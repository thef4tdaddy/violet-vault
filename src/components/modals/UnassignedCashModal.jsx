import React, { memo, lazy, Suspense } from "react";
import {
  X,
  DollarSign,
  Users,
  Percent,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Receipt,
} from "lucide-react";
import { useBudgetStore } from "../../stores/ui/uiStore";
import useUnassignedCashDistribution from "../../hooks/budgeting/useUnassignedCashDistribution";
import { ENVELOPE_TYPES } from "../../constants/categories";

const BillEnvelopeFundingInfo = lazy(() => import("../budgeting/BillEnvelopeFundingInfo"));

/**
 * Modal for distributing unassigned cash to envelopes
 * Pure UI component - all logic handled by useUnassignedCashDistribution hook
 */
const EnvelopeItem = memo(
  ({ envelope, distributionAmount, updateDistribution, isProcessing, bills = [] }) => {
    const newBalance = (envelope.currentBalance || 0) + distributionAmount;
    const isBillEnvelope = envelope.envelopeType === ENVELOPE_TYPES.BILL;

    return (
      <div className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex flex-col space-y-3">
          {/* Main envelope info and input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center flex-1">
              <div
                className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                style={{ backgroundColor: envelope.color }}
              />
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 text-sm truncate">{envelope.name}</h5>
                <p className="text-xs text-gray-600 truncate">
                  Current: ${(envelope.currentBalance || 0).toFixed(2)}
                  {(envelope.monthlyBudget ?? envelope.monthlyAmount) && (
                    <span className="hidden sm:inline ml-2">
                      • Budget: ${(envelope.monthlyBudget ?? envelope.monthlyAmount).toFixed(2)}
                      /month
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3">
              <div className="text-right">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={distributionAmount || ""}
                  onChange={(e) => updateDistribution(envelope.id, e.target.value)}
                  disabled={isProcessing}
                  className="w-24 sm:w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                  placeholder="0.00"
                />
                {distributionAmount > 0 && (
                  <div className="text-xs text-gray-500 mt-1">New: ${newBalance.toFixed(2)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Bill envelope funding info */}
          {isBillEnvelope && (
            <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
              <BillEnvelopeFundingInfo envelope={envelope} bills={bills} showDetails={false} />
            </Suspense>
          )}
        </div>
      </div>
    );
  }
);

const UnassignedCashModal = () => {
  const { isUnassignedCashModalOpen, closeUnassignedCashModal } = useBudgetStore();
  const {
    // State (except modal state)
    distributions,
    isProcessing,

    // Calculations
    totalDistributed,
    remainingCash,
    isValidDistribution,

    // Actions
    updateDistribution,
    clearDistributions,
    distributeEqually,
    distributeProportionally,
    distributeBillPriority,
    applyDistribution,

    // Data
    envelopes,
    bills,
    unassignedCash,
    getDistributionPreview,
  } = useUnassignedCashDistribution();

  if (!isUnassignedCashModalOpen) return null;

  const preview = getDistributionPreview();
  const hasDistributions = totalDistributed > 0;
  const isOverDistributed = totalDistributed > unassignedCash;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-xl rounded-t-xl p-4 sm:p-6 w-full max-w-4xl h-full sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {unassignedCash < 0 ? "Address Budget Deficit" : "Distribute Unassigned Cash"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {unassignedCash < 0 ? "Deficit:" : "Available:"}{" "}
              <span
                className={`font-medium ${unassignedCash < 0 ? "text-red-600" : "text-green-600"}`}
              >
                ${unassignedCash.toFixed(2)}
              </span>
              {unassignedCash < 0 && (
                <span className="ml-2 text-xs text-red-500">
                  (You've spent more than available)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={closeUnassignedCashModal}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Distribution Summary */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Distributing</div>
              <div
                className={`text-lg sm:text-xl font-bold ${isOverDistributed ? "text-red-600" : "text-blue-600"}`}
              >
                ${totalDistributed.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Remaining</div>
              <div
                className={`text-lg sm:text-xl font-bold ${remainingCash < 0 ? "text-red-600" : "text-green-600"}`}
              >
                ${remainingCash.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Status</div>
              <div className="flex items-center justify-center">
                {isOverDistributed ? (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-medium">
                      {unassignedCash < 0 ? "Increasing" : "Over"}
                    </span>
                  </div>
                ) : hasDistributions ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-medium">Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-medium">None</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={distributeBillPriority}
            disabled={isProcessing || envelopes.length === 0}
            className="btn btn-primary border-2 border-black flex items-center text-sm disabled:opacity-50"
            title="Smart distribution based on bill due dates and funding needs"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Smart Bills First
          </button>
          <button
            onClick={distributeEqually}
            disabled={isProcessing || envelopes.length === 0}
            className="btn btn-secondary border-2 border-black flex items-center text-sm disabled:opacity-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Distribute Equally
          </button>
          <button
            onClick={distributeProportionally}
            disabled={isProcessing || envelopes.length === 0}
            className="btn btn-secondary border-2 border-black flex items-center text-sm disabled:opacity-50"
          >
            <Percent className="h-4 w-4 mr-2" />
            Distribute Proportionally
          </button>
          <button
            onClick={clearDistributions}
            disabled={isProcessing || !hasDistributions}
            className="btn btn-secondary border-2 border-black flex items-center text-sm disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>

        {/* Envelope List */}
        <div className="flex-1 overflow-hidden">
          <h4 className="font-medium text-gray-900 mb-3 sticky top-0 bg-white py-1 z-10">
            Select Envelopes
          </h4>

          {envelopes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No envelopes available for distribution</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-64 sm:max-h-64 space-y-3">
              {envelopes.map((envelope) => (
                <EnvelopeItem
                  key={envelope.id}
                  envelope={envelope}
                  distributionAmount={distributions[envelope.id] || 0}
                  updateDistribution={updateDistribution}
                  isProcessing={isProcessing}
                  bills={bills}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {preview.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Distribution Preview</h4>
            <div className="bg-blue-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {preview.map((envelope) => (
                  <div key={envelope.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{envelope.name}</span>
                    <span className="text-blue-600 font-medium">
                      +${envelope.distributionAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={closeUnassignedCashModal}
            disabled={isProcessing}
            className="flex-1 btn btn-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={applyDistribution}
            disabled={!isValidDistribution || isProcessing}
            className="flex-1 btn btn-primary border-2 border-black disabled:opacity-50 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Distributing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Distribute ${totalDistributed.toFixed(2)}
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {isOverDistributed && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Distribution exceeds available cash by $
                {(totalDistributed - unassignedCash).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(UnassignedCashModal);
