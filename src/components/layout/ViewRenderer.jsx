import React, { Suspense, useCallback } from "react";
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
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "@highlight-run/react";
import logger from "../../utils/logger";

/**
 * ViewRenderer component for handling main content switching
 * Extracted from Layout.jsx for better organization
 */
const ViewRenderer = ({ activeView, budget, currentUser }) => {
  const {
    envelopes,
    bills,
    savingsGoals,
    supplementalAccounts,
    unassignedCash,
    biweeklyAllocation,
    paycheckHistory,
    actualBalance,
    transactions,
    allTransactions: rawAllTransactions,
    setActualBalance,
    reconcileTransaction,
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
    updateTransaction,
    deleteTransaction,
    addBill,
    updateBill,
    setAllTransactions,
    setTransactions,
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
    dashboard: (
      <Dashboard
        envelopes={envelopes}
        savingsGoals={savingsGoals}
        unassignedCash={unassignedCash}
        actualBalance={actualBalance}
        onUpdateActualBalance={setActualBalance}
        onReconcileTransaction={reconcileTransaction}
        transactions={safeTransactions}
        paycheckHistory={paycheckHistory}
      />
    ),
    envelopes: (
      <div className="space-y-6">
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
        biweeklyAllocation={biweeklyAllocation}
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
          // Update the bill using budget store method
          updateTransaction(updatedBill);
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
        onAddTransaction={() => {}} // Will be implemented
        onUpdateTransaction={() => {}} // Will be implemented
        onDeleteTransaction={() => {}} // Will be implemented
        onBulkImport={(newTransactions) => {
          console.log(
            "🔄 onBulkImport called with transactions:",
            newTransactions.length,
          );
          // Add transactions using budget store method - need to loop through individual transactions
          newTransactions.forEach((transaction) => addTransaction(transaction));
          console.log(
            "💾 Bulk import complete. Added transactions:",
            newTransactions.length,
          );
        }}
        currentUser={currentUser}
      />
    ),
    analytics: (
      <ChartsAndAnalytics
        transactions={allTransactions}
        envelopes={envelopes}
        bills={bills}
        paycheckHistory={paycheckHistory}
        savingsGoals={savingsGoals}
        currentUser={currentUser}
      />
    ),
    debts: <DebtDashboard />,
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
