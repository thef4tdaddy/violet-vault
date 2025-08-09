import React from "react";
import {
  CreditCard,
  Home,
  Car,
  User,
  Building,
  GraduationCap,
  Scale,
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  TrendingDown,
  Clock,
} from "lucide-react";
import { DEBT_TYPES, DEBT_TYPE_CONFIG } from "../../../constants/debts";

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
  const config =
    DEBT_TYPE_CONFIG[debt.type] || DEBT_TYPE_CONFIG[DEBT_TYPES.OTHER];
  const IconComponent = getDebtIcon(debt.type);

  // Calculate progress percentage
  const progressPercentage =
    debt.originalBalance > 0
      ? ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) *
        100
      : 0;

  // Determine status styling
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "paid_off":
        return "text-gray-600 bg-gray-100";
      case "deferred":
        return "text-yellow-600 bg-yellow-100";
      case "default":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleRecordPayment = (e) => {
    e.stopPropagation();
    // For now, just record the minimum payment
    // In a real implementation, this would open a payment modal
    const paymentData = {
      amount: debt.minimumPayment || 0,
      date: new Date().toISOString(),
      paymentMethod: "quick_pay",
    };
    onRecordPayment(debt.id, paymentData);
  };

  return (
    <div
      className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${config.borderColor}`}
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
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {debt.name}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {debt.creditor} • {config.name}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(debt.status)}`}
              >
                {debt.status?.replace("_", " ").toUpperCase() || "ACTIVE"}
              </span>
            </div>

            {/* Financial Details */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Current Balance */}
              <div>
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className="text-lg font-bold text-red-600">
                  ${debt.currentBalance?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Payment */}
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${debt.minimumPayment?.toFixed(2) || "0.00"}
                  <span className="text-xs text-gray-500 ml-1">
                    /{debt.paymentFrequency || "monthly"}
                  </span>
                </p>
              </div>

              {/* Interest Rate */}
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-lg font-semibold text-purple-600">
                  {debt.interestRate?.toFixed(2) || "0.00"}%
                </p>
              </div>

              {/* Next Payment / Payoff Info */}
              <div>
                <p className="text-xs text-gray-500">
                  {debt.nextPaymentDate ? "Next Payment" : "Payoff Months"}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {debt.nextPaymentDate ? (
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(debt.nextPaymentDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {debt.payoffInfo?.monthsToPayoff || "N/A"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {debt.originalBalance > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}% paid off</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Relationships */}
            {(debt.relatedBill || debt.relatedEnvelope) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {debt.relatedBill && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    📄 Bill: {debt.relatedBill.name}
                  </span>
                )}
                {debt.relatedEnvelope && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    📧 Envelope: {debt.relatedEnvelope.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="ml-4 flex items-center space-x-2">
          {debt.status === "active" && debt.minimumPayment > 0 && (
            <button
              onClick={handleRecordPayment}
              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            >
              Quick Pay
            </button>
          )}
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// Helper function to get the appropriate icon for debt type
const getDebtIcon = (debtType) => {
  const iconMap = {
    [DEBT_TYPES.MORTGAGE]: Home,
    [DEBT_TYPES.AUTO]: Car,
    [DEBT_TYPES.CREDIT_CARD]: CreditCard,
    [DEBT_TYPES.CHAPTER13]: Scale,
    [DEBT_TYPES.STUDENT]: GraduationCap,
    [DEBT_TYPES.PERSONAL]: User,
    [DEBT_TYPES.BUSINESS]: Building,
    [DEBT_TYPES.OTHER]: DollarSign,
  };

  return iconMap[debtType] || DollarSign;
};

export default DebtList;
