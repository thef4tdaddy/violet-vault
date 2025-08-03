import { useState, useCallback, useMemo } from "react";
import { useBudget } from "./useBudget";

/**
 * Custom hook for managing virtual balance override functionality
 * Allows manual override of the calculated virtual balance (app balance)
 */
const useVirtualBalanceOverride = () => {
  const budget = useBudget();
  const { envelopes, savingsGoals, unassignedCash, actualBalance, setUnassignedCash } = budget;

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);

  // Calculate virtual balance components
  const { totalEnvelopeBalance, totalSavingsBalance, virtualBalance } = useMemo(() => {
    const totalEnvelopeBalance = envelopes.reduce((sum, env) => sum + (env.currentBalance || 0), 0);
    const totalSavingsBalance = savingsGoals.reduce(
      (sum, goal) => sum + (goal.currentAmount || 0),
      0
    );
    const virtualBalance = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;
    return { totalEnvelopeBalance, totalSavingsBalance, virtualBalance };
  }, [envelopes, savingsGoals, unassignedCash]);

  // Calculate difference
  const difference = useMemo(() => {
    return actualBalance - virtualBalance;
  }, [actualBalance, virtualBalance]);

  // Check if balances are reconciled (within 1 cent)
  const isReconciled = useMemo(() => {
    return Math.abs(difference) < 0.01;
  }, [difference]);

  // Validate input value (now allows negative values for overspending scenarios)
  const isValidValue = useCallback((value) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && isFinite(numValue);
  }, []);

  // Check if change is large (>$100 difference)
  const isLargeChange = useCallback(
    (newValue) => {
      const numValue = parseFloat(newValue);
      if (!isValidValue(newValue)) return false;
      return Math.abs(numValue - virtualBalance) > 100;
    },
    [virtualBalance, isValidValue]
  );

  // Start editing mode
  const startEditing = useCallback(() => {
    setEditValue(virtualBalance.toString());
    setIsEditing(true);
  }, [virtualBalance]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue("");
    setShowConfirmDialog(false);
    setPendingValue(null);
  }, []);

  // Update edit value
  const updateEditValue = useCallback((value) => {
    setEditValue(value);
  }, []);

  // Apply virtual balance override by adjusting unassigned cash
  const applyVirtualBalanceOverride = useCallback(
    (value) => {
      const newVirtualBalance = parseFloat(value);
      if (isValidValue(value)) {
        // Calculate how much unassigned cash should be to achieve target virtual balance
        // newVirtualBalance = totalEnvelopeBalance + totalSavingsBalance + newUnassignedCash
        // newUnassignedCash = newVirtualBalance - totalEnvelopeBalance - totalSavingsBalance
        const newUnassignedCash = newVirtualBalance - totalEnvelopeBalance - totalSavingsBalance;

        setUnassignedCash(newUnassignedCash);
        setIsEditing(false);
        setEditValue("");
        setShowConfirmDialog(false);
        setPendingValue(null);
      }
    },
    [isValidValue, totalEnvelopeBalance, totalSavingsBalance, setUnassignedCash]
  );

  // Save balance with confirmation check
  const saveBalance = useCallback(() => {
    if (!isValidValue(editValue)) {
      alert("Please enter a valid number");
      return;
    }

    // Check if large change needs confirmation
    if (isLargeChange(editValue)) {
      setPendingValue(editValue);
      setShowConfirmDialog(true);
    } else {
      applyVirtualBalanceOverride(editValue);
    }
  }, [editValue, isValidValue, isLargeChange, applyVirtualBalanceOverride]);

  // Confirm large change
  const confirmLargeChange = useCallback(() => {
    if (pendingValue) {
      applyVirtualBalanceOverride(pendingValue);
    }
  }, [pendingValue, applyVirtualBalanceOverride]);

  // Quick action: Set virtual balance to match actual balance
  const matchActualBalance = useCallback(() => {
    if (isLargeChange(actualBalance.toString())) {
      setPendingValue(actualBalance.toString());
      setShowConfirmDialog(true);
    } else {
      applyVirtualBalanceOverride(actualBalance.toString());
    }
  }, [actualBalance, isLargeChange, applyVirtualBalanceOverride]);

  // Quick adjustment actions for virtual balance
  const adjustVirtualBalance = useCallback(
    (amount) => {
      const newValue = virtualBalance + amount;
      if (Math.abs(amount) > 100) {
        setPendingValue(newValue.toString());
        setShowConfirmDialog(true);
      } else {
        applyVirtualBalanceOverride(newValue.toString());
      }
    },
    [virtualBalance, applyVirtualBalanceOverride]
  );

  // Format currency display
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  // Get status information (enhanced for negative balance support)
  const getBalanceStatus = useCallback(() => {
    // Check for negative virtual balance (overspending scenario)
    if (virtualBalance < 0) {
      return {
        status: "overspending",
        message: "⚠️ Overspending detected",
        color: "text-red-700",
        bgColor: "bg-red-100",
        textColor: "text-red-900",
        borderColor: "border-red-200",
        isNegative: true,
      };
    }

    // Check for negative unassigned cash (budget deficit)
    if (unassignedCash < 0) {
      return {
        status: "deficit",
        message: "Budget deficit",
        color: "text-orange-700",
        bgColor: "bg-orange-100",
        textColor: "text-orange-900",
        borderColor: "border-orange-200",
        isDeficit: true,
      };
    }

    if (isReconciled) {
      return {
        status: "reconciled",
        message: "Balances match",
        color: "text-green-600",
        bgColor: "bg-green-50",
        textColor: "text-green-900",
        borderColor: "border-green-200",
      };
    } else if (Math.abs(difference) <= 10) {
      return {
        status: "minor-difference",
        message: `Difference: ${formatCurrency(Math.abs(difference))}`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-900",
        borderColor: "border-yellow-200",
      };
    } else {
      return {
        status: "major-difference",
        message: `Difference: ${formatCurrency(Math.abs(difference))}`,
        color: "text-red-600",
        bgColor: "bg-red-50",
        textColor: "text-red-900",
        borderColor: "border-red-200",
      };
    }
  }, [isReconciled, difference, formatCurrency, virtualBalance, unassignedCash]);

  return {
    // State
    actualBalance,
    virtualBalance,
    difference,
    isReconciled,
    isEditing,
    editValue,
    showConfirmDialog,
    pendingValue,
    totalEnvelopeBalance,
    totalSavingsBalance,
    unassignedCash,

    // Validation
    isValidValue,
    isLargeChange,

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
  };
};

export default useVirtualBalanceOverride;
