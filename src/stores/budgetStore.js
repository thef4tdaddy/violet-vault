import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Migration function to handle old localStorage format
const migrateOldData = () => {
  try {
    const oldData = localStorage.getItem("budget-store");
    const newData = localStorage.getItem("violet-vault-store");

    // Only show migration debug in development/preview
    if (
      import.meta.env.MODE === "development" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("f4tdaddy.com")
    ) {
      console.log("🔍 Migration Debug:", {
        hasOldData: !!oldData,
        hasNewData: !!newData,
        oldDataLength: oldData?.length || 0,
        newDataLength: newData?.length || 0,
      });
    }

    // Migrate if old data exists (always replace new data)
    if (oldData) {
      console.log("🔄 Migrating data from old budget-store to violet-vault-store...");

      const parsedOldData = JSON.parse(oldData);

      // Transform old reducer-based format to new direct format
      if (parsedOldData?.state) {
        const transformedData = {
          state: {
            envelopes: parsedOldData.state.envelopes || [],
            bills: parsedOldData.state.bills || [],
            transactions: parsedOldData.state.transactions || [],
            allTransactions: parsedOldData.state.allTransactions || [],
            savingsGoals: parsedOldData.state.savingsGoals || [],
            supplementalAccounts: parsedOldData.state.supplementalAccounts || [],
            unassignedCash: parsedOldData.state.unassignedCash || 0,
            biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
            paycheckHistory: parsedOldData.state.paycheckHistory || [],
            actualBalance: parsedOldData.state.actualBalance || 0,
          },
          version: 0,
        };

        localStorage.setItem("violet-vault-store", JSON.stringify(transformedData));
        console.log("✅ Data migration completed successfully - replaced existing data");

        // Remove old data after successful migration
        localStorage.removeItem("budget-store");
        console.log("🧹 Cleaned up old budget-store data");
      }
    }
  } catch (error) {
    console.warn("⚠️ Failed to migrate old data:", error);
  }
};

// Run migration before creating store
migrateOldData();

// Base store configuration
const storeInitializer = (set, get) => ({
  // State
  envelopes: [],
  bills: [],
  transactions: [],
  allTransactions: [],
  savingsGoals: [],
  supplementalAccounts: [],
  unassignedCash: 0,
  biweeklyAllocation: 0,
  paycheckHistory: [], // Paycheck history for payday predictions
  actualBalance: 0, // Real bank account balance
  isActualBalanceManual: false, // Track if balance was manually set
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

  getEnvelopesByType: (envelopeType) => {
    return get().envelopes.filter((e) => e.envelopeType === envelopeType);
  },

  getTotalEnvelopeBalance: () => {
    return get().envelopes.reduce((sum, e) => sum + (e.currentBalance || 0), 0);
  },

  getTotalEnvelopeBalanceByType: (envelopeType) => {
    return get().envelopes
      .filter((e) => e.envelopeType === envelopeType)
      .reduce((sum, e) => sum + (e.currentBalance || 0), 0);
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

  addTransactions: (transactions) =>
    set((state) => {
      state.transactions.push(...transactions);
      state.allTransactions.push(...transactions);
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

  // Supplemental accounts management
  setSupplementalAccounts: (accounts) =>
    set((state) => {
      state.supplementalAccounts = accounts;
    }),

  addSupplementalAccount: (account) =>
    set((state) => {
      state.supplementalAccounts.push(account);
    }),

  updateSupplementalAccount: (id, account) =>
    set((state) => {
      const index = state.supplementalAccounts.findIndex((a) => a.id === id);
      if (index !== -1) {
        state.supplementalAccounts[index] = account;
      }
    }),

  deleteSupplementalAccount: (id) =>
    set((state) => {
      state.supplementalAccounts = state.supplementalAccounts.filter((a) => a.id !== id);
    }),

  transferFromSupplementalAccount: (accountId, envelopeId, amount, description) =>
    set((state) => {
      // Find and update supplemental account
      const accountIndex = state.supplementalAccounts.findIndex((a) => a.id === accountId);
      if (accountIndex === -1) return;

      const account = state.supplementalAccounts[accountIndex];
      if (account.currentBalance < amount) return;

      // Find and update envelope
      const envelopeIndex = state.envelopes.findIndex((e) => e.id === envelopeId);
      if (envelopeIndex === -1) return;

      // Update balances
      state.supplementalAccounts[accountIndex].currentBalance -= amount;
      state.envelopes[envelopeIndex].currentAmount += amount;

      // Create transaction record
      const transaction = {
        id: Date.now(),
        amount: amount,
        description: description || `Transfer from ${account.name}`,
        source: "supplemental",
        sourceAccountId: accountId,
        targetEnvelopeId: envelopeId,
        date: new Date().toISOString(),
        type: "transfer",
      };

      state.transactions.push(transaction);
      state.allTransactions.push(transaction);
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
  setActualBalance: (balance, isManual = true) =>
    set((state) => {
      state.actualBalance = balance;
      state.isActualBalanceManual = isManual;
    }),

  // Reconcile transaction (placeholder - implement based on your needs)
  reconcileTransaction: (transaction) =>
    set((state) => {
      // Add reconcile logic here
      state.transactions.push(transaction);
      state.allTransactions.push(transaction);
    }),

  // Paycheck history management
  setPaycheckHistory: (history) =>
    set((state) => {
      state.paycheckHistory = history;
    }),

  processPaycheck: (paycheck) =>
    set((state) => {
      state.paycheckHistory.push(paycheck);
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
      state.supplementalAccounts = [];
      state.unassignedCash = 0;
      state.biweeklyAllocation = 0;
      state.paycheckHistory = [];
      state.actualBalance = 0;
      state.isActualBalanceManual = false;
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
          supplementalAccounts: state.supplementalAccounts,
          unassignedCash: state.unassignedCash,
          biweeklyAllocation: state.biweeklyAllocation,
          paycheckHistory: state.paycheckHistory,
          actualBalance: state.actualBalance,
          isActualBalanceManual: state.isActualBalanceManual,
        }),
      }),
      { name: "violet-vault-devtools" }
    )
  );
}

export default useOptimizedBudgetStore;
