import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Conflict resolution modal component
 * Extracted from Layout.jsx for better organization
 */
const ConflictResolutionModal = ({ syncConflicts, onResolveConflict, onDismiss }) => {
  if (!syncConflicts?.hasConflict) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-3xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-amber-500 p-4 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Sync Conflict Detected</h3>
          <p className="text-gray-600 mb-6">
            <strong>{syncConflicts.cloudUser?.userName}</strong> made changes on another
            device. Would you like to load their latest changes?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 btn btn-secondary rounded-2xl py-3"
            >
              Keep Mine
            </button>
            <button
              onClick={onResolveConflict}
              className="flex-1 btn btn-primary rounded-2xl py-3"
            >
              Load Theirs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;