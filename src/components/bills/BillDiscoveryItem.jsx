import React from "react";
import { getBillIcon, getIconByName } from "../../utils/common/billIcons";
import BillInfoHeader from "./BillInfoHeader";
import BillEnvelopeAssignment from "./BillEnvelopeAssignment";
import BillDiscoveryDetails from "./BillDiscoveryDetails";

/**
 * Individual bill item in discovery results
 * Extracted from BillDiscoveryModal for better organization
 */
const BillDiscoveryItem = ({
  bill,
  isSelected,
  assignedEnvelopeId,
  availableEnvelopes,
  onToggleSelection,
  onUpdateEnvelope,
}) => {
  const getBillIconComponent = (bill) => {
    if (bill.iconName && typeof bill.iconName === "string") {
      const IconComponent = getIconByName(bill.iconName);
      return React.createElement(IconComponent, { className: "h-6 w-6" });
    }

    const IconComponent = getBillIcon(
      bill.provider || "",
      bill.description || "",
      bill.category || "",
    );
    return React.createElement(IconComponent, { className: "h-6 w-6" });
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        isSelected
          ? "border-blue-300 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox and Icon */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(bill.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="text-xl">{getBillIconComponent(bill)}</div>
        </div>

        {/* Bill Info */}
        <div className="flex-1 min-w-0">
          <BillInfoHeader bill={bill} />
          <BillEnvelopeAssignment
            bill={bill}
            assignedEnvelopeId={assignedEnvelopeId}
            availableEnvelopes={availableEnvelopes}
            onUpdateEnvelope={onUpdateEnvelope}
          />
          <BillDiscoveryDetails discoveryData={bill.discoveryData} />
        </div>
      </div>
    </div>
  );
};

export default BillDiscoveryItem;