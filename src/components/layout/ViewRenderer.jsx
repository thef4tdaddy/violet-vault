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
import ChartsAndAnalytics from "../analytics/ChartsAndAnalytics";
import DebtDashboard from "../debt/DebtDashboard";
import AutoFundingView from "../automation/AutoFundingView";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "@highlight-run/react";
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
  const {
    envelopes,
    bills,
    savingsGoals,
    supplementalAccounts,
    unassignedCash,
    paycheckHistory,
    actualBalance: _actualBalance,
    transactions,
    allTransactions: rawAllTransactions,
    setActualBalance: _setActualBalance,
    reconcileTransaction: _reconcileTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSupplementalAccount,
    updateSupplementalAccount,
    deleteSupplementalAccount,
    transferFromSupplementalAccount,
    addEnvelope,
    updateEnvelope,
    processPaycheck,
    addTransaction,
    addTransactions,
    updateTransaction: _updateTransaction,
    deleteTransaction: _deleteTransaction,
    addBill,
    updateBill,
    setAllTransactions: _setAllTransactions,
    setTransactions: _setTransactions,
  } = budget;

  // Filter out null/undefined transactions to prevent runtime errors
  const allTransactions = (rawAllTransactions || []).filter(
    (t) => t && typeof t === "object",
  );
  const safeTransactions = (transactions || []).filter(
    (t) => t && typeof t === "object" && typeof t.amount === "number",
  );

  // Stable callback for bill updates
  const handleUpdateBill = useCallback(
    (updatedBill) => {
      logger.debug("ViewRenderer handleUpdateBill called", {
        billId: updatedBill.id,
        envelopeId: updatedBill.envelopeId,
        hasUpdateBill: !!updateBill,
      });

      try {
        // Use updateBill for proper bill persistence with envelope assignment
        // The budget store's updateBill handles both bills and allTransactions internally
        updateBill(updatedBill);
        logger.debug("ViewRenderer updateBill completed successfully", {
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
    [updateBill],
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
        <EnvelopeGrid />
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
        paycheckHistory={paycheckHistory}
        onProcessPaycheck={processPaycheck}
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

          // Update the bill in the bills collection
          updateBill(updatedBill);

          // BillManager's handlePayBill already creates the payment transaction
          // and updates envelope balances via reconcileTransaction
          logger.debug("Bill payment completed successfully", {
            billId: updatedBill.id,
          });
        }}
        onUpdateBill={handleUpdateBill}
        onCreateRecurringBill={(newBill) => {
          // Store bill properly using budget store - no transaction created until paid
          console.log("📋 Creating new bill:", newBill);
          const bill = {
            ...newBill,
            id: newBill.id || `bill_${Date.now()}`,
            type: "recurring_bill",
            isPaid: false,
            source: "manual",
            createdAt: new Date().toISOString(),
          };
          addBill(bill);
          console.log(
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
            console.error("Failed to search for new bills:", error);
            alert("Failed to search for new bills. Please try again.");
          }
        }}
        onError={(error) => {
          console.error("Bill management error:", error);
          alert(`Error: ${error.message || error}`);
        }}
      />
    ),
    transactions: (
      <TransactionLedger
        transactions={allTransactions}
        envelopes={envelopes}
        onAddTransaction={addTransaction}
        onUpdateTransaction={_updateTransaction}
        onDeleteTransaction={_deleteTransaction}
        onBulkImport={(newTransactions) => {
          console.log(
            "🔄 onBulkImport called with transactions:",
            newTransactions.length,
          );

          // Validate and normalize transactions for current data structure
          const validatedTransactions = newTransactions
            .filter(
              (transaction) => transaction && typeof transaction === "object",
            )
            .map((transaction) => ({
              // Ensure required fields with proper defaults
              id:
                transaction.id ||
                `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              date: transaction.date || new Date().toISOString().split("T")[0],
              description: transaction.description || "Imported Transaction",
              amount: parseFloat(transaction.amount) || 0,
              category: transaction.category || "Imported",
              envelopeId: transaction.envelopeId || "", // Empty means unassigned

              // Import metadata
              type:
                transaction.type ||
                (parseFloat(transaction.amount) >= 0 ? "income" : "expense"),
              notes: transaction.notes || "",
              importSource: "file_import",
              createdBy: currentUser?.userName || "Unknown",
              createdAt: transaction.createdAt || new Date().toISOString(),

              // Legacy compatibility
              reconciled: transaction.reconciled || false,

              // Additional fields that might be present
              ...Object.fromEntries(
                Object.entries(transaction).filter(
                  ([key]) =>
                    ![
                      "id",
                      "date",
                      "description",
                      "amount",
                      "category",
                      "envelopeId",
                      "type",
                      "notes",
                    ].includes(key),
                ),
              ),
            }));

          if (validatedTransactions.length === 0) {
            console.warn("No valid transactions to import");
            return;
          }

          // Use bulk import method for efficiency
          try {
            addTransactions(validatedTransactions);
            console.log(
              "💾 Bulk import complete. Added transactions:",
              validatedTransactions.length,
            );
          } catch (error) {
            console.error("Failed to import transactions:", error);
            // Fallback to individual imports if bulk fails
            console.warn("Falling back to individual transaction imports");
            validatedTransactions.forEach((transaction) => {
              try {
                addTransaction(transaction);
              } catch (individualError) {
                console.error(
                  `Failed to import transaction ${transaction.id}:`,
                  individualError,
                );
              }
            });
          }
        }}
        currentUser={currentUser}
      />
    ),
    analytics: (
      <ChartsAndAnalytics
        transactions={safeTransactions}
        envelopes={envelopes || []}
        currentUser={currentUser}
      />
    ),
    debts: <DebtDashboard />,
    automation: <AutoFundingView />,
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
