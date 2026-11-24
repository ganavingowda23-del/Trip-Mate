# TripMate — Your Journey, Your Way

TripMate is a full-stack, AI-powered travel planning web application built with React, Vite, Tailwind CSS, Express, the Google Gemini API (`@google/genai`), and Firebase Firestore.

## Features

- **Home**: Hero destination search, quick navigation to trip planning and destination discovery, and curated popular destinations.
- **AI Trip Planner**: Generates personalised day-by-day itineraries with places to visit, activities, food suggestions, and approximate daily costs using Gemini on the backend. Includes inline editing, regeneration, and graceful sample-itinerary fallback when `GEMINI_API_KEY` is not yet configured.
- **AI Travel Assistant**: Conversational travel advisor powered by Gemini through the `/api/chat` backend endpoint with typing indicators and contextual travel tips.
- **Budget Calculator**: Interactive estimator breaking down approximate transport, accommodation, food, and activity costs by budget tier and traveller count.
- **Explore Destinations**: Searchable and filterable travel directory (`Beaches`, `Mountains`, `Adventure`, `Cities`, `Historical Places`) with estimated budgets and best seasons to visit.
- **Saved Trips**: Save, view, edit notes/titles, and delete trip plans with instant `localStorage` persistence and optional Google Sign-In cloud sync to Firebase Firestore.
- **About & Contact**: Overview of TripMate's mission and a validated contact form backed by `/api/contact`.

## Prerequisites

- Node.js 20+ (tested on Node 22)
- npm or bun

## Environment Variables

Configure environment variables in your host or local `.env` file (see `.env.example`):

- `GEMINI_API_KEY` — Google Gemini API key used strictly on the backend (`server.ts`). Never exposed to browser bundles.
- `PORT` — Optional server port (defaults to `3000`).

Firebase web configuration is stored in `firebase-applet-config.json` and Firestore security rules are defined in `firestore.rules`.

## Local Setup & Run Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (Express API + Vite middleware on port 3000):
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

4. Type-check and build for production:
   ```bash
   npm run lint
   npm run build
   ```

5. Start the production server:
   ```bash
   NODE_ENV=production npm start
   ```
