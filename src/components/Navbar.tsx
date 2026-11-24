import { Menu, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTrips } from '../context/TripsContext';

const NAV_ITEMS = [
  { to: '/planner', label: 'AI Planner' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/budget', label: 'Budget' },
  { to: '/saved', label: 'Saved Trips' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { trips } = useTrips();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-[#0B1F3A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded-md px-1"
          aria-label="TripMate Home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" stroke="#0B1F3A" strokeWidth="2" />
            <path d="M12 6.5L14.8 12L12 17.5L9.2 12L12 6.5Z" fill="#38BDF8" stroke="#0B1F3A" strokeWidth="1.4" />
          </svg>
          <span className="font-display text-xl font-bold tracking-tight">TripMate</span>
        </Link>

        {/* Zone 2: 5 clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#0B1F3A] border-[#38BDF8]'
                    : 'text-slate-600 border-transparent hover:text-[#0B1F3A] hover:border-slate-300'
                }`
              }
            >
              {item.to === '/saved' && trips.length > 0 ? `${item.label} (${trips.length})` : item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/assistant"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium hover:bg-[#153159] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
            Ask Assistant
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-[#0B1F3A] hover:bg-slate-50 transition-colors"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1"
          aria-label="Mobile navigation"
        >
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive ? 'bg-slate-100 text-[#0B1F3A]' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            Home
          </NavLink>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-slate-100 text-[#0B1F3A]' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {item.to === '/saved' && trips.length > 0 ? `${item.label} (${trips.length})` : item.label}
            </NavLink>
          ))}
          <NavLink
            to="/assistant"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive ? 'bg-slate-100 text-[#0B1F3A]' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            AI Travel Assistant
          </NavLink>
        </nav>
      )}
    </header>
  );
}
