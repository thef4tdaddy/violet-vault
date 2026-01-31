/**
 * useBillForecasting Hook - Issue #1853
 * Real-time bill coverage calculation for paycheck allocation wizard
 */

import { useMemo } from "react";
import { useBillsQuery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";
import { calculateBillCoverage } from "@/services/forecasting/forecastingService";
import type { BillCoverageResult } from "@/services/forecasting/forecastingService";
import { calculateDaysUntilDue } from "@/utils/domain/bills/billCalculations";

export interface UseBillForecastingOptions {
  paycheckAmountCents: number | null;
  allocations: Array<{ envelopeId: string; amountCents: number }>;
  paycheckFrequency: "weekly" | "biweekly" | "monthly";
}

export interface BillWithCoverageEnhanced extends BillCoverageResult {
  billName: string;
  envelopeName: string;
}

export interface BillForecastingResult {
  upcomingBills: BillWithCoverageEnhanced[];
  totalShortage: number;
  criticalBills: BillWithCoverageEnhanced[];
  criticalCount: number;
  nextPayday: Date | null;
  daysUntilPayday: number | null;
  isLoading: boolean;
  error?: string;
}

/**
 * Main hook for bill forecasting
 */
export function useBillForecasting(options: UseBillForecastingOptions): BillForecastingResult {
  const { paycheckAmountCents, allocations, paycheckFrequency } = options;

  // Get next payday prediction
  const { daysUntilPayday, formattedPayday } = usePaydayProgress();

  // Fallback for next payday if no history
  const effectiveDaysUntilPayday = useMemo(() => {
    if (daysUntilPayday !== null) return daysUntilPayday;

    // Use frequency as fallback
    switch (paycheckFrequency) {
      case "weekly":
        return 7;
      case "biweekly":
        return 14;
      case "monthly":
        return 30;
      default:
        return 14; // Default to biweekly
    }
  }, [daysUntilPayday, paycheckFrequency]);

  // Query bills due before next payday
  const {
    data: bills = [],
    isLoading: billsLoading,
    error: billsError,
  } = useBillsQuery({
    status: "upcoming",
    daysAhead: effectiveDaysUntilPayday,
  });

  // Query all envelopes
  const { envelopes, isLoading: envelopesLoading } = useEnvelopes();

  // Calculate coverage
  const forecastingResult = useMemo((): BillForecastingResult => {
    if (!paycheckAmountCents || billsLoading || envelopesLoading) {
      return {
        upcomingBills: [],
        totalShortage: 0,
        criticalBills: [],
        criticalCount: 0,
        nextPayday: formattedPayday?.date ? new Date(formattedPayday.date) : null,
        daysUntilPayday: effectiveDaysUntilPayday,
        isLoading: true,
      };
    }

    if (billsError) {
      return {
        upcomingBills: [],
        totalShortage: 0,
        criticalBills: [],
        criticalCount: 0,
        nextPayday: null,
        daysUntilPayday: effectiveDaysUntilPayday,
        isLoading: false,
        error: "Failed to load upcoming bills",
      };
    }

    // No bills to forecast
    if (bills.length === 0) {
      return {
        upcomingBills: [],
        totalShortage: 0,
        criticalBills: [],
        criticalCount: 0,
        nextPayday: formattedPayday?.date ? new Date(formattedPayday.date) : null,
        daysUntilPayday: effectiveDaysUntilPayday,
        isLoading: false,
      };
    }

    // Prepare request for coverage calculation
    const billsInput = bills.map((bill) => ({
      id: bill.id,
      amountCents: Math.abs(bill.amount), // Bills are stored as negative
      dueDateDays: calculateDaysUntilDue(bill.dueDate, new Date()) || 0,
      envelopeId: bill.envelopeId || "",
    }));

    const envelopesInput = envelopes.map((env) => ({
      id: env.id,
      currentBalanceCents: env.currentBalance || 0,
      monthlyTargetCents: env.monthlyBudget || env.monthlyTarget || 0,
      isDiscretionary: env.type === "standard",
    }));

    const allocationsInput = allocations;

    // Call coverage calculation (tries Go first, falls back to JS)
    const coveragePromise = calculateBillCoverage({
      bills: billsInput,
      envelopes: envelopesInput,
      allocations: allocationsInput,
      paycheckAmountCents,
      daysUntilNextPayday: effectiveDaysUntilPayday,
    });

    // Note: This is synchronous in the JS fallback, async with Go
    // We're using it synchronously here for simplicity
    // In production, you might want to use React Query or similar
    let coverageResponse;
    try {
      // For now, use JavaScript fallback directly (sync)
      // TODO: Integrate async Go engine call with React Query
      const { calculateBillCoverageJS } = require("@/services/forecasting/forecastingService");
      coverageResponse = calculateBillCoverageJS({
        bills: billsInput,
        envelopes: envelopesInput,
        allocations: allocationsInput,
        paycheckAmountCents,
        daysUntilNextPayday: effectiveDaysUntilPayday,
      });
    } catch (error) {
      return {
        upcomingBills: [],
        totalShortage: 0,
        criticalBills: [],
        criticalCount: 0,
        nextPayday: null,
        daysUntilPayday: effectiveDaysUntilPayday,
        isLoading: false,
        error: "Coverage calculation failed",
      };
    }

    // Enhance results with names
    const upcomingBills: BillWithCoverageEnhanced[] = coverageResponse.bills.map((result) => {
      const bill = bills.find((b) => b.id === result.billId);
      const envelope = envelopes.find((e) => e.id === result.envelopeId);

      return {
        ...result,
        billName: bill?.name || "Unknown Bill",
        envelopeName: envelope?.name || "Unknown Envelope",
      };
    });

    // Identify critical bills
    const criticalBills = upcomingBills.filter(
      (b) => b.status === "uncovered" || (b.status === "partial" && b.coveragePercent < 50)
    );

    return {
      upcomingBills,
      totalShortage: coverageResponse.totalShortage,
      criticalBills,
      criticalCount: coverageResponse.criticalCount,
      nextPayday: formattedPayday?.date ? new Date(formattedPayday.date) : null,
      daysUntilPayday: effectiveDaysUntilPayday,
      isLoading: false,
    };
  }, [
    paycheckAmountCents,
    allocations,
    bills,
    envelopes,
    effectiveDaysUntilPayday,
    billsLoading,
    envelopesLoading,
    billsError,
    formattedPayday,
  ]);

  return forecastingResult;
}
