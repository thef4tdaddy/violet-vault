// src/contexts/BudgetContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useState, useMemo } from "react";
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
        bills: state.bills.map((bill) => (bill.id === action.payload.id ? action.payload : bill)),
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
        savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
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
        unassignedCash: action.payload.newUnassignedCash ?? state.unassignedCash,
      };

    case actionTypes.LOAD_DATA: {
      const validatedPayload = {
        ...action.payload,
        envelopes: Array.isArray(action.payload.envelopes) ? action.payload.envelopes : [],
        bills: Array.isArray(action.payload.bills) ? action.payload.bills : [],
        savingsGoals: Array.isArray(action.payload.savingsGoals) ? action.payload.savingsGoals : [],
        supplementalAccounts: Array.isArray(action.payload.supplementalAccounts)
          ? action.payload.supplementalAccounts
          : [],
        transactions: Array.isArray(action.payload.transactions) ? action.payload.transactions : [],
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

export const BudgetProvider = ({ children, encryptionKey, currentUser, budgetId, salt }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const firebaseSync = useMemo(() => new FirebaseSync(), []);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing] = useState(false);
  const [lastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    logger.budgetSync("BudgetProvider MOUNTED - this should always fire", {
      timestamp: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    if (encryptionKey && currentUser && budgetId) {
      console.log("🚀 DIRECT SYNC INIT");
      firebaseSync.initialize(budgetId, encryptionKey);
    }
  }, [encryptionKey, currentUser, budgetId, firebaseSync]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (encryptionKey && currentUser && budgetId) {
        logger.budgetSync("All dependencies present - proceeding with data load", {
          budgetId,
          userName: currentUser.userName,
        });

        try {
          const cloudResult = await firebaseSync.loadFromCloud();
          if (cloudResult && cloudResult.data) {
            dispatch({
              type: actionTypes.LOAD_DATA,
              payload: cloudResult.data,
            });
            return;
          }
        } catch (error) {
          console.warn("⚠️ Failed to load from cloud, will try localStorage:", error.message);
        }

        const savedData = localStorage.getItem("envelopeBudgetData");
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            const { encryptedData, iv } = parsed;
            const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);
            dispatch({ type: actionTypes.LOAD_DATA, payload: decryptedData });
          } catch (error) {
            console.error("❌ Failed to load initial data from localStorage:", error);
            if (error.message.includes("decrypt") || error.message.includes("parse")) {
              localStorage.removeItem("envelopeBudgetData");
            }
          }
        }
      }
    };

    loadInitialData();
  }, [encryptionKey, currentUser, budgetId, firebaseSync]);

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
              userAgent: navigator.userAgent.substring(0, 100),
            },
          }
        : null,
    };
  }, [state, currentUser]);

  useEffect(() => {
    if (encryptionKey && currentUser && !isSyncing) {
      const saveToLocal = async () => {
        try {
          const encrypted = await encryptionUtils.encrypt(syncData, encryptionKey);
          localStorage.setItem(
            "envelopeBudgetData",
            JSON.stringify({
              encryptedData: encrypted.data,
              salt: Array.from(salt || new Uint8Array()),
              iv: encrypted.iv,
            })
          );
        } catch (error) {
          console.error("Failed to save to localStorage:", error);
        }
      };

      const syncToCloud = async () => {
        if (isOnline) {
          try {
            await firebaseSync.saveToCloud(syncData, currentUser);
          } catch (error) {
            console.error("❌ Failed to sync to cloud:", error);
            setSyncError(error.message);
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
  }, [syncData, encryptionKey, currentUser, isOnline, isSyncing, salt, firebaseSync]);

  const actions = useMemo(
    () => ({
      setEnvelopes: (envelopes) =>
        dispatch({ type: actionTypes.SET_ENVELOPES, payload: envelopes }),
      setBills: (bills) => dispatch({ type: actionTypes.SET_BILLS, payload: bills }),
      setSavingsGoals: (goals) => dispatch({ type: actionTypes.SET_SAVINGS_GOALS, payload: goals }),
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
        dispatch({
          type: actionTypes.SET_BIWEEKLY_ALLOCATION,
          payload: amount,
        }),
      addEnvelope: (envelope) => dispatch({ type: actionTypes.ADD_ENVELOPE, payload: envelope }),
      updateEnvelope: (envelope) =>
        dispatch({ type: actionTypes.UPDATE_ENVELOPE, payload: envelope }),
      deleteEnvelope: (id) => dispatch({ type: actionTypes.DELETE_ENVELOPE, payload: id }),
      addBill: (bill) => dispatch({ type: actionTypes.ADD_BILL, payload: bill }),
      updateBill: (bill) => dispatch({ type: actionTypes.UPDATE_BILL, payload: bill }),
      deleteBill: (id) => dispatch({ type: actionTypes.DELETE_BILL, payload: id }),
      addSavingsGoal: (goal) => dispatch({ type: actionTypes.ADD_SAVINGS_GOAL, payload: goal }),
      updateSavingsGoal: (goal) =>
        dispatch({ type: actionTypes.UPDATE_SAVINGS_GOAL, payload: goal }),
      deleteSavingsGoal: (id) => dispatch({ type: actionTypes.DELETE_SAVINGS_GOAL, payload: id }),
      processPaycheck: (data) => dispatch({ type: actionTypes.PROCESS_PAYCHECK, payload: data }),
      reconcileTransaction: (data) =>
        dispatch({ type: actionTypes.RECONCILE_TRANSACTION, payload: data }),
      loadData: (data) => dispatch({ type: actionTypes.LOAD_DATA, payload: data }),
    }),
    []
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      ...actions,
      isOnline,
      isSyncing,
      lastSyncTime,
      syncError,
      getActiveUsers: () =>
        firebaseSync.getActiveUsers ? Array.from(firebaseSync.activeUsers?.values() || []) : [],
      getRecentActivity: () =>
        firebaseSync.getRecentActivity ? firebaseSync.getRecentActivity() : [],
    }),
    [state, actions, isOnline, isSyncing, lastSyncTime, syncError, firebaseSync]
  );

  return <BudgetContext.Provider value={contextValue}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};

export { actionTypes };
