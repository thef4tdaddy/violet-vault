// src/components/EnvelopeSystem.jsx - Complete System with Modern Purple Design
import React, { useState, useEffect } from "react";
import { encryptionUtils } from "../utils/encryption";
import FirebaseSync from "../utils/firebaseSync";
import UserSetup from "./UserSetup";
import Header from "./Header";
import ActivityBanner from "./ActivityBanner";
import SyncIndicator from "./SyncIndicator";
import PaycheckProcessor from "./PaycheckProcessor";
import EnvelopeGrid from "./EnvelopeGrid";
import BillManager from "./BillManager";
import SavingsGoals from "./SavingsGoals";
import Dashboard from "./Dashboard";
import TransactionLedger from "./TransactionLedger";
import ChartsAndAnalytics from "./ChartsAndAnalytics";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Calendar,
  Target,
  CreditCard,
  Sparkles,
  BookOpen,
  BarChart3,
} from "lucide-react";

const EnvelopeSystem = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [_salt, setSalt] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");

  // Core budget data
  const [envelopes, setEnvelopes] = useState([]);
  const [bills, setBills] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [unassignedCash, setUnassignedCash] = useState(0);
  const [_totalBudgetNeeded, setTotalBudgetNeeded] = useState(0);
  const [biweeklyAllocation, setBiweeklyAllocation] = useState(0);

  // Paycheck tracking
  const [paycheckHistory, setPaycheckHistory] = useState([]);

  // Dashboard and reconciliation state
  const [actualBalance, setActualBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // Transaction Ledger state
  const [allTransactions, setAllTransactions] = useState([]);

  // Firebase sync state
  const [firebaseSync] = useState(new FirebaseSync());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [syncConflicts, setSyncConflicts] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [budgetId, setBudgetId] = useState(null);

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

  // Initialize Firebase sync when user logs in
  useEffect(() => {
    if (isUnlocked && encryptionKey && currentUser && budgetId) {
      firebaseSync.initialize(budgetId, encryptionKey);

      // Setup enhanced sync listeners
      const syncListener = (event) => {
        switch (event.type) {
          case 'sync_start':
            setIsSyncing(true);
            setSyncError(null);
            break;
          case 'sync_success':
            setIsSyncing(false);
            setLastSyncTime(Date.now());
            break;
          case 'realtime_update':
            console.log('📡 Real-time update received');
            break;
          default:
            break;
        }
      };

      const errorListener = (error) => {
        setIsSyncing(false);
        
        // Handle network blocking errors with user-friendly message
        if (error.type === 'network_blocked') {
          setSyncError('Firebase sync is blocked by your browser or ad blocker. Please allow Firebase requests for full functionality.');
          console.warn('🚫 Firebase blocked:', error);
        } else {
          setSyncError(error.error || 'Sync error occurred');
          console.error('🔥 Sync error:', error);
        }
      };

      firebaseSync.addSyncListener(syncListener);
      firebaseSync.addErrorListener(errorListener);

      if (isOnline) {
        setupRealtimeSync();
        loadFromCloud();
      }

      return () => {
        firebaseSync.removeSyncListener(syncListener);
        firebaseSync.removeErrorListener(errorListener);
      };
    }

    return () => {
      firebaseSync.stopRealtimeSync();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked, encryptionKey, currentUser, budgetId, isOnline]);

  // Auto-sync when data changes
  useEffect(() => {
    if (isUnlocked && encryptionKey && currentUser && isOnline && !isSyncing) {
      const syncData = {
        envelopes,
        bills,
        savingsGoals,
        unassignedCash,
        paycheckHistory,
        actualBalance,
        transactions,
        allTransactions,
        lastActivity,
        currentUser,
      };

      // Debounce syncing to avoid too many requests
      const timeoutId = setTimeout(async () => {
        await syncToCloud(syncData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envelopes, bills, savingsGoals, unassignedCash, paycheckHistory, actualBalance, transactions, allTransactions, lastActivity]);

  // Auto-save to localStorage when data changes
  useEffect(() => {
    if (isUnlocked && encryptionKey && currentUser) {
      const saveData = async () => {
        try {
          const dataToSave = {
            envelopes,
            bills,
            savingsGoals,
            unassignedCash,
            paycheckHistory,
            actualBalance,
            transactions,
            allTransactions,
            lastActivity,
            currentUser,
          };

          const encrypted = await encryptionUtils.encrypt(dataToSave, encryptionKey);
          const saltArray = Array.from(_salt || []);
          
          localStorage.setItem("envelopeBudgetData", JSON.stringify({
            encryptedData: encrypted.data,
            salt: saltArray,
            iv: encrypted.iv,
          }));
        } catch (error) {
          console.error("Failed to save data to localStorage:", error);
        }
      };

      // Debounce saving to avoid too many writes
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [envelopes, bills, savingsGoals, unassignedCash, paycheckHistory, actualBalance, transactions, allTransactions, lastActivity, currentUser, isUnlocked, encryptionKey, _salt]);

  const setupRealtimeSync = () => {
    firebaseSync.setupRealtimeSync(async (cloudUpdate) => {
      console.log("📥 Receiving real-time update from Firebase");

      // Check for conflicts
      const conflicts = await firebaseSync.checkForConflicts(Date.now());
      if (conflicts.hasConflict) {
        setSyncConflicts(conflicts);
        return;
      }

      // Apply the update
      const { data, metadata } = cloudUpdate;
      if (data) {
        setEnvelopes(data.envelopes || []);
        setBills(data.bills || []);
        setSavingsGoals(data.savingsGoals || []);
        setUnassignedCash(data.unassignedCash || 0);
        setPaycheckHistory(data.paycheckHistory || []);
        setActualBalance(data.actualBalance || 0);
        setTransactions(data.transactions || []);
        setAllTransactions(data.allTransactions || []);
        setLastActivity(data.lastActivity || null);

        // Update enhanced sync state
        if (metadata) {
          setActiveUsers(metadata.activeUsers || []);
          setRecentActivity(metadata.recentActivity || []);
        }

        setLastSyncTime(Date.now());
      }
    });
  };

  const syncToCloud = async (data) => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await firebaseSync.saveToCloud(data, currentUser);
      setLastSyncTime(Date.now());

      // Update active users
      const users = await firebaseSync.getActiveUsers();
      setActiveUsers(users);
    } catch (error) {
      console.error("❌ Sync to cloud failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      const cloudData = await firebaseSync.loadFromCloud();

      if (cloudData) {
        console.log("📥 Loading data from Firebase");
        const { data, metadata } = cloudData;

        setEnvelopes(data.envelopes || []);
        setBills(data.bills || []);
        setSavingsGoals(data.savingsGoals || []);
        setUnassignedCash(data.unassignedCash || 0);
        setPaycheckHistory(data.paycheckHistory || []);
        setActualBalance(data.actualBalance || 0);
        setTransactions(data.transactions || []);
        setAllTransactions(data.allTransactions || []);
        setLastActivity(data.lastActivity || null);

        // Update enhanced sync state
        if (metadata) {
          setActiveUsers(metadata.activeUsers || []);
          setRecentActivity(metadata.recentActivity || []);
        }

        setLastSyncTime(Date.now());
      } else {
        console.log(
          "📤 No cloud data found - this device will create the initial data"
        );
      }
    } catch (error) {
      console.error("❌ Failed to load from cloud:", error);
      
      // Handle decryption errors by allowing fresh start
      if (error.name === 'OperationError') {
        console.log('🔄 Decryption failed - starting fresh');
        setSyncError('Encryption key mismatch detected. Your data appears to be encrypted with a different password. You can continue with fresh data, or try logging in with the correct password.');
        
        // Optionally clear corrupted cloud data
        try {
          const clearResult = await firebaseSync.clearCorruptedData();
          if (clearResult === 'blocked') {
            setSyncError('Encryption key mismatch detected. Firebase requests are being blocked by your browser. Please disable ad blockers and refresh the page.');
          }
        } catch (clearError) {
          console.error('❌ Failed to clear corrupted data:', clearError);
        }
      } else {
        setSyncError(error.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const resolveConflict = async () => {
    await loadFromCloud();
    setSyncConflicts(null);
  };

  const calculateBiweeklyNeeds = () => {
    const monthlyTotal = bills.reduce(
      (sum, bill) => sum + (bill.monthlyAmount || 0),
      0
    );
    const biweeklyTotal = bills.reduce(
      (sum, bill) => sum + (bill.biweeklyAmount || 0),
      0
    );

    setBiweeklyAllocation(biweeklyTotal);
    setTotalBudgetNeeded(monthlyTotal);

    // Update envelopes with biweekly allocations
    const updatedEnvelopes = bills.map((bill) => {
      const existingEnvelope = envelopes.find((env) => env.billId === bill.id);
      return {
        id: existingEnvelope?.id || Date.now() + Math.random(),
        billId: bill.id,
        name: bill.name,
        amount: bill.amount,
        frequency: bill.frequency,
        monthlyAmount: bill.monthlyAmount || 0,
        biweeklyAllocation: bill.biweeklyAmount || 0,
        currentBalance: existingEnvelope?.currentBalance || 0,
        dueDate: bill.dueDate,
        nextDueDate: bill.nextDueDate,
        category: bill.category || "Bills",
        color: bill.color || "#a855f7",
        spendingHistory: existingEnvelope?.spendingHistory || [],
      };
    });

    setEnvelopes(updatedEnvelopes);
  };

  useEffect(() => {
    calculateBiweeklyNeeds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills]);

  const processPaycheck = ({ amount, payerName, mode, date }) => {
    const paycheck = {
      id: Date.now(),
      amount,
      payerName,
      mode,
      date,
      processedBy: currentUser?.userName || 'Anonymous',
      allocations: {},
      totalAllocated: 0,
      leftoverAmount: 0,
    };

    if (mode === "leftover") {
      // All money goes to unassigned cash
      setUnassignedCash((prev) => prev + amount);
      paycheck.leftoverAmount = amount;
      paycheck.allocations.unassigned = amount;
    } else {
      // Auto-allocate to envelopes based on their needs
      let remainingAmount = amount;
      let totalAllocated = 0;

      const updatedEnvelopes = envelopes.map((envelope) => {
        // Calculate how much this envelope needs (up to its biweekly allocation)
        const currentNeed = Math.max(
          0,
          envelope.biweeklyAllocation - envelope.currentBalance
        );
        const allocation = Math.min(currentNeed, remainingAmount);

        if (allocation > 0) {
          remainingAmount -= allocation;
          totalAllocated += allocation;
          paycheck.allocations[envelope.id] = allocation;
        }

        return {
          ...envelope,
          currentBalance: envelope.currentBalance + allocation,
        };
      });

      // Remaining goes to unassigned cash
      setUnassignedCash((prev) => prev + remainingAmount);
      paycheck.allocations.unassigned = remainingAmount;
      paycheck.totalAllocated = totalAllocated;
      paycheck.leftoverAmount = remainingAmount;

      setEnvelopes(updatedEnvelopes);
    }

    setPaycheckHistory((prev) => [paycheck, ...prev]);
    return paycheck;
  };

  const spendFromEnvelope = (envelopeId, amount, description = "") => {
    setEnvelopes((prev) =>
      prev.map((envelope) => {
        if (envelope.id === envelopeId) {
          const newBalance = Math.max(0, envelope.currentBalance - amount);

          const spending = {
            id: Date.now(),
            amount,
            description,
            date: new Date().toISOString(),
            spentBy: currentUser?.userName || 'Anonymous',
          };

          return {
            ...envelope,
            currentBalance: newBalance,
            spendingHistory: [...(envelope.spendingHistory || []), spending],
          };
        }
        return envelope;
      })
    );
  };

  const transferBetweenEnvelopes = (fromId, toId, amount) => {
    setEnvelopes((prev) =>
      prev.map((envelope) => {
        if (envelope.id === fromId) {
          return {
            ...envelope,
            currentBalance: Math.max(0, envelope.currentBalance - amount),
          };
        }
        if (envelope.id === toId) {
          return {
            ...envelope,
            currentBalance: envelope.currentBalance + amount,
          };
        }
        return envelope;
      })
    );
  };

  const addBill = (billData) => {
    const newBill = {
      id: Date.now(),
      ...billData,
      createdBy: currentUser?.userName || 'Anonymous',
      createdAt: new Date().toISOString(),
    };

    setBills((prev) => [...prev, newBill]);
  };

  const updateBill = (billId, updates) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              ...updates,
              lastModifiedBy: currentUser?.userName || 'Anonymous',
              lastModifiedAt: new Date().toISOString(),
            }
          : bill
      )
    );
  };

  const deleteBill = (billId) => {
    setBills((prev) => prev.filter((bill) => bill.id !== billId));
    setEnvelopes((prev) =>
      prev.filter((envelope) => envelope.billId !== billId)
    );
  };

  // Savings goals functions
  const addSavingsGoal = (goalData) => {
    const newGoal = {
      id: Date.now(),
      ...goalData,
      currentAmount: parseFloat(goalData.currentAmount) || 0,
      targetAmount: parseFloat(goalData.targetAmount),
      createdBy: currentUser?.userName || 'Anonymous',
      createdAt: new Date().toISOString(),
    };

    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (goalId, updates) => {
    setSavingsGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              ...updates,
              lastModifiedBy: currentUser?.userName || 'Anonymous',
              lastModifiedAt: new Date().toISOString(),
            }
          : goal
      )
    );
  };

  const deleteSavingsGoal = (goalId) => {
    setSavingsGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const distributeToGoals = (distribution, totalAmount) => {
    // Update savings goals with distributed amounts
    setSavingsGoals((prev) =>
      prev.map((goal) => {
        const allocation = parseFloat(distribution[goal.id]) || 0;
        if (allocation > 0) {
          const newAmount = goal.currentAmount + allocation;
          return {
            ...goal,
            currentAmount: Math.min(newAmount, goal.targetAmount), // Don't exceed target
          };
        }
        return goal;
      })
    );

    // Reduce unassigned cash
    setUnassignedCash((prev) => Math.max(0, prev - totalAmount));

    // Record the distribution in history
    const distributionRecord = {
      id: Date.now(),
      type: "savings_distribution",
      amount: totalAmount,
      distribution,
      distributedBy: currentUser?.userName || 'Anonymous',
      date: new Date().toISOString(),
    };

    setPaycheckHistory((prev) => [distributionRecord, ...prev]);
  };

  // Dashboard functions
  const updateActualBalance = (newBalance) => {
    setActualBalance(newBalance);
  };

  const reconcileTransaction = (transaction) => {
    // Add transaction to history
    setTransactions((prev) => [transaction, ...prev]);
    setAllTransactions((prev) => [transaction, ...prev]);

    // Update envelope or savings goal based on transaction
    if (transaction.envelopeId) {
      if (transaction.envelopeId === "unassigned") {
        // Update unassigned cash
        setUnassignedCash((prev) => prev + transaction.amount);
      } else if (transaction.envelopeId.startsWith("savings_")) {
        // Update savings goal
        const goalId = transaction.envelopeId.replace("savings_", "");
        setSavingsGoals((prev) =>
          prev.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  currentAmount: Math.max(
                    0,
                    goal.currentAmount + transaction.amount
                  ),
                }
              : goal
          )
        );
      } else {
        // Update envelope
        setEnvelopes((prev) =>
          prev.map((envelope) =>
            envelope.id === transaction.envelopeId
              ? {
                  ...envelope,
                  currentBalance: Math.max(
                    0,
                    envelope.currentBalance + transaction.amount
                  ),
                }
              : envelope
          )
        );
      }
    }
  };
  
  // Transaction Ledger functions
  const addTransaction = (transaction) => {
    setAllTransactions((prev) => [transaction, ...prev]);
    
    // Apply transaction to envelope if assigned
    if (transaction.envelopeId) {
      if (transaction.envelopeId === "unassigned") {
        setUnassignedCash((prev) => prev + transaction.amount);
      } else {
        setEnvelopes((prev) =>
          prev.map((envelope) =>
            envelope.id === transaction.envelopeId
              ? {
                  ...envelope,
                  currentBalance: Math.max(
                    0,
                    envelope.currentBalance + transaction.amount
                  ),
                }
              : envelope
          )
        );
      }
    }
  };
  
  const updateTransaction = (transactionId, updatedTransaction) => {
    const oldTransaction = allTransactions.find(t => t.id === transactionId);
    
    setAllTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...updatedTransaction }
          : transaction
      )
    );
    
    // Reverse old transaction effects
    if (oldTransaction && oldTransaction.envelopeId) {
      if (oldTransaction.envelopeId === "unassigned") {
        setUnassignedCash((prev) => prev - oldTransaction.amount);
      } else {
        setEnvelopes((prev) =>
          prev.map((envelope) =>
            envelope.id === oldTransaction.envelopeId
              ? {
                  ...envelope,
                  currentBalance: Math.max(
                    0,
                    envelope.currentBalance - oldTransaction.amount
                  ),
                }
              : envelope
          )
        );
      }
    }
    
    // Apply new transaction effects
    if (updatedTransaction.envelopeId) {
      if (updatedTransaction.envelopeId === "unassigned") {
        setUnassignedCash((prev) => prev + updatedTransaction.amount);
      } else {
        setEnvelopes((prev) =>
          prev.map((envelope) =>
            envelope.id === updatedTransaction.envelopeId
              ? {
                  ...envelope,
                  currentBalance: Math.max(
                    0,
                    envelope.currentBalance + updatedTransaction.amount
                  ),
                }
              : envelope
          )
        );
      }
    }
  };
  
  const deleteTransaction = (transactionId) => {
    const transaction = allTransactions.find(t => t.id === transactionId);
    
    setAllTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    
    // Reverse transaction effects
    if (transaction && transaction.envelopeId) {
      if (transaction.envelopeId === "unassigned") {
        setUnassignedCash((prev) => prev - transaction.amount);
      } else {
        setEnvelopes((prev) =>
          prev.map((envelope) =>
            envelope.id === transaction.envelopeId
              ? {
                  ...envelope,
                  currentBalance: Math.max(
                    0,
                    envelope.currentBalance - transaction.amount
                  ),
                }
              : envelope
          )
        );
      }
    }
  };
  
  const bulkImportTransactions = (transactions) => {
    transactions.forEach(transaction => {
      addTransaction(transaction);
    });
  };

  const createActivitySignature = (user = currentUser) => ({
    userName: user?.userName || 'Anonymous',
    userColor: user?.userColor || '#a855f7',
    timestamp: new Date().toISOString(),
    deviceFingerprint: encryptionUtils.generateDeviceFingerprint(),
    deviceInfo: getDeviceInfo(),
  });

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome Browser";
    if (ua.includes("Firefox")) return "Firefox Browser";
    if (ua.includes("Safari")) return "Safari Browser";
    if (ua.includes("Edge")) return "Edge Browser";
    if (ua.includes("Mobile")) return "Mobile Device";
    return "Desktop Browser";
  };
  
  const normalizeImportData = (importedData) => {
    console.log('🔧 Normalizing import data...');
    
    // Helper function to normalize date format
    const normalizeDate = (dateStr) => {
      if (!dateStr) return '';
      
      try {
        // Handle various date formats
        let date;
        if (dateStr.includes('T')) {
          // ISO format: 2025-07-21T21:58:09.927Z
          date = new Date(dateStr);
        } else if (dateStr.includes(',')) {
          // Format: "July 14, 2025" or "Jul 10, 2025"
          date = new Date(dateStr);
        } else {
          // Try as-is
          date = new Date(dateStr);
        }
        
        // Return in YYYY-MM-DD format
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('Failed to normalize date:', dateStr, error);
        return new Date().toISOString().split('T')[0]; // fallback to today
      }
    };
    
    // Helper to calculate next due date
    const calculateNextDueDate = (frequency, currentDue) => {
      if (!currentDue) return '';
      
      try {
        const date = new Date(currentDue);
        
        switch (frequency) {
          case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
          case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
          case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
          case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
          case 'semiannual':
            date.setMonth(date.getMonth() + 6);
            break;
          case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
          default:
            return currentDue;
        }
        
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('Failed to calculate next due date:', frequency, currentDue, error);
        return currentDue;
      }
    };
    
    // Normalize bills
    const normalizedBills = (importedData.bills || []).map(bill => {
      const normalizedDueDate = normalizeDate(bill.dueDate);
      const nextDueDate = bill.nextDueDate || calculateNextDueDate(bill.frequency, normalizedDueDate);
      
      return {
        ...bill,
        dueDate: normalizedDueDate,
        nextDueDate: nextDueDate,
        // Ensure all required fields exist
        category: bill.category || 'Bills',
        color: bill.color || '#3B82F6',
        notes: bill.notes || '',
        priority: bill.priority || 'medium',
        createdBy: bill.createdBy || currentUser?.userName || 'Import',
        createdAt: bill.createdAt || new Date().toISOString()
      };
    });
    
    // Normalize envelopes
    const normalizedEnvelopes = (importedData.envelopes || []).map(envelope => {
      return {
        ...envelope,
        dueDate: normalizeDate(envelope.dueDate),
        nextDueDate: envelope.nextDueDate || calculateNextDueDate(envelope.frequency, normalizeDate(envelope.dueDate)),
        // Ensure all required fields
        category: envelope.category || 'Bills',
        color: envelope.color || '#3B82F6',
        spendingHistory: envelope.spendingHistory || []
      };
    });
    
    // Normalize transactions
    const normalizedTransactions = (importedData.transactions || []).map(transaction => {
      return {
        ...transaction,
        date: normalizeDate(transaction.date),
        // Ensure required fields
        category: transaction.category || 'Other',
        notes: transaction.notes || '',
        reconciled: transaction.reconciled || false,
        createdBy: transaction.createdBy || currentUser?.userName || 'Import',
        createdAt: transaction.createdAt || new Date().toISOString(),
        importSource: transaction.importSource || 'file'
      };
    });
    
    // Handle allTransactions - if missing, use transactions data
    const allTransactions = importedData.allTransactions || normalizedTransactions;
    const normalizedAllTransactions = allTransactions.map(transaction => {
      return {
        ...transaction,
        date: normalizeDate(transaction.date),
        category: transaction.category || 'Other',
        notes: transaction.notes || '',
        reconciled: transaction.reconciled || false,
        createdBy: transaction.createdBy || currentUser?.userName || 'Import',
        createdAt: transaction.createdAt || new Date().toISOString(),
        importSource: transaction.importSource || 'file'
      };
    });
    
    // Normalize paycheck history
    const normalizedPaycheckHistory = (importedData.paycheckHistory || []).map(paycheck => {
      return {
        ...paycheck,
        date: normalizeDate(paycheck.date),
        // Ensure required fields
        processedBy: paycheck.processedBy || currentUser?.userName || 'Import',
        allocations: paycheck.allocations || {},
        totalAllocated: paycheck.totalAllocated || 0,
        leftoverAmount: paycheck.leftoverAmount || 0
      };
    });
    
    // Normalize savings goals
    const normalizedSavingsGoals = (importedData.savingsGoals || []).map(goal => {
      return {
        ...goal,
        targetDate: goal.targetDate ? normalizeDate(goal.targetDate) : '',
        // Ensure required fields
        category: goal.category || 'General',
        color: goal.color || '#3B82F6',
        description: goal.description || '',
        priority: goal.priority || 'medium',
        createdBy: goal.createdBy || currentUser?.userName || 'Import',
        createdAt: goal.createdAt || new Date().toISOString()
      };
    });
    
    // Normalize last activity
    const normalizedLastActivity = importedData.lastActivity ? {
      ...importedData.lastActivity,
      timestamp: normalizeDate(importedData.lastActivity.timestamp) || new Date().toISOString(),
      userName: importedData.lastActivity.userName || currentUser?.userName || 'Import',
      userColor: importedData.lastActivity.userColor || currentUser?.userColor || '#a855f7'
    } : createActivitySignature();
    
    const result = {
      envelopes: normalizedEnvelopes,
      bills: normalizedBills,
      savingsGoals: normalizedSavingsGoals,
      unassignedCash: importedData.unassignedCash || 0,
      paycheckHistory: normalizedPaycheckHistory,
      actualBalance: importedData.actualBalance || 0,
      transactions: normalizedTransactions,
      allTransactions: normalizedAllTransactions,
      lastActivity: normalizedLastActivity
    };
    
    console.log('✅ Import data normalization complete');
    return result;
  };

  const handleSetup = async ({ password, userName, userColor }) => {
    try {
      // Validate required fields
      if (!password || !userName) {
        throw new Error('Password and username are required');
      }

      const user = { 
        userName: userName.trim(),
        userColor: userColor || '#a855f7'
      };
      const generatedBudgetId = encryptionUtils.generateBudgetId(password);
      setBudgetId(generatedBudgetId);

      // Save user profile to localStorage separately for persistence
      localStorage.setItem("userProfile", JSON.stringify(user));

      const savedData = localStorage.getItem("envelopeBudgetData");

      if (savedData) {
        const { encryptedData, salt, iv } = JSON.parse(savedData);

        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          encoder.encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveBits", "deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: new Uint8Array(salt),
            iterations: 100000,
            hash: "SHA-256",
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );

        const decryptedData = await encryptionUtils.decrypt(
          encryptedData,
          key,
          iv
        );
        setEnvelopes(decryptedData.envelopes || []);
        setBills(decryptedData.bills || []);
        setSavingsGoals(decryptedData.savingsGoals || []);
        setUnassignedCash(decryptedData.unassignedCash || 0);
        setPaycheckHistory(decryptedData.paycheckHistory || []);
        setActualBalance(decryptedData.actualBalance || 0);
        setTransactions(decryptedData.transactions || []);
        setAllTransactions(decryptedData.allTransactions || []);
        setLastActivity(decryptedData.lastActivity || null);
        setEncryptionKey(key);
        setSalt(new Uint8Array(salt));
        
        // Always use the new user data from the login form
        // This allows multiple family members to access the same encrypted data
        setCurrentUser(user);
        setIsUnlocked(true);
      } else {
        const { key, salt } = await encryptionUtils.generateKey(password);
        setEncryptionKey(key);
        setSalt(salt);
        setCurrentUser(user);
        setIsUnlocked(true);
        setLastActivity(createActivitySignature(user));
      }
    } catch (error) {
      alert("Invalid password or corrupted data");
      throw error;
    }
  };

  const exportData = () => {
    const exportData = {
      envelopes,
      bills,
      savingsGoals,
      unassignedCash,
      paycheckHistory,
      actualBalance,
      transactions,
      allTransactions,
      lastActivity,
      exportedBy: currentUser?.userName || 'Anonymous',
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `envelope-budget-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Validate file content first
          const content = e.target.result;
          if (!content || content.trim().length === 0) {
            alert("File appears to be empty");
            return;
          }
          
          // Check if it looks like JSON
          const trimmedContent = content.trim();
          if (!trimmedContent.startsWith('{') && !trimmedContent.startsWith('[')) {
            alert("File does not appear to be valid JSON format");
            return;
          }
          
          const importedData = JSON.parse(content);
          
          // Validate imported data structure
          if (!importedData || typeof importedData !== 'object') {
            alert("Invalid file format - not a valid data structure");
            return;
          }
          
          if (importedData.envelopes && importedData.bills) {
            // Normalize and fix imported data
            const normalizedData = normalizeImportData(importedData);
            
            setEnvelopes(normalizedData.envelopes);
            setBills(normalizedData.bills);
            setSavingsGoals(normalizedData.savingsGoals);
            setUnassignedCash(normalizedData.unassignedCash);
            setPaycheckHistory(normalizedData.paycheckHistory);
            setActualBalance(normalizedData.actualBalance);
            setTransactions(normalizedData.transactions);
            setAllTransactions(normalizedData.allTransactions);
            setLastActivity(normalizedData.lastActivity);
            
            console.log('✅ Import data normalized and loaded:', {
              envelopes: normalizedData.envelopes.length,
              bills: normalizedData.bills.length,
              savingsGoals: normalizedData.savingsGoals.length,
              transactions: normalizedData.transactions.length,
              allTransactions: normalizedData.allTransactions.length
            });
            
            alert(`Data imported successfully!\n\nImported:\n• ${normalizedData.bills.length} bills\n• ${normalizedData.envelopes.length} envelopes\n• ${normalizedData.savingsGoals.length} savings goals\n• $${normalizedData.unassignedCash.toFixed(2)} unassigned cash`);
          } else {
            alert("Invalid file format - missing required data structure (envelopes and bills)");
          }
        } catch (error) {
          console.error("File parsing error:", error);
          
          if (error instanceof SyntaxError) {
            alert(`Invalid JSON format: ${error.message}\n\nPlease ensure the file is a valid JSON export from this app.`);
          } else {
            alert(`Error reading file: ${error.message}`);
          }
        }
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  const logout = () => {
    if (
      confirm(
        "Are you sure you want to logout? Your data is automatically saved."
      )
    ) {
      // Note: We intentionally DO NOT clear the "userProfile" from localStorage
      // This allows the user profile to persist across sessions
      setIsUnlocked(false);
      setEncryptionKey(null);
      setSalt(null);
      setCurrentUser(null);
      setBudgetId(null);
      setBills([]);
      setEnvelopes([]);
      setSavingsGoals([]);
      setUnassignedCash(0);
      setPaycheckHistory([]);
      setActualBalance(0);
      setTransactions([]);
      setAllTransactions([]);
      setLastActivity(null);
      setSyncError(null);
      firebaseSync.stopRealtimeSync();
    }
  };
  
  const resetEncryptionAndStartFresh = async () => {
    if (
      confirm(
        "This will clear ALL your encrypted data and start fresh. This action cannot be undone. Are you sure?"
      )
    ) {
      try {
        // Clear local data
        localStorage.removeItem('envelopeBudgetData');
        localStorage.removeItem('userProfile'); // Also clear saved user profile
        
        // Clear cloud data
        if (firebaseSync && budgetId) {
          await firebaseSync.clearCorruptedData();
        }
        
        // Reset all state
        setIsUnlocked(false);
        setEncryptionKey(null);
        setSalt(null);
        setCurrentUser(null);
        setBudgetId(null);
        setBills([]);
        setEnvelopes([]);
        setSavingsGoals([]);
        setUnassignedCash(0);
        setPaycheckHistory([]);
        setActualBalance(0);
        setTransactions([]);
        setAllTransactions([]);
        setLastActivity(null);
        setSyncError(null);
        
        // Clear sync-related state
        setActiveUsers([]);
        setRecentActivity([]);
        setSyncConflicts(null);
        setIsSyncing(false);
        setLastSyncTime(null);
        
        firebaseSync.stopRealtimeSync();
        
        alert('All data has been cleared. You can now set up a new budget with a fresh password.');
      } catch (error) {
        console.error('Failed to reset encryption:', error);
        alert('Failed to clear all data. Please try refreshing the page.');
      }
    }
  };

  if (!currentUser) {
    return <UserSetup onSetupComplete={handleSetup} />;
  }

  const totalEnvelopeBalance = envelopes.reduce(
    (sum, env) => sum + env.currentBalance,
    0
  );
  const totalSavingsBalance = savingsGoals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );
  const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <Header
          currentUser={currentUser}
          onUserChange={() => setCurrentUser(null)}
          onExport={exportData}
          onImport={importData}
          onLogout={logout}
          onResetEncryption={resetEncryptionAndStartFresh}
        />

        {/* Activity Banner */}
        <ActivityBanner 
          activeUsers={activeUsers}
          recentActivity={recentActivity}
          currentUser={currentUser}
        />

        {/* Sync Indicator */}
        <SyncIndicator
          isOnline={isOnline}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          activeUsers={activeUsers}
          syncError={syncError}
          currentUser={currentUser}
        />

        {/* Navigation Tabs */}
        <div className="glassmorphism rounded-3xl mb-6 shadow-xl border border-white/20">
          <nav className="flex border-b border-white/20 overflow-x-auto">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "dashboard"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <CreditCard className="h-5 w-5 inline mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView("envelopes")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "envelopes"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <Wallet className="h-5 w-5 inline mr-3" />
              Envelopes
            </button>
            <button
              onClick={() => setActiveView("savings")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "savings"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <Target className="h-5 w-5 inline mr-3" />
              Savings Goals
            </button>
            <button
              onClick={() => setActiveView("paycheck")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "paycheck"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <DollarSign className="h-5 w-5 inline mr-3" />
              Add Paycheck
            </button>
            <button
              onClick={() => setActiveView("bills")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "bills"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <Calendar className="h-5 w-5 inline mr-3" />
              Manage Bills
            </button>
            <button
              onClick={() => setActiveView("transactions")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "transactions"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <BookOpen className="h-5 w-5 inline mr-3" />
              Transactions
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
                activeView === "analytics"
                  ? "border-purple-500 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              <BarChart3 className="h-5 w-5 inline mr-3" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glassmorphism rounded-3xl p-6">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-purple-500 p-3 rounded-2xl">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Total Cash
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalCash.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-3xl p-6">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-emerald-500 p-3 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Unassigned Cash
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${unassignedCash.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-3xl p-6">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-cyan-500 p-3 rounded-2xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Savings Total
                </p>
                <p className="text-2xl font-bold text-cyan-600">
                  ${totalSavingsBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-3xl p-6">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-amber-500 p-3 rounded-2xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Biweekly Need
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  ${biweeklyAllocation.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeView === "dashboard" && (
          <Dashboard
            envelopes={envelopes}
            savingsGoals={savingsGoals}
            unassignedCash={unassignedCash}
            actualBalance={actualBalance}
            onUpdateActualBalance={updateActualBalance}
            onReconcileTransaction={reconcileTransaction}
            transactions={transactions}
          />
        )}

        {activeView === "envelopes" && (
          <EnvelopeGrid
            envelopes={envelopes}
            unassignedCash={unassignedCash}
            onSpend={spendFromEnvelope}
            onTransfer={transferBetweenEnvelopes}
            onUpdateUnassigned={setUnassignedCash}
          />
        )}

        {activeView === "savings" && (
          <SavingsGoals
            savingsGoals={savingsGoals}
            unassignedCash={unassignedCash}
            onAddGoal={addSavingsGoal}
            onUpdateGoal={updateSavingsGoal}
            onDeleteGoal={deleteSavingsGoal}
            onDistributeToGoals={distributeToGoals}
          />
        )}

        {activeView === "paycheck" && (
          <PaycheckProcessor
            biweeklyAllocation={biweeklyAllocation}
            envelopes={envelopes}
            paycheckHistory={paycheckHistory}
            onProcessPaycheck={processPaycheck}
            currentUser={currentUser}
          />
        )}

        {activeView === "bills" && (
          <BillManager
            bills={bills}
            onAddBill={addBill}
            onUpdateBill={updateBill}
            onDeleteBill={deleteBill}
          />
        )}
        
        {activeView === "transactions" && (
          <TransactionLedger
            transactions={allTransactions}
            envelopes={envelopes}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
            onBulkImport={bulkImportTransactions}
            currentUser={currentUser}
          />
        )}

        {activeView === "analytics" && (
          <ChartsAndAnalytics
            transactions={allTransactions}
            envelopes={envelopes}
            bills={bills}
            paycheckHistory={paycheckHistory}
            savingsGoals={savingsGoals}
            currentUser={currentUser}
          />
        )}

        {/* Loading/Syncing Overlay */}
        {isSyncing && (
          <div className="fixed bottom-4 right-4 glassmorphism rounded-2xl p-4 z-50">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Syncing...
              </span>
            </div>
          </div>
        )}

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed bottom-4 left-4 bg-amber-500 text-white rounded-2xl p-4 z-50">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Offline - Changes saved locally
              </span>
            </div>
          </div>
        )}

        {/* Conflict Resolution Modal */}
        {syncConflicts?.hasConflict && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glassmorphism rounded-3xl p-8 w-full max-w-md">
              <div className="text-center">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative bg-amber-500 p-4 rounded-2xl">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Sync Conflict Detected
                </h3>
                <p className="text-gray-600 mb-6">
                  <strong>{syncConflicts.cloudUser?.userName}</strong> made
                  changes on another device. Would you like to load their latest
                  changes?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSyncConflicts(null)}
                    className="flex-1 btn btn-secondary rounded-2xl py-3"
                  >
                    Keep Mine
                  </button>
                  <button
                    onClick={resolveConflict}
                    className="flex-1 btn btn-primary rounded-2xl py-3"
                  >
                    Load Theirs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvelopeSystem;
