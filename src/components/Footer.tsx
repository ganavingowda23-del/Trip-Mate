import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#0B1F3A] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#38BDF8" strokeWidth="2" />
                <path d="M12 6.5L14.8 12L12 17.5L9.2 12L12 6.5Z" fill="#38BDF8" />
              </svg>
              <span className="font-display text-xl font-bold tracking-tight">TripMate</span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Your Journey, Your Way. Thoughtful itinerary planning, destination discovery, and transparent travel budgeting in one calm workspace.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-white mb-4">Plan & Discover</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/planner" className="hover:text-[#38BDF8] transition-colors">
                  AI Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-[#38BDF8] transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/budget" className="hover:text-[#38BDF8] transition-colors">
                  Budget Calculator
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-[#38BDF8] transition-colors">
                  AI Travel Assistant
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-white mb-4">Your Trips & Support</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/saved" className="hover:text-[#38BDF8] transition-colors">
                  Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#38BDF8] transition-colors">
                  About TripMate
                </Link>
              </li>
              <li>
                <Link to="/about#contact" className="hover:text-[#38BDF8] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TripMate. Your Journey, Your Way.</p>
          <p>All itinerary cost estimates are approximate and provided for trip planning guidance.</p>
        </div>
      </div>
    </footer>
  );
}
