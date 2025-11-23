import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import type { Bill } from "@/types/bills";

interface PaymentHistoryEntry {
  id?: string;
  amount?: number;
  paidDate?: string;
  date?: string;
}

interface BillWithPaymentHistory extends Bill {
  paymentHistory?: PaymentHistoryEntry[];
}

/**
 * Payment history section for BillDetailModal
 * Extracted to reduce modal complexity
 */
interface BillDetailPaymentHistoryProps {
  bill: BillWithPaymentHistory;
}

export const BillDetailPaymentHistory: React.FC<BillDetailPaymentHistoryProps> = ({ bill }) => {
  if (!bill.paymentHistory || bill.paymentHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {bill.paymentHistory
          .slice(-5)
          .reverse()
          .map((payment: PaymentHistoryEntry, index: number) => (
            <div
              key={payment.id || index}
              className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
            >
              <div>
                <p className="text-sm font-medium">${payment.amount?.toFixed(2)}</p>
                <p className="text-xs text-gray-600">
                  {new Date(payment.paidDate || payment.date).toLocaleDateString()}
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
  );
};

/**
 * Quick payment form section for BillDetailModal
 * Extracted to reduce modal complexity
 */
interface BillDetailQuickPaymentProps {
  bill: Bill;
  showPaymentForm: boolean;
  paymentAmount: string;
  handleShowPaymentForm: () => void;
  handleHidePaymentForm: () => void;
  handleMarkPaid: (e: React.FormEvent) => void;
  handlePaymentAmountChange: (value: string) => void;
}

export const BillDetailQuickPayment: React.FC<BillDetailQuickPaymentProps> = ({
  bill,
  showPaymentForm,
  paymentAmount,
  handleShowPaymentForm,
  handleHidePaymentForm,
  handleMarkPaid,
  handlePaymentAmountChange,
}) => {
  if (bill.status === "paid") {
    return null;
  }

  return (
    <div className="mb-6">
      {!showPaymentForm ? (
        <Button
          onClick={handleShowPaymentForm}
          className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          Mark as Paid
        </Button>
      ) : (
        <form onSubmit={handleMarkPaid} className="bg-green-50 rounded-xl p-4">
          <h4 className="font-medium text-green-900 mb-3">Mark as Paid</h4>
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
            <Button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Mark Paid
            </Button>
            <Button
              type="button"
              onClick={handleHidePaymentForm}
              className="px-4 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
