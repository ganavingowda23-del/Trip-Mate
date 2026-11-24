export type BudgetTier = 'budget' | 'moderate' | 'luxury';

export type DestinationCategory =
  | 'Beaches'
  | 'Mountains'
  | 'Adventure'
  | 'Cities'
  | 'Historical Places';

export interface Destination {
  id: string;
  name: string;
  stateOrProvince: string;
  country: string;
  region: string;
  category: DestinationCategory;
  isSmallPlace: boolean;
  image: string;
  shortDescription: string;
  fullDescription: string;
  bestTimeToVisit: string;
  recommendedDays: number;
  dailyBudgetUsd: {
    budget: number;
    moderate: number;
    luxury: number;
  };
  highlights: string[];
  signatureDish: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  places: string[];
  activities: string[];
  foodSuggestions: string[];
  estimatedCostUsd: number;
  notes?: string;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface GeneratedItinerary {
  title: string;
  destination: string;
  startingLocation: string;
  travelDates: string;
  daysCount: number;
  travelers: number;
  budgetTier: BudgetTier;
  interests: string[];
  summary: string;
  estimatedTotal: number;
  currency: string;
  budgetBreakdown: BudgetBreakdown;
  days: ItineraryDay[];
}

export interface SavedTrip {
  id: string;
  ownerId?: string;
  title: string;
  destination: string;
  startingLocation: string;
  travelDates?: string;
  daysCount: number;
  travelers: number;
  budgetTier: BudgetTier;
  interests: string[];
  estimatedTotal: number;
  currency: string;
  days: ItineraryDay[];
  notes?: string;
  source?: 'local' | 'cloud';
  createdAtMs: number;
  updatedAtMs: number;
}

export interface PlannerRequestPayload {
  destination: string;
  startingLocation: string;
  travelDates?: string;
  daysCount: number;
  travelers: number;
  budgetTier: BudgetTier;
  interests: string[];
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}
