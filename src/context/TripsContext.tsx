import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  createCloudTrip,
  deleteCloudTrip,
  deleteLocalTrip,
  generateSafeTripId,
  loadLocalTrips,
  subscribeCloudTrips,
  updateCloudTrip,
  upsertLocalTrip,
} from '../services/tripStorage';
import type { GeneratedItinerary, SavedTrip } from '../types/trip';

interface TripsContextValue {
  trips: SavedTrip[];
  loadingTrips: boolean;
  syncError: string | null;
  saveItinerary: (itinerary: GeneratedItinerary, notes?: string, existingId?: string) => Promise<SavedTrip>;
  updateTrip: (trip: SavedTrip) => Promise<void>;
  removeTrip: (trip: SavedTrip) => Promise<void>;
  syncLocalToCloud: () => Promise<number>;
  localOnlyCount: number;
  clearSyncError: () => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();
  const [localTrips, setLocalTrips] = useState<SavedTrip[]>(() => loadLocalTrips());
  const [cloudTrips, setCloudTrips] = useState<SavedTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setCloudTrips([]);
      setLoadingTrips(false);
      return;
    }

    setLoadingTrips(true);
    setSyncError(null);
    const unsubscribe = subscribeCloudTrips(
      user.uid,
      (nextCloudTrips) => {
        setCloudTrips(nextCloudTrips);
        setLoadingTrips(false);
      },
      (err) => {
        setSyncError(err.message);
        setLoadingTrips(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  // Merge cloud trips and any unsynced local trips (avoiding duplicates by id)
  const cloudIds = new Set(cloudTrips.map((t) => t.id));
  const localOnlyTrips = localTrips
    .filter((t) => !cloudIds.has(t.id))
    .map((t) => ({ ...t, source: 'local' as const }));
  const trips = [...cloudTrips, ...localOnlyTrips].sort((a, b) => b.updatedAtMs - a.updatedAtMs);

  const saveItinerary = async (
    itinerary: GeneratedItinerary,
    notes?: string,
    existingId?: string
  ): Promise<SavedTrip> => {
    const now = Date.now();
    const id = existingId || generateSafeTripId();
    const newTrip: SavedTrip = {
      id,
      ownerId: user?.uid,
      title: itinerary.title,
      destination: itinerary.destination,
      startingLocation: itinerary.startingLocation,
      travelDates: itinerary.travelDates,
      daysCount: itinerary.daysCount,
      travelers: itinerary.travelers,
      budgetTier: itinerary.budgetTier,
      interests: itinerary.interests,
      estimatedTotal: itinerary.estimatedTotal,
      currency: itinerary.currency,
      days: itinerary.days,
      notes,
      source: user ? 'cloud' : 'local',
      createdAtMs: now,
      updatedAtMs: now,
    };

    if (user) {
      if (existingId && cloudIds.has(existingId)) {
        await updateCloudTrip(user.uid, newTrip);
      } else {
        await createCloudTrip(user.uid, newTrip);
      }
    } else {
      const updated = upsertLocalTrip(newTrip);
      setLocalTrips(updated);
    }

    return newTrip;
  };

  const updateTrip = async (trip: SavedTrip) => {
    const updatedTrip: SavedTrip = {
      ...trip,
      updatedAtMs: Date.now(),
    };
    if (user && trip.source === 'cloud') {
      await updateCloudTrip(user.uid, updatedTrip);
    } else {
      const next = upsertLocalTrip(updatedTrip);
      setLocalTrips(next);
    }
  };

  const removeTrip = async (trip: SavedTrip) => {
    if (user && trip.source === 'cloud') {
      await deleteCloudTrip(trip.id);
    }
    const next = deleteLocalTrip(trip.id);
    setLocalTrips(next);
  };

  const syncLocalToCloud = async (): Promise<number> => {
    if (!user || localOnlyTrips.length === 0) return 0;
    let synced = 0;
    for (const localTrip of localOnlyTrips) {
      await createCloudTrip(user.uid, localTrip);
      deleteLocalTrip(localTrip.id);
      synced += 1;
    }
    setLocalTrips(loadLocalTrips());
    return synced;
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        loadingTrips,
        syncError,
        saveItinerary,
        updateTrip,
        removeTrip,
        syncLocalToCloud,
        localOnlyCount: user ? localOnlyTrips.length : 0,
        clearSyncError: () => setSyncError(null),
      }}
    >
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) {
    throw new Error('useTrips must be used within TripsProvider');
  }
  return ctx;
}
