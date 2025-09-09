// components/savings/DistributeModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { X, Gift } from "lucide-react";
import {
  SAVINGS_PRIORITIES,
  calculateGoalDistribution,
} from "../../utils/savings/savingsFormUtils";

const DistributeModal = ({
  isOpen,
  onClose,
  onDistribute,
  savingsGoals = [],
  unassignedCash = 0,
}) => {
  const [distribution, setDistribution] = useState({});
  const [totalToDistribute, setTotalToDistribute] = useState("");

  const initializeDistribution = useCallback(() => {
    const initialDistribution = {};
    savingsGoals.forEach((goal) => {
      initialDistribution[goal.id] = "";
    });
    setDistribution(initialDistribution);
    setTotalToDistribute("");
  }, [savingsGoals]);

  // Initialize distribution when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeDistribution();
    }
  }, [isOpen, initializeDistribution]);

  const calculateDistributionTotal = () => {
    return Object.values(distribution).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  const handleAutoDistribute = () => {
    const amount = parseFloat(totalToDistribute);
    if (!amount || amount <= 0) return;

    // Use the proportional distribution strategy from utils
    const autoDistribution = calculateGoalDistribution(
      savingsGoals,
      amount,
      "proportional",
    );

    setDistribution(autoDistribution);
  };

  const handleDistribute = () => {
    const totalDistributing = calculateDistributionTotal();
    if (totalDistributing <= 0 || totalDistributing > unassignedCash) {
      return;
    }

    // Filter out empty distributions
    const validDistribution = {};
    Object.entries(distribution).forEach(([goalId, amount]) => {
      const parsedAmount = parseFloat(amount);
      if (parsedAmount > 0) {
        validDistribution[goalId] = parsedAmount;
      }
    });

    if (Object.keys(validDistribution).length === 0) {
      return;
    }

    onDistribute(validDistribution);
    handleClose();
  };

  const handleClose = () => {
    initializeDistribution();
    onClose();
  };

  if (!isOpen) return null;

  const distributionTotal = calculateDistributionTotal();
  const isValidDistribution =
    distributionTotal > 0 && distributionTotal <= unassignedCash;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Distribute Unassigned Cash</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Available Cash Display */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-green-800">
              Available Unassigned Cash:
            </span>
            <span className="text-xl font-bold text-green-600">
              ${unassignedCash.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Distribution Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount to Distribute
              </label>
              <input
                type="number"
                step="0.01"
                max={unassignedCash}
                value={totalToDistribute}
                onChange={(e) => setTotalToDistribute(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAutoDistribute}
                disabled={
                  !totalToDistribute || parseFloat(totalToDistribute) <= 0
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Auto-Distribute
              </button>
            </div>
          </div>

          {/* Individual Goal Distribution */}
          {savingsGoals.map((goal) => {
            const remaining = goal.targetAmount - goal.currentAmount;
            const priority = SAVINGS_PRIORITIES.find(
              (p) => p.value === goal.priority,
            );

            return (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div>
                      <span className="font-medium">{goal.name}</span>
                      {priority && (
                        <span
                          className="ml-2 text-xs px-2 py-1 rounded-full"
                          style={{ color: priority.color }}
                        >
                          {priority.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    Need: ${remaining.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  max={Math.min(remaining, unassignedCash)}
                  value={distribution[goal.id] || ""}
                  onChange={(e) =>
                    setDistribution({
                      ...distribution,
                      [goal.id]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            );
          })}
        </div>

        {/* Distribution Summary */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total to Distribute:</span>
            <span className="text-lg font-bold">
              ${distributionTotal.toFixed(2)}
            </span>
          </div>
          {distributionTotal > unassignedCash && (
            <p className="text-red-600 text-sm mt-1">
              Exceeds available cash by $
              {(distributionTotal - unassignedCash).toFixed(2)}
            </p>
          )}
          {distributionTotal > 0 && distributionTotal <= unassignedCash && (
            <p className="text-green-600 text-sm mt-1">
              ✓ Valid distribution amount
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDistribute}
            disabled={!isValidDistribution}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Gift className="h-4 w-4" />
            <span>Distribute Funds</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistributeModal;
