import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

/**
 * Offline Fallback Page
 * Displayed when user tries to access uncached routes while offline
 */
const OfflinePage: React.FC = () => {
  const retryConnection = (): void => {
    // Attempt to reload the page when online
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-xl">
            <span className="text-white font-black text-3xl">V</span>
          </div>
          <h1 className="font-black text-black text-3xl mb-2">
            <span className="text-4xl">V</span>IOLET <span className="text-4xl">V</span>AULT
          </h1>
        </div>

        {/* Offline Message */}
        <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-white/80 backdrop-blur-sm mb-6">
          <div className="mb-4">
            {React.createElement(getIcon("WifiOff"), {
              className: "w-12 h-12 mx-auto text-gray-600 mb-4",
            })}
          </div>

          <h2 className="font-black text-black text-xl mb-3">
            <span className="text-2xl">Y</span>OU'RE <span className="text-2xl">O</span>FFLINE
          </h2>

          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            This page isn't available offline, but your core budgeting features still work.
          </p>

          <div className="space-y-3 text-left text-sm">
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("PieChart"), {
                className: "w-4 h-4 text-green-600 flex-shrink-0",
              })}
              <span className="text-gray-700">View your budget and envelopes</span>
            </div>
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("CreditCard"), {
                className: "w-4 h-4 text-green-600 flex-shrink-0",
              })}
              <span className="text-gray-700">Add transactions (queued for sync)</span>
            </div>
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("List"), {
                className: "w-4 h-4 text-green-600 flex-shrink-0",
              })}
              <span className="text-gray-700">Review transaction history</span>
            </div>
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("DollarSign"), {
                className: "w-4 h-4 text-green-600 flex-shrink-0",
              })}
              <span className="text-gray-700">Manage bills and due dates</span>
            </div>
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("BarChart"), {
                className: "w-4 h-4 text-green-600 flex-shrink-0",
              })}
              <span className="text-gray-700">View analytics and spending trends</span>
            </div>
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("Target"), {
                className: "w-4 h-4 text-green-600 flex-shrink-0",
              })}
              <span className="text-gray-700">Track savings goals progress</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={retryConnection}
            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </Button>

          <Button
            onClick={() => window.history.back()}
            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </Button>
        </div>

        {/* Connection Status */}
        <div className="mt-6 text-xs text-gray-500">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              navigator.onLine ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {navigator.onLine ? "Connected" : "Offline"}
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
