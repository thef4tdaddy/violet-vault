import React from "react";
import {
  X,
  DollarSign,
  Users,
  Percent,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useBudgetStore } from "../../stores/budgetStore";
import useUnassignedCashDistribution from "../../hooks/useUnassignedCashDistribution";

/**
 * Modal for distributing unassigned cash to envelopes
 * Pure UI component - all logic handled by useUnassignedCashDistribution hook
 */
const UnassignedCashModal = () => {
  const { isUnassignedCashModalOpen, closeUnassignedCashModal } =
    useBudgetStore();
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
    applyDistribution,

    // Data
    envelopes,
    unassignedCash,
    getDistributionPreview,
  } = useUnassignedCashDistribution();

  if (!isUnassignedCashModalOpen) return null;

  const preview = getDistributionPreview();
  const hasDistributions = totalDistributed > 0;
  const isOverDistributed = totalDistributed > unassignedCash;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {unassignedCash < 0
                ? "Address Budget Deficit"
                : "Distribute Unassigned Cash"}
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
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Distribution Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Distributing</div>
              <div
                className={`text-xl font-bold ${isOverDistributed ? "text-red-600" : "text-blue-600"}`}
              >
                ${totalDistributed.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Remaining</div>
              <div
                className={`text-xl font-bold ${remainingCash < 0 ? "text-red-600" : "text-green-600"}`}
              >
                ${remainingCash.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Status</div>
              <div className="flex items-center justify-center">
                {isOverDistributed ? (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">
                      {unassignedCash < 0
                        ? "Increasing Deficit"
                        : "Over Budget"}
                    </span>
                  </div>
                ) : hasDistributions ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">No Distribution</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={distributeEqually}
            disabled={isProcessing || envelopes.length === 0}
            className="btn btn-secondary flex items-center text-sm disabled:opacity-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Distribute Equally
          </button>
          <button
            onClick={distributeProportionally}
            disabled={isProcessing || envelopes.length === 0}
            className="btn btn-secondary flex items-center text-sm disabled:opacity-50"
          >
            <Percent className="h-4 w-4 mr-2" />
            Distribute Proportionally
          </button>
          <button
            onClick={clearDistributions}
            disabled={isProcessing || !hasDistributions}
            className="btn btn-secondary flex items-center text-sm disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>

        {/* Envelope List */}
        <div className="flex-1 overflow-hidden">
          <h4 className="font-medium text-gray-900 mb-3">Select Envelopes</h4>

          {envelopes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No envelopes available for distribution</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-64 space-y-3">
              {envelopes.map((envelope) => {
                const distributionAmount = distributions[envelope.id] || 0;
                const newBalance =
                  (envelope.currentAmount || 0) + distributionAmount;

                return (
                  <div
                    key={envelope.id}
                    className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: envelope.color }}
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">
                            {envelope.name}
                          </h5>
                          <p className="text-xs text-gray-600">
                            Current: ${(envelope.currentAmount || 0).toFixed(2)}
                            {envelope.monthlyAmount && (
                              <span className="ml-2">
                                • Budget: ${envelope.monthlyAmount.toFixed(2)}
                                /month
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={distributionAmount || ""}
                            onChange={(e) =>
                              updateDistribution(envelope.id, e.target.value)
                            }
                            disabled={isProcessing}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            placeholder="0.00"
                          />
                          {distributionAmount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              New: ${newBalance.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {preview.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">
              Distribution Preview
            </h4>
            <div className="bg-blue-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {preview.map((envelope) => (
                  <div
                    key={envelope.id}
                    className="flex justify-between text-sm"
                  >
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
            className="flex-1 btn btn-primary disabled:opacity-50 flex items-center justify-center"
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

export default UnassignedCashModal;
