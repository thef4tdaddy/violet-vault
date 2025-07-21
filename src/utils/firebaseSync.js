import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { encryptionUtils } from "./encryption";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseSync {
  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    this.unsubscribe = null;
    this.lastSyncTimestamp = null;
    
    // Enhanced state management
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;
    this.retryDelay = 1000;
    this.activeUsers = new Map();
    this.syncListeners = new Set();
    this.errorListeners = new Set();
    
    // Activity tracking
    this.recentActivity = [];
    this.maxActivityItems = 50;
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
  }

  initialize(budgetId, encryptionKey) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;
    this.retryAttempts = 0;
    
    // Clear any existing queued operations for a fresh start
    this.syncQueue = [];
  }
  
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      console.log('📶 Network connection restored');
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('📵 Network connection lost');
      this.isOnline = false;
    });
  }
  
  addSyncListener(callback) {
    this.syncListeners.add(callback);
  }
  
  removeSyncListener(callback) {
    this.syncListeners.delete(callback);
  }
  
  addErrorListener(callback) {
    this.errorListeners.add(callback);
  }
  
  removeErrorListener(callback) {
    this.errorListeners.delete(callback);
  }
  
  notifySyncListeners(event) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Error in sync listener:', error);
      }
    });
  }
  
  notifyErrorListeners(error) {
    this.errorListeners.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('❌ Error in error listener:', err);
      }
    });
  }

  static generateBudgetId(masterPassword) {
    return encryptionUtils.generateBudgetId(masterPassword);
  }

  async encryptForCloud(data) {
    const {
      envelopes,
      bills,
      savingsGoals,
      unassignedCash,
      paycheckHistory,
      actualBalance,
      transactions,
      lastActivity,
    } = data;

    // Encrypt everything except username
    const encryptedPayload = await encryptionUtils.encrypt(
      {
        envelopes,
        bills,
        savingsGoals,
        unassignedCash,
        paycheckHistory,
        actualBalance,
        transactions,
        activityData: lastActivity
          ? {
              userColor: lastActivity.userColor,
              timestamp: lastActivity.timestamp,
              deviceFingerprint: lastActivity.deviceFingerprint,
              deviceInfo: lastActivity.deviceInfo,
            }
          : null,
      },
      this.encryptionKey
    );

    return {
      encryptedData: encryptedPayload.data,
      iv: encryptedPayload.iv,
      lastActivity: lastActivity
        ? {
            userName: lastActivity.userName, // Only username visible
            timestamp: lastActivity.timestamp,
          }
        : null,
      version: 1,
      lastUpdated: serverTimestamp(),
    };
  }

  async decryptFromCloud(cloudData) {
    if (!cloudData.encryptedData || !cloudData.iv) {
      return null;
    }

    const decryptedData = await encryptionUtils.decrypt(
      cloudData.encryptedData,
      this.encryptionKey,
      cloudData.iv
    );

    // Reconstruct full lastActivity
    if (cloudData.lastActivity && decryptedData.activityData) {
      decryptedData.lastActivity = {
        userName: cloudData.lastActivity.userName,
        ...decryptedData.activityData,
      };
      delete decryptedData.activityData;
    }

    return decryptedData;
  }

  async saveToCloud(data, currentUser, options = {}) {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Firebase sync not initialized");
    }

    // If offline, queue the operation
    if (!this.isOnline && !options.skipQueue) {
      this.queueSyncOperation('save', { data, currentUser });
      console.log('📴 Queued save operation for when online');
      return;
    }

    try {
      this.notifySyncListeners({ type: 'sync_start', operation: 'save' });
      
      const encryptedData = await this.encryptForCloud(data);
      
      // Add activity tracking
      const activityData = {
        id: Date.now().toString(),
        type: 'data_save',
        userName: currentUser.userName,
        userColor: currentUser.userColor,
        timestamp: new Date().toISOString(),
        details: {
          envelopeCount: data.envelopes?.length || 0,
          billCount: data.bills?.length || 0,
          savingsGoalCount: data.savingsGoals?.length || 0
        }
      };
      
      this.addActivity(activityData);

      const docRef = doc(db, "budgets", this.budgetId);
      await setDoc(
        docRef,
        {
          ...encryptedData,
          currentUser: {
            id: currentUser.id || encryptionUtils.generateDeviceFingerprint(),
            userName: currentUser.userName,
            userColor: currentUser.userColor,
            deviceFingerprint: encryptionUtils.generateDeviceFingerprint(),
            lastSeen: new Date().toISOString(),
          },
          activity: this.recentActivity.slice(-10), // Include recent activity
        },
        { merge: true }
      );

      this.lastSyncTimestamp = Date.now();
      this.retryAttempts = 0; // Reset retry counter on success
      
      this.notifySyncListeners({ type: 'sync_success', operation: 'save' });
      console.log('✅ Successfully saved to cloud');
      
    } catch (error) {
      console.error('❌ Failed to save to cloud:', error);
      
      // Handle retry logic
      if (this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++;
        const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff
        
        console.log(`🔄 Retrying save operation in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetryAttempts})`);
        
        setTimeout(() => {
          this.saveToCloud(data, currentUser, { skipQueue: true });
        }, delay);
      } else {
        this.notifyErrorListeners({
          type: 'sync_error',
          operation: 'save',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    }
  }

  async loadFromCloud() {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Firebase sync not initialized");
    }

    if (!this.isOnline) {
      throw new Error("Cannot load from cloud while offline");
    }

    try {
      this.notifySyncListeners({ type: 'sync_start', operation: 'load' });
      
      const docRef = doc(db, "budgets", this.budgetId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const decryptedData = await this.decryptFromCloud(cloudData);
        
        // Update active users
        if (cloudData.currentUser) {
          this.activeUsers.set(cloudData.currentUser.id, {
            ...cloudData.currentUser,
            lastSeen: new Date(cloudData.currentUser.lastSeen || Date.now())
          });
        }
        
        // Merge remote activity with local activity
        if (cloudData.activity && Array.isArray(cloudData.activity)) {
          this.mergeActivity(cloudData.activity);
        }

        this.notifySyncListeners({ type: 'sync_success', operation: 'load' });
        
        return {
          data: decryptedData,
          metadata: {
            lastUpdated: cloudData.lastUpdated,
            currentUser: cloudData.currentUser,
            lastActivity: cloudData.lastActivity,
            activeUsers: Array.from(this.activeUsers.values()),
            recentActivity: this.recentActivity
          },
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load from cloud:', error);
      this.notifyErrorListeners({
        type: 'sync_error',
        operation: 'load',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  setupRealtimeSync(onDataChanged) {
    if (!this.budgetId) {
      throw new Error("Budget ID not set");
    }

    const docRef = doc(db, "budgets", this.budgetId);

    this.unsubscribe = onSnapshot(docRef, async (doc) => {
      if (doc.exists()) {
        const cloudData = doc.data();

        const cloudTimestamp = cloudData.lastUpdated?.toMillis() || 0;
        if (cloudTimestamp > (this.lastSyncTimestamp || 0)) {
          try {
            const decryptedData = await this.decryptFromCloud(cloudData);
            if (decryptedData) {
              onDataChanged({
                data: decryptedData,
                metadata: {
                  lastUpdated: cloudData.lastUpdated,
                  currentUser: cloudData.currentUser,
                  lastActivity: cloudData.lastActivity,
                },
              });
            }
          } catch (error) {
            console.error("❌ Failed to decrypt incoming data:", error);
          }
        }
      }
    });
  }

  stopRealtimeSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async getActiveUsers() {
    const docRef = doc(db, "budgets", this.budgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.currentUser ? [data.currentUser] : [];
    }

    return [];
  }

  async checkForConflicts(localTimestamp) {
    const docRef = doc(db, "budgets", this.budgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      const cloudTimestamp = cloudData.lastUpdated?.toMillis() || 0;

      if (cloudTimestamp > localTimestamp) {
        return {
          hasConflict: true,
          cloudUser: cloudData.currentUser,
          cloudTimestamp: new Date(cloudTimestamp),
        };
      }
    }

    return { hasConflict: false };
  }

  // Activity management
  addActivity(activity) {
    this.recentActivity.unshift(activity);
    if (this.recentActivity.length > this.maxActivityItems) {
      this.recentActivity = this.recentActivity.slice(0, this.maxActivityItems);
    }
  }
  
  mergeActivity(remoteActivity) {
    // Merge remote activities with local ones, avoiding duplicates
    const existingIds = new Set(this.recentActivity.map(a => a.id));
    
    const newActivities = remoteActivity.filter(activity => 
      !existingIds.has(activity.id)
    );
    
    if (newActivities.length > 0) {
      this.recentActivity = [...newActivities, ...this.recentActivity]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, this.maxActivityItems);
    }
  }
  
  getRecentActivity() {
    return [...this.recentActivity];
  }
  
  // Offline sync queue management
  queueSyncOperation(type, data) {
    this.syncQueue.push({
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    });
    
    // Limit queue size to prevent memory issues
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-100);
    }
  }
  
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    console.log(`🔄 Processing ${this.syncQueue.length} queued sync operations`);
    
    const operations = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'save':
            await this.saveToCloud(
              operation.data.data,
              operation.data.currentUser,
              { skipQueue: true }
            );
            break;
          default:
            console.warn('❓ Unknown queued operation type:', operation.type);
        }
      } catch (error) {
        console.error('❌ Failed to process queued operation:', error);
        
        // Re-queue if retries available
        if (operation.retries < 2) {
          operation.retries++;
          this.syncQueue.push(operation);
        }
      }
    }
  }
  
  getSyncQueueLength() {
    return this.syncQueue.length;
  }
  
  clearSyncQueue() {
    this.syncQueue = [];
  }
  
  // Enhanced error handling
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp) : null,
      queuedOperations: this.syncQueue.length,
      activeUsers: this.activeUsers.size,
      retryAttempts: this.retryAttempts,
      maxRetryAttempts: this.maxRetryAttempts
    };
  }
  
  // Health check method
  async performHealthCheck() {
    try {
      if (!this.isOnline) {
        return { status: 'offline', message: 'Device is offline' };
      }
      
      if (!this.budgetId || !this.encryptionKey) {
        return { status: 'not_initialized', message: 'Sync not initialized' };
      }
      
      // Try to read from Firestore to test connection
      const docRef = doc(db, "budgets", this.budgetId);
      await getDoc(docRef);
      
      return { status: 'healthy', message: 'All systems operational' };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default FirebaseSync;
