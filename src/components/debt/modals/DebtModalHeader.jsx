import React from "react";
import { getIcon } from "../../../utils";

/**
 * Header section for AddDebtModal
 * Pure UI component that preserves exact visual appearance
 */
const DebtModalHeader = ({ isEditMode, onClose }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-xl">
          {React.createElement(getIcon("CreditCard"), {
            className: "h-6 w-6 text-red-600",
          })}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Edit Debt" : "Add New Debt"}
          </h2>
          <p className="text-sm text-gray-600">
            {isEditMode ? "Update debt information" : "Track and manage a new debt"}
          </p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
        {React.createElement(getIcon("X"), {
          className: "h-5 w-5 text-gray-500",
        })}
      </button>
    </div>
  );
};

export default DebtModalHeader;
