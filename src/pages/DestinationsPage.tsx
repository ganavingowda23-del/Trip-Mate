import { ArrowRight, Calendar, MapPin, Search, Utensils, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DestinationImage } from '../components/DestinationImage';
import { DESTINATION_CATEGORIES, DESTINATIONS } from '../data/destinations';
import type { Destination, DestinationCategory } from '../types/trip';

export function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? 'All';

  const [queryText, setQueryText] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>(
    DESTINATION_CATEGORIES.includes(initialCategory as (typeof DESTINATION_CATEGORIES)[number])
      ? initialCategory
      : 'All'
  );
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  useEffect(() => {
    setQueryText(searchParams.get('q') ?? '');
  }, [searchParams]);

  const filteredDestinations = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return DESTINATIONS.filter((dest) => {
      const matchesCategory =
        activeCategory === 'All' || dest.category === (activeCategory as DestinationCategory);
      const matchesQuery =
        !q ||
        dest.name.toLowerCase().includes(q) ||
        dest.country.toLowerCase().includes(q) ||
        dest.region.toLowerCase().includes(q) ||
        dest.category.toLowerCase().includes(q) ||
        dest.shortDescription.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, queryText]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setQueryText('');
    setActiveCategory('All');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      <div className="bg-[#0B1F3A] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-3">
            Explore Destinations
          </h1>
          <p className="text-slate-300 text-base max-w-2xl">
            Browse coastlines, mountain valleys, historic quarters, and outdoor adventures with approximate daily budgets and ideal travel seasons.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Category Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-9">
          <div className="relative w-full lg:max-w-sm">
            <label htmlFor="destinations-search" className="sr-only">
              Search destinations by name, country, or keyword
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="destinations-search"
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search city, country, or region..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0284C7] focus:outline-none"
            />
            {queryText && (
              <button
                type="button"
                onClick={() => setQueryText('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200"
            role="group"
            aria-label="Filter destinations by category"
          >
            {DESTINATION_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  aria-pressed={isActive}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F3A] text-white'
                      : 'text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between text-sm text-slate-600">
          <p className="tabular-nums">
            Showing <span className="font-semibold text-[#0B1F3A]">{filteredDestinations.length}</span>{' '}
            {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
          </p>
          {(queryText || activeCategory !== 'All') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-[#0284C7] hover:text-[#0B1F3A] cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-[#0B1F3A] mb-2">
              No matching destinations found
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Try another keyword or clear your category filter. You can also enter any custom city directly in the AI Trip Planner.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium hover:bg-[#153159] transition-colors cursor-pointer"
              >
                Show all destinations
              </button>
              <Link
                to={
                  queryText.trim()
                    ? `/planner?destination=${encodeURIComponent(queryText.trim())}`
                    : '/planner'
                }
                className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-[#0B1F3A] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Plan custom destination
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredDestinations.map((dest) => (
              <article
                key={dest.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <DestinationImage
                      src={dest.image}
                      alt={`${dest.name}, ${dest.country}`}
                      label={dest.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>{dest.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>{dest.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{dest.recommendedDays} days ideal</span>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#0B1F3A] mb-2">
                      {dest.name}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {dest.shortDescription}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <p className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Est. daily budget (approx.)</span>
                        <span className="font-mono font-medium text-[#0B1F3A] tabular-nums">
                          ${dest.dailyBudgetUsd.budget}–${dest.dailyBudgetUsd.luxury}/day
                        </span>
                      </p>
                      <p className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Best time to visit</span>
                        <span className="font-medium text-[#0B1F3A] text-right">
                          {dest.bestTimeToVisit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDest(dest)}
                    className="text-sm font-medium text-slate-600 hover:text-[#0B1F3A] transition-colors cursor-pointer"
                  >
                    View highlights
                  </button>
                  <Link
                    to={`/planner?destination=${encodeURIComponent(dest.name)}&days=${dest.recommendedDays}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#153159] transition-colors whitespace-nowrap"
                  >
                    Plan Trip
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Destination Detail Modal */}
      {selectedDest && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dest-modal-title"
          onClick={() => setSelectedDest(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
              <DestinationImage
                src={selectedDest.image}
                alt={`${selectedDest.name}, ${selectedDest.country}`}
                label={selectedDest.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedDest(null)}
                aria-label="Close destination details"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 text-[#0B1F3A] flex items-center justify-center shadow hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>{selectedDest.country}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedDest.region}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedDest.category}</span>
              </div>
              <h2 id="dest-modal-title" className="font-display text-2xl font-bold text-[#0B1F3A] mb-3">
                {selectedDest.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                {selectedDest.fullDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Budget Tier (approx.)</p>
                  <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                    ${selectedDest.dailyBudgetUsd.budget}/day
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Moderate Tier (approx.)</p>
                  <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                    ${selectedDest.dailyBudgetUsd.moderate}/day
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Luxury Tier (approx.)</p>
                  <p className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                    ${selectedDest.dailyBudgetUsd.luxury}/day
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">Top Highlights</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    {selectedDest.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0" aria-hidden="true" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
                    <span>Best season: {selectedDest.bestTimeToVisit}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
                    <span>Try: {selectedDest.signatureDish}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                  to={`/budget?destination=${encodeURIComponent(selectedDest.name)}&days=${selectedDest.recommendedDays}`}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-[#0B1F3A] text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Estimate Budget
                </Link>
                <Link
                  to={`/planner?destination=${encodeURIComponent(selectedDest.name)}&days=${selectedDest.recommendedDays}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] transition-colors"
                >
                  Build Itinerary
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
