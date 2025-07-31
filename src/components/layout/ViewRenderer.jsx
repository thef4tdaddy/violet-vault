import React, { Suspense } from "react";
import Dashboard from "../Dashboard";
import SmartEnvelopeSuggestions from "../SmartEnvelopeSuggestions";
import EnvelopeGrid from "../EnvelopeGrid";
import SavingsGoals from "../SavingsGoals";
import SupplementalAccounts from "../SupplementalAccounts";
import PaycheckProcessor from "../PaycheckProcessor";
import BillManager from "../BillManager";
import TransactionLedger from "../TransactionLedger";
import ChartsAndAnalytics from "../ChartsAndAnalytics";
import LoadingSpinner from "../ui/LoadingSpinner";

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
    setAllTransactions,
    setTransactions,
  } = budget;

  // Filter out null/undefined transactions to prevent runtime errors
  const allTransactions = (rawAllTransactions || []).filter((t) => t && typeof t === "object");
  const safeTransactions = (transactions || []).filter(
    (t) => t && typeof t === "object" && typeof t.amount === "number"
  );

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
    bills: (
      <BillManager
        transactions={allTransactions}
        envelopes={envelopes}
        onPayBill={(updatedBill) => {
          // Update the bill in allTransactions
          const updatedTransactions = allTransactions.map((t) =>
            t.id === updatedBill.id ? updatedBill : t
          );
          setAllTransactions(updatedTransactions);
        }}
        onUpdateBill={(updatedBill) => {
          // Update the bill in allTransactions
          const updatedTransactions = allTransactions.map((t) =>
            t.id === updatedBill.id ? updatedBill : t
          );
          setAllTransactions(updatedTransactions);
        }}
        onCreateRecurringBill={(newBill) => {
          // Add new bill to allTransactions
          const billTransaction = {
            ...newBill,
            id: `bill_${Date.now()}`,
            type: "recurring_bill",
            date: new Date().toISOString().split("T")[0],
            isPaid: false,
            source: "manual",
          };
          setAllTransactions([...allTransactions, billTransaction]);
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
    ),
    transactions: (
      <TransactionLedger
        transactions={allTransactions}
        envelopes={envelopes}
        onAddTransaction={() => {}} // Will be implemented
        onUpdateTransaction={() => {}} // Will be implemented
        onDeleteTransaction={() => {}} // Will be implemented
        onBulkImport={(newTransactions) => {
          console.log("🔄 onBulkImport called with transactions:", newTransactions.length);
          const updatedAllTransactions = [...allTransactions, ...newTransactions];
          const updatedTransactions = [...safeTransactions, ...newTransactions];
          setAllTransactions(updatedAllTransactions);
          setTransactions(updatedTransactions);
          console.log(
            "💾 Bulk import complete. Total transactions:",
            updatedAllTransactions.length
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
  };

  return (
    <Suspense fallback={<LoadingSpinner message={`Loading ${activeView}...`} />}>
      {views[activeView]}
    </Suspense>
  );
};

export default ViewRenderer;