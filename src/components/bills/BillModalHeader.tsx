import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { getIconByName } from "../../utils/common/billIcons";

/**
 * Header section for AddBillModal
 * Pure UI component that preserves exact visual appearance
 */
const BillModalHeader = ({ editingBill, formData, onClose }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          {React.createElement(getIconByName(formData.iconName) || getIcon("Wallet"), {
            className: "h-5 w-5 text-blue-600",
          })}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBill ? "Edit Bill" : "Add New Bill"}
          </h2>
          <p className="text-sm text-gray-600">
            {editingBill ? "Update bill information and settings" : "Create a new recurring bill"}
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close modal"
      >
        {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
      </Button>
    </div>
  );
};

export default BillModalHeader;
