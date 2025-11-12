import { useMemo } from "react";
import { getUtilizationColor } from "@/utils/budgeting";
import { ENVELOPE_TYPES } from "@/constants/categories";
import { getBillEnvelopeDisplayInfo } from "@/utils/budgeting/billEnvelopeCalculations";
import type { BillEnvelopeResult } from "@/utils/budgeting/billEnvelopeCalculations";
import type { Envelope as DbEnvelope, Bill as DbBill } from "@/db/types";

type EnvelopeInput = DbEnvelope & {
  status: string;
  utilizationRate: number;
  available: number;
  monthlyBudget?: number;
  monthlyAmount?: number;
};

type BillInput = DbBill & { isPaid?: boolean };

interface EnvelopeDisplayData {
  statusIcon: string;
  utilizationColorClass: string;
  financialSummary: {
    currentBalance: string;
    secondaryLabel: string;
    secondaryValue: string;
    secondaryColor: string;
  };
  showProgressBar: boolean;
  progressBarColor: string;
}

export const useEnvelopeDisplayData = (
  envelope: EnvelopeInput,
  bills: BillInput[] = []
): EnvelopeDisplayData => {
  return useMemo(() => {
    const getStatusIcon = (status: string): string => {
      switch (status) {
        case "overdue":
        case "overspent":
          return "AlertTriangle";
        case "underfunded":
          return "Clock";
        case "healthy":
        default:
          return "CheckCircle";
      }
    };

    const getFallbackData = () => {
      const fallbackColor = getUtilizationColor(envelope.utilizationRate, envelope.status);
      return {
        colorClass: fallbackColor,
        financialSummary: {
          currentBalance: `$${(envelope.currentBalance || 0).toFixed(2)}`,
          secondaryLabel: "Available",
          secondaryValue: `$${envelope.available.toFixed(2)}`,
          secondaryColor: envelope.available >= 0 ? "text-green-600" : "text-red-600",
        },
        progressColor:
          envelope.utilizationRate > 1
            ? "bg-red-500"
            : envelope.utilizationRate > 0.8
              ? "bg-orange-500"
              : envelope.utilizationRate > 0.5
                ? "bg-blue-500"
                : "bg-green-500",
      };
    };

    const getBillStatusInfo = (displayText: { primaryStatus: string }) => {
      const isOnTrack = displayText.primaryStatus === "On Track";
      const isFullyFunded = displayText.primaryStatus === "Fully Funded";
      const isBehind = displayText.primaryStatus.startsWith("Behind");

      return {
        isOnTrack,
        isFullyFunded,
        isBehind,
        colorClass: isFullyFunded
          ? "bg-green-100 text-green-800"
          : isOnTrack
            ? "bg-blue-100 text-blue-800"
            : isBehind
              ? "bg-red-100 text-red-800"
              : "bg-orange-100 text-orange-800",
        progressColor: isFullyFunded
          ? "bg-green-500"
          : isOnTrack
            ? "bg-blue-500"
            : isBehind
              ? "bg-red-500"
              : "bg-orange-500",
      };
    };

    const getBillFinancialSummary = (
      currentBalance: number,
      targetMonthlyAmount: number,
      remainingToFund: number,
      status: ReturnType<typeof getBillStatusInfo>
    ) => ({
      currentBalance: `$${currentBalance.toFixed(2)}`,
      secondaryLabel: status.isFullyFunded
        ? "Surplus"
        : status.isOnTrack
          ? "On Track"
          : status.isBehind
            ? "Behind"
            : "Still Need",
      secondaryValue: status.isFullyFunded
        ? `$${(currentBalance - targetMonthlyAmount).toFixed(2)}`
        : status.isOnTrack && !status.isFullyFunded
          ? `$${remainingToFund.toFixed(2)}`
          : `$${Math.abs(remainingToFund).toFixed(2)}`,
      secondaryColor: status.isFullyFunded
        ? "text-green-600"
        : status.isOnTrack
          ? "text-blue-600"
          : status.isBehind
            ? "text-red-600"
            : "text-orange-600",
    });

    const getBillEnvelopeData = () => {
      const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);
      if (!displayInfo) return getFallbackData();

      const typedInfo = displayInfo as BillEnvelopeResult;
      const displayText = typedInfo.displayText ?? { primaryStatus: "" };
      const currentBalance = typedInfo.currentBalance ?? 0;
      const targetMonthlyAmount = typedInfo.targetMonthlyAmount ?? 0;
      const remainingToFund = typedInfo.remainingToFund ?? 0;
      const status = getBillStatusInfo(displayText);

      return {
        colorClass: status.colorClass,
        financialSummary: getBillFinancialSummary(
          currentBalance,
          targetMonthlyAmount,
          remainingToFund,
          status
        ),
        progressColor: status.progressColor,
      };
    };

    const getNonBillEnvelopeData = () => ({
      colorClass: getUtilizationColor(envelope.utilizationRate, envelope.status),
      financialSummary: {
        currentBalance: `$${(envelope.currentBalance || 0).toFixed(2)}`,
        secondaryLabel: "Available",
        secondaryValue: `$${envelope.available.toFixed(2)}`,
        secondaryColor: envelope.available >= 0 ? "text-green-600" : "text-red-600",
      },
      progressColor:
        envelope.utilizationRate > 1
          ? "bg-red-500"
          : envelope.utilizationRate > 0.8
            ? "bg-orange-500"
            : envelope.utilizationRate > 0.5
              ? "bg-blue-500"
              : "bg-green-500",
    });

    const envelopeData =
      envelope.envelopeType === ENVELOPE_TYPES.BILL
        ? getBillEnvelopeData()
        : getNonBillEnvelopeData();

    return {
      statusIcon: getStatusIcon(envelope.status),
      utilizationColorClass: envelopeData.colorClass,
      financialSummary: envelopeData.financialSummary,
      showProgressBar: envelope.envelopeType !== ENVELOPE_TYPES.VARIABLE,
      progressBarColor: envelopeData.progressColor,
    };
  }, [envelope, bills]);
};
