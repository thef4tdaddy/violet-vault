import React from "react";
import { getIcon } from "../../../utils";
import { Button } from "../../ui";

interface AnalysisSettings {
  minAmount: number;
  minTransactions: number;
  overspendingThreshold: number;
  bufferPercentage: number;
  [key: string]: unknown;
}

interface SuggestionStats {
  totalSuggestions: number;
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  potentialSavings: number;
  [key: string]: unknown;
}

// SettingField component - reusable input field with label and help text
const SettingField: React.FC<{
  label: string;
  helpText: string;
  children: React.ReactNode;
}> = ({ label, helpText, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    <p className="text-xs text-gray-500 mt-1">{helpText}</p>
  </div>
);

// StatsDisplay component - shows suggestion statistics
const StatsDisplay: React.FC<{ stats: SuggestionStats }> = ({ stats }) => (
  <div className="bg-white rounded-lg p-3 border border-gray-200">
    <h5 className="font-medium text-gray-900 mb-2 text-sm">Current Analysis</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      <div>
        <span className="text-gray-600 block">Total</span>
        <span className="font-bold text-gray-900">{stats.totalSuggestions}</span>
      </div>
      <div>
        <span className="text-gray-600 block">High Priority</span>
        <span className="font-bold text-red-600">{stats.priorityCounts.high}</span>
      </div>
      <div>
        <span className="text-gray-600 block">Medium Priority</span>
        <span className="font-bold text-amber-600">{stats.priorityCounts.medium}</span>
      </div>
      <div>
        <span className="text-gray-600 block">Low Priority</span>
        <span className="font-bold text-blue-600">{stats.priorityCounts.low}</span>
      </div>
    </div>
    {stats.potentialSavings > 0 && (
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="text-gray-600 text-xs">Potential Monthly Savings: </span>
        <span className="font-bold text-green-600 text-xs">
          ${stats.potentialSavings.toFixed(0)}
        </span>
      </div>
    )}
  </div>
);

interface SuggestionSettingsProps {
  settings: AnalysisSettings;
  onUpdateSettings: (updates: Partial<AnalysisSettings>) => void;
  onResetSettings: () => void;
  onRefresh: () => void;
  suggestionStats: SuggestionStats | null;
}

const SuggestionSettings: React.FC<SuggestionSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onRefresh,
  suggestionStats,
}) => {
  const handleSettingChange = (key: string, value: number) => {
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center">
          {React.createElement(getIcon("Settings"), {
            className: "h-4 w-4 mr-2 text-gray-600",
          })}
          Analysis Settings
        </h4>
        <div className="flex gap-2">
          <Button
            onClick={onRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Refresh suggestions"
          >
            {React.createElement(getIcon("RefreshCw"), {
              className: "h-4 w-4",
            })}
          </Button>
          <Button
            onClick={onResetSettings}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Reset to defaults"
          >
            {React.createElement(getIcon("RotateCcw"), {
              className: "h-4 w-4",
            })}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Amount */}
        <SettingField
          label="Minimum Spending Amount"
          helpText="Minimum total spending to suggest an envelope"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">$</span>
            </div>
            <input
              type="number"
              value={settings.minAmount}
              onChange={(e) => handleSettingChange("minAmount", parseFloat(e.target.value) || 0)}
              className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              placeholder="50"
              min="0"
              step="25"
            />
          </div>
        </SettingField>

        {/* Minimum Transactions */}
        <SettingField
          label="Minimum Transactions"
          helpText="Minimum transaction count to suggest an envelope"
        >
          <input
            type="number"
            value={settings.minTransactions}
            onChange={(e) => handleSettingChange("minTransactions", parseInt(e.target.value) || 1)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            placeholder="3"
            min="1"
            max="20"
          />
        </SettingField>

        {/* Overspending Threshold */}
        <SettingField
          label="Overspending Threshold"
          helpText="Budget multiplier to trigger overspending alerts"
        >
          <div className="relative">
            <input
              type="number"
              value={settings.overspendingThreshold}
              onChange={(e) =>
                handleSettingChange("overspendingThreshold", parseFloat(e.target.value) || 1)
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
        </SettingField>

        {/* Buffer Percentage */}
        <SettingField label="Suggestion Buffer" helpText="Buffer multiplier for suggested amounts">
          <div className="relative">
            <input
              type="number"
              value={settings.bufferPercentage}
              onChange={(e) =>
                handleSettingChange("bufferPercentage", parseFloat(e.target.value) || 1)
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
        </SettingField>
      </div>

      {/* Statistics */}
      {suggestionStats && <StatsDisplay stats={suggestionStats} />}
    </div>
  );
};

export default SuggestionSettings;
