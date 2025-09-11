import React from "react";
import { getIcon } from "../../../utils";
import { useQuickAdd } from "../../../hooks/dashboard/useQuickAdd";

/**
 * Quick Add Card - Fast action buttons for common tasks
 *
 * Features:
 * - Quick add buttons for common actions
 * - Transaction, Bill, and Envelope creation
 * - Visual action icons with labels
 * - Navigation to relevant sections
 */
const QuickAddCard = ({ setActiveView }) => {
  const { onQuickTransaction, onQuickBill, onQuickEnvelope } = useQuickAdd();

  const quickActions = [
    {
      key: "transaction",
      label: "Add Transaction",
      icon: "CreditCard",
      color: "purple",
      handler: onQuickTransaction || (() => setActiveView?.("transactions")),
    },
    {
      key: "bill",
      label: "Add Bill",
      icon: "Receipt",
      color: "blue",
      handler: onQuickBill || (() => setActiveView?.("bills")),
    },
    {
      key: "envelope",
      label: "Add Envelope",
      icon: "Package",
      color: "green",
      handler: onQuickEnvelope || (() => setActiveView?.("envelopes")),
    },
  ];

  const getActionColor = (color) => {
    const colors = {
      purple: "bg-purple-500 hover:bg-purple-600",
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-orange-100/40 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {React.createElement(getIcon("Plus"), {
          className: "h-6 w-6 text-orange-700",
        })}
        <h3 className="text-lg font-black text-black">
          <span className="text-xl">Q</span>UICK{" "}
          <span className="text-xl">A</span>DD
        </h3>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-4">
        {quickActions.map(({ key, label, icon, color, handler }) => (
          <button
            key={key}
            onClick={handler}
            className={`
              w-full flex items-center gap-4 p-4 rounded-lg border-2 border-black
              transition-colors ${getActionColor(color)} text-white
            `}
          >
            <div className="flex-shrink-0">
              {React.createElement(getIcon(icon), { className: "h-6 w-6" })}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">{label}</div>
              <div className="text-sm text-white/80">
                {key === "transaction" && "Record income or expense"}
                {key === "bill" && "Set up recurring payment"}
                {key === "envelope" && "Create budget category"}
              </div>
            </div>
            <div className="flex-shrink-0">
              {React.createElement(getIcon("ChevronRight"), {
                className: "h-5 w-5",
              })}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Tip */}
      <div className="mt-6 p-3 bg-orange-50/60 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 text-orange-900">
          {React.createElement(getIcon("Lightbulb"), {
            className: "h-4 w-4 text-amber-600",
          })}
          <span className="text-sm">
            <span className="font-semibold">Pro tip:</span> Use keyboard
            shortcuts for even faster entry
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickAddCard;
