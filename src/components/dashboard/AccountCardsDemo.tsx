import React from "react";
import AccountCards from "@/components/dashboard/AccountCards";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Demo page showcasing the glassmorphic account cards
 *
 * This is a standalone demo page for visual testing and verification
 * of the new AccountCards component.
 *
 * To use in production:
 * 1. Import AccountCards into MainDashboard.tsx
 * 2. Add <AccountCards className="mb-6" /> above or below AccountBalanceOverview
 * 3. AccountCards will automatically fetch data via TanStack Query hooks
 */
const AccountCardsDemo: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-black mb-2">
              <span className="text-5xl">A</span>CCOUNT <span className="text-5xl">C</span>ARDS{" "}
              <span className="text-5xl">D</span>EMO
            </h1>
            <p className="text-gray-600">
              Glassmorphic account cards with real-time data and direct action capabilities
            </p>
          </div>

          {/* Account Cards Component */}
          <AccountCards className="mb-8" />

          {/* Feature List */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-black text-black mb-4">
              <span className="text-3xl">F</span>EATURES
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Glassmorphism styling with backdrop blur</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Real-time data from TanStack Query hooks</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Responsive grid layout (1/2/3 columns)</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Loading skeletons with pulse animation</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Error state handling</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Direct "Allocate Funds" action button</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Hover effects and micro-animations</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>v2.0 ALL CAPS typography</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>100% test coverage</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AccountCardsDemo;
