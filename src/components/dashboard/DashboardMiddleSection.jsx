import React from "react";
import BiweeklyStatusCard from "./cards/BiweeklyStatusCard";
import EnvelopeSpendingCard from "./cards/EnvelopeSpendingCard";
import QuickAddCard from "./cards/QuickAddCard";

/**
 * Dashboard Middle Section - Core functionality cards
 *
 * Features:
 * - Biweekly Status tracking
 * - Envelope Spending breakdown
 * - Quick Add actions
 * - Responsive grid layout
 */
const DashboardMiddleSection = ({ setActiveView }) => {
  return (
    <div className="px-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biweekly Status Card */}
        <div className="lg:col-span-1">
          <BiweeklyStatusCard setActiveView={setActiveView} />
        </div>

        {/* Envelope Spending Card */}
        <div className="lg:col-span-1">
          <EnvelopeSpendingCard setActiveView={setActiveView} />
        </div>

        {/* Quick Add Card */}
        <div className="lg:col-span-1">
          <QuickAddCard setActiveView={setActiveView} />
        </div>
      </div>
    </div>
  );
};

export default DashboardMiddleSection;
