/**
 * BillForecastingPanel Component - Issue #1853
 * Main container for bill coverage forecasting in paycheck wizard
 */

import { useMemo } from "react";
import { useBillForecasting } from "@/hooks/budgeting/paycheck-flow/useBillForecasting";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { BillCoverageItem } from "./BillCoverageItem";
import { AutoFixSection } from "./AutoFixSection";
import {
  generateAutoFixSuggestions,
  type AutoFixSuggestion,
} from "@/utils/domain/budgeting/autoFixSuggestions";
import { formatCentsAsCurrency } from "@/utils/domain/budgeting/billCoverageCalculations";

interface BillForecastingPanelProps {
  paycheckAmountCents: number | null;
  allocations: Array<{ envelopeId: string; amountCents: number }>;
  paycheckFrequency: "weekly" | "biweekly" | "monthly";
  onAutoFix?: (suggestions: AutoFixSuggestion[]) => void;
}

export function BillForecastingPanel({
  paycheckAmountCents,
  allocations,
  paycheckFrequency,
  onAutoFix,
}: BillForecastingPanelProps) {
  const { envelopes } = useEnvelopes();

  const forecastingResult = useBillForecasting({
    paycheckAmountCents,
    allocations,
    paycheckFrequency,
  });

  const {
    upcomingBills,
    totalShortage,
    criticalBills,
    nextPayday,
    daysUntilPayday,
    isLoading,
    error,
  } = forecastingResult;

  // Generate auto-fix suggestions
  const autoFixSuggestions = useMemo(() => {
    if (totalShortage === 0 || criticalBills.length === 0) {
      return [];
    }

    const envelopesWithAllocation = envelopes.map((env) => ({
      id: env.id,
      name: env.name,
      currentBalance: env.currentBalance || 0,
      monthlyTarget:
        env.monthlyBudget ??
        (env as { monthlyContribution?: number }).monthlyContribution ??
        (env as { targetAmount?: number }).targetAmount ??
        0,
      isDiscretionary: env.type === "standard",
      category: env.category || "",
      allocationAmount: allocations.find((a) => a.envelopeId === env.id)?.amountCents || 0,
    }));

    return generateAutoFixSuggestions(criticalBills, envelopesWithAllocation);
  }, [totalShortage, criticalBills, envelopes, allocations]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center text-red-600">
          <p className="font-bold">⚠️ Forecasting Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Disabled state (no paycheck amount)
  if (!paycheckAmountCents) {
    return (
      <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-6 opacity-50">
        <div className="text-center text-slate-600">
          <p className="font-bold">📊 Bill Coverage</p>
          <p className="text-sm mt-2">Enter paycheck amount to see bill coverage forecast</p>
        </div>
      </div>
    );
  }

  // Format next payday
  const formattedPayday = nextPayday
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(nextPayday)
    : "Unknown";

  return (
    <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-black text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
          📊 Upcoming Bills
        </h3>
        <div className="text-sm text-slate-600 mt-1">
          Before next payday ({formattedPayday} • {daysUntilPayday} days)
        </div>
      </div>

      {/* Total Shortage Badge */}
      {totalShortage > 0 && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-red-900 uppercase text-sm">Total Shortage</div>
              <div className="text-xs text-red-700">
                {criticalBills.length} bill{criticalBills.length > 1 ? "s" : ""} underfunded
              </div>
            </div>
            <div className="font-black text-2xl text-red-900">
              {formatCentsAsCurrency(totalShortage)}
            </div>
          </div>
        </div>
      )}

      {/* No Bills Message */}
      {upcomingBills.length === 0 && (
        <div className="text-center py-8 text-slate-600">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold">No bills due before next payday!</div>
          <div className="text-sm mt-1">You're all set</div>
        </div>
      )}

      {/* Bills List */}
      {upcomingBills.length > 0 && (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
          {upcomingBills.map((bill) => (
            <BillCoverageItem key={bill.billId} bill={bill} />
          ))}
        </div>
      )}

      {/* Auto-Fix Section */}
      {autoFixSuggestions.length > 0 && onAutoFix && (
        <AutoFixSection suggestions={autoFixSuggestions} onApply={onAutoFix} />
      )}

      {/* All Covered Message */}
      {upcomingBills.length > 0 && totalShortage === 0 && (
        <div className="mt-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg text-center">
          <div className="font-black text-green-900 uppercase">✅ All Bills Covered</div>
          <div className="text-xs text-green-700 mt-1">
            Great job! All upcoming bills are fully funded
          </div>
        </div>
      )}
    </div>
  );
}
