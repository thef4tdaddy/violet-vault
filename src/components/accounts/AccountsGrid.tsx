import React from "react";
import { getIcon } from "@/utils";
import AccountCard from "./AccountCard";
import {
  getAccountTypeInfo,
  calculateDaysUntilExpiration,
  getExpirationStatus,
} from "@/utils/accounts";

interface AccountTypeInfo {
  value: string;
  label: string;
  icon: string;
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

interface AccountsGridProps {
  accounts: Account[];
  showBalances: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string | number) => void;
  onStartTransfer: (account: Account) => void;
}

const DEFAULT_TYPE_INFO: AccountTypeInfo = {
  value: "Other",
  label: "Other",
  icon: "💳",
};

const AccountsGrid = ({
  accounts,
  showBalances,
  onEdit,
  onDelete,
  onStartTransfer,
}: AccountsGridProps) => {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white/60 rounded-lg border border-white/20">
        {React.createElement(getIcon("CreditCard"), {
          className: "h-8 w-8 mx-auto mb-2 opacity-50",
        })}
        <p className="text-sm">No supplemental accounts added yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => {
        const typeInfo = getAccountTypeInfo(account.type) || DEFAULT_TYPE_INFO;
        const daysUntilExpiration = calculateDaysUntilExpiration(account.expirationDate);
        const expirationStatus = getExpirationStatus(daysUntilExpiration);

        return (
          <AccountCard
            key={String(account.id)}
            account={account}
            typeInfo={typeInfo}
            expirationStatus={expirationStatus}
            showBalances={showBalances}
            onEdit={onEdit}
            onDelete={onDelete}
            onStartTransfer={onStartTransfer}
          />
        );
      })}
    </div>
  );
};

export default AccountsGrid;
