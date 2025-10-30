import React from "react";
import { getIcon } from "../../../utils";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import { getBillEnvelopeDisplayInfo } from "../../../utils/budgeting/billEnvelopeCalculations";

/**
 * Envelope status display component
 * Shows status icon, badge, and balance information
 *
 * Part of EnvelopeItem refactoring for ESLint compliance
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */
const EnvelopeStatusDisplay = ({ envelope, bills, utilizationColorClass }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
      case "overspent":
        return React.createElement(getIcon("AlertTriangle"), {
          className: "h-4 w-4",
        });
      case "underfunded":
        return React.createElement(getIcon("Clock"), { className: "h-4 w-4" });
      case "healthy":
      default:
        return React.createElement(getIcon("CheckCircle"), {
          className: "h-4 w-4",
        });
    }
  };

  const renderBalanceInfo = () => {
    if (envelope.envelopeType === ENVELOPE_TYPES.BILL) {
      const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);
      if (displayInfo) {
        const { displayText } = displayInfo;
        return (
          <>
            <p className="text-xs text-gray-500">
              {displayText?.primaryStatus || "Balance"}
            </p>
            <p
              className={`text-lg font-semibold ${
                envelope.available >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${envelope.available.toFixed(2)}
            </p>
          </>
        );
      }
    }

    // For non-bill envelopes, keep the original "Available" display
    return (
      <>
        <p className="text-xs text-gray-500">Available</p>
        <p
          className={`text-lg font-semibold ${
            envelope.available >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${envelope.available.toFixed(2)}
        </p>
      </>
    );
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(envelope.status)}
          <h3 className="font-black text-black text-base">{envelope.envelopeName}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${utilizationColorClass}`}>
          {envelope.status}
        </span>
      </div>
      <div className="text-right">{renderBalanceInfo()}</div>
    </div>
  );
};

export default EnvelopeStatusDisplay;
