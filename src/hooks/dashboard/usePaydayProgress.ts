import { useMemo } from "react";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import useBudgetData from "@/hooks/budgeting/core/useBudgetData";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import {
  getDaysUntilPayday,
  formatPaydayPrediction,
} from "@/utils/domain/budgeting/paydayPredictor";
import type { PaydayPrediction, PaycheckEntry } from "@/utils/domain/budgeting/paydayPredictor";
import { predictNextPayday } from "@/utils/domain/budgeting/paydayPredictor";

interface PaydayProgressData {
  daysUntilPayday: number | null;
  hoursUntilPayday: number | null;
  progressPercentage: number;
  safeToSpend: number;
  formattedPayday: {
    displayText: string;
    shortText: string;
    confidence: number;
    pattern?: string | null;
    date: string;
  } | null;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Hook for calculating payday progress and safe-to-spend amounts
 * Integrates payday predictions with budget data for dashboard display
 *
 * @returns {PaydayProgressData} Payday progress information
 */
export const usePaydayProgress = (): PaydayProgressData => {
  const { unassignedCash, isLoading: cashLoading } = useUnassignedCash();
  const budgetData = useBudgetData();
  const billsData = useBills();
  const bills = billsData.bills;
  const billsLoading = billsData.isLoading;

  // Get paycheck history from transactions
  const paycheckHistory = useMemo<PaycheckEntry[]>(() => {
    if (!budgetData.transactions) return [];

    return budgetData.transactions
      .filter((t) => t.type === "income" && t.category === "paycheck")
      .map((t) => ({
        date: t.date instanceof Date ? t.date : new Date(t.date),
        amount: t.amount,
      }))
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
  }, [budgetData.transactions]);

  // Generate payday prediction
  const paydayPrediction = useMemo<PaydayPrediction | null>(() => {
    if (paycheckHistory.length < 2) return null;
    return predictNextPayday(paycheckHistory);
  }, [paycheckHistory]);

  // Calculate days and hours until payday
  const { daysUntilPayday, hoursUntilPayday } = useMemo(() => {
    if (!paydayPrediction?.nextPayday) {
      return { daysUntilPayday: null, hoursUntilPayday: null };
    }

    const now = new Date();
    const days = getDaysUntilPayday(paydayPrediction, now);

    // Calculate hours for more precise countdown
    const diffTime = paydayPrediction.nextPayday.getTime() - now.getTime();
    const hours = Math.ceil(diffTime / (1000 * 60 * 60));

    return { daysUntilPayday: days, hoursUntilPayday: hours };
  }, [paydayPrediction]);

  // Calculate progress percentage in biweekly cycle
  const progressPercentage = useMemo(() => {
    if (!paydayPrediction?.intervalDays || !paydayPrediction?.nextPayday) {
      return 0;
    }

    const now = new Date();
    let lastPayday: Date;

    const entry = paycheckHistory[0];
    // Use actual last paycheck date if available, otherwise calculate theoretical previous payday
    if (entry && entry.date) {
      lastPayday = entry.date instanceof Date ? entry.date : new Date(entry.date);
    } else {
      const intervalMs = paydayPrediction.intervalDays * 24 * 60 * 60 * 1000;
      lastPayday = new Date(paydayPrediction.nextPayday.getTime() - intervalMs);
    }

    const totalCycleMs = paydayPrediction.nextPayday.getTime() - lastPayday.getTime();
    const elapsedMs = now.getTime() - lastPayday.getTime();

    // Ensure valid cycle duration
    if (totalCycleMs <= 0) return 0;

    const percentage = Math.max(0, Math.min(100, (elapsedMs / totalCycleMs) * 100));
    return percentage;
  }, [paydayPrediction, paycheckHistory]);

  // Calculate safe-to-spend amount
  const safeToSpend = useMemo(() => {
    let available = unassignedCash || 0;

    // Subtract upcoming bills due before next payday
    if (bills && bills.length > 0 && paydayPrediction?.nextPayday) {
      const upcomingBills = bills.filter((bill) => {
        // Bills are transactions, so use bill.date
        const billDate = bill.date instanceof Date ? bill.date : new Date(bill.date);
        return billDate <= paydayPrediction.nextPayday! && !bill.isPaid;
      });

      const totalUpcoming = upcomingBills.reduce((sum, bill) => {
        // Bills have negative amounts (expenses), so we need to get absolute value
        return sum + Math.abs(bill.amount || 0);
      }, 0);

      available -= totalUpcoming;
    }

    return Math.max(0, available);
  }, [unassignedCash, bills, paydayPrediction]);

  // Format payday for display
  const formattedPayday = useMemo(() => {
    if (!paydayPrediction) return null;
    return formatPaydayPrediction(paydayPrediction);
  }, [paydayPrediction]);

  const isLoading = cashLoading || budgetData.isLoading || billsLoading;
  const hasError = !!(budgetData.envelopesError || budgetData.transactionsError);

  return {
    daysUntilPayday,
    hoursUntilPayday,
    progressPercentage,
    safeToSpend,
    formattedPayday,
    isLoading,
    hasError,
  };
};
