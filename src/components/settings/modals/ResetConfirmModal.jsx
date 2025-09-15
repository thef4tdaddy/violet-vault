import React from "react";
import { getIcon } from "../../../utils";

const ResetConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border-2 border-black ring-1 ring-gray-800/10">
        <div className="flex items-center gap-3 mb-4">
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-6 w-6 text-red-500",
          })}
          <h4 className="font-black text-black text-base">
            <span className="text-lg">C</span>ONFIRM{" "}
            <span className="text-lg">D</span>ATA{" "}
            <span className="text-lg">R</span>ESET
          </h4>
        </div>
        <p className="text-purple-900 mb-6">
          This will permanently delete all your budget data. This action cannot
          be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 border-2 border-black"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 border-2 border-black"
          >
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;
