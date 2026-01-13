import React from "react";
import { Textarea, Checkbox } from "@/components/ui";
import { FormSection } from "@/components/primitives/forms";
import ReceiptButton from "@/components/receipts/ReceiptButton";
import logger from "@/utils/common/logger";
import type { Transaction } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";

interface NotesSectionProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
  onClose?: () => void;
}

/**
 * NotesSection - Notes, reconciled status, and receipt scanner
 * Uses FormSection primitive for consistent layout
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
  onClose,
}) => {
  return (
    <FormSection title="Additional Details" subtitle="Notes and reconciliation">
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <Textarea
          value={transactionForm.notes || ""}
          onChange={(e) =>
            setTransactionForm({
              ...transactionForm,
              notes: e.target.value,
            })
          }
          disabled={!!editingTransaction && !canEdit}
          placeholder="Add any notes or details about this transaction..."
          rows={4}
        />
      </div>

      {/* Reconciled Checkbox */}
      <div className="flex items-center">
        <Checkbox
          checked={transactionForm.reconciled || false}
          onChange={(e) =>
            setTransactionForm({
              ...transactionForm,
              reconciled: e.target.checked,
            })
          }
          disabled={!!editingTransaction && !canEdit}
        />
        <label className="ml-2 text-sm font-medium text-gray-700">Mark as reconciled</label>
      </div>

      {/* Receipt Scanner (only for new transactions) */}
      {!editingTransaction && onClose && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-purple-900 mb-1">Have a receipt?</p>
              <p className="text-sm text-purple-700">
                Scan a receipt to automatically fill in transaction details
              </p>
            </div>
            <ReceiptButton
              variant="secondary"
              onTransactionCreated={(transaction: unknown) => {
                logger.info(
                  "Transaction created from receipt in form",
                  transaction as Record<string, unknown>
                );
                onClose();
              }}
            />
          </div>
        </div>
      )}
    </FormSection>
  );
};

export default NotesSection;
