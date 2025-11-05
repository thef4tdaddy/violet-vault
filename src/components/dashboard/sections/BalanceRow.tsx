import React from "react";
import { getIcon } from "@/utils";
import EditableBalance from "@/components/ui/EditableBalance";
import { Button } from "@/components/ui";

interface BalanceRowProps {
  actualBalance: number;
  totalVirtualBalance: number;
  unassignedCash: number;
  difference: number;
  isBalanced: boolean;
  onUpdateBalance: (newBalance: number) => Promise<void>;
  onOpenReconcileModal: () => void;
}

/**
 * Balance Row Component - Top row with all balance metrics
 * Shows Actual, Virtual, Unassigned, Difference, and Reconcile button
 */
const BalanceRow = ({
  actualBalance,
  totalVirtualBalance,
  unassignedCash,
  difference,
  isBalanced,
  onUpdateBalance,
  onOpenReconcileModal,
}: BalanceRowProps) => {
  const getDifferenceColor = () => {
    if (isBalanced) return "text-green-600";
    return difference > 0 ? "text-green-600" : "text-red-600";
  };

  const getDifferenceIcon = () => {
    if (isBalanced) return "CheckCircle";
    return "AlertTriangle";
  };

  return (
    <div className="glassmorphism rounded-2xl p-4 border border-white/20">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Actual Balance */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Actual Balance</span>
            {React.createElement(getIcon("CreditCard"), {
              className: "h-4 w-4 text-blue-600",
            })}
          </div>
          <EditableBalance
            value={actualBalance}
            onChange={onUpdateBalance}
            title="Actual Balance"
            subtitle="Click to edit"
            colorClass="text-blue-900"
            bgClass="bg-blue-50"
            hoverClass="hover:bg-blue-100"
          />
        </div>

        {/* Virtual Balance */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Virtual Balance</span>
            {React.createElement(getIcon("Wallet"), {
              className: "h-4 w-4 text-green-600",
            })}
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${totalVirtualBalance.toFixed(2)}
          </div>
        </div>

        {/* Unassigned Cash */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Unassigned Cash</span>
            {React.createElement(getIcon("DollarSign"), {
              className: "h-4 w-4 text-purple-600",
            })}
          </div>
          <div className="text-2xl font-bold text-purple-900">${unassignedCash.toFixed(2)}</div>
        </div>

        {/* Difference */}
        <div
          className={`rounded-lg p-4 ${
            isBalanced
              ? "bg-green-50"
              : Math.abs(difference) > 10
                ? "bg-red-50"
                : "bg-yellow-50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium ${
                isBalanced
                  ? "text-green-900"
                  : Math.abs(difference) > 10
                    ? "text-red-900"
                    : "text-yellow-900"
              }`}
            >
              Difference
            </span>
            {React.createElement(getIcon(getDifferenceIcon()), {
              className: `h-4 w-4 ${
                isBalanced
                  ? "text-green-600"
                  : Math.abs(difference) > 10
                    ? "text-red-600"
                    : "text-yellow-600"
              }`,
            })}
          </div>
          <div className={`text-2xl font-bold ${getDifferenceColor()}`}>
            {isBalanced ? "✓" : `${difference > 0 ? "+" : ""}$${difference.toFixed(2)}`}
          </div>
        </div>

        {/* Reconcile Button */}
        <div className="flex items-center justify-center">
          <Button
            onClick={onOpenReconcileModal}
            className="btn btn-secondary border-2 border-black w-full h-full flex flex-col items-center justify-center gap-2"
          >
            {React.createElement(getIcon("RefreshCw"), {
              className: "h-5 w-5",
            })}
            <span className="font-medium">Reconcile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BalanceRow);
