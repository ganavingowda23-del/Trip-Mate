import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'node:crypto';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import type {
  BudgetTier,
  ChatMessagePayload,
  GeneratedItinerary,
  ItineraryDay,
  PlannerRequestPayload,
} from './src/types/trip.ts';

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callWithRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE');
      if (!isTransient || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastErr;
}

function formatGeminiError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      return String(parsed.error.message);
    }
  } catch {
    // Use raw message if not JSON
  }
  return raw || fallback;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function normalizeBudgetTier(value: unknown): BudgetTier {
  if (value === 'budget' || value === 'moderate' || value === 'luxury') {
    return value;
  }
  return 'moderate';
}

function buildDemoItinerary(input: PlannerRequestPayload): GeneratedItinerary {
  const dailyPerPersonMap: Record<BudgetTier, number> = {
    budget: 115,
    moderate: 225,
    luxury: 480,
  };
  const dailyPerPerson = dailyPerPersonMap[input.budgetTier];
  const dailyGroupCost = dailyPerPerson * input.travelers;
  const interestFocus =
    input.interests.length > 0 ? input.interests.join(', ') : 'local highlights and authentic dining';

  const dayThemes = [
    'Arrival, Neighbourhood Orientation & Evening Stroll',
    'Historic Core & Cultural Landmarks',
    'Local Markets, Artisan Quarters & Scenic Viewpoints',
    'Signature Excursion & Natural Landscapes',
    'Hidden Neighbourhoods, Workshops & Culinary Trail',
    'Coastal or Highland Escape & Sunset Promenade',
    'Slow Morning, Gallery Hopping & Farewell Dinner',
  ];

  const days: ItineraryDay[] = Array.from({ length: input.daysCount }, (_, idx) => {
    const dayNum = idx + 1;
    const theme = dayThemes[idx % dayThemes.length];
    const isFirst = dayNum === 1;
    const isLast = dayNum === input.daysCount;

    const places = isFirst
      ? [`${input.destination} Central District`, `${input.destination} Old Town Square`, 'Waterfront Promenade']
      : isLast
        ? ['Morning Artisan Market', 'Botanical Garden or Museum Quarter', 'Departure Transit Hub']
        : [
            `${input.destination} Historic Landmark #${dayNum}`,
            `Scenic Overlook & Park`,
            `${input.interests[idx % Math.max(1, input.interests.length)] || 'Cultural'} District`,
          ];

    const activities = isFirst
      ? [
          `Arrive from ${input.startingLocation} and check into your accommodation.`,
          `Take an unhurried orientation walk through the historic centre.`,
          `Enjoy a relaxed evening welcome dinner featuring regional classics.`,
        ]
      : isLast
        ? [
            `Pick up locally roasted coffee and browse morning crafts.`,
            `Visit one final gallery or heritage site before packing.`,
            `Transfer smoothly toward your return journey to ${input.startingLocation}.`,
          ]
        : [
            `Morning exploration tailored to ${input.interests[0] || 'sightseeing'} before peak crowds.`,
            `Midday guided walk or self-paced neighborhood discovery.`,
            `Golden-hour scenic stop and relaxed evening stroll.`,
          ];

    const foodSuggestions = [
      `Morning bakery stop for fresh regional pastries and espresso`,
      `Neighborhood bistro lunch highlighting seasonal local produce`,
      input.budgetTier === 'luxury'
        ? `Chef-led tasting menu at a renowned ${input.destination} dining room`
        : `Casual family-run restaurant known for regional specialties`,
    ];

    return {
      day: dayNum,
      title: `Day ${dayNum}: ${theme}`,
      places,
      activities,
      foodSuggestions,
      estimatedCostUsd: Math.round(dailyGroupCost),
      notes: `Curated around ${interestFocus}. Adjust pacing freely.`,
    };
  });

  const subtotalDays = days.reduce((sum, d) => sum + d.estimatedCostUsd, 0);
  const transportEstimate = Math.round(input.travelers * (input.budgetTier === 'luxury' ? 680 : input.budgetTier === 'moderate' ? 380 : 210));
  const accommodation = Math.round(subtotalDays * 0.45);
  const food = Math.round(subtotalDays * 0.28);
  const activities = Math.round(subtotalDays * 0.27);
  const total = transportEstimate + accommodation + food + activities;

  return {
    title: `${input.daysCount}-Day ${input.destination} Journey`,
    destination: input.destination,
    startingLocation: input.startingLocation,
    travelDates: input.travelDates || `${input.daysCount} flexible days`,
    daysCount: input.daysCount,
    travelers: input.travelers,
    budgetTier: input.budgetTier,
    interests: input.interests,
    summary: `A balanced ${input.daysCount}-day ${input.budgetTier} itinerary for ${input.travelers} traveler${input.travelers > 1 ? 's' : ''} departing ${input.startingLocation} to ${input.destination}, focused on ${interestFocus}.`,
    estimatedTotal: total,
    currency: 'USD',
    budgetBreakdown: {
      transport: transportEstimate,
      accommodation,
      food,
      activities,
      total,
    },
    days,
  };
}

function buildDemoChatReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('pack') || lower.includes('luggage') || lower.includes('bring')) {
    return [
      'Here is a practical packing checklist you can adapt to your trip:',
      '',
      '1. **Core Documents**: Passport (6+ months validity), digital & printed itinerary backups, travel insurance details, and unlocked bank cards.',
      '2. **Layering Clothing**: Breathable base layers, one weatherproof outer shell, comfortable broken-in walking shoes, and a compact daypack.',
      '3. **Tech & Transit**: Universal power adapter, 10,000mAh power bank, offline maps downloaded before departure, and reusable water bottle.',
      '',
      'Tell me your destination and travel month if you would like a weather-specific packing list.',
    ].join('\n');
  }

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('cheap') || lower.includes('save')) {
    return [
      'Three reliable ways to keep travel costs predictable without sacrificing quality:',
      '',
      '1. **Shoulder-Season Timing**: Traveling 3–4 weeks before or after peak summer/holiday windows typically lowers accommodation rates by 20–35%.',
      '2. **Transit-Connected Neighbourhoods**: Staying 10–15 minutes outside the historic core near a metro or tram line cuts lodging costs while keeping sightseeing effortless.',
      '3. **Midday Main Meals**: Many acclaimed restaurants offer multi-course lunch menus at nearly half the evening price.',
      '',
      'You can also test exact scenarios in the TripMate Budget Calculator.',
    ].join('\n');
  }

  return [
    'Great travel question! Here are a few practical pointers from TripMate:',
    '',
    '1. **Pace Your Days**: Group 2–3 nearby landmarks in the morning and leave afternoons open for neighborhoods, cafés, and spontaneous finds.',
    '2. **Book Anchors Early**: Reserve high-demand museum entries, scenic trains, and intercity connections 2–4 weeks ahead.',
    '3. **Local Rhythm**: Check regional public holidays and museum closure days (often Mondays or Tuesdays) before locking your day order.',
    '',
    'Share your destination, trip length, or budget tier and I can tailor recommendations right away.',
  ].join('\n');
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

const contactSubmissions: ContactSubmission[] = [];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(getGeminiClient()),
    });
  });

  app.post('/api/plan', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const destination = sanitizeText(body.destination, 120);
      const startingLocation = sanitizeText(body.startingLocation, 120) || 'Your Home City';
      const travelDates = sanitizeText(body.travelDates, 80);
      const daysCount = clampInt(body.daysCount, 1, 21, 5);
      const travelers = clampInt(body.travelers, 1, 20, 2);
      const budgetTier = normalizeBudgetTier(body.budgetTier);

      const rawInterests: unknown[] = Array.isArray(body.interests) ? body.interests : [];
      const interests = rawInterests
        .map((item) => sanitizeText(item, 40))
        .filter(Boolean)
        .slice(0, 10);

      if (!destination || destination.length < 2) {
        res.status(400).json({ error: 'Please enter a valid destination (at least 2 characters).' });
        return;
      }

      const normalizedInput: PlannerRequestPayload = {
        destination,
        startingLocation,
        travelDates,
        daysCount,
        travelers,
        budgetTier,
        interests,
      };

      const ai = getGeminiClient();
      if (!ai) {
        res.json({
          source: 'demo',
          notice:
            'Gemini API key is not configured yet. Showing a tailored sample itinerary so you can preview, edit, and save your trip.',
          itinerary: buildDemoItinerary(normalizedInput),
        });
        return;
      }

      const prompt = [
        `Create a realistic, well-paced ${daysCount}-day travel itinerary for ${travelers} traveler(s) visiting ${destination}, departing from ${startingLocation}.`,
        travelDates ? `Travel dates or window: ${travelDates}.` : '',
        `Budget tier: ${budgetTier}.`,
        interests.length > 0 ? `Traveler interests: ${interests.join(', ')}.` : 'Balance culture, scenery, and local cuisine.',
        `All monetary estimates must be approximate USD totals for the entire group of ${travelers} traveler(s).`,
        `Include real, geographically logical neighbourhoods, landmarks, activities, and specific local food suggestions for each day.`,
      ]
        .filter(Boolean)
        .join(' ');

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
        config: {
          systemInstruction:
            'You are TripMate, a seasoned travel planner. Design practical, geographically sensible day-by-day itineraries with realistic approximate costs in USD. Avoid impossible transit hops.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              estimatedTotal: { type: Type.NUMBER },
              budgetBreakdown: {
                type: Type.OBJECT,
                properties: {
                  transport: { type: Type.NUMBER },
                  accommodation: { type: Type.NUMBER },
                  food: { type: Type.NUMBER },
                  activities: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                },
                required: ['transport', 'accommodation', 'food', 'activities', 'total'],
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    places: { type: Type.ARRAY, items: { type: Type.STRING } },
                    activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    foodSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    estimatedCostUsd: { type: Type.NUMBER },
                    notes: { type: Type.STRING },
                  },
                  required: ['day', 'title', 'places', 'activities', 'foodSuggestions', 'estimatedCostUsd'],
                },
              },
            },
            required: ['title', 'summary', 'estimatedTotal', 'budgetBreakdown', 'days'],
          },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'The AI planner returned an empty response. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      const days: ItineraryDay[] = Array.isArray(parsed.days)
        ? parsed.days.slice(0, daysCount).map((d: Record<string, unknown>, index: number) => ({
            day: clampInt(d.day, 1, 21, index + 1),
            title: sanitizeText(d.title, 140) || `Day ${index + 1}`,
            places: Array.isArray(d.places)
              ? d.places.map((p) => sanitizeText(p, 100)).filter(Boolean).slice(0, 8)
              : [],
            activities: Array.isArray(d.activities)
              ? d.activities.map((a) => sanitizeText(a, 240)).filter(Boolean).slice(0, 8)
              : [],
            foodSuggestions: Array.isArray(d.foodSuggestions)
              ? d.foodSuggestions.map((f) => sanitizeText(f, 160)).filter(Boolean).slice(0, 6)
              : [],
            estimatedCostUsd: Math.max(0, Math.round(Number(d.estimatedCostUsd) || 0)),
            notes: sanitizeText(d.notes, 300),
          }))
        : [];

      if (days.length === 0) {
        res.status(502).json({ error: 'Could not parse generated itinerary days. Please regenerate.' });
        return;
      }

      const breakdown = parsed.budgetBreakdown ?? {};
      const transport = Math.max(0, Math.round(Number(breakdown.transport) || 0));
      const accommodation = Math.max(0, Math.round(Number(breakdown.accommodation) || 0));
      const food = Math.max(0, Math.round(Number(breakdown.food) || 0));
      const activities = Math.max(0, Math.round(Number(breakdown.activities) || 0));
      const total =
        Math.max(0, Math.round(Number(breakdown.total) || Number(parsed.estimatedTotal) || 0)) ||
        transport + accommodation + food + activities;

      const itinerary: GeneratedItinerary = {
        title: sanitizeText(parsed.title, 160) || `${daysCount}-Day ${destination} Trip`,
        destination,
        startingLocation,
        travelDates: travelDates || `${daysCount} flexible days`,
        daysCount: days.length,
        travelers,
        budgetTier,
        interests,
        summary: sanitizeText(parsed.summary, 600) || `Personalised ${daysCount}-day plan for ${destination}.`,
        estimatedTotal: total,
        currency: 'USD',
        budgetBreakdown: {
          transport,
          accommodation,
          food,
          activities,
          total,
        },
        days,
      };

      res.json({
        source: 'gemini',
        itinerary,
      });
    } catch (err) {
      const message = formatGeminiError(err, 'Unable to generate itinerary right now.');
      console.error('Error in POST /api/plan:', message);
      res.status(500).json({
        error: message,
      });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const rawMessages: unknown[] = Array.isArray(body.messages) ? body.messages : [];
      const messages: ChatMessagePayload[] = rawMessages
        .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object'))
        .map((m) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: sanitizeText(m.content, 2000),
        }))
        .filter((m) => m.content.length > 0)
        .slice(-20);

      if (messages.length === 0) {
        res.status(400).json({ error: 'Please enter a travel question.' });
        return;
      }

      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      const ai = getGeminiClient();

      if (!ai) {
        res.json({
          source: 'demo',
          notice: 'Preview assistant mode (configure GEMINI_API_KEY in Secrets for live Gemini responses).',
          reply: buildDemoChatReply(lastUserMessage),
        });
        return;
      }

      const transcript = messages
        .map((m) => `${m.role === 'user' ? 'Traveler' : 'TripMate Assistant'}: ${m.content}`)
        .join('\n\n');

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: transcript,
          config: {
            systemInstruction:
              'You are the TripMate AI Travel Assistant. Answer travel questions concisely, warmly, and practically—covering destinations, best seasons, packing, local transit, visas/entry reminders (always noting travelers should verify official government rules), food etiquette, and approximate costs. Use clean markdown lists when helpful.',
          },
        })
      );

      const reply = (response.text ?? '').trim();
      if (!reply) {
        res.status(502).json({ error: 'The assistant returned an empty response. Please try again.' });
        return;
      }

      res.json({
        source: 'gemini',
        reply,
      });
    } catch (err) {
      const message = formatGeminiError(err, 'Unable to reach travel assistant right now.');
      console.error('Error in POST /api/chat:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/contact', (req: Request, res: Response) => {
    const body = req.body ?? {};
    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 160);
    const subject = sanitizeText(body.subject, 120);
    const message = sanitizeText(body.message, 2000);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) {
      res.status(400).json({ error: 'Please provide your full name (at least 2 characters).' });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (subject.length < 2) {
      res.status(400).json({ error: 'Please enter a subject.' });
      return;
    }
    if (message.length < 10) {
      res.status(400).json({ error: 'Please write a message of at least 10 characters.' });
      return;
    }

    const referenceId = `TM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    contactSubmissions.unshift({
      id: referenceId,
      name,
      email,
      subject,
      message,
      submittedAt: new Date().toISOString(),
    });
    if (contactSubmissions.length > 200) {
      contactSubmissions.length = 200;
    }

    res.status(201).json({
      ok: true,
      referenceId,
      message: 'Your message has been received by the TripMate team. We will reply within one business day.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripMate server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TripMate server:', err);
  process.exit(1);
});
