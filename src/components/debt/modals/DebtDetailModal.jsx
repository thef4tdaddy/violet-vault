import React from "react";
import { getIcon } from "../../../utils";
import { useDebtDetailModal } from "../../../hooks/debts/useDebtDetailModal";
import { UniversalConnectionManager } from "../../ui/ConnectionDisplay";
import DebtProgressBar from "../ui/DebtProgressBar";
import QuickPaymentForm from "../ui/QuickPaymentForm";

/**
 * Modal for viewing and managing individual debt details
 * Pure UI component - all business logic handled by useDebtDetailModal hook
 */
const DebtDetailModal = ({
  debt,
  isOpen,
  onClose,
  onDelete,
  onRecordPayment,
  _onLinkToBill,
  onEdit,
}) => {
  const {
    showPaymentForm,
    paymentAmount,
    setPaymentAmount,
    progressData,
    payoffDisplay,
    recentPayments,
    hasRecentPayments,
    isActiveDebt,
    handleRecordPayment,
    handleDelete,
    handleEdit,
    handleShowPaymentForm,
    handleCancelPayment,
  } = useDebtDetailModal(debt, isOpen, onClose, onDelete, onRecordPayment, onEdit);

  if (!isOpen || !debt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{debt.name}</h3>
            <p className="text-gray-600">
              {debt.creditor} • {debt.type}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
          </button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Current Balance</p>
                <p className="text-2xl font-bold text-red-700">
                  ${debt.currentBalance?.toFixed(2) || "0.00"}
                </p>
              </div>
              {React.createElement(getIcon("TrendingDown"), { className: "h-8 w-8 text-red-500" })}
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Monthly Payment</p>
                <p className="text-2xl font-bold text-orange-700">
                  ${debt.minimumPayment?.toFixed(2) || "0.00"}
                </p>
              </div>
              {React.createElement(getIcon("Calendar"), { className: "h-8 w-8 text-orange-500" })}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Interest Rate</p>
                <p className="text-2xl font-bold text-purple-700">
                  {debt.interestRate?.toFixed(2) || "0.00"}%
                </p>
              </div>
              {React.createElement(getIcon("DollarSign"), { className: "h-8 w-8 text-purple-500" })}
            </div>
          </div>
        </div>

        {/* Progress */}
        <DebtProgressBar progressData={progressData} />

        {/* Payoff Information */}
        {payoffDisplay && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-3">Payoff Projection</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Expected Payoff</p>
                <p className="font-semibold text-blue-900">{payoffDisplay.expectedPayoff}</p>
              </div>
              <div>
                <p className="text-blue-600">Total Interest</p>
                <p className="font-semibold text-blue-900">${payoffDisplay.totalInterest}</p>
              </div>
              <div>
                <p className="text-blue-600">Payoff Date</p>
                <p className="font-semibold text-blue-900">{payoffDisplay.payoffDate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Universal Connection Manager for Debts */}
        <UniversalConnectionManager
          entityType="debt"
          entityId={debt.id}
          canEdit={true}
          theme="purple"
        />

        {/* Payment History */}
        {hasRecentPayments && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
                >
                  <div>
                    <p className="text-sm font-medium">${payment.formattedAmount}</p>
                    <p className="text-xs text-gray-600">{payment.displayDate}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    {payment.principalDisplay && <p>Principal: ${payment.principalDisplay}</p>}
                    {payment.interestDisplay && <p>Interest: ${payment.interestDisplay}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Payment */}
        <QuickPaymentForm
          showPaymentForm={showPaymentForm}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          onSubmit={handleRecordPayment}
          onShowForm={handleShowPaymentForm}
          onCancel={handleCancelPayment}
          isActiveDebt={isActiveDebt}
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center"
          >
            {React.createElement(getIcon("Edit"), { className: "h-4 w-4 mr-2" })}
            Edit Debt
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center"
          >
            {React.createElement(getIcon("Trash2"), { className: "h-4 w-4 mr-2" })}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebtDetailModal;
