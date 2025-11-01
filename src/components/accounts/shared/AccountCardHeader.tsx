import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

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

interface AccountCardHeaderProps {
  account: Account;
  typeInfo: AccountTypeInfo;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string | number) => void;
}

const AccountCardHeader = ({ account, typeInfo, onEdit, onDelete }: AccountCardHeaderProps) => (
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center">
      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: account.color }} />
      <div>
        <h4 className="font-medium text-gray-900 text-sm">{account.name}</h4>
        <p className="text-xs text-gray-600">
          {typeInfo.icon} {typeInfo.label}
        </p>
      </div>
    </div>

    <div className="flex items-center space-x-1">
      {!account.isActive && (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
      )}
      <Button onClick={() => onEdit(account)} className="p-1 text-gray-400 hover:text-cyan-600">
        {React.createElement(getIcon("Edit3"), { className: "h-3 w-3" })}
      </Button>
      <Button onClick={() => onDelete(account.id)} className="p-1 text-gray-400 hover:text-red-600">
        {React.createElement(getIcon("Trash2"), { className: "h-3 w-3" })}
      </Button>
    </div>
  </div>
);

export default AccountCardHeader;
