import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface QuickAddCardProps {
  onAddTransaction?: () => void;
  onAddPaycheck?: () => void;
  onAddBill?: () => void;
}

/**
 * Quick Add Card
 * Provides quick access buttons to add transactions, paychecks, and bills
 */
const QuickAddCard = ({ onAddTransaction, onAddPaycheck, onAddBill }: QuickAddCardProps) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {React.createElement(getIcon("Plus"), {
          className: "h-5 w-5 mr-2 text-blue-600",
        })}
        Quick Add
      </h3>

      <div className="space-y-3">
        {onAddTransaction && (
          <Button
            onClick={onAddTransaction}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            {React.createElement(getIcon("ArrowRight"), {
              className: "h-4 w-4",
            })}
            Add Transaction
          </Button>
        )}

        {onAddPaycheck && (
          <Button
            onClick={onAddPaycheck}
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            {React.createElement(getIcon("DollarSign"), {
              className: "h-4 w-4",
            })}
            Add Paycheck
          </Button>
        )}

        {onAddBill && (
          <Button
            onClick={onAddBill}
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            {React.createElement(getIcon("Calendar"), {
              className: "h-4 w-4",
            })}
            Add Bill
          </Button>
        )}
      </div>
    </div>
  );
};

export default React.memo(QuickAddCard);
