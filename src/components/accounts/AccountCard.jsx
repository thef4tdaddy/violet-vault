import React from "react";
import { getIcon } from "../../utils";

const AccountCard = ({
  account,
  typeInfo,
  _daysUntilExpiration,
  expirationStatus,
  showBalances,
  onEdit,
  onDelete,
  onStartTransfer,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/90 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: account.color }}
          />
          <div>
            <h4 className="font-medium text-gray-900 text-sm">
              {account.name}
            </h4>
            <p className="text-xs text-gray-600">
              {typeInfo.icon} {typeInfo.label}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {!account.isActive && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Inactive
            </span>
          )}
          <button
            onClick={() => onEdit(account)}
            className="p-1 text-gray-400 hover:text-cyan-600"
          >
                        {React.createElement(getIcon('Edit3'), { className: "h-3 w-3" })}
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
                        {React.createElement(getIcon('Trash2'), { className: "h-3 w-3" })}
          </button>
        </div>
      </div>

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
              {showBalances
                ? `$${account.annualContribution.toFixed(2)}`
                : "••••"}
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
        <p className="text-xs text-gray-500 mt-2 italic">
          {account.description}
        </p>
      )}

      {/* Transfer Button */}
      {account.currentBalance > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => onStartTransfer(account)}
            className="w-full btn btn-sm btn-primary border-2 border-black flex items-center justify-center"
          >
                        {React.createElement(getIcon('Zap'), { className: "h-3 w-3 mr-1" })}
            Transfer to Budget
          </button>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Last updated: {new Date(account.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
};

export default AccountCard;
