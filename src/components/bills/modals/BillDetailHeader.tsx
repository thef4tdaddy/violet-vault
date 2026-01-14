import React from "react";
import { getIconByName } from "@/utils/core/common/billIcons";
import { getFrequencyDisplayText } from "@/utils/core/common/frequencyCalculations";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import type { Bill } from "@/types/bills";

interface StatusInfo {
  classes: {
    bg: string;
    icon: string;
    text?: string;
    border?: string;
  };
  text?: string;
}

interface BillDetailHeaderProps {
  bill: Bill;
  statusInfo: StatusInfo;
  onClose: () => void;
}

/**
 * Header section for BillDetailModal
 * Extracted to reduce modal complexity
 */
export const BillDetailHeader: React.FC<BillDetailHeaderProps> = ({
  bill,
  statusInfo,
  onClose,
}) => {
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
      <ModalCloseButton onClick={onClose} />
    </div>
  );
};
