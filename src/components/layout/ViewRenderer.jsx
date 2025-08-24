import React, { Suspense, useCallback } from "react";
import { Wallet, Settings } from "lucide-react";
import Dashboard from "../pages/MainDashboard";
import SmartEnvelopeSuggestions from "../budgeting/SmartEnvelopeSuggestions";
import EnvelopeGrid from "../budgeting/EnvelopeGrid";
import SavingsGoals from "../savings/SavingsGoals";
import SupplementalAccounts from "../accounts/SupplementalAccounts";
import PaycheckProcessor from "../budgeting/PaycheckProcessor";
import BillManager from "../bills/BillManager";
import TransactionLedger from "../transactions/TransactionLedger";
const ChartsAndAnalytics = React.lazy(
  () => import("../analytics/ChartsAndAnalytics"),
);
// Temporarily disable lazy loading due to chunk loading error
// const DebtDashboard = React.lazy(() => import("../debt/DebtDashboard"));
import DebtDashboard from "../debt/DebtDashboard";
const AutoFundingView = React.lazy(
  () => import("../automation/AutoFundingView"),
);
const ActivityFeed = React.lazy(() => import("../activity/ActivityFeed"));
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "@highlight-run/react";
import {
  useUnassignedCash,
  useActualBalance,
} from "../../hooks/useBudgetMetadata";
import useBills from "../../hooks/useBills";
import useBudgetData from "../../hooks/useBudgetData";
import logger from "../../utils/logger";

/**
 * ViewRenderer component for handling main content switching
 * Extracted from Layout.jsx for better organization
 */
const ViewRenderer = ({
  activeView,
  budget,
  currentUser,
  totalBiweeklyNeed,
  setActiveView,
}) => {
  // Use TanStack Query hooks for budget metadata
  const { unassignedCash } = useUnassignedCash();
  // useActualBalance hook called but values not currently needed
  useActualBalance();

  // Get bill operations from TanStack Query hook instead of budget store
  const { updateBill: tanStackUpdateBill, addBill: tanStackAddBill } =
    useBills();

  // Get TanStack Query paycheck operations for proper UI updates
  const {
    processPaycheck: tanStackProcessPaycheck,
    paycheckHistory: tanStackPaycheckHistory,
  } = useBudgetData();

  const {
    envelopes,
    bills,
    savingsGoals,
    supplementalAccounts,
    transactions,
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

  // Filter out null/undefined transactions to prevent runtime errors
  const safeTransactions = (transactions || []).filter(
    (t) => t && typeof t === "object" && typeof t.amount === "number",
  );

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
        logger.debug(
          "ViewRenderer TanStack updateBill completed successfully",
          {
            billId: updatedBill.id,
            envelopeId: updatedBill.envelopeId,
          },
        );
      } catch (error) {
        logger.error("Error in ViewRenderer handleUpdateBill", error, {
          billId: updatedBill.id,
          envelopeId: updatedBill.envelopeId,
        });
      }
    },
    [tanStackUpdateBill],
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
      <div className="space-y-6">
        {/* Envelope Header with Auto-Funding Access */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-purple-500 p-3 rounded-2xl">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              Budget Envelopes
            </h2>
            <p className="text-gray-600 mt-1">
              Organize your money into spending categories
            </p>
          </div>
          <button
            onClick={() => setActiveView("automation")}
            className="btn btn-secondary flex items-center"
            title="Manage automatic envelope funding rules"
          >
            <Settings className="h-4 w-4 mr-2" />
            Auto-Funding
          </button>
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
        onDeletePaycheck={async (paycheckId) => {
          try {
            // Validate paycheck ID
            if (!paycheckId) {
              throw new Error("Paycheck ID is required for deletion");
            }

            logger.info("Starting paycheck deletion process", {
              paycheckId,
              paycheckIdType: typeof paycheckId,
            });

            // Get the paycheck to delete from TanStack Query data
            const paycheckToDelete = tanStackPaycheckHistory.find(
              (p) => p.id === paycheckId,
            );
            if (!paycheckToDelete) {
              throw new Error(
                `Paycheck with ID ${paycheckId} not found in paycheckHistory`,
              );
            }

            logger.info("Found paycheck to delete", {
              paycheckId,
              amount: paycheckToDelete.amount,
              mode: paycheckToDelete.mode,
              allocations: paycheckToDelete.envelopeAllocations?.length || 0,
            });

            // Import required functions
            const { budgetDb, getBudgetMetadata, setBudgetMetadata } =
              await import("../../db/budgetDb");

            // Get current metadata
            const currentMetadata = await getBudgetMetadata();
            const currentActualBalance = currentMetadata?.actualBalance || 0;
            const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

            // Calculate new balances (subtract the paycheck amount)
            const newActualBalance =
              currentActualBalance - paycheckToDelete.amount;
            let newUnassignedCash = currentUnassignedCash;

            // Handle envelope balance reversals if this was an "allocate" paycheck
            if (
              paycheckToDelete.mode === "allocate" &&
              paycheckToDelete.envelopeAllocations
            ) {
              logger.info(
                "Reversing envelope allocations for allocate mode paycheck",
              );

              // Subtract from envelope balances
              for (const allocation of paycheckToDelete.envelopeAllocations) {
                const envelope = await budgetDb.envelopes.get(
                  allocation.envelopeId,
                );
                if (envelope) {
                  await budgetDb.envelopes.update(allocation.envelopeId, {
                    currentBalance: Math.max(
                      0,
                      (envelope.currentBalance || 0) - allocation.amount,
                    ),
                  });
                  logger.debug("Reversed envelope allocation", {
                    envelopeId: allocation.envelopeId,
                    amount: allocation.amount,
                  });
                }
              }

              // Calculate how much went to unassigned cash originally
              const totalAllocated =
                paycheckToDelete.envelopeAllocations.reduce(
                  (sum, alloc) => sum + alloc.amount,
                  0,
                );
              const leftoverAmount = paycheckToDelete.amount - totalAllocated;
              newUnassignedCash = Math.max(
                0,
                currentUnassignedCash - leftoverAmount,
              );
            } else {
              logger.info(
                "Reversing leftover mode paycheck from unassigned cash",
              );
              // "leftover" mode - all went to unassigned cash, so subtract it all
              newUnassignedCash = Math.max(
                0,
                currentUnassignedCash - paycheckToDelete.amount,
              );
            }

            // Update budget metadata
            logger.info("Updating budget metadata", {
              oldActualBalance: currentActualBalance,
              newActualBalance,
              oldUnassignedCash: currentUnassignedCash,
              newUnassignedCash,
            });

            await setBudgetMetadata({
              actualBalance: newActualBalance,
              unassignedCash: newUnassignedCash,
            });

            // Remove paycheck from history in Dexie - ensure we have a valid key
            logger.info("Deleting paycheck from Dexie", {
              paycheckId,
              paycheckIdType: typeof paycheckId,
            });

            // Verify the paycheck exists in Dexie before attempting to delete
            const existsInDexie =
              await budgetDb.paycheckHistory.get(paycheckId);
            if (!existsInDexie) {
              logger.warn("Paycheck not found in Dexie database", {
                paycheckId,
              });
            } else {
              await budgetDb.paycheckHistory.delete(paycheckId);
              logger.info("Successfully deleted paycheck from Dexie");
            }

            // REMOVED: No longer calling Zustand to prevent data inconsistency
            // await deletePaycheck(paycheckId);

            // Invalidate TanStack Query caches to refresh UI
            const { queryClient } = await import("../../utils/queryClient");
            const { queryKeys } = await import("../../utils/queryClient");

            queryClient.invalidateQueries({
              queryKey: queryKeys.paycheckHistory(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
            queryClient.invalidateQueries({
              queryKey: queryKeys.budgetMetadata,
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

            logger.info(
              "Paycheck deleted successfully with proper balance reversal",
              {
                paycheckId,
                actualBalanceChange: newActualBalance - currentActualBalance,
                unassignedCashChange: newUnassignedCash - currentUnassignedCash,
              },
            );
          } catch (error) {
            logger.error(
              "Failed to delete paycheck with proper balance reversal",
              error,
              {
                paycheckId,
                errorMessage: error.message,
                errorStack: error.stack,
              },
            );
            throw error;
          }
        }}
        currentUser={currentUser}
      />
    ),
    bills: (
      <BillManager
        transactions={bills}
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
          logger.debug(
            "✅ Bill stored successfully - no transaction created until paid",
          );
        }}
        onSearchNewBills={async () => {
          try {
            // This would integrate with email parsing or other bill detection services
            // For now, we'll show a placeholder notification
            alert(
              "Bill search feature would integrate with email parsing services to automatically detect new bills from your inbox.",
            );
          } catch (error) {
            logger.error("Failed to search for new bills:", error);
            alert("Failed to search for new bills. Please try again.");
          }
        }}
        onError={(error) => {
          logger.error("Bill management error:", error);
          alert(`Error: ${error.message || error}`);
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
    debts: (
      <Suspense fallback={<LoadingSpinner />}>
        <DebtDashboard />
      </Suspense>
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
      <Suspense
        fallback={<LoadingSpinner message={`Loading ${activeView}...`} />}
      >
        {views[activeView]}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ViewRenderer;
