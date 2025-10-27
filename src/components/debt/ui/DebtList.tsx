import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
// import { useDebtCard } from "@/hooks/debts/useDebtCard";
import DebtCardProgressBar from "./DebtCardProgressBar";

interface Debt {
  id: string;
  name: string;
  creditor: string;
  type: string;
  [key: string]: unknown;
}

interface DebtListProps {
  debts: Debt[];
  onDebtClick: (debt: Debt) => void;
  onRecordPayment: (debt: Debt, amount: number) => void;
}

/**
 * List of debts with summary information
 * Pure UI component for displaying debt cards
 */
const DebtList = ({ debts, onDebtClick, _onRecordPayment }: DebtListProps) => {
  return (
    <div className="divide-y divide-gray-100">
      {debts.map((debt) => (
        <DebtCard key={debt.id} debt={debt} onClick={() => onDebtClick(debt)} />
      ))}
    </div>
  );
};

interface DebtCardProps {
  debt: Debt;
  onClick: () => void;
}

interface FinancialDetailsProps {
  currentBalance: number;
  paymentDisplay: string;
  interestRate: number;
  nextPaymentInfo: { label: string; hasIcon: boolean; type: string; value: string };
}

const FinancialDetails = ({
  currentBalance,
  paymentDisplay,
  interestRate,
  nextPaymentInfo,
}: FinancialDetailsProps) => (
  <div className="mt-3 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div>
      <p className="text-xs text-gray-500">Current Balance</p>
      <p className="text-base md:text-lg font-bold text-red-600">${currentBalance}</p>
    </div>
    <div>
      <p className="text-xs text-gray-500">Payment</p>
      <p className="text-base md:text-lg font-semibold text-gray-900">
        {paymentDisplay || "$0.00"}
      </p>
    </div>
    <div>
      <p className="text-xs text-gray-500">Interest Rate</p>
      <p className="text-base md:text-lg font-semibold text-purple-600">{interestRate || 0}%</p>
    </div>
    <div>
      <p className="text-xs text-gray-500">{nextPaymentInfo.label || "Next Payment"}</p>
      <p className="text-sm md:text-base font-semibold text-gray-900">
        {nextPaymentInfo.hasIcon && (
          <span className="flex items-center">
            {nextPaymentInfo.type === "next_payment"
              ? React.createElement(getIcon("Calendar"), {
                  className: "h-3 w-3 mr-1",
                })
              : React.createElement(getIcon("Clock"), {
                  className: "h-3 w-3 mr-1",
                })}
            {nextPaymentInfo.value || "N/A"}
          </span>
        )}
      </p>
    </div>
  </div>
);

const DebtCard = ({ debt, onClick }: DebtCardProps) => {
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
  } = {
    config: { bgColor: "bg-gray-50", textColor: "text-gray-600", name: "Standard" },
    IconComponent: "Clock",
    statusStyle: "text-gray-600",
    statusText: "Active",
    progressData: { percentage: 0 },
    paymentInfo: { display: "$0.00" },
    nextPaymentInfo: { label: "Next Payment", hasIcon: true, type: "next_payment", value: "N/A" },
    relationships: { hasRelationships: false, items: [] },
    canQuickPay: false,
    handleRecordPayment: () => {},
    currentBalance: Number(debt?.currentBalance) || 0,
    interestRate: Number(debt?.interestRate) || 0,
  };

  return (
    <div
      className="p-6 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 border border-gray-200 hover:border-gray-300 rounded-xl hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-2xl ${config.bgColor}`}>
              {React.createElement(getIcon(IconComponent), {
                className: `h-6 w-6 ${config.textColor}`,
              })}
            </div>
          </div>

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
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle}`}>
                {statusText}
              </span>
            </div>

            <FinancialDetails
              currentBalance={currentBalance}
              paymentDisplay={paymentInfo.display}
              interestRate={interestRate}
              nextPaymentInfo={nextPaymentInfo}
            />

            <DebtCardProgressBar progressData={progressData} />

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

        <div className="ml-2 md:ml-4 flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          {canQuickPay && (
            <Button
              onClick={handleRecordPayment}
              className="px-2 md:px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            >
              <span className="hidden sm:inline">Quick Pay</span>
              <span className="sm:hidden">Pay</span>
            </Button>
          )}
          {React.createElement(getIcon("ArrowRight"), {
            className: "h-4 w-4 md:h-5 md:w-5 text-gray-400",
          })}
        </div>
      </div>
    </div>
  );
};

export default DebtList;
