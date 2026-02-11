import { useCallback } from "react";
import { useBudgetMetadataQuery } from "./useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "./useBudgetMetadataMutation";
import logger from "@/utils/core/common/logger";

interface FormatBalanceOptions {
  showCurrency?: boolean;
  showSign?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export const useBudgetMetadataUtils = () => {
  const { actualBalance, isActualBalanceManual } = useBudgetMetadataQuery();
  const { mutation: updateMetadataMutation } = useBudgetMetadataMutation();

  const setBiweeklyAllocation = useCallback(
    async (amount: number) => {
      if (typeof amount !== "number" || isNaN(amount)) {
        logger.warn("Invalid biweekly allocation:", { amount });
        return false;
      }

      try {
        await updateMetadataMutation.mutateAsync({
          biweeklyAllocation: amount,
        });
        return true;
      } catch (error) {
        logger.error("Failed to update biweekly allocation:", error);
        return false;
      }
    },
    [updateMetadataMutation]
  );

  const getBalanceDifference = useCallback(
    (calculatedBalance: number) => {
      if (!isActualBalanceManual || !calculatedBalance) return 0;
      return actualBalance - calculatedBalance;
    },
    [actualBalance, isActualBalanceManual]
  );

  const shouldConfirmChange = useCallback(
    (newBalance: number, threshold = 500) => {
      const changeAmount = Math.abs(newBalance - actualBalance);
      return changeAmount >= threshold;
    },
    [actualBalance]
  );

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
    setBiweeklyAllocation,
    getBalanceDifference,
    shouldConfirmChange,
    formatBalance,
    validateBalanceInput,
  };
};
