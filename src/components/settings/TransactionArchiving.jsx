import React, { useState } from "react";
import {
  Archive,
  Database,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  BarChart3,
  RefreshCw,
  Settings,
  Info,
} from "lucide-react";
import useTransactionArchiving from "../../hooks/useTransactionArchiving";
import logger from "../../utils/logger";

/**
 * Transaction Archiving Management Component
 * Allows users to manage old transaction data while preserving analytics
 */
const TransactionArchiving = () => {
  const {
    archivingStatus,
    lastResult,
    isArchiving,
    archivingProgress,
    isLoading,
    executeArchiving,
    refreshInfo,
    needsArchiving,
  } = useTransactionArchiving();

  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [confirmArchiving, setConfirmArchiving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleArchive = async () => {
    if (!confirmArchiving) {
      setConfirmArchiving(true);
      return;
    }

    try {
      await executeArchiving(selectedPeriod);
      setConfirmArchiving(false);
    } catch (error) {
      logger.error("Archiving failed:", error);
    }
  };

  const handlePreview = async () => {
    try {
      setShowPreview(true);
      // Create a temporary archiver to get preview data
      const { createArchiver } = await import(
        "../../utils/transactionArchiving"
      );
      const archiver = createArchiver();
      const cutoffDate = archiver.calculateCutoffDate(selectedPeriod);
      const transactionsToArchive =
        await archiver.getTransactionsForArchiving(cutoffDate);

      // Group by category and envelope for preview
      const preview = {
        totalCount: transactionsToArchive.length,
        cutoffDate,
        categories: {},
        envelopes: {},
        totalAmount: 0,
        dateRange: {
          earliest: null,
          latest: null,
        },
      };

      transactionsToArchive.forEach((transaction) => {
        // Categories
        const category = transaction.category || "Uncategorized";
        if (!preview.categories[category]) {
          preview.categories[category] = { count: 0, amount: 0 };
        }
        preview.categories[category].count++;
        preview.categories[category].amount += transaction.amount || 0;

        // Envelopes
        const envelopeId = transaction.envelopeId || "None";
        if (!preview.envelopes[envelopeId]) {
          preview.envelopes[envelopeId] = { count: 0, amount: 0 };
        }
        preview.envelopes[envelopeId].count++;
        preview.envelopes[envelopeId].amount += transaction.amount || 0;

        // Totals
        preview.totalAmount += transaction.amount || 0;

        // Date range
        if (
          !preview.dateRange.earliest ||
          transaction.date < preview.dateRange.earliest
        ) {
          preview.dateRange.earliest = transaction.date;
        }
        if (
          !preview.dateRange.latest ||
          transaction.date > preview.dateRange.latest
        ) {
          preview.dateRange.latest = transaction.date;
        }
      });

      setPreviewData(preview);
    } catch (error) {
      logger.error("Failed to generate preview:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Loading Transaction Archive Information...
          </h3>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "high":
        return AlertTriangle;
      case "medium":
        return Clock;
      case "low":
        return CheckCircle;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Archive className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Transaction Archiving
              </h2>
              <p className="text-gray-600 mt-1">
                Archive old transactions while preserving analytics data
              </p>
            </div>
          </div>
          <button
            onClick={refreshInfo}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {archivingStatus && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {archivingStatus.currentStats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">
                    Old Transactions (1+ years)
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {archivingStatus.currentStats.oldTransactions.toLocaleString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Very Old (2+ years)
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {archivingStatus.currentStats.veryOldTransactions.toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Recommendation Alert */}
          {needsArchiving && (
            <div
              className={`p-4 rounded-lg border ${getUrgencyColor(archivingStatus.urgency)}`}
            >
              <div className="flex items-start space-x-3">
                {React.createElement(getUrgencyIcon(archivingStatus.urgency), {
                  className: "h-5 w-5 mt-0.5 flex-shrink-0",
                })}
                <div className="flex-1">
                  <p className="font-medium">
                    {archivingStatus.suggestedAction}
                  </p>
                  {archivingStatus.potentialSavings && (
                    <p className="text-sm mt-1">
                      Potential storage savings:{" "}
                      {archivingStatus.potentialSavings.savingsMB}MB (
                      {archivingStatus.potentialSavings.savingsPercent}%
                      reduction)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Archiving Configuration */}
      {needsArchiving && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Archive Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archive transactions older than:
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                disabled={isArchiving}
              >
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months (1 year)</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months (2 years)</option>
                <option value={36}>36 months (3 years)</option>
                <option value={48}>48 months (4 years)</option>
                <option value={60}>60 months (5 years)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Transactions older than this period will be archived but
                analytics will be preserved
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    What happens during archiving:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Old transactions are compressed and moved to archives
                    </li>
                    <li>Analytics data is preserved in aggregated form</li>
                    <li>Historical insights remain available in reports</li>
                    <li>Database performance is improved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Settings className="h-4 w-4" />
                <span>Advanced Options</span>
              </button>

              {showAdvancedOptions && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preserveAnalytics"
                      defaultChecked={true}
                      disabled={true}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="preserveAnalytics"
                      className="text-sm text-gray-700"
                    >
                      Preserve analytics data (recommended)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="optimizeDatabase"
                      defaultChecked={true}
                      disabled={true}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="optimizeDatabase"
                      className="text-sm text-gray-700"
                    >
                      Optimize database after archiving
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Results */}
      {showPreview && previewData && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Archive Preview
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {previewData.totalCount === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">
                No transactions found for archiving with the selected period.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-900">
                    {previewData.totalCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700">
                    Transactions to Archive
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-900">
                    ${Math.abs(previewData.totalAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700">Total Amount</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-900">
                    {Object.keys(previewData.categories).length}
                  </p>
                  <p className="text-sm text-purple-700">Categories</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-900">
                    {previewData.dateRange.earliest
                      ? new Date(previewData.dateRange.earliest).getFullYear()
                      : "N/A"}{" "}
                    -{" "}
                    {previewData.dateRange.latest
                      ? new Date(previewData.dateRange.latest).getFullYear()
                      : "N/A"}
                  </p>
                  <p className="text-sm text-orange-700">Date Range</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Transactions by Category
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(previewData.categories)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 8)
                      .map(([category, data]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                        >
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {data.count} transactions
                            </span>
                            <br />
                            <span className="text-xs text-gray-500">
                              ${Math.abs(data.amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  {Object.keys(previewData.categories).length > 8 && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      +{Object.keys(previewData.categories).length - 8} more
                      categories
                    </p>
                  )}
                </div>
              </div>

              {/* Storage Impact */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <HardDrive className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Estimated Storage Impact
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Archiving these {previewData.totalCount.toLocaleString()}{" "}
                      transactions will reduce storage usage by approximately{" "}
                      {Math.round(
                        ((previewData.totalCount * 0.35) / 1024) * 100,
                      ) / 100}
                      MB while preserving all analytics data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cutoff Date Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-800">
                      Archive Cutoff Date
                    </p>
                    <p className="text-sm text-gray-600">
                      Transactions before{" "}
                      {new Date(previewData.cutoffDate).toLocaleDateString()}{" "}
                      will be archived
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Archiving Progress */}
      {isArchiving && archivingProgress && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Archiving in Progress
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Stage: {archivingProgress.stage}</span>
                <span>{archivingProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${archivingProgress.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Please wait while we archive your transactions...</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {needsArchiving && !isArchiving && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ready to Archive
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {confirmArchiving
                  ? 'Click "Confirm Archive" to proceed with archiving.'
                  : "Archive old transactions to improve performance and reduce storage."}
              </p>
            </div>

            <div className="flex space-x-3">
              {!showPreview && (
                <button
                  onClick={handlePreview}
                  disabled={isArchiving}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Preview First</span>
                </button>
              )}

              {confirmArchiving && (
                <button
                  onClick={() => setConfirmArchiving(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={handleArchive}
                className={`btn ${confirmArchiving ? "btn-danger" : "btn-primary"} flex items-center space-x-2`}
                disabled={isArchiving}
              >
                <Archive className="h-4 w-4" />
                <span>
                  {confirmArchiving ? "Confirm Archive" : "Start Archiving"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Last Archiving Result
          </h3>

          <div
            className={`p-4 rounded-lg ${lastResult.success ? "bg-green-50" : "bg-red-50"}`}
          >
            <div className="flex items-start space-x-3">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${lastResult.success ? "text-green-800" : "text-red-800"}`}
                >
                  {lastResult.success
                    ? "Archiving Completed Successfully"
                    : "Archiving Failed"}
                </p>
                <p
                  className={`text-sm mt-1 ${lastResult.success ? "text-green-700" : "text-red-700"}`}
                >
                  {lastResult.message || lastResult.error}
                </p>
                {lastResult.stats && (
                  <div className="mt-2 text-sm">
                    <p>Processed: {lastResult.stats.processed} transactions</p>
                    <p>Archived: {lastResult.stats.archived} transactions</p>
                    <p>
                      Analytics created: {lastResult.stats.aggregated} records
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Archiving Needed */}
      {!needsArchiving && !isLoading && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Archiving Needed
            </h3>
            <p className="text-gray-600">
              Your transaction data is well-optimized. Check back when you have
              more historical data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionArchiving;
