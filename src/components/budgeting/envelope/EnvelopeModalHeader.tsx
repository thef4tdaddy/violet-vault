import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import EditLockIndicator from "../../ui/EditLockIndicator";

// Type definitions
interface Lock {
  userId: string;
  timestamp: number;
  [key: string]: unknown;
}

interface EnvelopeModalHeaderProps {
  title?: string;
  subtitle?: string;
  lockLoading?: boolean;
  isLocked?: boolean;
  isOwnLock?: boolean;
  isExpired?: boolean;
  lock?: Lock | null;
  onBreakLock?: () => void;
  onClose: () => void;
}

const EnvelopeModalHeader = ({
  title = "Edit Envelope",
  subtitle = "Modify envelope settings",
  lockLoading = false,
  isLocked = false,
  isOwnLock = false,
  isExpired = false,
  lock = null,
  onBreakLock,
  onClose,
}: EnvelopeModalHeaderProps) => {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="bg-white/20 p-2 rounded-xl mr-3">
              {React.createElement(getIcon("Edit"), {
                className: "h-5 w-5 text-white",
              })}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {lockLoading && (
                  <div className="bg-purple-500/20 text-purple-100 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-yellow-300 border-t-transparent mr-1" />
                    Acquiring Lock...
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-blue-100 text-sm">{subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Lock Controls */}
            {isLocked && !isOwnLock && isExpired && (
              <Button
                onClick={onBreakLock}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
              >
                {React.createElement(getIcon("Unlock"), {
                  className: "h-3 w-3 mr-1",
                })}
                Break Lock
              </Button>
            )}
            <Button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Lock Indicator */}
      {isLocked && (
        <div className="mx-6 mt-4">
          <EditLockIndicator
            isLocked={isLocked}
            isOwnLock={isOwnLock}
            lock={lock}
            onBreakLock={onBreakLock}
            showDetails={true}
          />
        </div>
      )}
    </>
  );
};

export default EnvelopeModalHeader;
