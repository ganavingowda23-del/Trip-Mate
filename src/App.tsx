import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { TripsProvider } from './context/TripsContext';
import { AboutContactPage } from './pages/AboutContactPage';
import { AssistantPage } from './pages/AssistantPage';
import { BudgetPage } from './pages/BudgetPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { HomePage } from './pages/HomePage';
import { PlannerPage } from './pages/PlannerPage';
import { SavedTripsPage } from './pages/SavedTripsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TripsProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-white text-[#0B1F3A]">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/destinations" element={<DestinationsPage />} />
                  <Route path="/budget" element={<BudgetPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/saved" element={<SavedTripsPage />} />
                  <Route path="/about" element={<AboutContactPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TripsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
