import { ArrowRight, Calculator, Info, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DESTINATIONS } from '../data/destinations';
import type { BudgetTier } from '../types/trip';

const TIER_DEFAULTS: Record<
  BudgetTier,
  {
    label: string;
    stayPerNight: number;
    foodPerDay: number;
    activitiesPerDay: number;
    transportPerTraveler: number;
  }
> = {
  budget: {
    label: 'Budget',
    stayPerNight: 65,
    foodPerDay: 35,
    activitiesPerDay: 25,
    transportPerTraveler: 240,
  },
  moderate: {
    label: 'Moderate',
    stayPerNight: 165,
    foodPerDay: 65,
    activitiesPerDay: 55,
    transportPerTraveler: 460,
  },
  luxury: {
    label: 'Luxury',
    stayPerNight: 420,
    foodPerDay: 145,
    activitiesPerDay: 130,
    transportPerTraveler: 950,
  },
};

export function BudgetPage() {
  const [searchParams] = useSearchParams();
  const paramDest = searchParams.get('destination') ?? '';
  const paramDays = Number(searchParams.get('days')) || 5;

  const matchedDest = DESTINATIONS.find(
    (d) => d.name.toLowerCase() === paramDest.toLowerCase()
  );

  const [destination, setDestination] = useState(matchedDest?.name ?? (paramDest || 'Kyoto'));
  const [days, setDays] = useState(Math.max(1, Math.min(21, paramDays)));
  const [travelers, setTravelers] = useState(2);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [customTransportPerPerson, setCustomTransportPerPerson] = useState<number>(
    TIER_DEFAULTS.moderate.transportPerTraveler
  );
  const [customNightlyRate, setCustomNightlyRate] = useState<number>(
    TIER_DEFAULTS.moderate.stayPerNight
  );
  const [customFoodPerPersonDay, setCustomFoodPerPersonDay] = useState<number>(
    TIER_DEFAULTS.moderate.foodPerDay
  );
  const [customActivitiesPerPersonDay, setCustomActivitiesPerPersonDay] = useState<number>(
    TIER_DEFAULTS.moderate.activitiesPerDay
  );

  const applyTierPreset = (tier: BudgetTier, destName = destination) => {
    setBudgetTier(tier);
    const destObj = DESTINATIONS.find((d) => d.name.toLowerCase() === destName.toLowerCase());
    const defaults = TIER_DEFAULTS[tier];
    if (destObj) {
      const daily = destObj.dailyBudgetUsd[tier];
      setCustomNightlyRate(Math.round(daily * 0.55));
      setCustomFoodPerPersonDay(Math.round(daily * 0.25));
      setCustomActivitiesPerPersonDay(Math.round(daily * 0.2));
    } else {
      setCustomNightlyRate(defaults.stayPerNight);
      setCustomFoodPerPersonDay(defaults.foodPerDay);
      setCustomActivitiesPerPersonDay(defaults.activitiesPerDay);
    }
    setCustomTransportPerPerson(defaults.transportPerTraveler);
  };

  const handleDestinationSelect = (name: string) => {
    setDestination(name);
    applyTierPreset(budgetTier, name);
  };

  const roomsNeeded = Math.max(1, Math.ceil(travelers / 2));
  const nights = Math.max(1, days - 1);

  const breakdown = useMemo(() => {
    const transport = Math.round(customTransportPerPerson * travelers);
    const accommodation = Math.round(customNightlyRate * roomsNeeded * nights);
    const food = Math.round(customFoodPerPersonDay * travelers * days);
    const activities = Math.round(customActivitiesPerPersonDay * travelers * days);
    const total = transport + accommodation + food + activities;
    const perPerson = Math.round(total / Math.max(1, travelers));
    const perDay = Math.round(total / Math.max(1, days));
    return { transport, accommodation, food, activities, total, perPerson, perDay };
  }, [
    customActivitiesPerPersonDay,
    customFoodPerPersonDay,
    customNightlyRate,
    customTransportPerPerson,
    days,
    nights,
    roomsNeeded,
    travelers,
  ]);

  const categories = [
    { label: 'Transport & Transit', amount: breakdown.transport, color: 'bg-[#0B1F3A]' },
    { label: 'Accommodation', amount: breakdown.accommodation, color: 'bg-[#0284C7]' },
    { label: 'Food & Dining', amount: breakdown.food, color: 'bg-[#38BDF8]' },
    { label: 'Activities & Entry', amount: breakdown.activities, color: 'bg-slate-400' },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      <div className="bg-[#0B1F3A] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-3">
            Travel Budget Calculator
          </h1>
          <p className="text-slate-300 text-base max-w-2xl">
            Adjust your budget tier, trip length, and traveller count to estimate approximate costs across transport, lodging, dining, and activities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-[#0284C7]" aria-hidden="true" />
                <h2 className="font-display text-xl font-semibold text-[#0B1F3A]">
                  Trip parameters
                </h2>
              </div>
              <button
                type="button"
                onClick={() => applyTierPreset(budgetTier)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0B1F3A] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset rates
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="budget-destination" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Destination
                </label>
                <input
                  id="budget-destination"
                  type="text"
                  list="tripmate-destinations-list"
                  value={destination}
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
                />
                <datalist id="tripmate-destinations-list">
                  {DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <span className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Budget style
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl" role="group" aria-label="Budget style">
                  {(['budget', 'moderate', 'luxury'] as BudgetTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => applyTierPreset(tier)}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="budget-days" className="font-medium text-[#0B1F3A]">
                    Duration (days)
                  </label>
                  <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
                    {days} {days === 1 ? 'day' : 'days'} ({nights} {nights === 1 ? 'night' : 'nights'})
                  </span>
                </div>
                <input
                  id="budget-days"
                  type="range"
                  min={1}
                  max={21}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-[#0B1F3A] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="budget-travelers" className="font-medium text-[#0B1F3A]">
                    Travellers
                  </label>
                  <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
                    {travelers} {travelers === 1 ? 'person' : 'people'} ({roomsNeeded} {roomsNeeded === 1 ? 'room' : 'rooms'})
                  </span>
                </div>
                <input
                  id="budget-travelers"
                  type="range"
                  min={1}
                  max={16}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full accent-[#0B1F3A] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-4">
                Fine-tune approximate unit rates (USD)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rate-transport" className="block text-xs text-slate-600 mb-1">
                    Transport per traveller (flights / rail)
                  </label>
                  <input
                    id="rate-transport"
                    type="number"
                    min={0}
                    max={10000}
                    value={customTransportPerPerson}
                    onChange={(e) => setCustomTransportPerPerson(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm text-[#0B1F3A] tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="rate-stay" className="block text-xs text-slate-600 mb-1">
                    Accommodation per room / night
                  </label>
                  <input
                    id="rate-stay"
                    type="number"
                    min={0}
                    max={5000}
                    value={customNightlyRate}
                    onChange={(e) => setCustomNightlyRate(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm text-[#0B1F3A] tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="rate-food" className="block text-xs text-slate-600 mb-1">
                    Food & dining per person / day
                  </label>
                  <input
                    id="rate-food"
                    type="number"
                    min={0}
                    max={1000}
                    value={customFoodPerPersonDay}
                    onChange={(e) => setCustomFoodPerPersonDay(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm text-[#0B1F3A] tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="rate-activities" className="block text-xs text-slate-600 mb-1">
                    Activities & tickets per person / day
                  </label>
                  <input
                    id="rate-activities"
                    type="number"
                    min={0}
                    max={2000}
                    value={customActivitiesPerPersonDay}
                    onChange={(e) => setCustomActivitiesPerPersonDay(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm text-[#0B1F3A] tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Estimate Summary */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Approximate Total Estimate ({travelers} {travelers === 1 ? 'traveller' : 'travellers'}, {days} days)
              </p>
              <p className="font-mono text-4xl font-bold text-[#0B1F3A] tabular-nums mb-4">
                ~${breakdown.total.toLocaleString()} <span className="text-base font-normal text-slate-500">USD</span>
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                <div>
                  <p className="text-xs text-slate-500">Approx. per person</p>
                  <p className="font-mono text-lg font-semibold text-[#0B1F3A] tabular-nums">
                    ~${breakdown.perPerson.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Approx. group / day</p>
                  <p className="font-mono text-lg font-semibold text-[#0B1F3A] tabular-nums">
                    ~${breakdown.perDay.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stacked Bar */}
              <div className="h-3 w-full rounded-full overflow-hidden bg-slate-100 flex mb-5" aria-hidden="true">
                {categories.map((cat) => {
                  const pct = breakdown.total > 0 ? (cat.amount / breakdown.total) * 100 : 25;
                  return (
                    <div
                      key={cat.label}
                      className={cat.color}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>

              <div className="space-y-3 mb-7">
                {categories.map((cat) => {
                  const pct = breakdown.total > 0 ? Math.round((cat.amount / breakdown.total) * 100) : 0;
                  return (
                    <div key={cat.label} className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <span className={`w-2.5 h-2.5 rounded-xs ${cat.color}`} aria-hidden="true" />
                        {cat.label}
                      </span>
                      <span className="font-mono font-medium text-[#0B1F3A] tabular-nums">
                        ~${cat.amount.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                to={`/planner?destination=${encodeURIComponent(destination)}&days=${days}&travelers=${travelers}&budget=${budgetTier}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] transition-colors"
              >
                Build Itinerary for This Budget
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
              <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                All figures shown are <strong>approximate planning estimates</strong> based on typical seasonal rates. Actual prices vary with booking lead time, airfare class, and exchange rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
