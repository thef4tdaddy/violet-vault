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
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "@highlight-run/react";

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
    (t) => t && typeof t === "object"
  );
  const safeTransactions = (transactions || []).filter(
    (t) => t && typeof t === "object" && typeof t.amount === "number"
  );

  // Stable callback for bill updates
  const handleUpdateBill = useCallback((updatedBill) => {
    console.log("🔄 [DIRECT] ViewRenderer handleUpdateBill called", {
      billId: updatedBill.id,
      envelopeId: updatedBill.envelopeId,
      hasUpdateBill: !!updateBill,
      timestamp: new Date().toISOString(),
    });
    
    try {
      // Use updateBill for proper bill persistence with envelope assignment
      // The budget store's updateBill handles both bills and allTransactions internally
      updateBill(updatedBill);
      console.log("🔄 [DIRECT] ViewRenderer called updateBill successfully");
    } catch (error) {
      console.error("❌ [DIRECT] Error in ViewRenderer handleUpdateBill", error);
    }
  }, [updateBill]);

  // Debug log to verify function creation
  window.console.log("🔧 [DIRECT] ViewRenderer handleUpdateBill created", {
    functionExists: !!handleUpdateBill,
    functionType: typeof handleUpdateBill,
    timestamp: new Date().toISOString(),
    activeView,
  });
  console.log("🔧 [DIRECT] ViewRenderer handleUpdateBill created", {
    functionExists: !!handleUpdateBill,
    functionType: typeof handleUpdateBill,
    timestamp: new Date().toISOString(),
    activeView,
  });

  const views = {
    dashboard: <Dashboard />,
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
        onAddAccount={() => {}} // Will be implemented
        onUpdateAccount={() => {}} // Will be implemented
        onDeleteAccount={() => {}} // Will be implemented
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
    bills: (() => {
      window.console.log("🔧 [DIRECT] Rendering BillManager with props", {
        hasHandleUpdateBill: !!handleUpdateBill,
        handleUpdateBillType: typeof handleUpdateBill,
        activeView,
        timestamp: new Date().toISOString(),
      });
      console.log("🔧 [DIRECT] Rendering BillManager with props", {
        hasHandleUpdateBill: !!handleUpdateBill,
        handleUpdateBillType: typeof handleUpdateBill,
        activeView,
        timestamp: new Date().toISOString(),
      });
      
      return (
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
              "✅ Bill stored successfully - no transaction created until paid"
            );
          }}
          onSearchNewBills={async () => {
            try {
              // This would integrate with email parsing or other bill detection services
              // For now, we'll show a placeholder notification
              alert(
                "Bill search feature would integrate with email parsing services to automatically detect new bills from your inbox."
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
      );
    })(),
    transactions: <TransactionLedger currentUser={currentUser} />,
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
