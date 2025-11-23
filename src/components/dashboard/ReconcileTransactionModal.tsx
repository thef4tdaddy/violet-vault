import React from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface EnvelopeOption {
  id: string | number;
  name: string;
}

interface NewTransaction {
  type?: string;
  amount?: string | number;
  description?: string;
  envelopeId?: string | number;
  date?: string;
}

interface ReconcileTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTransaction: NewTransaction;
  onUpdateTransaction: (updates: Partial<NewTransaction>) => void;
  onReconcile: () => void;
  getEnvelopeOptions?: () => EnvelopeOption[];
}

const ReconcileTransactionModal: React.FC<ReconcileTransactionModalProps> = ({
  isOpen,
  onClose,
  newTransaction,
  onUpdateTransaction,
  onReconcile,
  getEnvelopeOptions = () => [],
}) => {
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-black text-black text-base">
            <span className="text-lg">R</span>ECONCILE <span className="text-lg">T</span>RANSACTION
          </h3>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => onUpdateTransaction({ type: "expense" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  newTransaction.type === "expense"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                {React.createElement(getIcon("Minus"), {
                  className: "h-5 w-5 mx-auto mb-1",
                })}
                <span className="text-sm">Expense</span>
              </Button>

              <Button
                type="button"
                onClick={() => onUpdateTransaction({ type: "income" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  newTransaction.type === "income"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                {React.createElement(getIcon("Plus"), {
                  className: "h-5 w-5 mx-auto mb-1",
                })}
                <span className="text-sm">Income</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={newTransaction.amount}
              onChange={(e) => onUpdateTransaction({ amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => onUpdateTransaction({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What was this transaction for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Envelope
            </label>
            <Select
              value={newTransaction.envelopeId}
              onChange={(e) => onUpdateTransaction({ envelopeId: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select envelope...</option>
              {getEnvelopeOptions().map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => onUpdateTransaction({ date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onReconcile}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Reconcile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReconcileTransactionModal;
