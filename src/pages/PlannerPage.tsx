import {
  AlertCircle,
  BookmarkCheck,
  Calendar,
  Check,
  Cloud,
  Edit3,
  Info,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import type { BudgetTier, GeneratedItinerary, ItineraryDay } from '../types/trip';

const INTEREST_OPTIONS = [
  'Beaches',
  'Mountains',
  'Culture & History',
  'Local Food',
  'Adventure',
  'Scenic Walks',
  'Museums & Art',
  'Relaxation',
];

export function PlannerPage() {
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle, signingIn } = useAuth();
  const { trips, saveItinerary } = useTrips();

  const paramDest = searchParams.get('destination') ?? '';
  const paramDays = Number(searchParams.get('days')) || 5;
  const paramTravelers = Number(searchParams.get('travelers')) || 2;
  const paramBudget = searchParams.get('budget');
  const paramTripId = searchParams.get('tripId');

  const [destination, setDestination] = useState(paramDest || 'Hampi, Karnataka');
  const [startingLocation, setStartingLocation] = useState('Bengaluru');
  const [travelDates, setTravelDates] = useState('');
  const [daysCount, setDaysCount] = useState(Math.max(1, Math.min(21, paramDays || 4)));
  const [travelers, setTravelers] = useState(Math.max(1, Math.min(20, paramTravelers)));
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(
    paramBudget === 'budget' || paramBudget === 'moderate' || paramBudget === 'luxury'
      ? paramBudget
      : 'moderate'
  );
  const [interests, setInterests] = useState<string[]>(['Culture & History', 'Local Food']);

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | undefined>(undefined);
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  const [tripNotes, setTripNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (paramTripId) {
      const found = trips.find((t) => t.id === paramTripId);
      if (found) {
        setDestination(found.destination);
        setStartingLocation(found.startingLocation);
        setTravelDates(found.travelDates ?? '');
        setDaysCount(found.daysCount);
        setTravelers(found.travelers);
        setBudgetTier(found.budgetTier);
        setInterests(found.interests);
        setTripNotes(found.notes ?? '');
        setEditingTripId(found.id);
        setItinerary({
          title: found.title,
          destination: found.destination,
          startingLocation: found.startingLocation,
          travelDates: found.travelDates ?? `${found.daysCount} days`,
          daysCount: found.daysCount,
          travelers: found.travelers,
          budgetTier: found.budgetTier,
          interests: found.interests,
          summary: `Saved ${found.daysCount}-day ${found.budgetTier} trip to ${found.destination}.`,
          estimatedTotal: found.estimatedTotal,
          currency: found.currency,
          budgetBreakdown: {
            transport: Math.round(found.estimatedTotal * 0.25),
            accommodation: Math.round(found.estimatedTotal * 0.35),
            food: Math.round(found.estimatedTotal * 0.2),
            activities: Math.round(found.estimatedTotal * 0.2),
            total: found.estimatedTotal,
          },
          days: found.days,
        });
      }
    }
  }, [paramTripId, trips]);

  useEffect(() => {
    if (paramDest && !paramTripId) {
      setDestination(paramDest);
    }
  }, [paramDest, paramTripId]);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item)
        ? prev.filter((x) => x !== item)
        : prev.length < 10
          ? [...prev, item]
          : prev
    );
  };

  const generatePlan = async () => {
    if (destination.trim().length < 2) {
      setErrorMsg('Please enter a destination (at least 2 characters).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setNoticeMsg(null);
    setSaveFeedback(null);
    setEditingDayIdx(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.trim(),
          startingLocation: startingLocation.trim() || 'Home City',
          travelDates: travelDates.trim(),
          daysCount,
          travelers,
          budgetTier,
          interests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not generate itinerary. Please try again.');
        return;
      }

      setItinerary(data.itinerary as GeneratedItinerary);
      setEditingTripId(undefined);
      if (data.notice) {
        setNoticeMsg(String(data.notice));
      }
    } catch {
      setErrorMsg('Unable to reach the itinerary generator. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void generatePlan();
  };

  const updateDayField = (dayIndex: number, updated: ItineraryDay) => {
    if (!itinerary) return;
    const nextDays = itinerary.days.map((d, idx) => (idx === dayIndex ? updated : d));
    const daysSum = nextDays.reduce((acc, d) => acc + (Number(d.estimatedCostUsd) || 0), 0);
    const transportShare = itinerary.budgetBreakdown.transport;
    const nextTotal = transportShare + daysSum;

    setItinerary({
      ...itinerary,
      days: nextDays,
      daysCount: nextDays.length,
      estimatedTotal: nextTotal,
      budgetBreakdown: {
        ...itinerary.budgetBreakdown,
        total: nextTotal,
      },
    });
  };

  const handleAddDay = () => {
    if (!itinerary || itinerary.days.length >= 21) return;
    const nextNum = itinerary.days.length + 1;
    const newDay: ItineraryDay = {
      day: nextNum,
      title: `Day ${nextNum}: Flexible Exploration`,
      places: [`${itinerary.destination} Local District`],
      activities: ['Morning coffee and unhurried sightseeing'],
      foodSuggestions: ['Local cafe or regional restaurant'],
      estimatedCostUsd: Math.round(
        itinerary.days[0]?.estimatedCostUsd || 180
      ),
    };
    const nextDays = [...itinerary.days, newDay];
    const nextTotal =
      itinerary.budgetBreakdown.transport +
      nextDays.reduce((acc, d) => acc + d.estimatedCostUsd, 0);

    setItinerary({
      ...itinerary,
      daysCount: nextDays.length,
      days: nextDays,
      estimatedTotal: nextTotal,
    });
    setEditingDayIdx(nextDays.length - 1);
  };

  const handleDeleteDay = (dayIndex: number) => {
    if (!itinerary || itinerary.days.length <= 1) return;
    const nextDays = itinerary.days
      .filter((_, idx) => idx !== dayIndex)
      .map((d, idx) => ({ ...d, day: idx + 1 }));
    const nextTotal =
      itinerary.budgetBreakdown.transport +
      nextDays.reduce((acc, d) => acc + d.estimatedCostUsd, 0);
    setItinerary({
      ...itinerary,
      daysCount: nextDays.length,
      days: nextDays,
      estimatedTotal: nextTotal,
    });
    setEditingDayIdx(null);
  };

  const handleSaveTrip = async () => {
    if (!itinerary) return;
    setSaving(true);
    setSaveFeedback(null);
    setErrorMsg(null);
    try {
      const saved = await saveItinerary(itinerary, tripNotes, editingTripId);
      setEditingTripId(saved.id);
      setSaveFeedback(
        user
          ? 'Saved to your Firestore account and available across devices.'
          : 'Saved locally in your browser. Sign in with Google on Saved Trips to sync to the cloud.'
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save trip right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      <div className="bg-[#0B1F3A] text-white py-12 sm:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-2">
            AI Trip Planner
          </h1>
          <p className="text-slate-300 text-base max-w-2xl">
            Enter your destination, group size, budget style, and interests to generate an editable day-by-day itinerary.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 lg:sticky lg:top-20"
          >
            <h2 className="font-display text-lg font-semibold text-[#0B1F3A]">
              Trip details
            </h2>

            <div>
              <label htmlFor="planner-destination" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                Destination
              </label>
              <input
                id="planner-destination"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Gokarna, Hampi, Spiti Valley, Bundi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Quick pick small Indian destinations">
                {['Gokarna', 'Hampi', 'Spiti Valley', 'Coorg', 'Bundi', 'Ziro Valley'].map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => setDestination(`${spot}, India`)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      destination.toLowerCase().includes(spot.toLowerCase())
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {spot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="planner-origin" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                Starting location
              </label>
              <input
                id="planner-origin"
                type="text"
                value={startingLocation}
                onChange={(e) => setStartingLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Delhi, Chennai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="planner-dates" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                Travel dates <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="planner-dates"
                type="text"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                placeholder="e.g. Oct 12 – Oct 18 or Flexible Spring"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="planner-days" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Number of days
                </label>
                <input
                  id="planner-days"
                  type="number"
                  min={1}
                  max={21}
                  value={daysCount}
                  onChange={(e) => setDaysCount(Math.max(1, Math.min(21, Number(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm text-[#0B1F3A] tabular-nums focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="planner-travelers" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Travellers
                </label>
                <input
                  id="planner-travelers"
                  type="number"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm text-[#0B1F3A] tabular-nums focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                Budget preference
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl" role="group" aria-label="Budget preference">
                {(['budget', 'moderate', 'luxury'] as BudgetTier[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setBudgetTier(tier)}
                    aria-pressed={budgetTier === tier}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      budgetTier === tier
                        ? 'bg-[#0B1F3A] text-white'
                        : 'text-slate-600 hover:text-[#0B1F3A]'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#0B1F3A] mb-2">
                Interests
              </span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Travel interests">
                {INTEREST_OPTIONS.map((item) => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      aria-pressed={selected}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#38BDF8]/20 border-[#0284C7] text-[#0B1F3A]'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" aria-hidden="true" />
                  Generating itinerary...
                </>
              ) : (
                <>
                  {itinerary ? <RefreshCw className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" /> : null}
                  {itinerary ? 'Regenerate Itinerary' : 'Generate Itinerary'}
                </>
              )}
            </button>
          </form>

          {/* Right Itinerary Panel */}
          <div className="lg:col-span-8 space-y-6">
            {errorMsg && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 text-sm text-red-900"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <p className="font-medium">{errorMsg}</p>
                  <button
                    type="button"
                    onClick={() => void generatePlan()}
                    className="text-xs font-semibold underline cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {noticeMsg && (
              <div
                role="status"
                className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-[#0B1F3A]"
              >
                <Info className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                <p>{noticeMsg}</p>
              </div>
            )}

            {loading && !itinerary && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5" aria-busy="true">
                <div className="flex items-center gap-3 text-[#0B1F3A]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0284C7]" aria-hidden="true" />
                  <p className="font-display text-lg font-semibold">
                    Crafting your {daysCount}-day {destination} itinerary...
                  </p>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              </div>
            )}

            {!loading && !itinerary && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center">
                <Calendar className="w-10 h-10 text-[#0284C7] mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-display text-2xl font-semibold text-[#0B1F3A] mb-2">
                  Your itinerary will appear here
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Adjust your destination, dates, budget style, and interests on the left, then select{' '}
                  <strong>Generate Itinerary</strong> to create a custom day-by-day plan.
                </p>
                <button
                  type="button"
                  onClick={() => void generatePlan()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] transition-colors cursor-pointer"
                >
                  Generate Sample Plan for {destination}
                </button>
              </div>
            )}

            {itinerary && (
              <div className="space-y-6">
                {/* Itinerary Header Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="flex-1">
                      <label htmlFor="itinerary-title-input" className="sr-only">
                        Trip Title
                      </label>
                      <input
                        id="itinerary-title-input"
                        type="text"
                        value={itinerary.title}
                        onChange={(e) => setItinerary({ ...itinerary, title: e.target.value })}
                        className="w-full font-display text-2xl font-bold text-[#0B1F3A] bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#0284C7] focus:outline-none pb-1"
                      />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                          {itinerary.startingLocation} to {itinerary.destination}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{itinerary.travelDates}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Users className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                          {itinerary.travelers} {itinerary.travelers === 1 ? 'traveller' : 'travellers'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{itinerary.budgetTier}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void generatePlan()}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveTrip()}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#153159] transition-colors cursor-pointer"
                      >
                        {saving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Save className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                        )}
                        {editingTripId ? 'Update Saved Trip' : 'Save Trip'}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mt-4 mb-5">
                    {itinerary.summary}
                  </p>

                  {/* Approximate Cost Summary Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs">
                    <div>
                      <p className="text-slate-500">Transport (approx.)</p>
                      <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                        ~${itinerary.budgetBreakdown.transport.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Lodging (approx.)</p>
                      <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                        ~${itinerary.budgetBreakdown.accommodation.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Food (approx.)</p>
                      <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                        ~${itinerary.budgetBreakdown.food.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Activities (approx.)</p>
                      <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                        ~${itinerary.budgetBreakdown.activities.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-slate-500">Total (approx.)</p>
                      <p className="font-mono text-base font-bold text-[#0284C7] tabular-nums">
                        ~${itinerary.estimatedTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {saveFeedback && (
                    <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <BookmarkCheck className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                        {saveFeedback}
                      </span>
                      <div className="flex items-center gap-3">
                        {!user && (
                          <button
                            type="button"
                            onClick={() => void signInWithGoogle()}
                            disabled={signingIn}
                            className="inline-flex items-center gap-1 font-semibold text-[#0B1F3A] underline cursor-pointer"
                          >
                            <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
                            Sync with Google
                          </button>
                        )}
                        <Link to="/saved" className="font-semibold text-[#0284C7] hover:underline">
                          View Saved Trips
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Day Cards */}
                <div className="space-y-4">
                  {itinerary.days.map((day, idx) => {
                    const isEditing = editingDayIdx === idx;
                    return (
                      <article
                        key={`${day.day}-${idx}`}
                        className="bg-white border border-slate-200 rounded-2xl p-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          {isEditing ? (
                            <input
                              type="text"
                              aria-label={`Title for Day ${day.day}`}
                              value={day.title}
                              onChange={(e) => updateDayField(idx, { ...day, title: e.target.value })}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-display text-base font-semibold text-[#0B1F3A]"
                            />
                          ) : (
                            <h3 className="font-display text-lg font-semibold text-[#0B1F3A]">
                              {day.title}
                            </h3>
                          )}

                          <div className="flex items-center gap-3 shrink-0">
                            {isEditing ? (
                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                <span>Est. USD:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={day.estimatedCostUsd}
                                  onChange={(e) =>
                                    updateDayField(idx, {
                                      ...day,
                                      estimatedCostUsd: Math.max(0, Number(e.target.value) || 0),
                                    })
                                  }
                                  className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs text-[#0B1F3A] tabular-nums"
                                />
                              </label>
                            ) : (
                              <span className="font-mono text-sm font-medium text-[#0B1F3A] tabular-nums">
                                ~${day.estimatedCostUsd.toLocaleString()}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => setEditingDayIdx(isEditing ? null : idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              {isEditing ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                                  Done
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                  Edit
                                </>
                              )}
                            </button>

                            {itinerary.days.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDay(idx)}
                                aria-label={`Remove Day ${day.day}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="pt-4 space-y-4 text-sm">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Places to visit (one per line)
                              </label>
                              <textarea
                                rows={3}
                                value={day.places.join('\n')}
                                onChange={(e) =>
                                  updateDayField(idx, {
                                    ...day,
                                    places: e.target.value.split('\n'),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-[#0B1F3A]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Activities (one per line)
                              </label>
                              <textarea
                                rows={3}
                                value={day.activities.join('\n')}
                                onChange={(e) =>
                                  updateDayField(idx, {
                                    ...day,
                                    activities: e.target.value.split('\n'),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-[#0B1F3A]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Food suggestions (one per line)
                              </label>
                              <textarea
                                rows={2}
                                value={day.foodSuggestions.join('\n')}
                                onChange={(e) =>
                                  updateDayField(idx, {
                                    ...day,
                                    foodSuggestions: e.target.value.split('\n'),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-[#0B1F3A]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2">
                                Places to visit
                              </p>
                              <ul className="space-y-1.5 text-slate-700">
                                {day.places.filter(Boolean).map((p, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-1" aria-hidden="true" />
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2">
                                Activities
                              </p>
                              <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                                {day.activities.filter(Boolean).map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2">
                                Food suggestions
                              </p>
                              <ul className="space-y-1.5 text-slate-700">
                                {day.foodSuggestions.filter(Boolean).map((f, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Utensils className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-1" aria-hidden="true" />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>

                {/* Add Day & Trip Notes */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="trip-notes" className="text-sm font-semibold text-[#0B1F3A]">
                      Personal trip notes
                    </label>
                    {itinerary.days.length < 21 && (
                      <button
                        type="button"
                        onClick={handleAddDay}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0B1F3A] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        Add day
                      </button>
                    )}
                  </div>
                  <textarea
                    id="trip-notes"
                    rows={3}
                    value={tripNotes}
                    onChange={(e) => setTripNotes(e.target.value)}
                    placeholder="Add flight confirmation reminders, hotel districts, or dietary notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
