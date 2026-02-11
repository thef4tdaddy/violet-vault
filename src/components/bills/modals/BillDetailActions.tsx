import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import type { Bill } from "@/types/bills";

interface BillDetailActionsProps {
  bill: Bill;
  onClose: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  handleCreateRecurring: () => void;
}

/**
 * Action buttons section for BillDetailModal
 * Extracted to reduce modal complexity
 */
export const BillDetailActions: React.FC<BillDetailActionsProps> = ({
  bill,
  onClose,
  handleEdit,
  handleDelete,
  handleCreateRecurring,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={onClose}
        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
      >
        Close
      </Button>

      {bill.frequency === "once" && (
        <Button
          onClick={handleCreateRecurring}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center"
        >
          {React.createElement(getIcon("Target"), {
            className: "h-4 w-4 mr-2",
          })}
          Make Recurring
        </Button>
      )}

      <Button
        onClick={handleEdit}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center"
      >
        {React.createElement(getIcon("Edit"), {
          className: "h-4 w-4 mr-2",
        })}
        Edit Bill
      </Button>

      <Button
        onClick={handleDelete}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center"
      >
        {React.createElement(getIcon("Trash2"), {
          className: "h-4 w-4 mr-2",
        })}
        Delete
      </Button>
    </div>
  );
};
