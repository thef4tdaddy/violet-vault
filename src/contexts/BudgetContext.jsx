// src/contexts/BudgetContext.jsx
import React, { createContext, useEffect, useState, useMemo } from "react";
import { encryptionUtils } from "../utils/encryption";
import FirebaseSync from "../utils/firebaseSync";
import { Sentry } from "../utils/sentry";
import logger from "../utils/logger";
import useBudgetStore from "../stores/budgetStore";
import { actionTypes } from "./budgetState";
import { getEncryptedData, setEncryptedData, clearEncryptedData } from "../db";

export const BudgetContext = createContext();

export const BudgetProvider = ({
  children,
  encryptionKey,
  currentUser,
  budgetId,
  salt,
}) => {
  const store = useBudgetStore();
  const { dispatch, ...state } = store;
  const firebaseSync = useMemo(() => new FirebaseSync(), []);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    logger.budgetSync("BudgetProvider MOUNTED - this should always fire", {
      timestamp: new Date().toISOString(),
    });
  }, []);

  // CRITICAL FIX: This useEffect now correctly waits for all auth-related props before running.
  useEffect(() => {
    const loadInitialData = async () => {
      // GUARD CLAUSE: Do not proceed until all authentication details are available.
      if (encryptionKey && currentUser && budgetId) {
        setIsSyncing(true);
        setSyncError(null);
        logger.budgetSync(
          "✅ Auth details present. Proceeding with data load.",
          {
            budgetId,
            userName: currentUser.userName,
          },
        );

        try {
          // Initialize FirebaseSync with valid credentials, just before use.
          firebaseSync.initialize(budgetId, encryptionKey);

          const cloudResult = await firebaseSync.loadFromCloud();
          if (cloudResult && cloudResult.data) {
            logger.info(
              "☁️ Successfully loaded data from cloud.",
              cloudResult.data,
            );
            dispatch({
              type: actionTypes.LOAD_DATA,
              payload: cloudResult.data,
            });
            setLastSyncTime(Date.now());
            setIsSyncing(false);
            return; // Exit after successful cloud load
          }
        } catch (error) {
          logger.warn("⚠️ Failed to load from cloud. Will try localStorage.", {
            error: error.message,
          });
          setSyncError(
            "Failed to load cloud data. Check password or connection.",
          );
        }

        // Fallback to IndexedDB (Dexie) or localStorage if cloud load fails
        let localEntry = await getEncryptedData();
        if (!localEntry) {
          const savedData = localStorage.getItem("envelopeBudgetData");
          if (savedData) {
            localEntry = JSON.parse(savedData);
          }
        }

        if (localEntry) {
          try {
            const { encryptedData, iv } = localEntry;
            const decryptedData = await encryptionUtils.decrypt(
              encryptedData,
              encryptionKey,
              iv,
            );
            dispatch({ type: actionTypes.LOAD_DATA, payload: decryptedData });
            logger.info(
              "💾 Successfully loaded data from IndexedDB/localStorage.",
            );
          } catch (error) {
            logger.error(
              "❌ Failed to load/decrypt data from local cache.",
              error,
            );
            localStorage.removeItem("envelopeBudgetData");
            await clearEncryptedData?.();
            setSyncError("Failed to decrypt local data. It may be corrupted.");
          }
        }
        setIsSyncing(false);
      } else {
        logger.warn(
          "⏳ Skipping data load: Authentication details not yet available.",
          {
            hasEncryptionKey: !!encryptionKey,
            hasCurrentUser: !!currentUser,
            hasBudgetId: !!budgetId,
          },
        );
      }
    };

    loadInitialData();
  }, [encryptionKey, currentUser, budgetId]); // This dependency array is crucial.

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
    // GUARD CLAUSE: Only save/sync if data has been loaded and auth is ready.
    if (state.dataLoaded && encryptionKey && currentUser && budgetId) {
      const saveData = async () => {
        setIsSyncing(true);
        try {
          // Local save is fast, do it first. Save to both Dexie and localStorage
          const encrypted = await encryptionUtils.encrypt(
            syncData,
            encryptionKey,
          );
          const cacheEntry = {
            encryptedData: encrypted.data,
            salt: Array.from(salt || new Uint8Array()),
            iv: encrypted.iv,
          };
          localStorage.setItem(
            "envelopeBudgetData",
            JSON.stringify(cacheEntry),
          );
          await setEncryptedData(cacheEntry);
          logger.info("💾 Data saved to local cache.");

          // Then sync to cloud if online.
          if (isOnline) {
            await firebaseSync.saveToCloud(syncData, currentUser);
            setLastSyncTime(Date.now());
            setSyncError(null);
            logger.info("☁️ Data synced to cloud.");
          }
        } catch (error) {
          logger.error("❌ Failed to save or sync data.", error);
          setSyncError(error.message);
        } finally {
          setIsSyncing(false);
        }
      };

      // Debounce the save function to avoid excessive writes.
      const handler = setTimeout(() => {
        saveData();
      }, 1000); // Save 1 second after the last change.

      return () => {
        clearTimeout(handler);
      };
    }
  }, [
    syncData,
    encryptionKey,
    currentUser,
    budgetId,
    salt,
    isOnline,
    state.dataLoaded,
  ]);

  const actions = useMemo(
    () => ({
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
        dispatch({
          type: actionTypes.SET_BIWEEKLY_ALLOCATION,
          payload: amount,
        }),
      addEnvelope: (envelope) =>
        dispatch({ type: actionTypes.ADD_ENVELOPE, payload: envelope }),
      updateEnvelope: (envelope) =>
        dispatch({ type: actionTypes.UPDATE_ENVELOPE, payload: envelope }),
      deleteEnvelope: (id) =>
        dispatch({ type: actionTypes.DELETE_ENVELOPE, payload: id }),
      addBill: (bill) =>
        dispatch({ type: actionTypes.ADD_BILL, payload: bill }),
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
      resetAllData: () => dispatch({ type: actionTypes.RESET_ALL_DATA }),
    }),
    [dispatch, state, store],
  );

  const contextValue = useMemo(
    () => ({
      // Spread state first, but exclude action methods to avoid conflicts
      ...Object.fromEntries(
        Object.entries(state).filter(
          ([key]) =>
            !key.startsWith("add") &&
            !key.startsWith("update") &&
            !key.startsWith("delete") &&
            !key.startsWith("set") &&
            key !== "dispatch",
        ),
      ),
      // Then spread BudgetContext actions which handle persistence
      ...actions,
      isOnline,
      isSyncing,
      lastSyncTime,
      syncError,
      getActiveUsers: () =>
        firebaseSync.getActiveUsers
          ? Array.from(firebaseSync.activeUsers?.values() || [])
          : [],
      getRecentActivity: () =>
        firebaseSync.getRecentActivity ? firebaseSync.getRecentActivity() : [],
    }),
    [
      state,
      actions,
      isOnline,
      isSyncing,
      lastSyncTime,
      syncError,
      firebaseSync,
      dispatch,
    ],
  );

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};

export { actionTypes };
