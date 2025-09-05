import React from "react";
import { Settings, RefreshCw, RotateCcw } from "lucide-react";

const SuggestionSettings = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onRefresh,
  suggestionStats,
}) => {
  const handleSettingChange = (key, value) => {
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Settings className="h-4 w-4 mr-2 text-gray-600" />
          Analysis Settings
        </h4>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Refresh suggestions"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onResetSettings}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Spending Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">$</span>
            </div>
            <input
              type="number"
              value={settings.minAmount}
              onChange={(e) =>
                handleSettingChange(
                  "minAmount",
                  parseFloat(e.target.value) || 0,
                )
              }
              className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              placeholder="50"
              min="0"
              step="25"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum total spending to suggest an envelope
          </p>
        </div>

        {/* Minimum Transactions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Transactions
          </label>
          <input
            type="number"
            value={settings.minTransactions}
            onChange={(e) =>
              handleSettingChange(
                "minTransactions",
                parseInt(e.target.value) || 1,
              )
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            placeholder="3"
            min="1"
            max="20"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum transaction count to suggest an envelope
          </p>
        </div>

        {/* Overspending Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overspending Threshold
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.overspendingThreshold}
              onChange={(e) =>
                handleSettingChange(
                  "overspendingThreshold",
                  parseFloat(e.target.value) || 1,
                )
              }
              className="block w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              placeholder="1.2"
              min="1"
              max="3"
              step="0.1"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">x</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Budget multiplier to trigger overspending alerts
          </p>
        </div>

        {/* Buffer Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suggestion Buffer
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.bufferPercentage}
              onChange={(e) =>
                handleSettingChange(
                  "bufferPercentage",
                  parseFloat(e.target.value) || 1,
                )
              }
              className="block w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              placeholder="1.1"
              min="1"
              max="2"
              step="0.1"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">x</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Buffer multiplier for suggested amounts
          </p>
        </div>
      </div>

      {/* Statistics */}
      {suggestionStats && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2 text-sm">
            Current Analysis
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-600 block">Total</span>
              <span className="font-bold text-gray-900">
                {suggestionStats.totalSuggestions}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block">High Priority</span>
              <span className="font-bold text-red-600">
                {suggestionStats.priorityCounts.high}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block">Medium Priority</span>
              <span className="font-bold text-amber-600">
                {suggestionStats.priorityCounts.medium}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block">Low Priority</span>
              <span className="font-bold text-blue-600">
                {suggestionStats.priorityCounts.low}
              </span>
            </div>
          </div>

          {suggestionStats.potentialSavings > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-gray-600 text-xs">
                Potential Monthly Savings:{" "}
              </span>
              <span className="font-bold text-green-600 text-xs">
                ${suggestionStats.potentialSavings.toFixed(0)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionSettings;
