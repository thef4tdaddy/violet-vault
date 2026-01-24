import React from "react";
import { getIcon } from "@/utils";
import Button from "../ui/buttons/Button";

const AccountsHeader = ({
  totalValue,
  onAddAccount,
  showBalances,
  onToggleBalances,
}: {
  totalValue: number;
  onAddAccount: () => void;
  showBalances?: boolean;
  onToggleBalances?: () => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-black text-xl flex items-center tracking-wide">
          <div className="relative mr-2 sm:mr-4 shrink-0">
            <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-cyan-500 p-3 rounded-2xl">
              {React.createElement(getIcon("CreditCard"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          {/* Mobile: Two-line title */}
          <div className="min-w-0">
            <div className="sm:hidden flex flex-col leading-tight">
              <div>
                <span className="text-2xl">S</span>UPPLEMENTAL
              </div>
              <div>
                <span className="text-2xl">A</span>CCOUNTS
              </div>
            </div>
            {/* Desktop: Full title on one line */}
            <div className="hidden sm:block">
              <span className="text-2xl">S</span>UPPLEMENTAL&nbsp;&nbsp;
              <span className="text-2xl">A</span>CCOUNTS
            </div>
          </div>
        </h3>
        <p className="text-sm text-purple-900 mt-1 font-medium ml-12 sm:ml-16 flex items-center">
          Total: {showBalances ? `$${totalValue.toFixed(2)}` : "****"}
          {onToggleBalances && (
            <Button
              onClick={onToggleBalances}
              className="ml-2 p-1 text-purple-900/60 hover:text-purple-900 transition-colors"
              title={showBalances ? "Hide balances" : "Show balances"}
            >
              {React.createElement(getIcon(showBalances ? "Eye" : "EyeOff"), {
                className: "h-3.5 w-3.5",
              })}
            </Button>
          )}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <Button
          onClick={onToggleBalances}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 border-2 border-black hover:border-cyan-200 transition-colors"
          title={showBalances ? "Hide account balances" : "Show account balances"}
        >
          {showBalances
            ? React.createElement(getIcon("Eye"), { className: "h-4 w-4" })
            : React.createElement(getIcon("EyeOff"), { className: "h-4 w-4" })}
          <span className="hidden sm:inline">{showBalances ? "Hide" : "Show"}</span>
        </Button>
        <Button
          onClick={onAddAccount}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors border-2 border-black shadow-lg"
        >
          {React.createElement(getIcon("Plus"), { className: "h-3 w-3 mr-1" })}
          Add Account
        </Button>
      </div>
    </div>
  );
};

export default AccountsHeader;
