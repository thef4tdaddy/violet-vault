import React from "react";
import { Button } from "@/components/ui";
import {
  formatAmountChange,
  formatDateChange,
  hasChanges,
  type BillChange,
} from "@/utils/domain/bills/billUpdateHelpers";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import type { Bill } from "@/types/bills";

interface BulkUpdateSummary {
  changedBills: number;
  totalBills: number;
  totalAmountChange: number;
}

interface BulkUpdateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedBills: Bill[];
  changes: Record<string, BillChange>;
  summary: BulkUpdateSummary;
}

const BulkUpdateConfirmModal: React.FC<BulkUpdateConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedBills,
  changes,
  summary,
}) => {
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-black my-auto"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-black text-black">CONFIRM BULK CHANGES</h3>
            <ModalCloseButton onClick={onClose} />
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm p-4 rounded-xl border-2 border-black shadow-lg">
              <h4 className="font-black text-purple-900 mb-2">SUMMARY OF CHANGES</h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p className="font-medium">
                  • {summary.changedBills} of {summary.totalBills} bills will be updated
                </p>
                {summary.totalAmountChange !== 0 && (
                  <p className="font-medium">
                    • Net amount change: {summary.totalAmountChange > 0 ? "+" : ""}$
                    {summary.totalAmountChange.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {selectedBills.map((bill) => {
                const change = changes[bill.id];
                if (!change || !hasChanges(change)) return null;

                const amountChange = formatAmountChange(change.originalAmount, change.amount);
                const dateChange = formatDateChange(change.originalDueDate, change.dueDate);

                return (
                  <div
                    key={bill.id}
                    className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <h5 className="font-bold text-gray-900">{bill.provider || bill.name}</h5>
                    <div className="text-sm text-purple-800 space-y-1 mt-1">
                      {amountChange.hasChange && (
                        <p className="font-medium">
                          Amount: <span className="text-gray-600">${amountChange.original}</span> →{" "}
                          <span className="text-purple-900 font-bold">${amountChange.updated}</span>
                        </p>
                      )}
                      {dateChange && dateChange.hasChange && (
                        <p className="font-medium">
                          Due Date: <span className="text-gray-600">{dateChange.original}</span> →{" "}
                          <span className="text-purple-900 font-bold">{dateChange.updated}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-gray-200/80 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300/80 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
              >
                Back to Edit
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all border-2 border-black shadow-md hover:shadow-lg font-black"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateConfirmModal;
