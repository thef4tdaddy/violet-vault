import { useEffect, useState } from "react";
import { useEnvelopes } from "./useEnvelopes";
import useBills from "./useBills";
import { useTransactions } from "./useTransactions";
import { useActualBalance } from "./useBudgetMetadata";
import useOnboardingStore from "../stores/onboardingStore";
import logger from "../utils/logger";

/**
 * Hook that automatically detects user actions and marks onboarding steps as complete
 */
export const useOnboardingAutoComplete = () => {
  const { markStepComplete, isStepComplete, preferences, isOnboarded } =
    useOnboardingStore();

  const { envelopes = [] } = useEnvelopes();
  const { bills = [] } = useBills();
  const { data: transactions = [] } = useTransactions();
  const { actualBalance } = useActualBalance();

  // Skip if user has disabled hints or is already onboarded
  // Also add delay to prevent immediate auto-completion before tutorial can show
  const [isReady, setIsReady] = useState(false);
  const shouldAutoComplete = preferences.showHints && !isOnboarded && isReady;

  // Delay auto-completion to allow tutorial to initialize first
  useEffect(() => {
    if (!preferences.showHints || isOnboarded) return;

    // Wait 3 seconds for tutorial to potentially show, then enable auto-completion
    const timer = setTimeout(() => {
      setIsReady(true);
      logger.info("🎯 Onboarding auto-completion enabled after delay");
    }, 3000);

    return () => clearTimeout(timer);
  }, [preferences.showHints, isOnboarded]);

  // Auto-complete bank balance step when actual balance is set
  useEffect(() => {
    if (!shouldAutoComplete) return;

    if (
      actualBalance !== null &&
      actualBalance !== undefined &&
      !isStepComplete("firstBankBalance")
    ) {
      logger.info(
        "🎯 Auto-completing firstBankBalance step - actual balance set:",
        actualBalance,
      );
      markStepComplete("firstBankBalance");
    }
  }, [actualBalance, shouldAutoComplete, isStepComplete, markStepComplete]);

  // Auto-complete envelope step when first envelope is created (ignore system-generated ones)
  useEffect(() => {
    if (!shouldAutoComplete) return;

    // Filter out system-generated envelopes (those created automatically during setup)
    const userCreatedEnvelopes = envelopes.filter((env) => {
      // Skip envelopes that look like system defaults
      return (
        env.name !== "Emergency Fund" &&
        env.name !== "Unassigned Cash" &&
        !env.name.startsWith("Default") &&
        env.source !== "system"
      );
    });

    if (userCreatedEnvelopes.length > 0 && !isStepComplete("firstEnvelope")) {
      logger.info(
        "🎯 Auto-completing firstEnvelope step - user envelope created:",
        userCreatedEnvelopes[0].name,
      );
      markStepComplete("firstEnvelope");
    }
  }, [envelopes, shouldAutoComplete, isStepComplete, markStepComplete]);

  // Auto-complete bills step when first bill is added
  useEffect(() => {
    if (!shouldAutoComplete) return;

    if (bills.length > 0 && !isStepComplete("firstBills")) {
      logger.info(
        "🎯 Auto-completing firstBills step - bill added:",
        bills[0].description,
      );
      markStepComplete("firstBills");
    }
  }, [bills.length, shouldAutoComplete, isStepComplete, markStepComplete]);

  // Auto-complete transaction step when first expense transaction is added
  useEffect(() => {
    if (!shouldAutoComplete) return;

    const expenseTransactions = transactions.filter(
      (t) => t && typeof t.amount === "number" && t.amount < 0,
    );

    if (expenseTransactions.length > 0 && !isStepComplete("firstTransaction")) {
      logger.info(
        "🎯 Auto-completing firstTransaction step - expense recorded:",
        expenseTransactions[0].description,
      );
      markStepComplete("firstTransaction");
    }
  }, [transactions, shouldAutoComplete, isStepComplete, markStepComplete]);

  // Auto-complete paycheck step when first income transaction is added
  useEffect(() => {
    if (!shouldAutoComplete) return;

    const incomeTransactions = transactions.filter(
      (t) =>
        t &&
        typeof t.amount === "number" &&
        t.amount > 0 &&
        (t.type === "income" ||
          t.category?.toLowerCase().includes("paycheck") ||
          t.category?.toLowerCase().includes("salary")),
    );

    if (incomeTransactions.length > 0 && !isStepComplete("firstPaycheck")) {
      logger.info(
        "🎯 Auto-completing firstPaycheck step - income recorded:",
        incomeTransactions[0].description,
      );
      markStepComplete("firstPaycheck");
    }
  }, [transactions, shouldAutoComplete, isStepComplete, markStepComplete]);

  // Auto-complete linked envelopes step when bills are connected to envelopes
  useEffect(() => {
    if (!shouldAutoComplete) return;

    const linkedBills = bills.filter((bill) => bill.envelopeId);

    if (linkedBills.length > 0 && !isStepComplete("linkedEnvelopes")) {
      logger.info(
        "🎯 Auto-completing linkedEnvelopes step - bill linked to envelope:",
        linkedBills[0].description,
      );
      markStepComplete("linkedEnvelopes");
    }
  }, [bills, shouldAutoComplete, isStepComplete, markStepComplete]);

  // Auto-complete allocation step when envelopes have been funded
  useEffect(() => {
    if (!shouldAutoComplete) return;

    const fundedEnvelopes = envelopes.filter((env) => env.currentBalance > 0);

    if (fundedEnvelopes.length > 0 && !isStepComplete("firstAllocation")) {
      logger.info(
        "🎯 Auto-completing firstAllocation step - envelope funded:",
        fundedEnvelopes[0].name,
      );
      markStepComplete("firstAllocation");
    }
  }, [envelopes, shouldAutoComplete, isStepComplete, markStepComplete]);

  return {
    shouldAutoComplete,
    autoCompleteStats: {
      envelopesCount: envelopes.length,
      billsCount: bills.length,
      transactionsCount: transactions.length,
      hasActualBalance: actualBalance !== null && actualBalance !== undefined,
    },
  };
};
