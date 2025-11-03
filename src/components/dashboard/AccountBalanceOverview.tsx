import React from "react";
import { getIcon } from "../../utils";
import EditableBalance from "../ui/EditableBalance";
import { Button, StylizedButtonText } from "../ui";

// Helper functions to reduce complexity
const getDifferenceCardStyles = (isBalanced, difference) => {
  if (isBalanced) return { bg: "bg-green-50", text: "text-green-900", icon: "text-green-600" };
  if (Math.abs(difference) > 10)
    return { bg: "bg-red-50", text: "text-red-900", icon: "text-red-600" };
  return { bg: "bg-yellow-50", text: "text-yellow-900", icon: "text-yellow-600" };
};

const getDifferenceMessage = (isBalanced, difference) => {
  if (isBalanced) return "Accounts are balanced!";
  return difference > 0 ? "Extra money available" : "Virtual balance exceeds actual";
};

const AccountBalanceOverview = ({
  actualBalance,
  totalVirtualBalance,
  totalEnvelopeBalance,
  totalSavingsBalance,
  unassignedCash,
  difference,
  isBalanced,
  onUpdateBalance,
  onOpenReconcileModal,
  onAutoReconcileDifference,
}) => {
  const diffStyles = getDifferenceCardStyles(isBalanced, difference);

  return (
    <div className="glassmorphism rounded-2xl p-6 border-2 border-black ring-1 ring-gray-800/10">
      <h2 className="font-black text-black text-xl mb-6 flex items-center">
        {React.createElement(getIcon("CreditCard"), {
          className: "h-6 w-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0",
        })}
        <div className="min-w-0">
          {/* Mobile: shorter title */}
          <div className="sm:hidden">
            <StylizedButtonText firstLetterClassName="text-xl" restClassName="text-lg">
              DASHBOARD
            </StylizedButtonText>
          </div>
          {/* Desktop: full title */}
          <div className="hidden sm:block">
            <StylizedButtonText firstLetterClassName="text-2xl" restClassName="text-xl">
              VIOLET VAULT APP DASHBOARD
            </StylizedButtonText>
          </div>
        </div>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actual Balance */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-blue-900">Actual Bank Balance</h3>
            {React.createElement(getIcon("CreditCard"), {
              className: "h-5 w-5 text-blue-600",
            })}
          </div>
          <EditableBalance
            value={actualBalance}
            onChange={onUpdateBalance}
            title="Current Balance"
            subtitle="Click to edit your checking account balance"
            colorClass="text-blue-900"
            bgClass="bg-blue-50"
            hoverClass="hover:bg-blue-100"
          />
        </div>

        {/* Virtual Balance */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-green-900">Virtual Balance</h3>
            {React.createElement(getIcon("Wallet"), {
              className: "h-5 w-5 text-green-600",
            })}
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-green-900">
              ${totalVirtualBalance.toFixed(2)}
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>Envelopes: ${totalEnvelopeBalance.toFixed(2)}</div>
              <div>Savings: ${totalSavingsBalance.toFixed(2)}</div>
              <div>Unassigned: ${unassignedCash.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Difference */}
        <div className={`rounded-lg p-6 ${diffStyles.bg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-medium ${diffStyles.text}`}>Difference</h3>
            {React.createElement(getIcon(isBalanced ? "CheckCircle" : "AlertTriangle"), {
              className: `h-5 w-5 ${diffStyles.icon}`,
            })}
          </div>
          <div className="space-y-3">
            <div
              className={`text-2xl font-bold ${
                isBalanced ? "text-green-900" : difference > 0 ? "text-green-900" : "text-red-900"
              }`}
            >
              {isBalanced
                ? "Accounts Balanced!"
                : `${difference > 0 ? "+" : ""}$${difference.toFixed(2)}`}
            </div>
            <p className={`text-sm ${diffStyles.text.replace("900", "700")}`}>
              {getDifferenceMessage(isBalanced, difference)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={onOpenReconcileModal}
          className="btn btn-secondary border-2 border-black flex items-center"
        >
          {React.createElement(getIcon("RefreshCw"), {
            className: "h-4 w-4 mr-2",
          })}
          Reconcile Transaction
        </Button>

        {!isBalanced && Math.abs(difference) > 0.01 && (
          <Button
            onClick={() => onAutoReconcileDifference(difference)}
            className="btn btn-primary border-2 border-black flex items-center bg-green-600 hover:bg-green-700 text-white"
          >
            {React.createElement(getIcon("CheckCircle"), {
              className: "h-4 w-4 mr-2",
            })}
            Auto-Reconcile Difference
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountBalanceOverview;
