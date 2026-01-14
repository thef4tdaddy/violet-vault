import { useCallback } from "react";
import { getIconByName } from "@/utils/core/common/billIcons";

const URGENCY_COLORS = {
  overdue: "text-red-600 bg-red-50",
  urgent: "text-orange-600 bg-orange-50",
  soon: "text-yellow-600 bg-yellow-50",
  normal: "text-green-600 bg-green-50",
};

interface BillTotals {
  overdue?: number;
  upcoming?: number;
  paid?: number;
  total?: number;
}

// Helper to format days display
const formatDaysDisplay = (days: number | null): string => {
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `${days} days`;
};

const createSummaryCard = (
  label: string,
  value: number,
  textColor: string,
  bgColor: string,
  key: number
) => ({ label, value, textColor, bgColor, key });

export function useBillManagerDisplayLogic(selectedBills: Set<string>) {
  const getBillIcon = useCallback((bill: { iconName?: string }) => {
    return getIconByName(bill.iconName ?? "") || "FileText";
  }, []);

  const getUrgencyColors = useCallback((urgency: string) => {
    return URGENCY_COLORS[urgency as keyof typeof URGENCY_COLORS] || URGENCY_COLORS.normal;
  }, []);

  const getSummaryCards = useCallback((totals: BillTotals = {}) => {
    const { overdue = 0, upcoming = 0, paid = 0, total = 0 } = totals;

    return [
      createSummaryCard("Overdue", overdue, "text-red-600", "bg-red-50", 1),
      createSummaryCard("Upcoming", upcoming, "text-blue-600", "bg-blue-50", 2),
      createSummaryCard("Paid This Month", paid, "text-green-600", "bg-green-50", 3),
      createSummaryCard("Total", total, "text-gray-600", "bg-gray-50", 4),
    ];
  }, []);

  const getBillDisplayData = useCallback(
    (bill: {
      id: string;
      iconName?: string;
      urgency: string;
      dueDate?: Date;
      daysUntilDue: number | null;
      isPaid: boolean;
      amount: number;
    }) => {
      const Icon = getBillIcon(bill);
      const urgencyColors = getUrgencyColors(bill.urgency);
      const isSelected = selectedBills.has(bill.id);

      const dueDateDisplay = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "Not set";
      const daysDisplay = formatDaysDisplay(bill.daysUntilDue);

      return {
        Icon,
        urgencyColors,
        isSelected,
        dueDateDisplay,
        daysDisplay,
        statusText: bill.isPaid ? "Paid" : bill.urgency,
      };
    },
    [selectedBills, getBillIcon, getUrgencyColors]
  );

  return {
    getBillIcon,
    getUrgencyColors,
    getSummaryCards,
    getBillDisplayData,
  };
}
