import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils/icons";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface ClearConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Clear security events confirmation modal
 * Extracted from SecuritySettings.jsx with UI standards compliance
 */
const ClearConfirmationModal: React.FC<ClearConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-black bg-red-50/90 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-red-500/20 border border-red-400">
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-6 w-6 text-red-600",
              })}
            </div>
            <h4 className="font-black text-black text-lg uppercase tracking-wide">
              CLEAR SECURITY EVENTS
            </h4>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Warning Message */}
        <div className="rounded-lg p-4 border border-red-300 bg-white/70 mb-6">
          <p className="text-purple-800 font-medium text-sm">
            ⚠️ Are you sure you want to clear all security event logs?
          </p>
          <p className="text-red-700 font-bold text-xs mt-2 uppercase tracking-wide">
            🚨 This action cannot be undone!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold uppercase tracking-wide"
          >
            ❌ CANCEL
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all border-2 border-black shadow-md hover:shadow-lg font-black uppercase tracking-wide"
          >
            🗑️ CLEAR EVENTS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClearConfirmationModal;
