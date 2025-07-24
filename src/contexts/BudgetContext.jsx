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
      return { ...state, envelopes: action.payload };
    case actionTypes.SET_BILLS:
      return { ...state, bills: action.payload };
    case actionTypes.SET_SAVINGS_GOALS:
      return { ...state, savingsGoals: action.payload };
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
          env.id === action.payload.id ? action.payload : env
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
          bill.id === action.payload.id ? action.payload : bill
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
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    case actionTypes.DELETE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(
          (goal) => goal.id !== action.payload
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

    case actionTypes.LOAD_DATA:
      return { ...state, ...action.payload };

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

  // Load initial data from localStorage when BudgetProvider mounts
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("🔍 BudgetProvider loadInitialData called", {
        hasEncryptionKey: !!encryptionKey,
        hasCurrentUser: !!currentUser,
        hasBudgetId: !!budgetId,
        currentUser: currentUser,
      });

      if (encryptionKey && currentUser && budgetId) {
        try {
          console.log("🔄 Attempting to load data from localStorage...");
          const savedData = localStorage.getItem("envelopeBudgetData");

          if (savedData) {
            console.log("✅ Found saved data in localStorage");
            const {
              salt: savedSalt,
              encryptedData,
              iv,
            } = JSON.parse(savedData);

            console.log("🔐 Decrypting data with provided encryptionKey...");
            // Use the provided encryptionKey directly (it's already derived)
            const { encryptionUtils } = await import("../utils/encryption");
            const decryptedData = await encryptionUtils.decrypt(
              encryptedData,
              encryptionKey,
              iv
            );

            console.log("✅ Data decrypted successfully!", {
              envelopes: decryptedData.envelopes?.length || 0,
              bills: decryptedData.bills?.length || 0,
              savingsGoals: decryptedData.savingsGoals?.length || 0,
              allTransactions: decryptedData.allTransactions?.length || 0,
              transactions: decryptedData.transactions?.length || 0,
              unassignedCash: decryptedData.unassignedCash || 0,
            });

            // Load all the data into the state
            console.log("📝 Dispatching LOAD_DATA action...");
            dispatch({ type: actionTypes.LOAD_DATA, payload: decryptedData });

            console.log(
              "🎉 Initial budget data loaded successfully into state!"
            );
          } else {
            console.warn("⚠️ No saved data found in localStorage");
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
      firebaseSync.initialize(budgetId, encryptionKey);

      const syncListener = (event) => {
        switch (event.type) {
          case "sync_start":
            setIsSyncing(true);
            setSyncError(null);
            break;
          case "sync_success":
            setIsSyncing(false);
            setLastSyncTime(Date.now());
            break;
          default:
            break;
        }
      };

      const errorListener = (error) => {
        setIsSyncing(false);
        if (error.type === "network_blocked") {
          setSyncError(
            "Firebase sync is blocked. Please allow Firebase requests."
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
  const syncData = useMemo(
    () => ({
      ...state,
      currentUser,
      lastActivity: currentUser
        ? {
            userName: currentUser.userName,
            userColor: currentUser.userColor,
            timestamp: Date.now(),
            deviceFingerprint: `${navigator.userAgent}_${Date.now()}`,
            deviceInfo: {
              platform: navigator.platform,
              userAgent: navigator.userAgent.substring(0, 100), // Truncate for storage
            },
          }
        : null,
    }),
    [state, currentUser]
  );

  // Auto-save and sync
  useEffect(() => {
    if (encryptionKey && currentUser && !isSyncing) {
      // Auto-save to localStorage
      const saveToLocal = async () => {
        try {
          const encrypted = await encryptionUtils.encrypt(
            syncData,
            encryptionKey
          );
          localStorage.setItem(
            "envelopeBudgetData",
            JSON.stringify({
              encryptedData: encrypted.data,
              salt: Array.from(salt || new Uint8Array()), // Use salt from auth context
              iv: encrypted.iv,
            })
          );
        } catch (error) {
          console.error("Failed to save to localStorage:", error);
        }
      };

      // Auto-sync to cloud
      const syncToCloud = async () => {
        if (isOnline) {
          try {
            await firebaseSync.saveToCloud(syncData, currentUser);
          } catch (error) {
            console.error("Failed to sync to cloud:", error);
          }
        }
      };

      const localTimeout = setTimeout(saveToLocal, 500);
      const syncTimeout = setTimeout(syncToCloud, 1000);

      return () => {
        clearTimeout(localTimeout);
        clearTimeout(syncTimeout);
      };
    }
  }, [syncData, encryptionKey, isOnline, isSyncing, firebaseSync]); // Use syncData instead of state to reduce re-renders

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
