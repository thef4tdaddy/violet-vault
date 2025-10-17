import React, { useState } from "react";
import { getIcon } from "../../utils";

const DeleteEnvelopeModal = ({
  isOpen,
  onClose,
  onConfirm,
  envelope,
  connectedBills = [],
  isDeleting = false,
}) => {
  const [deleteBillsToo, setDeleteBillsToo] = useState(false);

  if (!isOpen || !envelope) return null;

  const handleConfirm = () => {
    onConfirm(envelope.id, deleteBillsToo);
  };

  const handleClose = () => {
    setDeleteBillsToo(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              {React.createElement(getIcon("Trash2"), {
                className: "h-6 w-6 text-red-600",
              })}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Envelope</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">Are you sure you want to delete "{envelope.name}"?</p>

            {/* Connected Bills Section */}
            {connectedBills.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-3">
                  {connectedBills.length} Connected Bill
                  {connectedBills.length > 1 ? "s" : ""} Found
                </h4>

                <div className="space-y-2 mb-3">
                  {connectedBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded"
                    >
                      • {bill.name || bill.provider} - ${Math.abs(bill.amount || 0).toFixed(2)}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="billAction"
                      checked={!deleteBillsToo}
                      onChange={() => setDeleteBillsToo(false)}
                      className="mr-2"
                    />
                    <span className="text-yellow-800">
                      Keep bills and disconnect them (recommended)
                    </span>
                  </label>

                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="billAction"
                      checked={deleteBillsToo}
                      onChange={() => setDeleteBillsToo(true)}
                      className="mr-2"
                    />
                    <span className="text-red-700">
                      Also delete all {connectedBills.length} connected bill
                      {connectedBills.length > 1 ? "s" : ""}
                    </span>
                  </label>
                </div>

                <p className="text-xs text-yellow-600 mt-2">
                  {deleteBillsToo
                    ? "⚠️ This will permanently delete the envelope AND all connected bills."
                    : "✅ Bills will remain but lose their envelope connection."}
                </p>
              </div>
            )}

            {/* Balance Warning */}
            {envelope.currentBalance > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  💰 This envelope has ${envelope.currentBalance.toFixed(2)}. The money will be
                  transferred to unassigned cash.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
              disabled={isDeleting}
            >
              {React.createElement(getIcon("Trash2"), {
                className: "h-4 w-4 mr-2",
              })}
              {isDeleting ? "Deleting..." : "Delete Envelope"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEnvelopeModal;
