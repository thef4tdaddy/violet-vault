import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Optimized Zustand store with middleware
const useOptimizedBudgetStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
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

          // Optimized actions - direct state mutations with Immer
          setEnvelopes: (envelopes) =>
            set((state) => {
              state.envelopes = envelopes;
            }),

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

          // Optimized bulk operations
          bulkUpdateEnvelopes: (updates) =>
            set((state) => {
              updates.forEach((update) => {
                const index = state.envelopes.findIndex((e) => e.id === update.id);
                if (index !== -1) {
                  Object.assign(state.envelopes[index], update);
                }
              });
            }),

          // Computed selectors for better performance
          getEnvelopeById: (id) => {
            return get().envelopes.find((e) => e.id === id);
          },

          getEnvelopesByCategory: (category) => {
            return get().envelopes.filter((e) => e.category === category);
          },

          getTotalEnvelopeBalance: () => {
            return get().envelopes.reduce((sum, e) => sum + (e.currentBalance || 0), 0);
          },

          // Transaction management actions
          setTransactions: (transactions) =>
            set((state) => {
              state.transactions = transactions;
            }),

          setAllTransactions: (allTransactions) =>
            set((state) => {
              state.allTransactions = allTransactions;
            }),

          addTransaction: (transaction) =>
            set((state) => {
              state.transactions.push(transaction);
              state.allTransactions.push(transaction);
            }),

          updateTransaction: (transaction) =>
            set((state) => {
              const transIndex = state.transactions.findIndex((t) => t.id === transaction.id);
              const allTransIndex = state.allTransactions.findIndex((t) => t.id === transaction.id);

              if (transIndex !== -1) {
                state.transactions[transIndex] = transaction;
              }
              if (allTransIndex !== -1) {
                state.allTransactions[allTransIndex] = transaction;
              }
            }),

          deleteTransaction: (id) =>
            set((state) => {
              state.transactions = state.transactions.filter((t) => t.id !== id);
              state.allTransactions = state.allTransactions.filter((t) => t.id !== id);
            }),

          // Bills management actions
          setBills: (bills) =>
            set((state) => {
              state.bills = bills;
            }),

          addBill: (bill) =>
            set((state) => {
              state.bills.push(bill);
              state.allTransactions.push(bill);
            }),

          updateBill: (bill) =>
            set((state) => {
              const billIndex = state.bills.findIndex((b) => b.id === bill.id);
              const allTransIndex = state.allTransactions.findIndex((t) => t.id === bill.id);

              if (billIndex !== -1) {
                state.bills[billIndex] = bill;
              }
              if (allTransIndex !== -1) {
                state.allTransactions[allTransIndex] = bill;
              }
            }),

          deleteBill: (id) =>
            set((state) => {
              state.bills = state.bills.filter((b) => b.id !== id);
              state.allTransactions = state.allTransactions.filter((t) => t.id !== id);
            }),

          // Savings goals management
          setSavingsGoals: (savingsGoals) =>
            set((state) => {
              state.savingsGoals = savingsGoals;
            }),

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

          // Unassigned cash, actual balance and allocation management
          setActualBalance: (amount) =>
            set((state) => {
              state.actualBalance = amount;
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
        }))
      ),
      {
        name: "violet-vault-store", // localStorage key
        partialize: (state) => ({
          // Only persist essential data
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
      }
    ),
    {
      name: "violet-vault-devtools",
    }
  )
);

export default useOptimizedBudgetStore;
