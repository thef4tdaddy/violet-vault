import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface ClearDataConfirmationModalProps {
  showConfirmClear: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ClearDataConfirmationModal: React.FC<ClearDataConfirmationModalProps> = ({
  showConfirmClear,
  loading,
  onCancel,
  onConfirm,
}) => {
  const modalRef = useModalAutoScroll(showConfirmClear);

  if (!showConfirmClear) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {React.createElement(getIcon("AlertTriangle"), {
              className: "h-6 w-6 text-red-600 mr-2",
            })}
            <h4 className="text-lg font-semibold text-gray-900">Clear All Data?</h4>
          </div>
          <ModalCloseButton
            onClick={() => {
              if (!loading) {
                onCancel();
              }
            }}
            className={loading ? "opacity-50 pointer-events-none" : ""}
          />
        </div>
        <p className="text-sm text-gray-600 mb-6">
          This will permanently delete all your envelopes, transactions, bills, and settings.
          <strong className="text-red-600"> This action cannot be undone.</strong>
        </p>
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
          <p className="text-xs text-red-800">
            💡 <strong>Tip:</strong> Export your data first if you want to keep a backup.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Clear All Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataConfirmationModal;
