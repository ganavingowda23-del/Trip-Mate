import { ArrowRight, Calculator, Calendar, Compass, MapPin, MessageSquare, Search, Wallet } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DestinationImage } from '../components/DestinationImage';
import { DESTINATIONS, HERO_IMAGE } from '../data/destinations';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      navigate('/destinations');
      return;
    }
    navigate(`/destinations?q=${encodeURIComponent(trimmed)}`);
  };

  const featuredDestinations = DESTINATIONS.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#0B1F3A] text-white overflow-hidden">
        <div className="absolute inset-0">
          <DestinationImage
            src={HERO_IMAGE}
            alt="Sunlit Mediterranean turquoise cove with limestone cliffs and white sailboat"
            label="Explore the World with TripMate"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/92 via-[#0B1F3A]/75 to-[#0B1F3A]/45"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#38BDF8] tracking-wide mb-3">
              TripMate · Your Journey, Your Way
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-[1.08] mb-5">
              Explore the World with TripMate
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl mb-8">
              Plan smarter, travel better and create unforgettable memories.
            </p>

            {/* Destination Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="flex flex-col sm:flex-row gap-2.5 bg-white p-2 rounded-xl shadow-lg max-w-xl mb-7"
              role="search"
              aria-label="Search travel destinations"
            >
              <label htmlFor="hero-destination-search" className="sr-only">
                Search destinations
              </label>
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="hero-destination-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where would you like to go? (e.g. Kyoto, Amalfi, Lisbon)"
                  className="w-full px-3 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={
                  searchQuery.trim()
                    ? `/planner?destination=${encodeURIComponent(searchQuery.trim())}`
                    : '/planner'
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#38BDF8] text-[#0B1F3A] text-sm font-semibold hover:bg-[#7DD3FC] transition-colors whitespace-nowrap shrink-0"
              >
                Plan My Trip
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/12 text-white border border-white/30 text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
              >
                Explore Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0B1F3A] tracking-tight text-balance mb-3">
              Everything you need from first spark to departure
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Build day-by-day itineraries, estimate realistic trip budgets, and save plans across sessions without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/planner"
              className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-[#0284C7]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center mb-5">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0B1F3A] mb-2">
                  01. Personalised AI Itineraries
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Share your destination, travel dates, group size, and interests to generate an editable day-by-day route with dining ideas.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] group-hover:translate-x-0.5 transition-transform">
                Open AI Planner
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>

            <Link
              to="/budget"
              className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-[#0284C7]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center mb-5">
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0B1F3A] mb-2">
                  02. Clear Budget Estimates
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Compare approximate transport, accommodation, food, and activity costs across budget tiers and traveller counts.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] group-hover:translate-x-0.5 transition-transform">
                Calculate Trip Cost
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>

            <Link
              to="/assistant"
              className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-[#0284C7]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center mb-5">
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0B1F3A] mb-2">
                  03. Travel Assistant & Saved Plans
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Ask practical packing, transit, or seasonal timing questions and keep your favourite itineraries saved locally or in the cloud.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] group-hover:translate-x-0.5 transition-transform">
                Chat with Assistant
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0B1F3A] tracking-tight mb-2">
                Popular destinations
              </h2>
              <p className="text-slate-600 text-base">
                Curated coastlines, alpine valleys, historic cities, and highland trails ready to customize.
              </p>
            </div>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] hover:text-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
            >
              View all destinations
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredDestinations.map((dest) => (
              <article
                key={dest.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <DestinationImage
                      src={dest.image}
                      alt={`${dest.name}, ${dest.country}`}
                      label={dest.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>{dest.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>{dest.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">~${dest.dailyBudgetUsd.moderate}/day</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#0B1F3A] mb-2">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {dest.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    Best: {dest.bestTimeToVisit.split('&')[0].trim()}
                  </span>
                  <Link
                    to={`/planner?destination=${encodeURIComponent(dest.name)}&days=${dest.recommendedDays}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#0284C7] hover:text-[#0B1F3A] transition-colors whitespace-nowrap"
                  >
                    Plan trip
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Planning Banner */}
      <section className="bg-[#F8FAFC] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-[#0B1F3A] text-white rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-[#38BDF8] mb-3">
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Ready when you are</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white text-balance mb-3">
                Turn your next travel idea into a day-by-day plan in seconds
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Adjust every stop, compare approximate costs in our budget calculator, and save your favourite routes for later.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#38BDF8] text-[#0B1F3A] text-sm font-semibold hover:bg-[#7DD3FC] transition-colors whitespace-nowrap"
              >
                Start Planning
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/budget"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 text-white border border-white/20 text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                <Wallet className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
                Budget Tool
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
