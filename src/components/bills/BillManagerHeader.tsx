import React from "react";
import { Button, StylizedButtonText } from "@/components/ui";
import { getIcon } from "../../utils";

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
        <h2 className="font-black text-black text-xl flex items-center tracking-wide">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-blue-500 p-3 rounded-2xl">
              {React.createElement(getIcon("FileText"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <StylizedButtonText firstLetterClassName="text-2xl" restClassName="text-xl">
            BILL MANAGER
          </StylizedButtonText>
        </h2>
        <p className="text-purple-900 mt-2 ml-16">
          Track and manage your recurring bills and payments
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isEditLocked && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg flex items-center gap-2">
            {React.createElement(getIcon("Clock"), { className: "h-4 w-4" })}
            Editing: {currentEditor}
          </div>
        )}

        <Button
          onClick={searchNewBills}
          disabled={isSearching}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 border-2 border-black"
        >
          {isSearching
            ? React.createElement(getIcon("RefreshCw"), {
                className: "h-4 w-4 animate-spin",
              })
            : React.createElement(getIcon("Search"), { className: "h-4 w-4" })}
          Discover Bills
        </Button>

        <Button
          onClick={handleAddNewBill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 border-2 border-black"
        >
          {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
          Add Bill
        </Button>
      </div>
    </div>
  );
};

export default BillManagerHeader;
