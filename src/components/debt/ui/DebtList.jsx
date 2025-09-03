import React from "react";
import { ArrowRight, Calendar, Clock } from "lucide-react";
// import { useDebtCard } from "../../../hooks/debts/useDebtCard";
import DebtCardProgressBar from "./DebtCardProgressBar";

/**
 * List of debts with summary information
 * Pure UI component for displaying debt cards
 */
const DebtList = ({ debts, onDebtClick, onRecordPayment }) => {
  return (
    <div className="divide-y divide-gray-100">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          onClick={() => onDebtClick(debt)}
          onRecordPayment={onRecordPayment}
        />
      ))}
    </div>
  );
};

const DebtCard = ({ debt, onClick, onRecordPayment }) => {
  const {
    config,
    IconComponent,
    statusStyle,
    statusText,
    progressData,
    paymentInfo,
    nextPaymentInfo,
    relationships,
    canQuickPay,
    handleRecordPayment,
    currentBalance,
    interestRate,
  } = {}; // useDebtCard(debt, onRecordPayment);

  return (
    <div
      className="p-6 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 border border-gray-200 hover:border-gray-300 rounded-xl hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          {/* Icon and Type */}
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-2xl ${config.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${config.textColor}`} />
            </div>
          </div>

          {/* Debt Info */}
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {debt.name}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {debt.creditor} • {config.name}
                </p>
              </div>

              {/* Status Badge */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle}`}>
                {statusText}
              </span>
            </div>

            {/* Financial Details */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Balance */}
              <div>
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className="text-base md:text-lg font-bold text-red-600">${currentBalance}</p>
              </div>

              {/* Payment */}
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-base md:text-lg font-semibold text-gray-900">
                  {paymentInfo.display}
                </p>
              </div>

              {/* Interest Rate */}
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-base md:text-lg font-semibold text-purple-600">
                  {interestRate}%
                </p>
              </div>

              {/* Next Payment / Payoff Info */}
              <div>
                <p className="text-xs text-gray-500">{nextPaymentInfo.label}</p>
                <p className="text-sm md:text-base font-semibold text-gray-900">
                  {nextPaymentInfo.hasIcon && (
                    <span className="flex items-center">
                      {nextPaymentInfo.type === "next_payment" ? (
                        <Calendar className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {nextPaymentInfo.value}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <DebtCardProgressBar progressData={progressData} />

            {/* Relationships */}
            {relationships.hasRelationships && (
              <div className="mt-3 flex flex-wrap gap-2">
                {relationships.items.map((item, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full max-w-full ${item.className}`}
                  >
                    <span className="truncate">
                      {item.icon} {item.label}: {item.name}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="ml-2 md:ml-4 flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          {canQuickPay && (
            <button
              onClick={handleRecordPayment}
              className="px-2 md:px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            >
              <span className="hidden sm:inline">Quick Pay</span>
              <span className="sm:hidden">Pay</span>
            </button>
          )}
          <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default DebtList;
