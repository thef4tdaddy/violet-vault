import React from "react";
import {
  Wallet,
  Edit3,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  Minus,
  TrendingDown,
} from "lucide-react";
import useVirtualBalanceOverride from "../../hooks/useVirtualBalanceOverride";

/**
 * Enhanced virtual balance display with inline editing capability
 * Allows users to manually override the calculated virtual balance
 */
const VirtualBalanceDisplay = ({ className = "" }) => {
  const {
    // State
    virtualBalance,
    isEditing,
    editValue,
    showConfirmDialog,
    pendingValue,
    totalEnvelopeBalance,
    totalSavingsBalance,
    unassignedCash,

    // Validation
    isValidValue,

    // Actions
    startEditing,
    cancelEditing,
    updateEditValue,
    saveBalance,
    confirmLargeChange,
    matchActualBalance,
    adjustVirtualBalance,

    // Utilities
    formatCurrency,
    getBalanceStatus,
  } = useVirtualBalanceOverride();

  const balanceStatus = getBalanceStatus();

  if (showConfirmDialog) {
    return (
      <div className={`bg-yellow-50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-yellow-900">Confirm Balance Change</h3>
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        </div>

        <div className="space-y-4">
          <p className="text-sm text-yellow-800">
            This will change your virtual balance by more than $100. Are you sure?
          </p>

          <div className="bg-white rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Virtual Balance:</span>
              <span className="font-medium">{formatCurrency(virtualBalance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>New Virtual Balance:</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(parseFloat(pendingValue))}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Change:</span>
              <span
                className={
                  parseFloat(pendingValue) > virtualBalance ? "text-green-600" : "text-red-600"
                }
              >
                {parseFloat(pendingValue) > virtualBalance ? "+" : ""}
                {formatCurrency(parseFloat(pendingValue) - virtualBalance)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cancelEditing}
              className="flex-1 btn btn-secondary flex items-center justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={confirmLargeChange}
              className="flex-1 btn btn-primary flex items-center justify-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine icon and header styling based on balance status
  const getHeaderIcon = () => {
    if (balanceStatus.isNegative) {
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    }
    return <Wallet className="h-5 w-5 text-green-600" />;
  };

  return (
    <div
      className={`${balanceStatus.bgColor} border-2 ${balanceStatus.borderColor} rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium ${balanceStatus.textColor}`}>
          Virtual Balance
          {balanceStatus.isNegative && (
            <span className="ml-2 text-xs font-normal">(Overspending)</span>
          )}
          {balanceStatus.isDeficit && <span className="ml-2 text-xs font-normal">(Deficit)</span>}
        </h3>
        {getHeaderIcon()}
      </div>

      <div className="space-y-3">
        {/* Virtual Balance Display/Editor */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => updateEditValue(e.target.value)}
                className="flex-1 text-2xl font-bold bg-white border border-green-300 rounded px-2 py-1 text-green-900 focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveBalance();
                  if (e.key === "Escape") cancelEditing();
                }}
              />
              <div className="flex space-x-1">
                <button
                  onClick={saveBalance}
                  disabled={!isValidValue(editValue)}
                  className="btn btn-sm btn-primary disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={cancelEditing} className="btn btn-sm btn-secondary">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {!isValidValue(editValue) && editValue && (
              <p className="text-xs text-red-600">Please enter a valid number</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={startEditing}
              className="group flex items-center space-x-2 hover:bg-green-100 rounded p-1 -m-1 transition-colors"
              title="Click to edit virtual balance"
            >
              <div className={`text-2xl font-bold ${balanceStatus.textColor}`}>
                {formatCurrency(virtualBalance)}
              </div>
              <Edit3 className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Breakdown */}
        <div className={`text-sm ${balanceStatus.color} space-y-1`}>
          <div>Envelopes: {formatCurrency(totalEnvelopeBalance || 0)}</div>
          <div>Savings: {formatCurrency(totalSavingsBalance || 0)}</div>
          <div className={unassignedCash < 0 ? "font-semibold text-red-700" : ""}>
            Unassigned: {formatCurrency(unassignedCash || 0)}
            {unassignedCash < 0 && <span className="ml-1">⚠️</span>}
          </div>
        </div>

        {/* Quick Actions */}
        {!isEditing && (
          <div className={`pt-3 border-t ${balanceStatus.borderColor} space-y-2`}>
            <div className={`flex items-center justify-between text-xs ${balanceStatus.color}`}>
              <span>Quick Actions:</span>
              <span className={balanceStatus.color}>{balanceStatus.message}</span>
            </div>

            {/* Recovery Actions for Negative Balances */}
            {(virtualBalance < 0 || unassignedCash < 0) && (
              <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
                <div className="text-xs font-medium text-red-800">💡 Recovery Suggestions:</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      adjustVirtualBalance(
                        Math.abs(virtualBalance < 0 ? virtualBalance : unassignedCash)
                      )
                    }
                    className="btn btn-xs bg-red-100 text-red-700 border-red-300 hover:bg-red-200 flex items-center"
                    title="Add enough to balance budget"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Balance Budget
                  </button>
                  <button
                    onClick={matchActualBalance}
                    className="btn btn-xs bg-red-100 text-red-700 border-red-300 hover:bg-red-200 flex items-center"
                    title="Set virtual balance to match actual balance"
                  >
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    Match Bank
                  </button>
                </div>
                <div className="text-xs text-red-700">
                  Consider reducing spending or adding income to resolve the deficit.
                </div>
              </div>
            )}

            {/* Standard Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={matchActualBalance}
                className="btn btn-xs btn-secondary flex items-center"
                title="Set virtual balance to match actual balance"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Match Bank
              </button>

              <button
                onClick={() => adjustVirtualBalance(50)}
                className="btn btn-xs btn-secondary flex items-center"
                title="Add $50"
              >
                <Plus className="h-3 w-3 mr-1" />
                $50
              </button>

              <button
                onClick={() => adjustVirtualBalance(-50)}
                className="btn btn-xs btn-secondary flex items-center"
                title="Subtract $50"
              >
                <Minus className="h-3 w-3 mr-1" />
                $50
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualBalanceDisplay;
