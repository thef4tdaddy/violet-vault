import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { useBudgetStore } from "../../../stores/ui/uiStore";

// Type definitions
interface UnassignedCashEnvelopeProps {
  unassignedCash: number;
  onViewHistory?: (envelope: {
    id: string;
    name: string;
    currentBalance: number;
    category: string;
    color: string;
    description: string;
    envelopeType: string;
  }) => void;
}

const UnassignedCashEnvelope = ({ unassignedCash, onViewHistory }: UnassignedCashEnvelopeProps) => {
  const openUnassignedCashModal = useBudgetStore((state) => state.openUnassignedCashModal);

  const handleClick = () => {
    openUnassignedCashModal();
  };

  const handleHistoryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Create a virtual unassigned envelope for history viewing
    const unassignedEnvelope = {
      id: "unassigned",
      name: "Unassigned Cash",
      currentBalance: unassignedCash,
      category: "Cash Management",
      color: "#6b7280",
      description: "Available cash not allocated to any specific envelope",
      envelopeType: "cash",
    };
    onViewHistory?.(unassignedEnvelope);
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 ${
        unassignedCash < 0 ? "from-red-50 to-pink-50 border-red-200 hover:border-red-300" : ""
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center">
            {React.createElement(getIcon("DollarSign"), {
              className: "h-5 w-5 mr-2 text-green-600",
            })}
            Unassigned Cash
          </h3>
          <p className="text-xs text-gray-600 mt-1">Cash Management</p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <div
            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              unassignedCash < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {unassignedCash < 0 ? "Overspent" : "Available"}
          </div>

          <Button
            onClick={handleHistoryClick}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="View transaction history"
          >
            {React.createElement(getIcon("History"), { className: "h-4 w-4" })}
          </Button>
        </div>
      </div>

      {/* Cash Amount Display */}
      <div className="mb-4">
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 mb-2">Click anywhere to distribute</p>
          <p
            className={`text-3xl font-bold ${
              unassignedCash < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            ${Math.abs(unassignedCash).toFixed(2)}
            {unassignedCash < 0 && <span className="text-sm text-red-500 ml-2">deficit</span>}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {unassignedCash < 0
              ? "Address overspending by moving funds"
              : "Distribute to envelopes"}
          </p>
        </div>
      </div>

      {/* Visual Indicator */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-center text-xs text-gray-500">
          {React.createElement(getIcon("DollarSign"), {
            className: "h-3 w-3 mr-1",
          })}
          <span>{unassignedCash < 0 ? "Needs attention" : "Ready to allocate"}</span>
        </div>
      </div>
    </div>
  );
};

export default UnassignedCashEnvelope;
