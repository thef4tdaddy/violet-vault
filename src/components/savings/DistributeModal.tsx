// components/savings/DistributeModal.jsx
import { Button } from "@/components/ui";
import React, { useState, useEffect, useCallback } from "react";
import { getIcon } from "../../utils";
import {
  SAVINGS_PRIORITIES,
  calculateGoalDistribution,
} from "@/utils/domain/savings/savingsFormUtils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: string;
  color?: string;
}

interface DistributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDistribute: (distribution: Record<string, number>) => void;
  savingsGoals?: SavingsGoal[];
  unassignedCash?: number;
}

const createEmptyDistribution = (goals: SavingsGoal[]) => {
  const distribution: Record<string, string> = {};
  goals.forEach((goal) => {
    distribution[goal.id] = "";
  });
  return distribution;
};

const calculateTotal = (distribution: Record<string, string>) => {
  return Object.values(distribution).reduce((sum, amount) => {
    return sum + (parseFloat(amount) || 0);
  }, 0);
};

const filterValidDistribution = (distribution: Record<string, string>) => {
  const valid: Record<string, number> = {};
  Object.entries(distribution).forEach(([goalId, amount]) => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      valid[goalId] = parsedAmount;
    }
  });
  return valid;
};

const DistributeModal = ({
  isOpen,
  onClose,
  onDistribute,
  savingsGoals = [],
  unassignedCash = 0,
}: DistributeModalProps) => {
  const [distribution, setDistribution] = useState<Record<string, string>>({});
  const [totalToDistribute, setTotalToDistribute] = useState("");
  const modalRef = useModalAutoScroll(isOpen);

  const initializeDistribution = useCallback(() => {
    setDistribution(createEmptyDistribution(savingsGoals));
    setTotalToDistribute("");
  }, [savingsGoals]);

  useEffect(() => {
    if (isOpen) {
      initializeDistribution();
    }
  }, [isOpen, initializeDistribution]);

  const handleAutoDistribute = () => {
    const amount = parseFloat(totalToDistribute);
    if (!amount || amount <= 0) return;
    const numericDistribution = calculateGoalDistribution(
      savingsGoals as never,
      amount,
      "proportional"
    ) as Record<string, number>;
    // Convert numeric distribution to string format for the state
    const stringDistribution: Record<string, string> = {};
    Object.entries(numericDistribution).forEach(([key, value]) => {
      stringDistribution[key] = value.toString();
    });
    setDistribution(stringDistribution);
  };

  const handleDistribute = () => {
    const totalDistributing = calculateTotal(distribution);
    if (totalDistributing <= 0 || totalDistributing > unassignedCash) return;

    const validDistribution = filterValidDistribution(distribution);
    if (Object.keys(validDistribution).length === 0) return;

    onDistribute(validDistribution);
    handleClose();
  };

  const handleClose = () => {
    initializeDistribution();
    onClose();
  };

  if (!isOpen) return null;

  const distributionTotal = calculateTotal(distribution);
  const isValidDistribution = distributionTotal > 0 && distributionTotal <= unassignedCash;

  const updateGoalAmount = (goalId: string, value: string) => {
    setDistribution({ ...distribution, [goalId]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-2xl my-auto"
      >
        <ModalHeader onClose={handleClose} />
        <AvailableCash amount={unassignedCash} />
        <DistributionControls
          totalToDistribute={totalToDistribute}
          setTotalToDistribute={setTotalToDistribute}
          onAutoDistribute={handleAutoDistribute}
          unassignedCash={unassignedCash}
        />
        <GoalsList
          goals={savingsGoals}
          distribution={distribution}
          updateGoalAmount={updateGoalAmount}
          unassignedCash={unassignedCash}
        />
        <DistributionSummary total={distributionTotal} unassignedCash={unassignedCash} />
        <ActionButtons
          onCancel={handleClose}
          onDistribute={handleDistribute}
          isValid={isValidDistribution}
        />
      </div>
    </div>
  );
};

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-xl font-semibold">Distribute Unassigned Cash</h3>
    <ModalCloseButton onClick={onClose} variant="outlineRed" />
  </div>
);

const AvailableCash = ({ amount }: { amount: number }) => (
  <div className="mb-6 p-4 bg-green-50 rounded-lg">
    <div className="flex items-center justify-between">
      <span className="font-medium text-green-800">Available Unassigned Cash:</span>
      <span className="text-xl font-bold text-green-600">${amount.toFixed(2)}</span>
    </div>
  </div>
);

const DistributionControls = ({
  totalToDistribute,
  setTotalToDistribute,
  onAutoDistribute,
  unassignedCash,
}: {
  totalToDistribute: string;
  setTotalToDistribute: (value: string) => void;
  onAutoDistribute: () => void;
  unassignedCash: number;
}) => (
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
        <Button
          onClick={onAutoDistribute}
          disabled={!totalToDistribute || parseFloat(totalToDistribute) <= 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Auto-Distribute
        </Button>
      </div>
    </div>
  </div>
);

const GoalsList = ({
  goals,
  distribution,
  updateGoalAmount,
  unassignedCash,
}: {
  goals: SavingsGoal[];
  distribution: Record<string, string>;
  updateGoalAmount: (goalId: string, value: string) => void;
  unassignedCash: number;
}) => (
  <div className="space-y-4 mb-6">
    {goals.map((goal) => (
      <GoalDistributionItem
        key={goal.id}
        goal={goal}
        amount={distribution[goal.id] || ""}
        onAmountChange={(value) => updateGoalAmount(goal.id, value)}
        unassignedCash={unassignedCash}
      />
    ))}
  </div>
);

const GoalDistributionItem = ({
  goal,
  amount,
  onAmountChange,
  unassignedCash,
}: {
  goal: SavingsGoal;
  amount: string;
  onAmountChange: (value: string) => void;
  unassignedCash: number;
}) => {
  const remaining = goal.targetAmount - goal.currentAmount;
  const priority = SAVINGS_PRIORITIES.find((p) => p.value === goal.priority);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
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
        <span className="text-sm text-gray-600">Need: ${remaining.toFixed(2)}</span>
      </div>
      <input
        type="number"
        step="0.01"
        max={Math.min(remaining, unassignedCash)}
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        placeholder="0.00"
      />
    </div>
  );
};

const DistributionSummary = ({
  total,
  unassignedCash,
}: {
  total: number;
  unassignedCash: number;
}) => (
  <div className="border-t pt-4 mb-6">
    <div className="flex justify-between items-center">
      <span className="font-medium">Total to Distribute:</span>
      <span className="text-lg font-bold">${total.toFixed(2)}</span>
    </div>
    {total > unassignedCash && (
      <p className="text-red-600 text-sm mt-1">
        Exceeds available cash by ${(total - unassignedCash).toFixed(2)}
      </p>
    )}
    {total > 0 && total <= unassignedCash && (
      <p className="text-green-600 text-sm mt-1">✓ Valid distribution amount</p>
    )}
  </div>
);

const ActionButtons = ({
  onCancel,
  onDistribute,
  isValid,
}: {
  onCancel: () => void;
  onDistribute: () => void;
  isValid: boolean;
}) => (
  <div className="flex justify-end space-x-3">
    <Button
      onClick={onCancel}
      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      Cancel
    </Button>
    <Button
      onClick={onDistribute}
      disabled={!isValid}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      {React.createElement(getIcon("Gift"), { className: "h-4 w-4" })}
      <span>Distribute Funds</span>
    </Button>
  </div>
);

export default DistributeModal;
