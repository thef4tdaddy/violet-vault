import React from "react";
import { getIcon } from "../../utils";

/**
 * @typedef {Object} SyncConflict
 * @property {boolean} hasConflict - Whether a conflict exists
 * @property {Object} [cloudUser] - User who made changes on cloud
 * @property {string} [cloudUser.userName] - Name of the cloud user
 * @property {string} [cloudUser.id] - ID of the cloud user
 */

/**
 * Conflict resolution modal component
 * Displays when sync conflicts are detected between local and cloud data
 * Extracted from Layout.jsx for better organization
 *
 * @param {Object} props - Component props
 * @param {SyncConflict|null} props.syncConflicts - Conflict details including cloud user info
 * @param {Function} props.onResolveConflict - Callback to resolve conflict by loading cloud data
 * @param {Function} props.onDismiss - Callback to dismiss conflict and keep local data
 * @returns {React.ReactElement|null} Modal element or null if no conflict
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
