import React from "react";
import { getIcon } from "../../../utils";

/**
 * Statistics display component for Local-Only Mode Settings
 * Extracted from LocalOnlyModeSettings.jsx following refactoring pattern
 * 
 * Features:
 * - Data usage statistics grid
 * - Color-coded stat cards
 * - Icons for visual identification
 * - Responsive grid layout
 */
const LocalOnlyModeStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      key: "totalEnvelopes",
      icon: "Database",
      color: "green",
      label: "Envelopes",
      value: stats.totalEnvelopes,
    },
    {
      key: "totalTransactions", 
      icon: "BarChart3",
      color: "purple",
      label: "Transactions",
      value: stats.totalTransactions,
    },
    {
      key: "storageSizeFormatted",
      icon: "HardDrive", 
      color: "amber",
      label: "Storage Used",
      value: stats.storageSizeFormatted,
    },
    {
      key: "totalBills",
      icon: "Monitor",
      color: "gray", 
      label: "Bills",
      value: stats.totalBills,
    },
  ];

  return (
    <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl mb-6">
      <h4 className="font-black text-black text-base mb-4">
        <span className="text-lg">D</span>ATA STATISTICS
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className={`glassmorphism rounded-xl p-4 border-2 border-black bg-${stat.color}-100/40 backdrop-blur-sm text-center shadow-lg hover:shadow-xl transition-all`}
          >
            {React.createElement(getIcon(stat.icon), {
              className: `h-8 w-8 text-${stat.color}-600 mx-auto mb-3`,
            })}
            <div className={`text-2xl font-black text-${stat.color}-900 mb-1`}>
              {stat.value}
            </div>
            <div className={`text-xs text-${stat.color}-700 font-medium uppercase tracking-wide`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalOnlyModeStats;