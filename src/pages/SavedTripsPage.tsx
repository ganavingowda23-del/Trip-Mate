import {
  AlertCircle,
  Bookmark,
  Calendar,
  Cloud,
  Edit3,
  HardDrive,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import type { SavedTrip } from '../types/trip';

export function SavedTripsPage() {
  const { user, authReady, authError, signingIn, signInWithGoogle, signOut } = useAuth();
  const { trips, loadingTrips, syncError, removeTrip, syncLocalToCloud, localOnlyCount } = useTrips();

  const [viewingTrip, setViewingTrip] = useState<SavedTrip | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const count = await syncLocalToCloud();
      setSyncMessage(`Synced ${count} ${count === 1 ? 'trip' : 'trips'} to your Firestore database.`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (trip: SavedTrip) => {
    await removeTrip(trip);
    setConfirmDeleteId(null);
    if (viewingTrip?.id === trip.id) {
      setViewingTrip(null);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      <div className="bg-[#0B1F3A] text-white py-12 sm:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Saved Trips
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Review, edit, or delete your saved travel plans. Trips save instantly in your browser and sync to Firestore when you sign in.
            </p>
          </div>

          <div className="shrink-0">
            {!authReady ? null : user ? (
              <div className="flex flex-wrap items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5">
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{user.displayName || 'Signed in'}</p>
                  <p className="text-[11px] text-slate-300">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={signingIn}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38BDF8] text-[#0B1F3A] text-sm font-semibold hover:bg-[#7DD3FC] transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                {signingIn ? 'Signing in...' : 'Sign in with Google for Cloud Sync'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {(authError || syncError) && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-900"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{authError || syncError}</p>
          </div>
        )}

        {user && localOnlyCount > 0 && (
          <div className="bg-white border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-[#0B1F3A]">
              <Cloud className="w-5 h-5 text-[#0284C7] shrink-0" aria-hidden="true" />
              <p>
                You have <strong className="tabular-nums">{localOnlyCount}</strong>{' '}
                {localOnlyCount === 1 ? 'trip' : 'trips'} saved locally on this device. Sync to store in Firestore across devices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing}
              className="px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#153159] transition-colors shrink-0 cursor-pointer"
            >
              {syncing ? 'Syncing...' : 'Sync to Firestore'}
            </button>
          </div>
        )}

        {syncMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
            {syncMessage}
          </div>
        )}

        {loadingTrips ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex items-center justify-center gap-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-[#0284C7]" aria-hidden="true" />
            <span className="text-sm font-medium">Loading your saved trips from Firestore...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-display text-2xl font-semibold text-[#0B1F3A] mb-2">
              No saved trips yet
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Generate an itinerary in the AI Trip Planner and save it here to review, edit, or compare costs later.
            </p>
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] transition-colors"
            >
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <article
                key={trip.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                    <span className="inline-flex items-center gap-1">
                      {trip.source === 'cloud' ? (
                        <>
                          <Cloud className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                          Firestore synced
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          Saved locally
                        </>
                      )}
                    </span>
                    <span className="capitalize">{trip.budgetTier}</span>
                  </div>

                  <h2 className="font-display text-xl font-semibold text-[#0B1F3A] mb-2">
                    {trip.title}
                  </h2>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                      <span>
                        {trip.startingLocation} to {trip.destination}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                      <span>
                        {trip.daysCount} {trip.daysCount === 1 ? 'day' : 'days'}
                        {trip.travelDates ? ` · ${trip.travelDates}` : ''}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 tabular-nums">
                      <Users className="w-3.5 h-3.5 text-[#0284C7]" aria-hidden="true" />
                      <span>
                        {trip.travelers} {trip.travelers === 1 ? 'traveller' : 'travellers'} · Approx.{' '}
                        <strong className="font-mono text-[#0B1F3A]">
                          ~${trip.estimatedTotal.toLocaleString()} {trip.currency}
                        </strong>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingTrip(trip)}
                      className="px-3.5 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#153159] transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <Link
                      to={`/planner?tripId=${encodeURIComponent(trip.id)}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-[#0B1F3A] hover:bg-slate-50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                  </div>

                  {confirmDeleteId === trip.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleDelete(trip)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(trip.id)}
                      aria-label={`Delete ${trip.title}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Trip Detail Modal */}
      {viewingTrip && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-trip-modal-title"
          onClick={() => setViewingTrip(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-xl border border-slate-200 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 id="saved-trip-modal-title" className="font-display text-2xl font-bold text-[#0B1F3A]">
                  {viewingTrip.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 tabular-nums">
                  {viewingTrip.startingLocation} to {viewingTrip.destination} · {viewingTrip.daysCount} days ·{' '}
                  {viewingTrip.travelers} travellers · Approx. ~${viewingTrip.estimatedTotal.toLocaleString()}{' '}
                  {viewingTrip.currency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTrip(null)}
                aria-label="Close trip details"
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {viewingTrip.notes && (
              <div className="mb-6 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-700">
                <p className="text-xs font-semibold text-slate-500 mb-1">Trip notes</p>
                <p>{viewingTrip.notes}</p>
              </div>
            )}

            <div className="space-y-4">
              {viewingTrip.days.map((day) => (
                <div key={day.day} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-display text-base font-semibold text-[#0B1F3A]">
                      {day.title}
                    </h3>
                    <span className="font-mono text-xs font-medium text-[#0284C7] tabular-nums">
                      ~${day.estimatedCostUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                    <div>
                      <p className="font-semibold text-[#0B1F3A] mb-1">Places</p>
                      <ul className="space-y-1">
                        {day.places.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B1F3A] mb-1">Activities</p>
                      <ul className="space-y-1 list-disc pl-4">
                        {day.activities.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B1F3A] mb-1">Dining</p>
                      <ul className="space-y-1">
                        {day.foodSuggestions.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link
                to={`/planner?tripId=${encodeURIComponent(viewingTrip.id)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] transition-colors"
              >
                <Edit3 className="w-4 h-4" aria-hidden="true" />
                Open in Planner
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
