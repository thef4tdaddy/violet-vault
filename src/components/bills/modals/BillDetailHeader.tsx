import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getIconByName } from "../../../utils/common/billIcons";
import { getFrequencyDisplayText } from "../../../utils/common/frequencyCalculations";

/**
 * Header section for BillDetailModal
 * Extracted to reduce modal complexity
 */
export const BillDetailHeader = ({ bill, statusInfo, onClose }) => {
  const BillIcon = getIconByName(bill.iconName || "Receipt");

  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${statusInfo.classes.bg}`}>
          {React.createElement(BillIcon, {
            className: `h-6 w-6 ${statusInfo.classes.icon}`,
          })}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{bill.name}</h3>
          <p className="text-gray-600">
            {bill.category} • {getFrequencyDisplayText(bill.frequency)}
          </p>
        </div>
      </div>
      <Button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
      </Button>
    </div>
  );
};
