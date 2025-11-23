import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface Transaction {
  description: string;
  [key: string]: unknown;
}

interface VirtualRow {
  start: number;
  [key: string]: unknown;
}

interface DeleteConfirmationProps {
  transaction: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
  virtualRow: VirtualRow;
  gridTemplate: string;
}

/**
 * Inline delete confirmation component
 */
const DeleteConfirmation = ({ transaction, onConfirm, onCancel, virtualRow, gridTemplate }: DeleteConfirmationProps) => {
  return (
    <div
      className="grid bg-red-50 border border-red-200"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
        gridTemplateColumns: gridTemplate,
      }}
    >
      <div className="px-4 py-4 col-span-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-700">
            {React.createElement(getIcon("AlertTriangle"), {
              className: "h-5 w-5 mr-2 flex-shrink-0",
            })}
            <span className="font-medium">Delete "{transaction.description}"?</span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={onCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
