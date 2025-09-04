import React from "react";
import { Clock, RefreshCw, Search, Plus } from "lucide-react";

/**
 * Header section for BillManager
 * Pure UI component that preserves exact visual appearance
 */
const BillManagerHeader = ({
  isEditLocked,
  currentEditor,
  isSearching,
  searchNewBills,
  handleAddNewBill,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bill Manager</h2>
        <p className="text-gray-600">Track and manage your recurring bills and payments</p>
      </div>

      <div className="flex items-center gap-2">
        {isEditLocked && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Editing: {currentEditor}
          </div>
        )}

        <button
          onClick={searchNewBills}
          disabled={isSearching}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 border-2 border-black"
        >
          {isSearching ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Discover Bills
        </button>

        <button
          onClick={handleAddNewBill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 border-2 border-black"
        >
          <Plus className="h-4 w-4" />
          Add Bill
        </button>
      </div>
    </div>
  );
};

export default BillManagerHeader;