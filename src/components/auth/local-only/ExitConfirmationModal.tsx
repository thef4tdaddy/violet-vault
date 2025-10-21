import React from "react";
import { Button } from "@/components/ui";

interface ExitConfirmationModalProps {
  showConfirmExit: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  showConfirmExit,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!showConfirmExit) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 rounded-2xl">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Switch to Standard Mode?</h4>
        <p className="text-sm text-gray-600 mb-6">
          This will enable password protection and cloud sync features. Your local data will
          be preserved and you can set up encryption.
        </p>
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
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Switch Mode
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;
