import React from "react";
import { AlertCircle } from "lucide-react";
import { calculateDaysUntilExpiration } from "../../utils/accounts";

const ExpirationAlert = ({ expiringAccounts }) => {
  if (expiringAccounts.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
      <div className="flex items-start">
        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-orange-800">
            {expiringAccounts.length} account
            {expiringAccounts.length === 1 ? "" : "s"} expiring soon
          </p>
          <div className="text-xs text-orange-700 mt-1">
            {expiringAccounts.map((account) => {
              const days = calculateDaysUntilExpiration(account.expirationDate);
              return (
                <span key={account.id} className="mr-3">
                  {account.name}: {days === 0 ? "Today" : `${days} days`}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpirationAlert;
