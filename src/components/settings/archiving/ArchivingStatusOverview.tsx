import React from "react";
import { getIcon } from "../../../utils";

interface CurrentStats {
  totalTransactions: number;
  oldTransactions: number;
  veryOldTransactions: number;
}

interface PotentialSavings {
  savingsMB: number;
  savingsPercent: number;
}

interface ArchivingStatus {
  currentStats: CurrentStats;
  urgency: string;
  suggestedAction: string;
  potentialSavings?: PotentialSavings;
}

interface ArchivingStatusOverviewProps {
  archivingStatus: ArchivingStatus | null;
  needsArchiving: boolean;
  getUrgencyColor: (urgency: string) => string;
  getUrgencyIcon: (urgency: string) => React.ComponentType<{ className?: string }>;
}

const ArchivingStatusOverview = ({
  archivingStatus,
  needsArchiving,
  getUrgencyColor,
  getUrgencyIcon,
}: ArchivingStatusOverviewProps) => {
  if (!archivingStatus) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-900">
                {archivingStatus.currentStats.totalTransactions.toLocaleString()}
              </p>
            </div>
            {React.createElement(getIcon("Database"), {
              className: "h-8 w-8 text-blue-600",
            })}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Old Transactions (1+ years)</p>
              <p className="text-2xl font-bold text-yellow-900">
                {archivingStatus.currentStats.oldTransactions.toLocaleString()}
              </p>
            </div>
            {React.createElement(getIcon("Clock"), {
              className: "h-8 w-8 text-yellow-600",
            })}
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Very Old (2+ years)</p>
              <p className="text-2xl font-bold text-red-900">
                {archivingStatus.currentStats.veryOldTransactions.toLocaleString()}
              </p>
            </div>
            {React.createElement(getIcon("AlertTriangle"), {
              className: "h-8 w-8 text-red-600",
            })}
          </div>
        </div>
      </div>

      {/* Recommendation Alert */}
      {needsArchiving && (
        <div className={`p-4 rounded-lg border ${getUrgencyColor(archivingStatus.urgency)}`}>
          <div className="flex items-start space-x-3">
            {React.createElement(getUrgencyIcon(archivingStatus.urgency), {
              className: "h-5 w-5 mt-0.5 flex-shrink-0",
            })}
            <div className="flex-1">
              <p className="font-medium">{archivingStatus.suggestedAction}</p>
              {archivingStatus.potentialSavings && (
                <p className="text-sm mt-1">
                  Potential storage savings: {archivingStatus.potentialSavings.savingsMB}MB (
                  {archivingStatus.potentialSavings.savingsPercent}% reduction)
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivingStatusOverview;
