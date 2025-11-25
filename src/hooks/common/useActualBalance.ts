import { useCallback } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";
import logger from "../../utils/common/logger";

interface UpdateBalanceOptions {
  isManual?: boolean;
  source?: string;
}

interface FormatBalanceOptions {
  showCurrency?: boolean;
  showSign?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Custom hook for managing actual balance operations
 * Handles business logic for balance updates, validations, and state management
 *
 * @deprecated Use useActualBalance from '@/hooks/budgeting/useBudgetMetadata' instead
 * This hook exists for backward compatibility but the proper implementation
 * uses TanStack Query + Dexie for data management.
 */
export const useActualBalance = () => {
  // Note: actualBalance is no longer in UiStore - it's managed by TanStack Query + Dexie
  // This hook provides a compatibility layer with hardcoded defaults
  const { isActualBalanceManual } = useBudgetStore(
    useShallow((state) => ({
      isActualBalanceManual: state.isActualBalanceManual,
    }))
  );

  // Default values since actualBalance is no longer in Zustand
  const actualBalance = 0;
  const setStoreBalance = (_balance: number) => {
    logger.warn(
      "useActualBalance from common/useActualBalance is deprecated. Use useActualBalance from @/hooks/budgeting/useBudgetMetadata instead."
    );
  };

  /**
   * Updates the actual balance with validation and audit logging
   * @param {number} newBalance - The new balance value
   * @param {UpdateBalanceOptions} options - Configuration options
   */
  const updateActualBalance = useCallback(
    (newBalance: number, options: UpdateBalanceOptions = {}) => {
      const { isManual = true, source = "manual" } = options;

      // Validate input
      if (typeof newBalance !== "number" || isNaN(newBalance)) {
        logger.warn("Invalid balance value provided:", { value: newBalance });
        return false;
      }

      // Business logic: reasonable balance limits
      const MAX_BALANCE = 1000000; // $1M limit
      const MIN_BALANCE = -100000; // -$100k limit (for overdrafts)

      if (newBalance > MAX_BALANCE || newBalance < MIN_BALANCE) {
        logger.warn("Balance outside reasonable limits:", {
          value: newBalance,
          limits: { max: MAX_BALANCE, min: MIN_BALANCE },
        });
        return false;
      }

      const previousBalance = actualBalance;

      // Update store with balance and metadata
      setStoreBalance(newBalance);

      // TODO: Add audit logging in future PR
      // This would track who changed what and when
      const auditEntry = {
        previousValue: previousBalance,
        newValue: newBalance,
        source,
        isManual,
        timestamp: new Date().toISOString(),
        change: newBalance - previousBalance,
      };

      // For now, just log to console (in production this would go to an audit service)
      logger.info("Balance updated", auditEntry);

      return true;
    },
    [actualBalance, setStoreBalance]
  );

  /**
   * Calculates the difference between manual and calculated balance
   * @param {number} calculatedBalance - The system-calculated balance
   * @returns {number} The difference (positive = manual is higher)
   */
  const getBalanceDifference = useCallback(
    (calculatedBalance: number) => {
      if (!isActualBalanceManual || !calculatedBalance) return 0;
      return actualBalance - calculatedBalance;
    },
    [actualBalance, isActualBalanceManual]
  );

  /**
   * Determines if a balance change should trigger confirmation
   * @param {number} newBalance - The proposed new balance
   * @param {number} threshold - The threshold for requiring confirmation
   * @returns {boolean} Whether confirmation is needed
   */
  const shouldConfirmChange = useCallback(
    (newBalance: number, threshold = 500) => {
      const changeAmount = Math.abs(newBalance - actualBalance);
      return changeAmount >= threshold;
    },
    [actualBalance]
  );

  /**
   * Formats balance for display
   * @param {number} balance - Balance to format
   * @param {FormatBalanceOptions} options - Formatting options
   * @returns {string} Formatted balance string
   */
  const formatBalance = useCallback((balance: number, options: FormatBalanceOptions = {}) => {
    const {
      showCurrency = true,
      showSign = false,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    const formatter = new Intl.NumberFormat("en-US", {
      style: showCurrency ? "currency" : "decimal",
      currency: "USD",
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay: showSign ? "always" : "auto",
    });

    return formatter.format(balance || 0);
  }, []);

  /**
   * Validates balance input string
   * @param {string} inputValue - The input string to validate
   * @returns {Object} Validation result with isValid and parsedValue
   */
  const validateBalanceInput = useCallback((inputValue: string) => {
    // Allow empty string, numbers, decimal point, and negative sign
    const isValidFormat = inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue);

    if (!isValidFormat) {
      return { isValid: false, error: "Invalid number format" };
    }

    if (inputValue === "" || inputValue === "-" || inputValue === ".") {
      return { isValid: true, parsedValue: 0 };
    }

    const parsedValue = parseFloat(inputValue);

    if (isNaN(parsedValue)) {
      return { isValid: false, error: "Not a valid number" };
    }

    return { isValid: true, parsedValue };
  }, []);

  return {
    // State
    actualBalance,
    isActualBalanceManual,

    // Actions
    updateActualBalance,

    // Computed values
    getBalanceDifference,
    shouldConfirmChange,

    // Utils
    formatBalance,
    validateBalanceInput,
  };
};
