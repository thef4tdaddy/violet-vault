import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

/**
 * Props for the actions component
 */
interface EnvelopeIntegrityActionsProps {
  selectedCount: number;
  totalCorrupted: number;
  isProcessing: boolean;
  isScanning: boolean;
  onSelectAll: () => void;
  onRepairSelected: () => void;
  onRemoveSelected: () => void;
  onRescan: () => void;
}

/**
 * Action buttons panel for envelope integrity checker
 * Handles selection and action buttons with proper states
 * Extracted from EnvelopeIntegrityChecker.tsx for reusability
 */
export const EnvelopeIntegrityActions: React.FC<EnvelopeIntegrityActionsProps> = ({
  selectedCount,
  totalCorrupted,
  isProcessing,
  isScanning,
  onSelectAll,
  onRepairSelected,
  onRemoveSelected,
  onRescan,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Select All/Deselect All */}
      <Button
        onClick={onSelectAll}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        disabled={isProcessing}
      >
        {selectedCount === totalCorrupted ? "Deselect All" : "Select All"}
      </Button>

      {/* Repair Selected */}
      <Button
        onClick={onRepairSelected}
        disabled={selectedCount === 0 || isProcessing}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {React.createElement(getIcon("Wrench"), {
          className: "h-4 w-4 mr-2",
        })}
        Repair Selected ({selectedCount})
      </Button>

      {/* Remove Selected */}
      <Button
        onClick={onRemoveSelected}
        disabled={selectedCount === 0 || isProcessing}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {React.createElement(getIcon("Trash2"), {
          className: "h-4 w-4 mr-2",
        })}
        Remove Selected ({selectedCount})
      </Button>

      {/* Rescan */}
      <Button
        onClick={onRescan}
        disabled={isProcessing || isScanning}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {React.createElement(getIcon("RefreshCw"), {
          className: "h-4 w-4 mr-2",
        })}
        Rescan
      </Button>
    </div>
  );
};
