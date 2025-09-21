import React from "react";
import { useTouchFeedback } from "../../utils/ui/touchFeedback";

/**
 * Extracted content component for TransferModal
 * Reduces main component complexity for ESLint compliance
 */
const TransferModalContent = ({
  transferringAccount,
  transferForm,
  setTransferForm,
  envelopes,
  onClose,
  onTransfer,
}) => {
  const confirmFeedback = useTouchFeedback("confirm", "success");

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Available Balance:</span>
          <span className="font-bold text-green-600">
            ${transferringAccount.currentBalance.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transfer to Envelope *
        </label>
        <select
          value={transferForm.envelopeId}
          onChange={(e) =>
            setTransferForm({
              ...transferForm,
              envelopeId: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          required
        >
          <option value="">Select an envelope...</option>
          {envelopes.map((envelope) => (
            <option key={envelope.id} value={envelope.id}>
              {envelope.name} ($
              {envelope.currentAmount?.toFixed(2) || "0.00"})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
        <input
          type="number"
          step="0.01"
          max={transferringAccount.currentBalance}
          value={transferForm.amount}
          onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <input
          type="text"
          value={transferForm.description}
          onChange={(e) =>
            setTransferForm({
              ...transferForm,
              description: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          placeholder={`Transfer from ${transferringAccount.name}`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 btn btn-secondary border-2 border-black">
          Cancel
        </button>
        <button
          onClick={confirmFeedback.onClick(onTransfer)}
          className={`flex-1 btn btn-primary border-2 border-black ${confirmFeedback.className}`}
        >
          Transfer ${transferForm.amount || "0.00"}
        </button>
      </div>
    </div>
  );
};

export default TransferModalContent;