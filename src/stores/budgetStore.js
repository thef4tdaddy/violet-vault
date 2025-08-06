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
  // Unassigned cash modal state
  isUnassignedCashModalOpen: false,
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
    return get()
      .envelopes.filter((e) => e.envelopeType === envelopeType)
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
      // Find the transaction before deleting to reverse any unassigned cash changes
      const transaction =
        state.transactions.find((t) => t.id === id) ||
        state.allTransactions.find((t) => t.id === id);

      if (transaction && transaction.envelopeId === "unassigned") {
        // Reverse the unassigned cash change when deleting
        if (transaction.type === "income") {
          // Remove the income amount from unassigned cash
          state.unassignedCash -= Math.abs(transaction.amount);
        } else if (transaction.type === "expense") {
          // Add back the expense amount to unassigned cash
          state.unassignedCash += Math.abs(transaction.amount);
        }
      }

      // Remove from both arrays
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

  // Unassigned cash modal management
  openUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = true;
    }),

  closeUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = false;
    }),

  // Actual balance management
  setActualBalance: (balance, isManual = true) =>
    set((state) => {
      state.actualBalance = balance;
      state.isActualBalanceManual = isManual;
    }),

  // Reconcile transaction - properly handles unassigned cash updates
  reconcileTransaction: (transaction) =>
    set((state) => {
      // Add transaction to both arrays
      state.transactions.push(transaction);
      state.allTransactions.push(transaction);

      // If transaction targets unassigned cash, update unassigned cash balance
      if (transaction.envelopeId === "unassigned") {
        if (transaction.type === "income") {
          // Income adds to unassigned cash
          state.unassignedCash += Math.abs(transaction.amount);
        } else if (transaction.type === "expense") {
          // Expense subtracts from unassigned cash
          state.unassignedCash -= Math.abs(transaction.amount);
        }
      }
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

  // Clear all transactions (for cleanup)
  clearAllTransactions: () =>
    set((state) => {
      state.transactions = [];
      state.allTransactions = [];
    }),

  // Remove duplicate reconcile transactions
  removeDuplicateReconcileTransactions: () =>
    set((state) => {
      const reconcilePatterns = ["Balance reconciliation", "reconciliation", "Auto-Reconcile"];

      // Filter out duplicate reconcile transactions
      state.transactions = state.transactions.filter((t, index, array) => {
        const isReconcile = reconcilePatterns.some((pattern) =>
          t.description?.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!isReconcile) return true;

        // Keep only the first occurrence of each reconcile transaction
        return (
          array.findIndex(
            (other) =>
              other.description === t.description &&
              other.amount === t.amount &&
              Math.abs(new Date(other.date).getTime() - new Date(t.date).getTime()) < 60000 // Within 1 minute
          ) === index
        );
      });

      state.allTransactions = state.allTransactions.filter((t, index, array) => {
        const isReconcile = reconcilePatterns.some((pattern) =>
          t.description?.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!isReconcile) return true;

        // Keep only the first occurrence of each reconcile transaction
        return (
          array.findIndex(
            (other) =>
              other.description === t.description &&
              other.amount === t.amount &&
              Math.abs(new Date(other.date).getTime() - new Date(t.date).getTime()) < 60000 // Within 1 minute
          ) === index
        );
      });
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
      state.isUnassignedCashModalOpen = false;
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
