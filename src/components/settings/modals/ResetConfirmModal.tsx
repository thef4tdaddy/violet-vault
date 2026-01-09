import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {React.createElement(getIcon("AlertTriangle"), {
              className: "h-6 w-6 text-red-500",
            })}
            <h4 className="font-black text-black text-base">
              <span className="text-lg">C</span>ONFIRM <span className="text-lg">D</span>ATA{" "}
              <span className="text-lg">R</span>ESET
            </h4>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>
        <p className="text-purple-900 mb-6">
          This will permanently delete all your budget data. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 border-2 border-black"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 border-2 border-black"
          >
            Delete All Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;
