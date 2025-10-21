import React from "react";
import { getIcon } from "@/utils";

interface Stats {
  totalEnvelopes: number;
  totalTransactions: number;
  storageSizeFormatted: string;
  totalBills: number;
}

interface StatisticsGridProps {
  stats: Stats | null;
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-50 p-4 rounded-lg text-center">
        {React.createElement(getIcon("Database"), {
          className: "h-6 w-6 text-green-600 mx-auto mb-2",
        })}
        <div className="text-lg font-semibold text-green-900">{stats.totalEnvelopes}</div>
        <div className="text-xs text-green-700">Envelopes</div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg text-center">
        {React.createElement(getIcon("BarChart3"), {
          className: "h-6 w-6 text-purple-600 mx-auto mb-2",
        })}
        <div className="text-lg font-semibold text-purple-900">{stats.totalTransactions}</div>
        <div className="text-xs text-purple-700">Transactions</div>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg text-center">
        {React.createElement(getIcon("HardDrive"), {
          className: "h-6 w-6 text-amber-600 mx-auto mb-2",
        })}
        <div className="text-lg font-semibold text-amber-900">{stats.storageSizeFormatted}</div>
        <div className="text-xs text-amber-700">Storage Used</div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg text-center">
        {React.createElement(getIcon("Monitor"), {
          className: "h-6 w-6 text-gray-600 mx-auto mb-2",
        })}
        <div className="text-lg font-semibold text-gray-900">{stats.totalBills}</div>
        <div className="text-xs text-gray-700">Bills</div>
      </div>
    </div>
  );
};

export default StatisticsGrid;
