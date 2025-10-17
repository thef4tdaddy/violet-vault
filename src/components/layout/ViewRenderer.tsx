import React, { Suspense, useCallback } from "react";
import { getIcon } from "../../utils";
import { globalToast } from "../../stores/ui/toastStore";
import Dashboard from "../pages/MainDashboard";
import SmartEnvelopeSuggestions from "../budgeting/SmartEnvelopeSuggestions";
import EnvelopeGrid from "../budgeting/EnvelopeGrid";
import SavingsGoals from "../savings/SavingsGoals";
import SupplementalAccounts from "../accounts/SupplementalAccounts";
import PaycheckProcessor from "../budgeting/PaycheckProcessor";
import BillManager from "../bills/BillManager";
import TransactionLedger from "../transactions/TransactionLedger";
const ChartsAndAnalytics = React.lazy(() => import("../analytics/ChartsAndAnalytics"));
// Temporarily disable lazy loading due to chunk loading error
// const DebtDashboard = React.lazy(() => import("../debt/DebtDashboard"));
import DebtDashboard from "../debt/DebtDashboard";
import { isDebtFeatureEnabled } from "../../utils/debts/debtDebugConfig";
const AutoFundingView = React.lazy(() => import("../automation/AutoFundingView"));
const ActivityFeed = React.lazy(() => import("../activity/ActivityFeed"));
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "@highlight-run/react";
import { useLayoutData } from "../../hooks/layout";
import { usePaycheckOperations } from "../../hooks/layout/usePaycheckOperations";
import logger from "../../utils/common/logger";

/**
 * ViewRenderer component for handling main content switching
 * Extracted from Layout.jsx for better organization
 */
const ViewRenderer = ({ activeView, budget, currentUser, totalBiweeklyNeed, setActiveView }) => {
  // Use centralized layout data hook
  const layoutData = useLayoutData();
  const {
    unassignedCash,
    bills,
    envelopes,
    transactions: safeTransactions,
    processPaycheck: tanStackProcessPaycheck,
    paycheckHistory: tanStackPaycheckHistory,
  } = layoutData;

  // Get bill operations from the bills data
  const { updateBill: tanStackUpdateBill, addBill: tanStackAddBill } = bills;

  // Get paycheck operations
  const { handleDeletePaycheck } = usePaycheckOperations();

  const {
    _envelopes,
    _bills,
    savingsGoals,
    supplementalAccounts,
    _transactions,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSupplementalAccount,
    updateSupplementalAccount,
    deleteSupplementalAccount,
    transferFromSupplementalAccount,
    addEnvelope,
    updateEnvelope,
  } = budget;

  // safeTransactions already filtered by useLayoutData hook

  // Stable callback for bill updates
  const handleUpdateBill = useCallback(
    (updatedBill) => {
      logger.debug("ViewRenderer handleUpdateBill called", {
        billId: updatedBill.id,
        envelopeId: updatedBill.envelopeId,
        hasTanStackUpdateBill: !!tanStackUpdateBill,
      });

      try {
        // Use TanStack Query updateBill for proper bill persistence with envelope assignment
        tanStackUpdateBill({ id: updatedBill.id, updates: updatedBill });
        logger.debug("ViewRenderer TanStack updateBill completed successfully", {
          billId: updatedBill.id,
          envelopeId: updatedBill.envelopeId,
        });
      } catch (error) {
        logger.error("Error in ViewRenderer handleUpdateBill", error, {
          billId: updatedBill.id,
          envelopeId: updatedBill.envelopeId,
        });
      }
    },
    [tanStackUpdateBill]
  );

  // Debug log to verify function creation - only on dev sites
  if (activeView === "bills") {
    logger.debug("ViewRenderer handleUpdateBill created for bills view", {
      functionExists: !!handleUpdateBill,
      functionType: typeof handleUpdateBill,
      activeView,
    });
  }

  const views = {
    dashboard: <Dashboard setActiveView={setActiveView} />,
    envelopes: (
      <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-black text-black text-base flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-purple-500 p-3 rounded-2xl">
                  {React.createElement(getIcon("Wallet"), {
                    className: "h-6 w-6 text-white",
                  })}
                </div>
              </div>
              <span className="text-lg">E</span>NVELOPE <span className="text-lg">M</span>ANAGEMENT
            </h2>
            <p className="text-purple-900 mt-1">
              Organize and track your budget allocations • {envelopes?.length || 0} envelopes
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <button
              onClick={() => setActiveView("automation")}
              className="btn btn-secondary border-2 border-black flex items-center"
              title="Manage automatic envelope funding rules"
            >
              {React.createElement(getIcon("Settings"), {
                className: "h-4 w-4 mr-2",
              })}
              Auto-Funding
            </button>
          </div>
        </div>

        <SmartEnvelopeSuggestions
          transactions={safeTransactions}
          envelopes={envelopes}
          onCreateEnvelope={addEnvelope}
          onUpdateEnvelope={updateEnvelope}
          dateRange="6months"
          minAmount={50}
          minTransactions={3}
        />
        <EnvelopeGrid data-tour="envelope-grid" />
      </div>
    ),
    savings: (
      <SavingsGoals
        savingsGoals={savingsGoals}
        unassignedCash={unassignedCash}
        onAddGoal={addSavingsGoal}
        onUpdateGoal={updateSavingsGoal}
        onDeleteGoal={deleteSavingsGoal}
        onDistributeToGoals={() => {}} // Will be implemented
      />
    ),
    supplemental: (
      <SupplementalAccounts
        supplementalAccounts={supplementalAccounts}
        onAddAccount={addSupplementalAccount}
        onUpdateAccount={updateSupplementalAccount}
        onDeleteAccount={deleteSupplementalAccount}
        onTransferToEnvelope={transferFromSupplementalAccount}
        envelopes={envelopes}
        currentUser={currentUser}
      />
    ),
    paycheck: (
      <PaycheckProcessor
        biweeklyAllocation={totalBiweeklyNeed}
        envelopes={envelopes}
        paycheckHistory={tanStackPaycheckHistory}
        onProcessPaycheck={tanStackProcessPaycheck}
        onDeletePaycheck={(paycheckId) => handleDeletePaycheck(paycheckId, tanStackPaycheckHistory)}
        currentUser={currentUser}
      />
    ),
    bills: (
      <BillManager
        transactions={safeTransactions}
        envelopes={envelopes}
        onPayBill={(updatedBill) => {
          // Handle bill payment properly - mark as paid and update in bills store
          logger.debug("ViewRenderer onPayBill called", {
            billId: updatedBill.id,
            isPaid: updatedBill.isPaid,
            paidDate: updatedBill.paidDate,
          });

          // Update the bill in the bills collection using TanStack Query
          tanStackUpdateBill({ id: updatedBill.id, updates: updatedBill });

          // BillManager's handlePayBill already creates the payment transaction
          // and updates envelope balances via reconcileTransaction
          logger.debug("Bill payment completed successfully", {
            billId: updatedBill.id,
          });
        }}
        onUpdateBill={handleUpdateBill}
        onCreateRecurringBill={(newBill) => {
          // Store bill properly using budget store - no transaction created until paid
          logger.debug("📋 Creating new bill:", newBill);
          const bill = {
            ...newBill,
            id: newBill.id || `bill_${Date.now()}`,
            type: "recurring_bill",
            isPaid: false,
            source: "manual",
            createdAt: new Date().toISOString(),
          };
          tanStackAddBill(bill);
          logger.debug("✅ Bill stored successfully - no transaction created until paid");
        }}
        onSearchNewBills={async () => {
          try {
            // This would integrate with email parsing or other bill detection services
            // For now, we'll show a placeholder notification
            globalToast.showInfo(
              "Bill search feature would integrate with email parsing services to automatically detect new bills from your inbox.",
              "Feature Coming Soon"
            );
          } catch (error) {
            logger.error("Failed to search for new bills:", error);
            globalToast.showError(
              "Failed to search for new bills. Please try again.",
              "Search Failed"
            );
          }
        }}
        onError={(error) => {
          logger.error("Bill management error:", error);
          globalToast.showError(`Error: ${error.message || error}`, "Error");
        }}
      />
    ),
    transactions: <TransactionLedger currentUser={currentUser} />,
    analytics: (
      <Suspense fallback={<LoadingSpinner />}>
        <ChartsAndAnalytics
          transactions={safeTransactions}
          envelopes={envelopes || []}
          currentUser={currentUser}
        />
      </Suspense>
    ),
    debts: isDebtFeatureEnabled("ENABLE_DEBT_DASHBOARD") ? (
      <Suspense fallback={<LoadingSpinner />}>
        <DebtDashboard />
      </Suspense>
    ) : (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Debt Dashboard Temporarily Disabled
        </h2>
        <p className="text-gray-600 mb-4">
          The debt dashboard is currently disabled for debugging the temporal dead zone error.
        </p>
        <p className="text-sm text-gray-500">
          Debug configuration can be adjusted in src/utils/debtDebugConfig.js
        </p>
      </div>
    ),
    automation: (
      <Suspense fallback={<LoadingSpinner />}>
        <AutoFundingView />
      </Suspense>
    ),
    activity: (
      <Suspense fallback={<LoadingSpinner />}>
        <ActivityFeed />
      </Suspense>
    ),
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner message={`Loading ${activeView}...`} />}>
        {views[activeView]}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ViewRenderer;
