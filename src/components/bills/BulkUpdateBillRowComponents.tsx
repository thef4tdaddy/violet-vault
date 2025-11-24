import React from "react";
import { getIcon } from "@/utils";
import type { Bill } from "@/types/bills";

interface BillChange {
  amount?: number;
  dueDate?: string;
  originalDueDate?: string;
}

export interface AmountChange {
  hasChange: boolean;
  original: number;
  updated?: number;
  difference?: string;
  differenceFormatted?: string;
  isIncrease?: boolean;
  isDecrease?: boolean;
}

interface AmountUpdateFieldProps {
  change: BillChange | undefined;
  amountChange: AmountChange | undefined;
  billId: string;
  updateChange: (billId: string, field: string, value: number | string) => void;
}

interface DateUpdateFieldProps {
  change: BillChange | undefined;
  billId: string;
  updateChange: (billId: string, field: string, value: number | string) => void;
}

interface BillInfoProps {
  bill: Bill;
}

/**
 * Amount input field component for bulk update
 */
export const AmountUpdateField: React.FC<AmountUpdateFieldProps> = ({
  change,
  amountChange,
  billId,
  updateChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      {React.createElement(getIcon("DollarSign"), {
        className: "h-4 w-4 text-purple-600",
      })}
      <input
        type="number"
        step="0.01"
        value={Math.abs(change?.amount || 0)}
        onChange={(e) => updateChange(billId, "amount", parseFloat(e.target.value) || 0)}
        className={`w-24 px-2 py-1 border-2 border-black rounded text-sm glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all ${
          amountChange?.hasChange ? "bg-blue-50/80" : "bg-white/60"
        }`}
      />
      {amountChange?.hasChange && (
        <span className="text-xs text-purple-700 font-medium">(was ${amountChange.original})</span>
      )}
    </div>
  );
};

/**
 * Date input field component for bulk update
 */
export const DateUpdateField: React.FC<DateUpdateFieldProps> = ({
  change,
  billId,
  updateChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      {React.createElement(getIcon("Calendar"), {
        className: "h-4 w-4 text-purple-600",
      })}
      <input
        type="date"
        value={change?.dueDate || ""}
        onChange={(e) => updateChange(billId, "dueDate", e.target.value)}
        className={`px-2 py-1 border-2 border-black rounded text-sm glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all ${
          change?.dueDate !== change?.originalDueDate ? "bg-blue-50/80" : "bg-white/60"
        }`}
      />
    </div>
  );
};

/**
 * Bill info section component
 */
export const BillInfo: React.FC<BillInfoProps> = ({ bill }) => {
  return (
    <div className="flex-1">
      <h5 className="font-bold text-gray-900">
        {bill.provider || (bill as { description?: string }).description || bill.name}
      </h5>
      <p className="text-sm text-purple-800 font-medium">{bill.category}</p>
    </div>
  );
};

/**
 * Change indicator component
 */
export const ChangeIndicator = () => {
  return (
    <div className="glassmorphism rounded-full p-1 border border-blue-300">
      {React.createElement(getIcon("CheckCircle"), {
        className: "h-4 w-4 text-blue-600",
      })}
    </div>
  );
};

/**
 * Helper to check if amount mode is active
 */
export const shouldShowAmountField = (updateMode: string): boolean => {
  return updateMode === "amounts" || updateMode === "both";
};

/**
 * Helper to check if date mode is active
 */
export const shouldShowDateField = (updateMode: string): boolean => {
  return updateMode === "dates" || updateMode === "both";
};
