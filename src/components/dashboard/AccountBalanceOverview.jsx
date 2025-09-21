import React from "react";
import { getIcon } from "../../utils";
import EditableBalance from "../ui/EditableBalance";

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
  return (
    <div className="glassmorphism rounded-2xl p-6 border-2 border-black ring-1 ring-gray-800/10">
      <h2 className="font-black text-black text-base mb-6 flex items-center">
        {React.createElement(getIcon("CreditCard"), {
          className: "h-5 w-5 mr-2 text-blue-600",
        })}
        <span className="text-lg">C</span>HECKING{" "}
        <span className="text-lg">A</span>CCOUNT{" "}
        <span className="text-lg">D</span>ASHBOARD
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
            title="Bank Balance"
            subtitle="Click to edit your current checking account balance"
            className="text-blue-900"
            currencyClassName="text-2xl font-bold text-blue-900"
            subtitleClassName="text-sm text-blue-700"
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
        <div
          className={`rounded-lg p-6 ${
            isBalanced
              ? "bg-green-50"
              : Math.abs(difference) > 10
                ? "bg-red-50"
                : "bg-yellow-50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-medium ${
                isBalanced
                  ? "text-green-900"
                  : Math.abs(difference) > 10
                    ? "text-red-900"
                    : "text-yellow-900"
              }`}
            >
              Difference
            </h3>
            {isBalanced
              ? React.createElement(getIcon("CheckCircle"), {
                  className: "h-5 w-5 text-green-600",
                })
              : React.createElement(getIcon("AlertTriangle"), {
                  className: `h-5 w-5 ${
                    Math.abs(difference) > 10
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`,
                })}
          </div>
          <div className="space-y-3">
            <div
              className={`text-2xl font-bold ${
                isBalanced
                  ? "text-green-900"
                  : difference > 0
                    ? "text-green-900"
                    : "text-red-900"
              }`}
            >
              {isBalanced
                ? "Accounts Balanced!"
                : `${difference > 0 ? "+" : ""}$${difference.toFixed(2)}`}
            </div>
            <p
              className={`text-sm ${
                isBalanced
                  ? "text-green-700"
                  : Math.abs(difference) > 10
                    ? "text-red-700"
                    : "text-yellow-700"
              }`}
            >
              {isBalanced
                ? "Accounts are balanced!"
                : difference > 0
                  ? "Extra money available"
                  : "Virtual balance exceeds actual"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onOpenReconcileModal}
          className="btn btn-secondary border-2 border-black flex items-center"
        >
          {React.createElement(getIcon("RefreshCw"), {
            className: "h-4 w-4 mr-2",
          })}
          Reconcile Transaction
        </button>

        {!isBalanced && Math.abs(difference) > 0.01 && (
          <button
            onClick={onAutoReconcileDifference}
            className="btn btn-secondary border-2 border-black flex items-center"
          >
            {React.createElement(getIcon("CheckCircle"), {
              className: "h-4 w-4 mr-2",
            })}
            Auto-Reconcile Difference
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountBalanceOverview;
