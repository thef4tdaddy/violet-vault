// src/contexts/BudgetContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
} from "react";
import { encryptionUtils } from "../utils/encryption";
import FirebaseSync from "../utils/firebaseSync";
import { Sentry } from "../utils/sentry";
import logger from "../utils/logger";

const BudgetContext = createContext();

// Action types for the reducer
const actionTypes = {
  SET_ENVELOPES: "SET_ENVELOPES",
  SET_BILLS: "SET_BILLS",
  SET_SAVINGS_GOALS: "SET_SAVINGS_GOALS",
  SET_SUPPLEMENTAL_ACCOUNTS: "SET_SUPPLEMENTAL_ACCOUNTS",
  SET_UNASSIGNED_CASH: "SET_UNASSIGNED_CASH",
  SET_PAYCHECK_HISTORY: "SET_PAYCHECK_HISTORY",
  SET_ACTUAL_BALANCE: "SET_ACTUAL_BALANCE",
  SET_TRANSACTIONS: "SET_TRANSACTIONS",
  SET_ALL_TRANSACTIONS: "SET_ALL_TRANSACTIONS",
  SET_BIWEEKLY_ALLOCATION: "SET_BIWEEKLY_ALLOCATION",
  ADD_ENVELOPE: "ADD_ENVELOPE",
  UPDATE_ENVELOPE: "UPDATE_ENVELOPE",
  DELETE_ENVELOPE: "DELETE_ENVELOPE",
  ADD_BILL: "ADD_BILL",
  UPDATE_BILL: "UPDATE_BILL",
  DELETE_BILL: "DELETE_BILL",
  ADD_SAVINGS_GOAL: "ADD_SAVINGS_GOAL",
  UPDATE_SAVINGS_GOAL: "UPDATE_SAVINGS_GOAL",
  DELETE_SAVINGS_GOAL: "DELETE_SAVINGS_GOAL",
  PROCESS_PAYCHECK: "PROCESS_PAYCHECK",
  RECONCILE_TRANSACTION: "RECONCILE_TRANSACTION",
  LOAD_DATA: "LOAD_DATA",
};

// Initial state
const initialState = {
  envelopes: [],
  bills: [],
  savingsGoals: [],
  supplementalAccounts: [],
  unassignedCash: 0,
  biweeklyAllocation: 0,
  paycheckHistory: [],
  actualBalance: 0,
  transactions: [],
  allTransactions: [],
};

// Reducer function
const budgetReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ENVELOPES:
      return {
        ...state,
        envelopes: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_BILLS:
      return {
        ...state,
        bills: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_SAVINGS_GOALS:
      return {
        ...state,
        savingsGoals: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_SUPPLEMENTAL_ACCOUNTS:
      return { ...state, supplementalAccounts: action.payload };
    case actionTypes.SET_UNASSIGNED_CASH:
      return { ...state, unassignedCash: action.payload };
    case actionTypes.SET_PAYCHECK_HISTORY:
      return { ...state, paycheckHistory: action.payload };
    case actionTypes.SET_ACTUAL_BALANCE:
      return { ...state, actualBalance: action.payload };
    case actionTypes.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case actionTypes.SET_ALL_TRANSACTIONS:
      return { ...state, allTransactions: action.payload };
    case actionTypes.SET_BIWEEKLY_ALLOCATION:
      return { ...state, biweeklyAllocation: action.payload };

    case actionTypes.ADD_ENVELOPE:
      return { ...state, envelopes: [...state.envelopes, action.payload] };
    case actionTypes.UPDATE_ENVELOPE:
      return {
        ...state,
        envelopes: state.envelopes.map((env) =>
          env.id === action.payload.id ? action.payload : env,
        ),
      };
    case actionTypes.DELETE_ENVELOPE:
      return {
        ...state,
        envelopes: state.envelopes.filter((env) => env.id !== action.payload),
      };

    case actionTypes.ADD_BILL:
      return { ...state, bills: [...state.bills, action.payload] };
    case actionTypes.UPDATE_BILL:
      return {
        ...state,
        bills: state.bills.map((bill) =>
          bill.id === action.payload.id ? action.payload : bill,
        ),
      };
    case actionTypes.DELETE_BILL:
      return {
        ...state,
        bills: state.bills.filter((bill) => bill.id !== action.payload),
      };

    case actionTypes.ADD_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload],
      };
    case actionTypes.UPDATE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal,
        ),
      };
    case actionTypes.DELETE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(
          (goal) => goal.id !== action.payload,
        ),
      };

    case actionTypes.PROCESS_PAYCHECK:
      return {
        ...state,
        paycheckHistory: [...state.paycheckHistory, action.payload.paycheck],
        envelopes: action.payload.updatedEnvelopes,
        unassignedCash: action.payload.newUnassignedCash,
      };

    case actionTypes.RECONCILE_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload.transaction],
        allTransactions: [...state.allTransactions, action.payload.transaction],
        envelopes: action.payload.updatedEnvelopes || state.envelopes,
        unassignedCash:
          action.payload.newUnassignedCash ?? state.unassignedCash,
      };

    case actionTypes.LOAD_DATA: {
      const validatedPayload = {
        ...action.payload,
        envelopes: Array.isArray(action.payload.envelopes)
          ? action.payload.envelopes
          : [],
        bills: Array.isArray(action.payload.bills) ? action.payload.bills : [],
        savingsGoals: Array.isArray(action.payload.savingsGoals)
          ? action.payload.savingsGoals
          : [],
        supplementalAccounts: Array.isArray(action.payload.supplementalAccounts)
          ? action.payload.supplementalAccounts
          : [],
        transactions: Array.isArray(action.payload.transactions)
          ? action.payload.transactions
          : [],
        allTransactions: Array.isArray(action.payload.allTransactions)
          ? action.payload.allTransactions
          : [],
        paycheckHistory: Array.isArray(action.payload.paycheckHistory)
          ? action.payload.paycheckHistory
          : [],
      };
      return { ...state, ...validatedPayload, dataLoaded: true };
    }

    default:
      return state;
  }
};

export const BudgetProvider = ({
  children,
  encryptionKey,
  currentUser,
  budgetId,
  salt,
}) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const [firebaseSync] = useState(new FirebaseSync());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Force mount logging
  useEffect(() => {
    logger.budgetSync("BudgetProvider MOUNTED - this should always fire", {
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Load initial data from localStorage when BudgetProvider mounts
  useEffect(() => {
    logger.budgetSync("useEffect triggered - checking dependencies", {
      hasEncryptionKey: !!encryptionKey,
      hasCurrentUser: !!currentUser,
      hasBudgetId: !!budgetId,
      encryptionKey: encryptionKey ? "exists" : "missing",
      currentUser: currentUser ? currentUser.userName : "missing",
      budgetId: budgetId || "missing",
    });

    const loadInitialData = async () => {
      console.log("🔍 BudgetProvider loadInitialData called", {
        hasEncryptionKey: !!encryptionKey,
        hasCurrentUser: !!currentUser,
        hasBudgetId: !!budgetId,
        currentUser: currentUser,
        timestamp: new Date().toISOString(),
        existingEnvelopes: state.envelopes.length,
        existingBills: state.bills.length,
      });

      // Always check localStorage first to see what's there
      const savedData = localStorage.getItem("envelopeBudgetData");
      console.log("🗄️ localStorage check:", {
        hasData: !!savedData,
        dataLength: savedData?.length || 0,
      });

      if (encryptionKey && currentUser && budgetId) {
        logger.budgetSync(
          "All dependencies present - proceeding with data load",
          {
            budgetId,
            userName: currentUser.userName,
          },
        );
        try {
          console.log("🔄 Attempting to load data from localStorage...");

          // Initialize Firebase sync first
          console.log("🔥 Initializing Firebase sync for data loading", {
            budgetId,
            hasEncryptionKey: !!encryptionKey,
            currentUserName: currentUser?.userName,
          });
          firebaseSync.initialize(budgetId, encryptionKey);
          console.log("✅ Firebase sync initialized for data loading");

          // Try to load from cloud first, then fallback to localStorage
          let loadedFromCloud = false;

          try {
            console.log("☁️ Attempting to load data from cloud...");
            logger.budgetSync("Attempting to load data from cloud", {
              budgetId,
            });
            const cloudResult = await firebaseSync.loadFromCloud();

            if (cloudResult && cloudResult.data) {
              console.log("✅ Found data in cloud!", {
                envelopes: cloudResult.data.envelopes?.length || 0,
                bills: cloudResult.data.bills?.length || 0,
                savingsGoals: cloudResult.data.savingsGoals?.length || 0,
                allTransactions: cloudResult.data.allTransactions?.length || 0,
                lastUpdated: cloudResult.metadata?.lastUpdated
                  ?.toDate?.()
                  ?.toISOString(),
              });

              dispatch({
                type: actionTypes.LOAD_DATA,
                payload: cloudResult.data,
              });
              loadedFromCloud = true;
              console.log("🎉 Data loaded from cloud successfully!");
            } else {
              console.log("📄 No cloud data found, will try localStorage");
            }
          } catch (error) {
            console.warn(
              "⚠️ Failed to load from cloud, will try localStorage:",
              error.message,
            );
          }

          // Only load from localStorage if cloud loading failed or returned no data
          if (!loadedFromCloud && savedData) {
            console.log(
              "✅ Found saved data in localStorage, loading as fallback",
            );
            const parsed = JSON.parse(savedData);
            console.log("📦 Parsed localStorage data:", {
              hasEncryptedData: !!parsed.encryptedData,
              hasSalt: !!parsed.salt,
              hasIv: !!parsed.iv,
              encryptedDataLength: parsed.encryptedData?.length || 0,
            });

            const { salt: savedSalt, encryptedData, iv } = parsed;

            console.log("🔐 Decrypting data with provided encryptionKey...");
            // Use the provided encryptionKey directly (it's already derived)
            const { encryptionUtils } = await import("../utils/encryption");
            const decryptedData = await encryptionUtils.decrypt(
              encryptedData,
              encryptionKey,
              iv,
            );

            console.log("✅ Data decrypted successfully!", {
              envelopes: decryptedData.envelopes?.length || 0,
              bills: decryptedData.bills?.length || 0,
              savingsGoals: decryptedData.savingsGoals?.length || 0,
              allTransactions: decryptedData.allTransactions?.length || 0,
              transactions: decryptedData.transactions?.length || 0,
              unassignedCash: decryptedData.unassignedCash || 0,
              hasCurrentUser: !!decryptedData.currentUser,
            });

            // Load all the data into the state
            console.log("📝 Dispatching LOAD_DATA action...");
            dispatch({ type: actionTypes.LOAD_DATA, payload: decryptedData });

            console.log(
              "🎉 Initial budget data loaded successfully from localStorage!",
            );
          } else if (!loadedFromCloud) {
            console.warn("⚠️ No saved data found in localStorage or cloud");
          }
        } catch (error) {
          console.error("❌ Failed to load initial data:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            encryptionKey: !!encryptionKey,
            currentUser: currentUser,
            budgetId: budgetId,
          });

          // Clear corrupted data if loading fails
          if (
            error.message.includes("decrypt") ||
            error.message.includes("parse")
          ) {
            console.warn("🗑️ Clearing potentially corrupted localStorage data");
            localStorage.removeItem("envelopeBudgetData");
          }
        }
      } else {
        console.log("⏳ Waiting for required props...", {
          encryptionKey: !!encryptionKey,
          currentUser: !!currentUser,
          budgetId: !!budgetId,
        });
      }
    };

    loadInitialData();
  }, [encryptionKey, currentUser, budgetId]); // Load when these key values are available

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Firebase sync setup
  useEffect(() => {
    if (encryptionKey && currentUser && budgetId) {
      // Log sync initialization to Sentry
      Sentry.captureMessage("Firebase sync initializing", {
        level: "info",
        tags: { component: "BudgetContext", operation: "sync_init" },
        extra: {
          userName: currentUser?.userName,
          budgetId,
          hasEncryptionKey: !!encryptionKey,
        },
      });

      console.log("🔥 Initializing Firebase sync", {
        budgetId,
        hasEncryptionKey: !!encryptionKey,
        currentUserName: currentUser?.userName,
      });

      firebaseSync.initialize(budgetId, encryptionKey);

      console.log("✅ Firebase sync initialized successfully");

      const syncListener = (event) => {
        console.log("🔄 Sync event received:", event);

        // Send sync events to Sentry for debugging
        Sentry.captureMessage(`Sync event: ${event.type}`, {
          level: event.type.includes("error") ? "error" : "info",
          tags: {
            component: "BudgetContext",
            syncOperation: event.operation || "unknown",
          },
          extra: {
            event,
            currentUser: currentUser?.userName,
            budgetId,
            hasEncryptionKey: !!encryptionKey,
          },
        });

        switch (event.type) {
          case "sync_start":
            setIsSyncing(true);
            setSyncError(null);
            // Failsafe: automatically reset syncing state after 30 seconds
            setTimeout(() => {
              console.warn("⏰ Sync timeout - resetting syncing state");
              Sentry.captureMessage(
                "Sync timeout - operation took longer than 30 seconds",
                {
                  level: "warning",
                  tags: { component: "BudgetContext", issue: "sync_timeout" },
                  extra: {
                    operation: event.operation,
                    currentUser: currentUser?.userName,
                  },
                },
              );
              setIsSyncing(false);
              setSyncError("Sync timeout - please try again");
            }, 30000);
            break;
          case "sync_success":
            setIsSyncing(false);
            setLastSyncTime(Date.now());
            setSyncError(null);
            break;
          case "sync_error":
            setIsSyncing(false);
            setSyncError(event.error || "Sync failed");
            break;
          default:
            break;
        }
      };

      const errorListener = (error) => {
        setIsSyncing(false);
        if (error.type === "network_blocked") {
          setSyncError(
            "Firebase sync is blocked. Please allow Firebase requests.",
          );
        } else {
          setSyncError(error.error || "Sync error occurred");
        }
      };

      firebaseSync.addSyncListener(syncListener);
      firebaseSync.addErrorListener(errorListener);

      return () => {
        firebaseSync.removeSyncListener(syncListener);
        firebaseSync.removeErrorListener(errorListener);
        firebaseSync.stopRealtimeSync();
      };
    }
  }, [encryptionKey, currentUser, budgetId, firebaseSync]);

  // Memoize sync data to prevent unnecessary re-computations
  const syncData = useMemo(() => {
    const now = Date.now();
    return {
      ...state,
      currentUser,
      lastActivity: currentUser
        ? {
            userName: currentUser.userName,
            userColor: currentUser.userColor,
            timestamp: now,
            deviceFingerprint: `${navigator.userAgent}_${now}`,
            deviceInfo: {
              platform: navigator.platform,
              userAgent: navigator.userAgent.substring(0, 100), // Truncate for storage
            },
          }
        : null,
    };
  }, [
    state.bills,
    state.envelopes,
    state.transactions,
    state.allTransactions,
    state.biweeklyAllocation,
    state.unassignedCash,
    currentUser,
  ]); // Only update when actual data changes

  // Auto-save and sync
  useEffect(() => {
    if (encryptionKey && currentUser && !isSyncing) {
      // Log sync trigger conditions to Sentry
      Sentry.captureMessage("Auto-save and sync triggered", {
        level: "info",
        tags: { component: "BudgetContext", operation: "auto_sync" },
        extra: {
          hasEncryptionKey: !!encryptionKey,
          hasCurrentUser: !!currentUser,
          isSyncing,
          userName: currentUser?.userName,
          budgetId,
        },
      });

      // Auto-save to localStorage
      const saveToLocal = async () => {
        try {
          const encrypted = await encryptionUtils.encrypt(
            syncData,
            encryptionKey,
          );
          localStorage.setItem(
            "envelopeBudgetData",
            JSON.stringify({
              encryptedData: encrypted.data,
              salt: Array.from(salt || new Uint8Array()), // Use salt from auth context
              iv: encrypted.iv,
            }),
          );
        } catch (error) {
          console.error("Failed to save to localStorage:", error);
        }
      };

      // Auto-sync to cloud
      const syncToCloud = async () => {
        console.log("🔄 syncToCloud called", {
          isOnline,
          hasCurrentUser: !!currentUser,
          hasSyncData: !!syncData,
          hasFirebaseSync: !!firebaseSync,
          currentUserName: currentUser?.userName,
          syncDataSize: JSON.stringify(syncData).length,
        });

        if (isOnline) {
          try {
            console.log("☁️ Attempting to save to cloud...");
            await firebaseSync.saveToCloud(syncData, currentUser);
            console.log("✅ Successfully synced to cloud");
          } catch (error) {
            console.error("❌ Failed to sync to cloud:", error);
            setSyncError(error.message);
          }
        } else {
          console.log("📴 Not syncing - device is offline");
        }
      };

      const localTimeout = setTimeout(saveToLocal, 500);
      const syncTimeout = setTimeout(syncToCloud, 1000);

      return () => {
        clearTimeout(localTimeout);
        clearTimeout(syncTimeout);
      };
    }
  }, [
    JSON.stringify(state.bills),
    JSON.stringify(state.envelopes),
    JSON.stringify(state.transactions),
    JSON.stringify(state.allTransactions),
    state.biweeklyAllocation,
    state.unassignedCash,
    encryptionKey,
    isOnline,
    currentUser,
    firebaseSync,
  ]); // Trigger on actual data changes

  // Action creators
  const actions = {
    setEnvelopes: (envelopes) =>
      dispatch({ type: actionTypes.SET_ENVELOPES, payload: envelopes }),
    setBills: (bills) =>
      dispatch({ type: actionTypes.SET_BILLS, payload: bills }),
    setSavingsGoals: (goals) =>
      dispatch({ type: actionTypes.SET_SAVINGS_GOALS, payload: goals }),
    setSupplementalAccounts: (accounts) =>
      dispatch({
        type: actionTypes.SET_SUPPLEMENTAL_ACCOUNTS,
        payload: accounts,
      }),
    setUnassignedCash: (amount) =>
      dispatch({ type: actionTypes.SET_UNASSIGNED_CASH, payload: amount }),
    setPaycheckHistory: (history) =>
      dispatch({ type: actionTypes.SET_PAYCHECK_HISTORY, payload: history }),
    setActualBalance: (balance) =>
      dispatch({ type: actionTypes.SET_ACTUAL_BALANCE, payload: balance }),
    setTransactions: (transactions) =>
      dispatch({ type: actionTypes.SET_TRANSACTIONS, payload: transactions }),
    setAllTransactions: (transactions) =>
      dispatch({
        type: actionTypes.SET_ALL_TRANSACTIONS,
        payload: transactions,
      }),
    setBiweeklyAllocation: (amount) =>
      dispatch({ type: actionTypes.SET_BIWEEKLY_ALLOCATION, payload: amount }),

    addEnvelope: (envelope) =>
      dispatch({ type: actionTypes.ADD_ENVELOPE, payload: envelope }),
    updateEnvelope: (envelope) =>
      dispatch({ type: actionTypes.UPDATE_ENVELOPE, payload: envelope }),
    deleteEnvelope: (id) =>
      dispatch({ type: actionTypes.DELETE_ENVELOPE, payload: id }),

    addBill: (bill) => dispatch({ type: actionTypes.ADD_BILL, payload: bill }),
    updateBill: (bill) =>
      dispatch({ type: actionTypes.UPDATE_BILL, payload: bill }),
    deleteBill: (id) =>
      dispatch({ type: actionTypes.DELETE_BILL, payload: id }),

    addSavingsGoal: (goal) =>
      dispatch({ type: actionTypes.ADD_SAVINGS_GOAL, payload: goal }),
    updateSavingsGoal: (goal) =>
      dispatch({ type: actionTypes.UPDATE_SAVINGS_GOAL, payload: goal }),
    deleteSavingsGoal: (id) =>
      dispatch({ type: actionTypes.DELETE_SAVINGS_GOAL, payload: id }),

    processPaycheck: (data) =>
      dispatch({ type: actionTypes.PROCESS_PAYCHECK, payload: data }),
    reconcileTransaction: (data) =>
      dispatch({ type: actionTypes.RECONCILE_TRANSACTION, payload: data }),

    loadData: (data) =>
      dispatch({ type: actionTypes.LOAD_DATA, payload: data }),
  };

  const contextValue = {
    ...state,
    ...actions,
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    // Firebase sync data access
    getActiveUsers: () =>
      firebaseSync.getActiveUsers
        ? Array.from(firebaseSync.activeUsers?.values() || [])
        : [],
    getRecentActivity: () =>
      firebaseSync.getRecentActivity ? firebaseSync.getRecentActivity() : [],
    // Debug functions
    debugSyncInfo: () =>
      firebaseSync.debugSyncInfo
        ? firebaseSync.debugSyncInfo()
        : Promise.resolve({}),
    debugStorageInfo: () => {
      const localData = localStorage.getItem("violetvault_budget_data");
      return {
        hasLocalData: !!localData,
        localDataSize: localData?.length || 0,
        localDataKeys: localData ? Object.keys(JSON.parse(localData)) : [],
        timestamp: new Date().toISOString(),
      };
    },
    // Debug info
    _debug: {
      hasEncryptionKey: !!encryptionKey,
      hasCurrentUser: !!currentUser,
      hasBudgetId: !!budgetId,
      budgetId: budgetId,
      dataLoaded: state.dataLoaded || false,
      envelopeCount: state.envelopes.length,
      billCount: state.bills.length,
    },
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};

export { actionTypes };
