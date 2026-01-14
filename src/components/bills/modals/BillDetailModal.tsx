import React from "react";
import { getIcon } from "../../../utils";
import { getBillStatusIcon } from "@/utils/domain/bills/billDetailUtils";
import { useBillDetail } from "../../../hooks/budgeting/transactions/scheduled/expenses/useBillDetail";
import { UniversalConnectionManager } from "../../ui/ConnectionDisplay";
import { BillDetailHeader } from "./BillDetailHeader";
import { BillDetailStats } from "./BillDetailStats";
import { BillDetailPaymentHistory, BillDetailQuickPayment } from "./BillDetailSections";
import { BillDetailActions } from "./BillDetailActions";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import type { Bill as BillFromTypes } from "@/types/bills";

interface PaymentData {
  amount: number;
  paidDate: string;
}

interface BillDetailModalProps {
  bill: BillFromTypes | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (billId: string) => void | Promise<void>;
  onMarkPaid: (billId: string, paymentData: PaymentData) => void | Promise<void>;
  onEdit: (bill: BillFromTypes) => void;
  onCreateRecurring: (bill: BillFromTypes) => void;
}

/**
 * Pure UI component for viewing and managing individual bill details
 * Business logic extracted to useBillDetail hook following Issue #152 pattern
 */
const BillDetailModal: React.FC<BillDetailModalProps> = ({
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
  } = useBillDetail({ bill, onDelete, onMarkPaid, onClose, onEdit, onCreateRecurring });

  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen || !bill) return null;

  const statusIconName = getBillStatusIcon(
    bill.status ?? "",
    statusInfo.isOverdue,
    statusInfo.isDueSoon
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl my-auto border-2 border-black"
      >
        {/* Header */}
        <BillDetailHeader bill={bill} statusInfo={statusInfo} onClose={onClose} />

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
        <BillDetailStats bill={bill} />

        {/* Next Due Date (for recurring bills) */}
        {bill.frequency !== "once" && bill.nextDue && (
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-amber-900 mb-3">Next Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-amber-600">Next Due Date</p>
                <p className="font-semibold text-amber-900">
                  {new Date(bill.nextDue || "").toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-amber-600">Days Away</p>
                <p className="font-semibold text-amber-900">
                  {daysUntilDue !== null ? `${daysUntilDue} days` : "Not calculated"}
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
        <BillDetailPaymentHistory bill={bill} />

        {/* Quick Payment (for unpaid bills) */}
        <BillDetailQuickPayment
          bill={bill}
          showPaymentForm={showPaymentForm}
          paymentAmount={paymentAmount}
          handleShowPaymentForm={handleShowPaymentForm}
          handleHidePaymentForm={handleHidePaymentForm}
          handleMarkPaid={handleMarkPaid}
          handlePaymentAmountChange={handlePaymentAmountChange}
        />

        {/* Actions */}
        <BillDetailActions
          bill={bill}
          onClose={onClose}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleCreateRecurring={handleCreateRecurring}
        />
      </div>
    </div>
  );
};

export default BillDetailModal;
