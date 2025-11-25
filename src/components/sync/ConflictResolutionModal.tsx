import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

/**
 * Sync conflict details
 */
interface SyncConflict {
  hasConflict: boolean;
  cloudUser?: {
    userName?: string;
    id?: string;
  };
}

/**
 * Conflict resolution modal component props
 */
interface ConflictResolutionModalProps {
  syncConflicts: SyncConflict | null;
  onResolveConflict: () => void;
  onDismiss: () => void;
}

/**
 * Conflict resolution modal component
 * Displays when sync conflicts are detected between local and cloud data
 * Extracted from Layout.jsx for better organization
 */
const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  syncConflicts,
  onResolveConflict,
  onDismiss,
}) => {
  const shouldRender = Boolean(syncConflicts?.hasConflict);
  const modalRef = useModalAutoScroll(shouldRender);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-8 w-full max-w-md border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex justify-end mb-2">
          <ModalCloseButton onClick={onDismiss} />
        </div>
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-amber-500 p-4 rounded-2xl">
              {React.createElement(getIcon("Sparkles"), {
                className: "h-8 w-8 text-white",
              })}
            </div>
          </div>

          <h3 className="font-black text-black text-base mb-4">
            <span className="text-lg">S</span>YNC <span className="text-lg">C</span>ONFLICT{" "}
            <span className="text-lg">D</span>ETECTED
          </h3>
          <p className="text-gray-600 mb-6">
            <strong>{syncConflicts.cloudUser?.userName}</strong> made changes on another device.
            Would you like to load their latest changes?
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onDismiss}
              className="flex-1 btn btn-secondary border-2 border-black rounded-2xl py-3"
            >
              Keep Mine
            </Button>
            <Button
              onClick={onResolveConflict}
              className="flex-1 btn btn-primary border-2 border-black rounded-2xl py-3"
            >
              Load Theirs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
