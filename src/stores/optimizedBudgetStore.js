import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Base store configuration
const storeInitializer = (set, _get) => ({
  // State
  envelopes: [],
  bills: [],
  transactions: [],
  allTransactions: [],
  savingsGoals: [],
  unassignedCash: 0,
  biweeklyAllocation: 0,
  actualBalance: 0,
  isOnline: true, // Add isOnline state, default to true
  dataLoaded: false,

  // Envelope management
  addEnvelope: (envelope) =>
    set((state) => {
      state.envelopes.push(envelope);
    }),

  updateEnvelope: (envelope) =>
    set((state) => {
      const index = state.envelopes.findIndex((e) => e.id === envelope.id);
      if (index !== -1) {
        state.envelopes[index] = envelope;
      }
    }),

  deleteEnvelope: (id) =>
    set((state) => {
      state.envelopes = state.envelopes.filter((e) => e.id !== id);
    }),

  // Bill management
  addBill: (bill) =>
    set((state) => {
      state.bills.push(bill);
    }),

  updateBill: (bill) =>
    set((state) => {
      const index = state.bills.findIndex((b) => b.id === bill.id);
      if (index !== -1) {
        state.bills[index] = bill;
      }
    }),

  deleteBill: (id) =>
    set((state) => {
      state.bills = state.bills.filter((b) => b.id !== id);
    }),

  // Transaction management
  addTransactions: (transactions) =>
    set((state) => {
      state.transactions.push(...transactions);
      state.allTransactions.push(...transactions);
    }),

  addTransaction: (transaction) =>
    set((state) => {
      state.transactions.push(transaction);
      state.allTransactions.push(transaction);
    }),

  updateTransaction: (transaction) =>
    set((state) => {
      // Update in transactions array
      const transIndex = state.transactions.findIndex((t) => t.id === transaction.id);
      if (transIndex !== -1) {
        state.transactions[transIndex] = transaction;
      }

      // Update in allTransactions array
      const allTransIndex = state.allTransactions.findIndex((t) => t.id === transaction.id);
      if (allTransIndex !== -1) {
        state.allTransactions[allTransIndex] = transaction;
      }
    }),

  deleteTransaction: (id) =>
    set((state) => {
      state.transactions = state.transactions.filter((t) => t.id !== id);
      state.allTransactions = state.allTransactions.filter((t) => t.id !== id);
    }),

  // Savings goal management
  addSavingsGoal: (goal) =>
    set((state) => {
      state.savingsGoals.push(goal);
    }),

  updateSavingsGoal: (goal) =>
    set((state) => {
      const index = state.savingsGoals.findIndex((g) => g.id === goal.id);
      if (index !== -1) {
        state.savingsGoals[index] = goal;
      }
    }),

  deleteSavingsGoal: (id) =>
    set((state) => {
      state.savingsGoals = state.savingsGoals.filter((g) => g.id !== id);
    }),

  // Unassigned cash and allocation management
  setUnassignedCash: (amount) =>
    set((state) => {
      state.unassignedCash = amount;
    }),

  setBiweeklyAllocation: (amount) =>
    set((state) => {
      state.biweeklyAllocation = amount;
    }),

  // Actual balance management
  setActualBalance: (amount) =>
    set((state) => {
      state.actualBalance = amount;
    }),

  // Data loading state
  setDataLoaded: (loaded) =>
    set((state) => {
      state.dataLoaded = loaded;
    }),

  // Add an action to set the online status
  setOnlineStatus: (status) =>
    set((state) => {
      state.isOnline = status;
    }),

  // Reconcile transaction - adds a transaction and updates balances appropriately
  reconcileTransaction: (transactionData) =>
    set((state) => {
      const transaction = {
        ...transactionData,
        id: transactionData.id || Date.now(),
        date: transactionData.date || new Date().toISOString().split("T")[0],
        reconciledAt: transactionData.reconciledAt || new Date().toISOString(),
      };

      // Add transaction to both arrays
      state.transactions.push(transaction);
      state.allTransactions.push(transaction);

      // Update balances based on envelope assignment
      if (transaction.envelopeId && transaction.envelopeId !== "unassigned") {
        // Update specific envelope balance
        const envelope = state.envelopes.find((env) => env.id === transaction.envelopeId);
        if (envelope) {
          envelope.currentBalance = (envelope.currentBalance || 0) + transaction.amount;
        }
      } else {
        // Update unassigned cash
        state.unassignedCash = (state.unassignedCash || 0) + transaction.amount;
      }
    }),

  // Reset functionality
  resetStore: () =>
    set((state) => {
      state.envelopes = [];
      state.bills = [];
      state.transactions = [];
      state.allTransactions = [];
      state.savingsGoals = [];
      state.unassignedCash = 0;
      state.actualBalance = 0;
      state.isOnline = true; // Also reset isOnline status
      state.dataLoaded = false;
    }),
});

const base = subscribeWithSelector(immer(storeInitializer));

let useOptimizedBudgetStore;

if (LOCAL_ONLY_MODE) {
  // No persistence when running in local-only mode
  useOptimizedBudgetStore = create(base);
} else {
  useOptimizedBudgetStore = create(
    devtools(
      persist(base, {
        name: "violet-vault-store",
        partialize: (state) => ({
          envelopes: state.envelopes,
          bills: state.bills,
          transactions: state.transactions,
          allTransactions: state.allTransactions,
          savingsGoals: state.savingsGoals,
          unassignedCash: state.unassignedCash,
          biweeklyAllocation: state.biweeklyAllocation,
          actualBalance: state.actualBalance,
          // IMPORTANT: Do NOT persist the isOnline flag or dataLoaded
          // They should be determined at runtime
        }),
      }),
      { name: "violet-vault-devtools" }
    )
  );
}

export default useOptimizedBudgetStore;
