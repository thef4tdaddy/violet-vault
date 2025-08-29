import React, { useState } from "react";
import { X, Edit, Trash2, DollarSign, Calendar, TrendingDown, Receipt, Wallet } from "lucide-react";
import { useConfirm } from "../../../hooks/common/useConfirm";
import ConnectionDisplay, {
  ConnectionItem,
  ConnectionInfo,
  UniversalConnectionManager,
} from "../../ui/ConnectionDisplay";

/**
 * Modal for viewing and managing individual debt details
 * Pure UI component with basic actions
 */
const DebtDetailModal = ({
  debt,
  isOpen,
  onClose,
  onDelete,
  onRecordPayment,
  onLinkToBill,
  onEdit,
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(debt?.minimumPayment?.toString() || "");
  const confirm = useConfirm();

  if (!isOpen || !debt) return null;

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (amount <= 0) return;

    const paymentData = {
      amount,
      date: new Date().toISOString(),
      paymentMethod: "manual",
      notes: `Payment recorded via debt dashboard`,
    };

    onRecordPayment(debt.id, paymentData);
    setShowPaymentForm(false);
    setPaymentAmount(debt.minimumPayment?.toString() || "");
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Debt",
      message: `Are you sure you want to delete "${debt.name}"? This action cannot be undone.`,
      confirmLabel: "Delete Debt",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (confirmed) {
      onDelete(debt.id);
      onClose(); // Close modal after deletion
    }
  };

  const handleEdit = () => {
    onClose(); // Close detail modal first
    onEdit(debt); // Then open edit modal
  };

  const progressPercentage =
    debt.originalBalance > 0
      ? ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100
      : 0;

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
            <X className="h-6 w-6" />
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
              <TrendingDown className="h-8 w-8 text-red-500" />
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
              <Calendar className="h-8 w-8 text-orange-500" />
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
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Progress */}
        {debt.originalBalance > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Payoff Progress</span>
              <span>{progressPercentage.toFixed(1)}% paid off</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Original: ${debt.originalBalance?.toFixed(2)}</span>
              <span>Remaining: ${debt.currentBalance?.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payoff Information */}
        {debt.payoffInfo && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-3">Payoff Projection</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Expected Payoff</p>
                <p className="font-semibold text-blue-900">
                  {debt.payoffInfo?.payoffDate
                    ? new Date(debt.payoffInfo.payoffDate).toLocaleDateString()
                    : debt.payoffInfo?.monthsToPayoff
                      ? `${debt.payoffInfo.monthsToPayoff} months`
                      : "Insufficient data"}
                </p>
              </div>
              <div>
                <p className="text-blue-600">Total Interest</p>
                <p className="font-semibold text-blue-900">
                  ${debt.payoffInfo?.totalInterest?.toFixed(2) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-blue-600">Payoff Date</p>
                <p className="font-semibold text-blue-900">
                  {debt.payoffInfo?.payoffDate
                    ? new Date(debt.payoffInfo.payoffDate).toLocaleDateString()
                    : "N/A"}
                </p>
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
        {debt.paymentHistory && debt.paymentHistory.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {debt.paymentHistory
                .slice(-5)
                .reverse()
                .map((payment, index) => (
                  <div
                    key={payment.id || index}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">${payment.amount?.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      {payment.principalAmount && (
                        <p>Principal: ${payment.principalAmount.toFixed(2)}</p>
                      )}
                      {payment.interestAmount && (
                        <p>Interest: ${payment.interestAmount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Payment */}
        {debt.status === "active" && (
          <div className="mb-6">
            {!showPaymentForm ? (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Record Payment
              </button>
            ) : (
              <form onSubmit={handleRecordPayment} className="bg-green-50 rounded-xl p-4">
                <h4 className="font-medium text-green-900 mb-3">Record Payment</h4>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Payment amount"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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
            <Edit className="h-4 w-4 mr-2" />
            Edit Debt
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebtDetailModal;
