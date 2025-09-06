import React from "react";
import { getIcon } from "../../utils";

const AccountsHeader = ({
  totalValue,
  showBalances,
  onToggleBalances,
  onAddAccount,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold flex items-center text-gray-900">
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-30"></div>
            <div className="relative bg-cyan-500 p-2 rounded-xl">
                            {React.createElement(getIcon('CreditCard'), { className: "h-4 w-4 text-white" })}
            </div>
          </div>
          Supplemental Accounts
        </h3>
        <p className="text-sm text-gray-700 mt-1 font-medium">
          Track FSA, HSA, and other non-budget accounts • Total: $
          {totalValue.toFixed(2)}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggleBalances}
          className="p-2 text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
          title={showBalances ? "Hide balances" : "Show balances"}
        >
          {showBalances ? (
            React.createElement(getIcon('Eye'), { className: "h-4 w-4" })
          ) : (
            React.createElement(getIcon('EyeOff'), { className: "h-4 w-4" })
          )}
        </button>
        <button
          onClick={onAddAccount}
          className="btn btn-primary border-2 border-black text-sm flex items-center"
        >
                    {React.createElement(getIcon('Plus'), { className: "h-3 w-3 mr-1" })}
          Add Account
        </button>
      </div>
    </div>
  );
};

export default AccountsHeader;
