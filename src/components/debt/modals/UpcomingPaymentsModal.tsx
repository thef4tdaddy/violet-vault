import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

// Type definitions
interface UpcomingPayment {
  debtId: string;
  debtName: string;
  dueDate: string;
  amount: number;
  type?: string;
}

interface UpcomingPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  upcomingPayments?: UpcomingPayment[];
}

/**
 * Modal for displaying upcoming debt payments
 * Pure UI component - receives data as props
 */
const UpcomingPaymentsModal: React.FC<UpcomingPaymentsModalProps> = ({
  isOpen,
  onClose,
  upcomingPayments = [],
}) => {
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalUpcoming = upcomingPayments.reduce(
    (sum: number, payment: UpcomingPayment) => sum + (payment.amount || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border-2 border-black my-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Upcoming Payments</h3>
            <p className="text-gray-600">Next 30 days</p>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Summary */}
        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Total Upcoming</p>
              <p className="text-2xl font-bold text-orange-700">${totalUpcoming.toFixed(2)}</p>
            </div>
            {React.createElement(getIcon("DollarSign"), {
              className: "h-8 w-8 text-orange-500",
            })}
          </div>
        </div>

        {/* Payments List */}
        <div className="overflow-y-auto max-h-96">
          {upcomingPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {React.createElement(getIcon("Calendar"), {
                className: "h-12 w-12 mx-auto mb-4 opacity-50",
              })}
              <p>No upcoming payments in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map((payment, index) => (
                <div
                  key={`${payment.debtId}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.debtName}</p>
                    <p className="text-sm text-gray-600">Due: {formatDate(payment.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${payment.amount?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">{payment.type || "payment"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPaymentsModal;
