import { Button } from "@/components/ui";

/**
 * Bulk actions bar for BillTable
 * Extracted to reduce BillTable complexity
 */
const BillTableBulkActions = ({ selectionState, setShowBulkUpdateModal, clearSelection }) => {
  if (!selectionState.hasSelection) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
      <span className="text-sm text-blue-700">
        {selectionState.selectedCount} bill
        {selectionState.selectedCount > 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowBulkUpdateModal(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Bulk Update
        </Button>
        <Button
          onClick={clearSelection}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default BillTableBulkActions;
