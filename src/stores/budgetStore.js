import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { budgetHistoryMiddleware } from "../utils/budgetHistoryMiddleware.js";
import { budgetDb } from "../db/budgetDb.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Migration function to handle old localStorage format
const migrateOldData = async () => {
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
      console.log(
        "🔄 Migrating data from old budget-store to violet-vault-store...",
      );

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
            supplementalAccounts:
              parsedOldData.state.supplementalAccounts || [],
            debts: parsedOldData.state.debts || [],
            unassignedCash: parsedOldData.state.unassignedCash || 0,
            biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
            paycheckHistory: parsedOldData.state.paycheckHistory || [],
            actualBalance: parsedOldData.state.actualBalance || 0,
          },
          version: 0,
        };

        localStorage.setItem(
          "violet-vault-store",
          JSON.stringify(transformedData),
        );
        console.log(
          "✅ Data migration completed successfully - replaced existing data",
        );

        // Seed Dexie with migrated data so hooks can access it
        await budgetDb.bulkUpsertEnvelopes(transformedData.state.envelopes);
        await budgetDb.bulkUpsertBills(transformedData.state.bills);
        await budgetDb.bulkUpsertTransactions(
          transformedData.state.allTransactions.length > 0
            ? transformedData.state.allTransactions
            : transformedData.state.transactions,
        );
        await budgetDb.bulkUpsertSavingsGoals(
          transformedData.state.savingsGoals,
        );
        await budgetDb.bulkUpsertDebts(transformedData.state.debts);
        await budgetDb.bulkUpsertPaychecks(
          transformedData.state.paycheckHistory,
        );

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
await migrateOldData();

// Base store configuration
const storeInitializer = (set, get) => ({
  // App State (auth, UI, settings) - data arrays handled by TanStack Query
  unassignedCash: 0,
  biweeklyAllocation: 0,
  // Unassigned cash modal state
  isUnassignedCashModalOpen: false,
  paycheckHistory: [], // Paycheck history for payday predictions
  actualBalance: 0, // Real bank account balance
  isActualBalanceManual: false, // Track if balance was manually set
  isOnline: true, // Add isOnline state, default to true
  dataLoaded: false,
  cloudSyncEnabled: true, // Toggle for Firestore cloud sync (default enabled)

  // NOTE: Data arrays (envelopes, transactions, etc.) are now handled by TanStack Query → Dexie
  // Zustand only contains UI state and app settings

  // App state actions (data mutations now handled by TanStack Query hooks)

  // Optimized bulk operations
  setEnvelopes: (envelopes) =>
    set((state) => {
      state.envelopes = envelopes;
    }),
  bulkUpdateEnvelopes: (updates) =>
    set((state) => {
      updates.forEach((update) => {
        const index = state.envelopes.findIndex((e) => e.id === update.id);
        if (index !== -1) {
          Object.assign(state.envelopes[index], update);
        }
      });
    }),

  // Envelope CRUD operations
  addEnvelope: (envelope) =>
    set((state) => {
      console.log("📁 BudgetStore.addEnvelope called", {
        envelopeId: envelope.id,
        envelopeName: envelope.name,
        currentBalance: envelope.currentBalance,
      });
      state.envelopes.push({
        ...envelope,
        createdAt: envelope.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }),

  updateEnvelope: (id, updates) =>
    set((state) => {
      console.log("🔄 BudgetStore.updateEnvelope called", {
        envelopeId: id,
        updates,
      });
      const index = state.envelopes.findIndex((e) => e.id === id);
      if (index !== -1) {
        state.envelopes[index] = {
          ...state.envelopes[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    }),

  deleteEnvelope: (id) =>
    set((state) => {
      console.log("🗑️ BudgetStore.deleteEnvelope called", { envelopeId: id });
      state.envelopes = state.envelopes.filter((e) => e.id !== id);
    }),

  // Transfer funds between envelopes
  transferFunds: (fromEnvelopeId, toEnvelopeId, amount, description) =>
    set((state) => {
      console.log("💸 BudgetStore.transferFunds called", {
        fromEnvelopeId,
        toEnvelopeId,
        amount,
        description,
      });

      // Handle transfer from unassigned cash
      if (fromEnvelopeId === "unassigned") {
        if (state.unassignedCash < amount) {
          console.warn("Insufficient unassigned cash for transfer");
          return false;
        }
        state.unassignedCash -= amount;

        // Add to target envelope
        const toIndex = state.envelopes.findIndex((e) => e.id === toEnvelopeId);
        if (toIndex !== -1) {
          state.envelopes[toIndex].currentBalance =
            (state.envelopes[toIndex].currentBalance || 0) + amount;
        }
      }
      // Handle transfer to unassigned cash
      else if (toEnvelopeId === "unassigned") {
        const fromIndex = state.envelopes.findIndex(
          (e) => e.id === fromEnvelopeId,
        );
        if (
          fromIndex === -1 ||
          state.envelopes[fromIndex].currentBalance < amount
        ) {
          console.warn("Insufficient envelope balance for transfer");
          return false;
        }
        state.envelopes[fromIndex].currentBalance -= amount;
        state.unassignedCash += amount;
      }
      // Handle transfer between envelopes
      else {
        const fromIndex = state.envelopes.findIndex(
          (e) => e.id === fromEnvelopeId,
        );
        const toIndex = state.envelopes.findIndex((e) => e.id === toEnvelopeId);

        if (fromIndex === -1 || toIndex === -1) {
          console.warn("Source or target envelope not found");
          return false;
        }

        if (state.envelopes[fromIndex].currentBalance < amount) {
          console.warn("Insufficient balance in source envelope");
          return false;
        }

        state.envelopes[fromIndex].currentBalance -= amount;
        state.envelopes[toIndex].currentBalance =
          (state.envelopes[toIndex].currentBalance || 0) + amount;
      }

      // Create transfer transaction
      const transaction = {
        id: `transfer_${Date.now()}`,
        amount,
        description:
          description || `Transfer: ${fromEnvelopeId} → ${toEnvelopeId}`,
        type: "transfer",
        fromEnvelopeId,
        toEnvelopeId,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      state.transactions.push(transaction);
      state.allTransactions.push(transaction);

      return true;
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
      const transIndex = state.transactions.findIndex(
        (t) => t.id === transaction.id,
      );
      const allTransIndex = state.allTransactions.findIndex(
        (t) => t.id === transaction.id,
      );

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
      console.log("🔄 BudgetStore.updateBill called", {
        billId: bill.id,
        envelopeId: bill.envelopeId,
        billName: bill.name || bill.provider,
        fullBill: bill,
      });

      const billIndex = state.bills.findIndex((b) => b.id === bill.id);
      const allTransIndex = state.allTransactions.findIndex(
        (t) => t.id === bill.id,
      );

      console.log("🔄 Update bill indices", {
        billIndex,
        allTransIndex,
        billsLength: state.bills.length,
        allTransLength: state.allTransactions.length,
      });

      if (billIndex !== -1) {
        console.log("🔄 Updating bill in bills array", {
          oldBill: state.bills[billIndex],
          newBill: bill,
        });
        state.bills[billIndex] = bill;
      } else {
        console.log("⚠️ Bill not found in bills array, adding it", {
          billId: bill.id,
        });
        state.bills.push(bill);
      }

      if (allTransIndex !== -1) {
        console.log("🔄 Updating bill in allTransactions array", {
          oldTrans: state.allTransactions[allTransIndex],
          newTrans: bill,
        });
        state.allTransactions[allTransIndex] = bill;
      } else {
        console.log("⚠️ Bill not found in allTransactions array, adding it", {
          billId: bill.id,
        });
        state.allTransactions.push(bill);
      }

      console.log("✅ Bill update completed", {
        billId: bill.id,
        envelopeId: bill.envelopeId,
      });
    }),

  deleteBill: (id) =>
    set((state) => {
      state.bills = state.bills.filter((b) => b.id !== id);
      state.allTransactions = state.allTransactions.filter((t) => t.id !== id);
    }),

  // Debt tracking management
  setDebts: (debts) =>
    set((state) => {
      state.debts = debts;
    }),

  addDebt: (debt) =>
    set((state) => {
      console.log("💳 BudgetStore.addDebt called", {
        debtId: debt.id,
        debtName: debt.name,
        debtType: debt.type,
        balance: debt.currentBalance,
      });
      state.debts.push({
        ...debt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }),

  updateDebt: (debt) =>
    set((state) => {
      console.log("🔄 BudgetStore.updateDebt called", {
        debtId: debt.id,
        debtName: debt.name,
        balance: debt.currentBalance,
      });
      const index = state.debts.findIndex((d) => d.id === debt.id);
      if (index !== -1) {
        state.debts[index] = {
          ...debt,
          updatedAt: new Date().toISOString(),
        };
      }
    }),

  deleteDebt: (id) =>
    set((state) => {
      console.log("🗑️ BudgetStore.deleteDebt called", { debtId: id });
      state.debts = state.debts.filter((d) => d.id !== id);
    }),

  // Record debt payment
  recordDebtPayment: (debtId, payment) =>
    set((state) => {
      const debt = state.debts.find((d) => d.id === debtId);
      if (debt) {
        // Add payment to history
        if (!debt.paymentHistory) debt.paymentHistory = [];
        debt.paymentHistory.push({
          ...payment,
          id: crypto.randomUUID(),
          date: payment.date || new Date().toISOString(),
        });

        // Update current balance
        debt.currentBalance = Math.max(0, debt.currentBalance - payment.amount);
        debt.updatedAt = new Date().toISOString();

        console.log("💰 Debt payment recorded", {
          debtId,
          paymentAmount: payment.amount,
          newBalance: debt.currentBalance,
        });
      }
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
      state.supplementalAccounts = state.supplementalAccounts.filter(
        (a) => a.id !== id,
      );
    }),

  transferFromSupplementalAccount: (
    accountId,
    envelopeId,
    amount,
    description,
  ) =>
    set((state) => {
      // Find and update supplemental account
      const accountIndex = state.supplementalAccounts.findIndex(
        (a) => a.id === accountId,
      );
      if (accountIndex === -1) return;

      const account = state.supplementalAccounts[accountIndex];
      if (account.currentBalance < amount) return;

      // Find and update envelope
      const envelopeIndex = state.envelopes.findIndex(
        (e) => e.id === envelopeId,
      );
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

  // Start background sync service (when cloud sync is enabled)
  startBackgroundSync: async () => {
    const state = get();

    if (!state.cloudSyncEnabled) {
      console.log("💾 Local-only mode enabled - background sync not started");
      return;
    }

    console.log("🔄 Starting background sync service...");

    try {
      // Get auth context from auth store
      const { useAuth } = await import("./authStore");
      const authState = useAuth.getState();

      if (
        !authState.encryptionKey ||
        !authState.currentUser ||
        !authState.budgetId
      ) {
        console.warn("⚠️ Missing auth context for background sync");
        return;
      }

      // Import and start the background sync service
      const { default: CloudSyncService } = await import(
        "../services/cloudSyncService"
      );
      CloudSyncService.start({
        encryptionKey: authState.encryptionKey,
        currentUser: authState.currentUser,
        budgetId: authState.budgetId,
      });

      console.log("✅ Background sync service started");
    } catch (error) {
      console.error("❌ Failed to start background sync service:", error);
    }
  },

  // Add an action to set the online status
  setOnlineStatus: (status) =>
    set((state) => {
      state.isOnline = status;
    }),

  // Toggle cloud sync (Firestore)
  setCloudSyncEnabled: (enabled) =>
    set((state) => {
      state.cloudSyncEnabled = enabled;
      console.log(`🌩️ Cloud sync ${enabled ? "enabled" : "disabled"}`);
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
      const reconcilePatterns = [
        "Balance reconciliation",
        "reconciliation",
        "Auto-Reconcile",
      ];

      // Filter out duplicate reconcile transactions
      state.transactions = state.transactions.filter((t, index, array) => {
        const isReconcile = reconcilePatterns.some((pattern) =>
          t.description?.toLowerCase().includes(pattern.toLowerCase()),
        );

        if (!isReconcile) return true;

        // Keep only the first occurrence of each reconcile transaction
        return (
          array.findIndex(
            (other) =>
              other.description === t.description &&
              other.amount === t.amount &&
              Math.abs(
                new Date(other.date).getTime() - new Date(t.date).getTime(),
              ) < 60000, // Within 1 minute
          ) === index
        );
      });

      state.allTransactions = state.allTransactions.filter(
        (t, index, array) => {
          const isReconcile = reconcilePatterns.some((pattern) =>
            t.description?.toLowerCase().includes(pattern.toLowerCase()),
          );

          if (!isReconcile) return true;

          // Keep only the first occurrence of each reconcile transaction
          return (
            array.findIndex(
              (other) =>
                other.description === t.description &&
                other.amount === t.amount &&
                Math.abs(
                  new Date(other.date).getTime() - new Date(t.date).getTime(),
                ) < 60000, // Within 1 minute
            ) === index
          );
        },
      );
    }),

  // Load imported data into store and persist it
  loadData: (importedData) =>
    set((state) => {
      console.log("📥 Loading imported data into store", {
        envelopes: importedData.envelopes?.length || 0,
        bills: importedData.bills?.length || 0,
        transactions: importedData.transactions?.length || 0,
        allTransactions: importedData.allTransactions?.length || 0,
        savingsGoals: importedData.savingsGoals?.length || 0,
      });

      // Load all data arrays
      if (importedData.envelopes) state.envelopes = importedData.envelopes;
      if (importedData.bills) state.bills = importedData.bills;
      if (importedData.transactions)
        state.transactions = importedData.transactions;
      if (importedData.allTransactions)
        state.allTransactions = importedData.allTransactions;
      if (importedData.savingsGoals)
        state.savingsGoals = importedData.savingsGoals;
      if (importedData.debts) state.debts = importedData.debts;
      if (importedData.paycheckHistory)
        state.paycheckHistory = importedData.paycheckHistory;
      if (importedData.supplementalAccounts)
        state.supplementalAccounts = importedData.supplementalAccounts;

      // Load financial state
      if (typeof importedData.unassignedCash === "number")
        state.unassignedCash = importedData.unassignedCash;
      if (typeof importedData.biweeklyAllocation === "number")
        state.biweeklyAllocation = importedData.biweeklyAllocation;
      if (typeof importedData.actualBalance === "number")
        state.actualBalance = importedData.actualBalance;
      if (typeof importedData.isActualBalanceManual === "boolean")
        state.isActualBalanceManual = importedData.isActualBalanceManual;

      state.dataLoaded = true;
      console.log("✅ Data loaded into store successfully");

      // Force TanStack Query cache invalidation to show imported data immediately
      setTimeout(() => {
        // Dispatch multiple events to ensure all hooks refresh
        window.dispatchEvent(
          new CustomEvent("importCompleted", {
            detail: { source: "loadData", dataLoaded: true },
          }),
        );

        // Also dispatch specific invalidation events
        window.dispatchEvent(new CustomEvent("invalidateAllQueries"));

        console.log("🔄 Import cache invalidation events dispatched");
      }, 100);
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
      state.debts = [];
      state.unassignedCash = 0;
      state.biweeklyAllocation = 0;
      state.isUnassignedCashModalOpen = false;
      state.paycheckHistory = [];
      state.actualBalance = 0;
      state.isActualBalanceManual = false;
      state.isOnline = true; // Also reset isOnline status
      state.dataLoaded = false;
    }),

  // Security functionality
  validatePassword: async (password) => {
    try {
      console.log("🔐 validatePassword: Starting validation...");

      // Import the auth store to access password validation
      const { useAuth } = await import("./authStore.jsx");
      const { encryptionUtils } = await import("../utils/encryption");

      const authState = useAuth.getState();
      const savedData = localStorage.getItem("envelopeBudgetData");

      console.log("🔐 validatePassword: Data check", {
        hasSavedData: !!savedData,
        hasAuthSalt: !!authState.salt,
        authStateKeys: Object.keys(authState),
      });

      if (!savedData || !authState.salt) {
        console.log("🔐 validatePassword: Missing data or salt");
        return false;
      }

      const parsedData = JSON.parse(savedData);
      const { salt: savedSalt, encryptedData } = parsedData;
      const saltArray = new Uint8Array(savedSalt);

      console.log("🔐 validatePassword: Parsed data", {
        hasSavedSalt: !!savedSalt,
        hasEncryptedData: !!encryptedData,
        saltLength: saltArray.length,
      });

      // Try to derive the key with the provided password
      const testKey = await encryptionUtils.deriveKeyFromSalt(
        password,
        saltArray,
      );

      console.log("🔐 validatePassword: Key derived successfully");

      // Try to decrypt actual data to validate password
      if (encryptedData) {
        try {
          await encryptionUtils.decrypt(encryptedData, testKey);
          console.log(
            "🔐 validatePassword: Decryption successful - password is correct",
          );
          return true;
        } catch (decryptError) {
          console.log(
            "🔐 validatePassword: Decryption failed - password is incorrect",
            decryptError.message,
          );
          return false;
        }
      }

      // Fallback: if no encrypted data to test, just check if key exists
      console.log(
        "🔐 validatePassword: No encrypted data to test, using fallback",
      );
      return !!testKey;
    } catch (error) {
      console.error(
        "🔐 validatePassword: Validation failed with error:",
        error,
      );
      return false;
    }
  },
});

const base = subscribeWithSelector(
  immer(budgetHistoryMiddleware(storeInitializer)),
);

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
          // App state only (data arrays handled by TanStack Query)
          unassignedCash: state.unassignedCash,
          biweeklyAllocation: state.biweeklyAllocation,
          paycheckHistory: state.paycheckHistory,
          actualBalance: state.actualBalance,
          isActualBalanceManual: state.isActualBalanceManual,
          cloudSyncEnabled: state.cloudSyncEnabled,
          isOnline: state.isOnline,
        }),
      }),
      { name: "violet-vault-devtools" },
    ),
  );
}

export default useOptimizedBudgetStore;

// Provide a more intuitive export alias
export { useOptimizedBudgetStore as useBudgetStore };
