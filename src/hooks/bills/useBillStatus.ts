import { useMemo, useState } from "react";
import type { Bill as BillFromTypes } from "../../types/bills";

const STATUS_COLOR_CLASSES = {
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: "text-green-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "text-red-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "text-orange-500",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "text-blue-500",
  },
} as const;

export const useBillStatus = (bill: BillFromTypes | null) => {
  // Use state to keep 'now' stable during render for purity
  const [now] = useState(() => Date.now());

  const normalizedDueDate = useMemo(() => {
    if (!bill || !bill.dueDate) {
      return null;
    }

    const parsed = new Date(bill.dueDate);

    if (isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }, [bill]);

  const daysUntilDue = useMemo(() => {
    if (!normalizedDueDate) return null;
    const dueTime = normalizedDueDate.getTime();
    return Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
  }, [normalizedDueDate, now]);

  const isOverdue = useMemo(() => {
    return daysUntilDue !== null && daysUntilDue < 0;
  }, [daysUntilDue]);

  const isDueSoon = useMemo(() => {
    return daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;
  }, [daysUntilDue]);

  const statusInfo = useMemo(() => {
    const getStatusColor = () => {
      if (bill?.isPaid) return "green";
      if (isOverdue) return "red";
      if (isDueSoon) return "orange";
      return "blue";
    };

    const statusColor = getStatusColor();

    const getStatusText = () => {
      if (bill?.isPaid) return "Paid";
      if (isOverdue && daysUntilDue !== null) {
        return `Overdue by ${Math.abs(daysUntilDue)} days`;
      }
      if (isDueSoon && daysUntilDue !== null) {
        return `Due in ${daysUntilDue} days`;
      }
      if (daysUntilDue !== null) {
        return `Due in ${daysUntilDue} days`;
      }
      return normalizedDueDate ? "Scheduled" : "Date not set";
    };

    return {
      color: statusColor,
      classes: STATUS_COLOR_CLASSES[statusColor],
      text: getStatusText(),
      isOverdue,
      isDueSoon,
    };
  }, [bill?.isPaid, isOverdue, isDueSoon, daysUntilDue, normalizedDueDate]);

  return {
    daysUntilDue,
    statusInfo,
  };
};
