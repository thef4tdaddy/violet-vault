import React from "react";
import { getIcon } from "../../utils";
import { useLayoutData } from "../../hooks/layout/useLayoutData";
import BalanceSummaryRow from "../dashboard/BalanceSummaryRow";
import PaydayBanner from "../dashboard/PaydayBanner";
import NavigationTabs from "../dashboard/NavigationTabs";
import DashboardMiddleSection from "../dashboard/DashboardMiddleSection";
import DebtTrackerSection from "../dashboard/DebtTrackerSection";
import ActivitySnapshotSection from "../dashboard/ActivitySnapshotSection";
import InsightsSection from "../dashboard/InsightsSection";
import DashboardFooter from "../dashboard/DashboardFooter";

/**
 * Redesigned Main Dashboard - Issue #499
 *
 * Features:
 * - Balance summary cards (Actual, Virtual, Unassigned, Difference)
 * - Full-width Next Payday banner
 * - Middle section with Biweekly Status, Envelope Spending, Quick Add
 * - Debt Tracker with progress bars
 * - Activity Snapshot (transactions, bills, paychecks)
 * - Insights with AI-driven suggestions
 * - Responsive layout (desktop grid, mobile stacked)
 */
const MainDashboard = ({ setActiveView }) => {
  const layoutData = useLayoutData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header - handled by parent layout */}

      {/* Balance Summary Row */}
      <BalanceSummaryRow layoutData={layoutData} />

      {/* Full-width Payday Banner */}
      <PaydayBanner />

      {/* Navigation Tabs */}
      <NavigationTabs setActiveView={setActiveView} />

      {/* Middle Section - Biweekly Status, Envelope Spending, Quick Add */}
      <DashboardMiddleSection setActiveView={setActiveView} />

      {/* Debt Tracker Section */}
      <DebtTrackerSection setActiveView={setActiveView} />

      {/* Activity Snapshot Section */}
      <ActivitySnapshotSection setActiveView={setActiveView} />

      {/* Insights Section */}
      <InsightsSection />

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default MainDashboard;
