import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface ExpirationStatus {
  text: string;
  color: string;
}

interface Account {
  id: string | number;
  name: string;
  type: string;
  currentBalance: number;
  annualContribution: number;
  expirationDate: string | null;
  description: string | null;
  color: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  transactions: unknown[];
}

interface AccountCardDetailsProps {
  account: Account;
  expirationStatus: ExpirationStatus;
  showBalances: boolean;
  onStartTransfer: (account: Account) => void;
}

const AccountCardDetails = ({
  account,
  expirationStatus,
  showBalances,
  onStartTransfer,
}: AccountCardDetailsProps) => (
  <>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">Current Balance:</span>
        <span className="font-bold text-gray-900">
          {showBalances ? `$${account.currentBalance.toFixed(2)}` : "••••"}
        </span>
      </div>

      {account.annualContribution > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Annual Contribution:</span>
          <span className="text-xs text-gray-700">
            {showBalances ? `$${account.annualContribution.toFixed(2)}` : "••••"}
          </span>
        </div>
      )}

      {account.expirationDate && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Expires:</span>
          <span className={`text-xs font-medium ${expirationStatus.color}`}>
            {expirationStatus.text}
          </span>
        </div>
      )}
    </div>

    {account.description && (
      <p className="text-xs text-gray-500 mt-2 italic">{account.description}</p>
    )}

    {/* Transfer Button */}
    {account.currentBalance > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <Button
          onClick={() => onStartTransfer(account)}
          className="w-full btn btn-sm btn-primary border-2 border-black flex items-center justify-center"
        >
          {React.createElement(getIcon("Zap"), { className: "h-3 w-3 mr-1" })}
          Transfer to Budget
        </Button>
      </div>
    )}

    <div className="mt-2 text-xs text-gray-500">
      Last updated: {new Date(account.lastUpdated).toLocaleDateString()}
    </div>
  </>
);

export default AccountCardDetails;
