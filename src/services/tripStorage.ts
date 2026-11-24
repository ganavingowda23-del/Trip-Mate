import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { BudgetTier, ItineraryDay, SavedTrip } from '../types/trip';

const LOCAL_STORAGE_KEY = 'tripmate_saved_trips_v1';

// Blueprint validation constants (matched verbatim with firebase-blueprint.json & firestore.rules)
export const TRIP_LIMITS = {
  ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  ID_MAX: 128,
  TITLE_MAX: 160,
  DESTINATION_MAX: 120,
  STARTING_LOCATION_MAX: 120,
  TRAVEL_DATES_MAX: 80,
  DAYS_MIN: 1,
  DAYS_MAX: 21,
  TRAVELERS_MIN: 1,
  TRAVELERS_MAX: 20,
  INTERESTS_MAX_COUNT: 10,
  INTEREST_ITEM_MAX: 40,
  NOTES_MAX: 2000,
  CURRENCY_MAX: 10,
} as const;

export function generateSafeTripId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const id = `trip_${Date.now()}_${randomPart}`;
  return id.slice(0, TRIP_LIMITS.ID_MAX);
}

function clampString(val: string | undefined, max: number, fallback = ''): string {
  const trimmed = (val ?? '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

function normalizeBudgetTier(tier: string): BudgetTier {
  if (tier === 'budget' || tier === 'moderate' || tier === 'luxury') return tier;
  return 'moderate';
}

function sanitizeTripForSchema(trip: SavedTrip, ownerId?: string) {
  const daysCount = Math.max(
    TRIP_LIMITS.DAYS_MIN,
    Math.min(TRIP_LIMITS.DAYS_MAX, Math.round(trip.daysCount || trip.days.length || 1))
  );
  const travelers = Math.max(
    TRIP_LIMITS.TRAVELERS_MIN,
    Math.min(TRIP_LIMITS.TRAVELERS_MAX, Math.round(trip.travelers || 1))
  );
  const interests = (trip.interests || [])
    .map((item) => clampString(item, TRIP_LIMITS.INTEREST_ITEM_MAX))
    .filter(Boolean)
    .slice(0, TRIP_LIMITS.INTERESTS_MAX_COUNT);

  const days: ItineraryDay[] = (trip.days || []).slice(0, TRIP_LIMITS.DAYS_MAX).map((d, idx) => ({
    day: Math.max(1, Math.min(21, Math.round(d.day || idx + 1))),
    title: clampString(d.title, 140, `Day ${idx + 1}`),
    places: (d.places || []).map((p) => clampString(p, 100)).filter(Boolean).slice(0, 8),
    activities: (d.activities || []).map((a) => clampString(a, 240)).filter(Boolean).slice(0, 8),
    foodSuggestions: (d.foodSuggestions || []).map((f) => clampString(f, 160)).filter(Boolean).slice(0, 6),
    estimatedCostUsd: Math.max(0, Math.round(Number(d.estimatedCostUsd) || 0)),
    ...(d.notes ? { notes: clampString(d.notes, 300) } : {}),
  }));

  if (days.length === 0) {
    days.push({
      day: 1,
      title: 'Day 1',
      places: [clampString(trip.destination, 100, 'City Centre')],
      activities: ['Explore local highlights'],
      foodSuggestions: ['Regional cuisine'],
      estimatedCostUsd: 150,
    });
  }

  const base = {
    ...(ownerId ? { ownerId } : {}),
    title: clampString(trip.title, TRIP_LIMITS.TITLE_MAX, `${trip.destination} Trip`),
    destination: clampString(trip.destination, TRIP_LIMITS.DESTINATION_MAX, 'Destination'),
    startingLocation: clampString(trip.startingLocation, TRIP_LIMITS.STARTING_LOCATION_MAX, 'Origin City'),
    ...(trip.travelDates ? { travelDates: clampString(trip.travelDates, TRIP_LIMITS.TRAVEL_DATES_MAX) } : {}),
    daysCount,
    travelers,
    budgetTier: normalizeBudgetTier(trip.budgetTier),
    interests,
    estimatedTotal: Math.max(0, Math.min(1000000, Math.round(Number(trip.estimatedTotal) || 0))),
    currency: clampString(trip.currency, TRIP_LIMITS.CURRENCY_MAX, 'USD'),
    days,
    ...(trip.notes !== undefined ? { notes: clampString(trip.notes, TRIP_LIMITS.NOTES_MAX) } : {}),
  };

  return base;
}

export function loadLocalTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedTrip[];
  } catch {
    return [];
  }
}

export function saveLocalTrips(trips: SavedTrip[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // Ignore storage quota issues silently in restricted browsers
  }
}

export function upsertLocalTrip(trip: SavedTrip): SavedTrip[] {
  const existing = loadLocalTrips();
  const next = [trip, ...existing.filter((t) => t.id !== trip.id)];
  saveLocalTrips(next);
  return next;
}

export function deleteLocalTrip(tripId: string): SavedTrip[] {
  const next = loadLocalTrips().filter((t) => t.id !== tripId);
  saveLocalTrips(next);
  return next;
}

function toMillis(val: unknown, fallback: number): number {
  if (val instanceof Timestamp) {
    return val.toMillis();
  }
  if (typeof val === 'number') return val;
  return fallback;
}

export function subscribeCloudTrips(
  userId: string,
  onData: (trips: SavedTrip[]) => void,
  onError?: (err: Error) => void
) {
  const tripsRef = collection(db, 'trips');
  const q = query(tripsRef, where('ownerId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const trips: SavedTrip[] = snapshot.docs
        .map((snap) => {
          const data = snap.data();
          const now = Date.now();
          return {
            id: snap.id,
            ownerId: String(data.ownerId ?? userId),
            title: String(data.title ?? 'Untitled Trip'),
            destination: String(data.destination ?? ''),
            startingLocation: String(data.startingLocation ?? ''),
            travelDates: data.travelDates ? String(data.travelDates) : undefined,
            daysCount: Number(data.daysCount ?? 1),
            travelers: Number(data.travelers ?? 1),
            budgetTier: normalizeBudgetTier(String(data.budgetTier ?? 'moderate')),
            interests: Array.isArray(data.interests) ? data.interests.map(String) : [],
            estimatedTotal: Number(data.estimatedTotal ?? 0),
            currency: String(data.currency ?? 'USD'),
            days: Array.isArray(data.days) ? (data.days as ItineraryDay[]) : [],
            notes: data.notes ? String(data.notes) : undefined,
            source: 'cloud' as const,
            createdAtMs: toMillis(data.createdAt, now),
            updatedAtMs: toMillis(data.updatedAt, now),
          };
        })
        .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      onData(trips);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'trips');
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function createCloudTrip(userId: string, trip: SavedTrip): Promise<void> {
  const safeId = TRIP_LIMITS.ID_REGEX.test(trip.id) ? trip.id.slice(0, TRIP_LIMITS.ID_MAX) : generateSafeTripId();
  const docPath = `trips/${safeId}`;
  const payload = sanitizeTripForSchema(trip, userId);

  try {
    await setDoc(doc(db, 'trips', safeId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateCloudTrip(userId: string, trip: SavedTrip): Promise<void> {
  const docPath = `trips/${trip.id}`;
  const payload = sanitizeTripForSchema(trip, userId);
  // Omit ownerId from update fields so affectedKeys matches firestore.rules allowlist
  const { ownerId: _ignoredOwner, ...updatable } = payload;

  try {
    await updateDoc(doc(db, 'trips', trip.id), {
      ...updatable,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteCloudTrip(tripId: string): Promise<void> {
  const docPath = `trips/${tripId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
