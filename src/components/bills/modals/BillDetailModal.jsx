import React from "react";
import { getIcon } from "../../../utils";
import { getIconByName } from "../../../utils/common/billIcons";
import { getFrequencyDisplayText } from "../../../utils/common/frequencyCalculations";
import {
  formatBillAmount,
  getBillStatusIcon,
} from "../../../utils/bills/billDetailUtils";
import { useBillDetail } from "../../../hooks/bills/useBillDetail";
import { UniversalConnectionManager } from "../../ui/ConnectionDisplay";

/**
 * Pure UI component for viewing and managing individual bill details
 * Business logic extracted to useBillDetail hook following Issue #152 pattern
 */
const BillDetailModal = ({
  bill,
  isOpen,
  onClose,
  onDelete,
  onMarkPaid,
  onEdit,
  onCreateRecurring,
}) => {
  const {
    showPaymentForm,
    paymentAmount,
    daysUntilDue,
    statusInfo,
    handleMarkPaid,
    handleDelete,
    handleEdit,
    handleCreateRecurring,
    handlePaymentAmountChange,
    handleShowPaymentForm,
    handleHidePaymentForm,
  } = useBillDetail(
    bill,
    onDelete,
    onMarkPaid,
    onClose,
    onEdit,
    onCreateRecurring,
  );

  if (!isOpen || !bill) return null;

  // Get UI components
  const BillIcon = getIconByName(bill.iconName || "Receipt");
  const statusIconName = getBillStatusIcon(
    bill.status,
    statusInfo.isOverdue,
    statusInfo.isDueSoon,
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${statusInfo.classes.bg}`}>
              <BillIcon className={`h-6 w-6 ${statusInfo.classes.icon}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {bill.name}
              </h3>
              <p className="text-gray-600">
                {bill.category} • {getFrequencyDisplayText(bill.frequency)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.classes.bg} ${statusInfo.classes.border} border`}
          >
            {React.createElement(getIcon(statusIconName), {
              className: `h-4 w-4 ${statusInfo.classes.icon}`,
            })}
            <span className={`text-sm font-medium ${statusInfo.classes.text}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Amount Due
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  ${formatBillAmount(bill.amount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Due Date</p>
                <p className="text-lg font-bold text-blue-700">
                  {bill.dueDate
                    ? new Date(bill.dueDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Frequency</p>
                <p className="text-lg font-bold text-green-700">
                  {getFrequencyDisplayText(
                    bill.frequency,
                    bill.customFrequency,
                  )}
                </p>
              </div>
              {React.createElement(getIcon("Clock"), {
                className: "h-8 w-8 text-green-500",
              })}
            </div>
          </div>
        </div>

        {/* Next Due Date (for recurring bills) */}
        {bill.frequency !== "once" && bill.nextDueDate && (
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-amber-900 mb-3">Next Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-amber-600">Next Due Date</p>
                <p className="font-semibold text-amber-900">
                  {new Date(bill.nextDueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-amber-600">Days Away</p>
                <p className="font-semibold text-amber-900">
                  {daysUntilDue !== null
                    ? `${daysUntilDue} days`
                    : "Not calculated"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Universal Connection Manager for Bills */}
        <UniversalConnectionManager
          entityType="bill"
          entityId={bill.id}
          canEdit={true}
          theme="purple"
        />

        {/* Bill Notes */}
        {bill.notes && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{bill.notes}</p>
            </div>
          </div>
        )}

        {/* Payment History */}
        {bill.paymentHistory && bill.paymentHistory.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {bill.paymentHistory
                .slice(-5)
                .reverse()
                .map((payment, index) => (
                  <div
                    key={payment.id || index}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        ${payment.amount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(
                          payment.paidDate || payment.date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {React.createElement(getIcon("CheckCircle"), {
                        className: "h-4 w-4 text-green-500",
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Payment (for unpaid bills) */}
        {bill.status !== "paid" && (
          <div className="mb-6">
            {!showPaymentForm ? (
              <button
                onClick={handleShowPaymentForm}
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Mark as Paid
              </button>
            ) : (
              <form
                onSubmit={handleMarkPaid}
                className="bg-green-50 rounded-xl p-4"
              >
                <h4 className="font-medium text-green-900 mb-3">
                  Mark as Paid
                </h4>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => handlePaymentAmountChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Payment amount"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    onClick={handleHidePaymentForm}
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

          {bill.frequency === "once" && (
            <button
              onClick={handleCreateRecurring}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center"
            >
              <Target className="h-4 w-4 mr-2" />
              Make Recurring
            </button>
          )}

          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Bill
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

export default BillDetailModal;
