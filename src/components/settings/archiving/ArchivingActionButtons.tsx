import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface ArchivingActionButtonsProps {
  needsArchiving: boolean;
  isArchiving: boolean;
  showPreview: boolean;
  confirmArchiving: boolean;
  handlePreview: () => void;
  toggleConfirmArchiving: () => void;
  onArchiveClick: () => void;
}

const ArchivingActionButtons: React.FC<ArchivingActionButtonsProps> = ({
  needsArchiving,
  isArchiving,
  showPreview,
  confirmArchiving,
  handlePreview,
  toggleConfirmArchiving,
  onArchiveClick,
}) => {
  if (!needsArchiving || isArchiving) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ready to Archive</h3>
          <p className="text-gray-600 text-sm mt-1">
            {confirmArchiving
              ? 'Click "Confirm Archive" to proceed with archiving.'
              : "Archive old transactions to improve performance and reduce storage."}
          </p>
        </div>

        <div className="flex space-x-3">
          {!showPreview && (
            <Button
              onClick={handlePreview}
              disabled={isArchiving}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              {React.createElement(getIcon("BarChart3"), {
                className: "h-4 w-4",
              })}
              <span>Preview First</span>
            </Button>
          )}

          {confirmArchiving && (
            <Button onClick={toggleConfirmArchiving} variant="secondary">
              Cancel
            </Button>
          )}

          <Button
            onClick={onArchiveClick}
            className={`flex items-center space-x-2`}
            variant={confirmArchiving ? "destructive" : "primary"}
            disabled={isArchiving}
          >
            {React.createElement(getIcon("Archive"), { className: "h-4 w-4" })}
            <span>{confirmArchiving ? "Confirm Archive" : "Start Archiving"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArchivingActionButtons;
