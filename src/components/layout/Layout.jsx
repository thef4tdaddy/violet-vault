// src/components/layout/Layout.jsx
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BudgetProvider, useBudget } from "../../contexts/BudgetContext";
import UserSetup from "../auth/UserSetup";
import Header from "../ui/Header";
import TeamActivitySync from "../sync/TeamActivitySync";
import LoadingSpinner from "../ui/LoadingSpinner";
import useEnvelopeSystem from "../budgeting/EnvelopeSystem";
import { encryptionUtils } from "../../utils/encryption";
import FirebaseSync from "../../utils/firebaseSync";
import logger from "../../utils/logger";
import { getVersionInfo } from "../../utils/version";
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

// Lazy load heavy components for better performance
const PaycheckProcessor = lazy(() => import("../budgeting/PaycheckProcessor"));
const EnvelopeGrid = lazy(() => import("../../new/UnifiedEnvelopeManager"));
const SmartEnvelopeSuggestions = lazy(() => import("../budgeting/SmartEnvelopeSuggestions"));
const BillManager = lazy(() => import("../../new/UnifiedBillTracker"));
const SavingsGoals = lazy(() => import("../savings/SavingsGoals"));
const Dashboard = lazy(() => import("./Dashboard"));
const TransactionLedger = lazy(() => import("../transactions/TransactionLedger"));
const ChartsAndAnalytics = lazy(() => import("../analytics/ChartsAndAnalytics"));
const SupplementalAccounts = lazy(() => import("../accounts/SupplementalAccounts"));

const Layout = () => {
  logger.debug("Layout component is running");

  const { isUnlocked, encryptionKey, currentUser, login, logout, budgetId, salt } = useAuth();

  const firebaseSync = useMemo(() => new FirebaseSync(), []);

  logger.auth("Auth hook values", {
    isUnlocked,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!budgetId,
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [syncConflicts, setSyncConflicts] = useState(null);

  // Handle activity updates from MainContent
  const handleActivityUpdate = useCallback(({ users, activity }) => {
    setActiveUsers(users);
    setRecentActivity(activity);
  }, []);
  const handleSetup = async (userData) => {
    logger.auth("Layout handleSetup called", { hasUserData: !!userData });
    try {
      // Generate budgetId from password for cross-device sync
      const { encryptionUtils } = await import("../../utils/encryption");
      const userDataWithId = {
        ...userData,
        budgetId: userData.budgetId || encryptionUtils.generateBudgetId(userData.password),
      };

      logger.auth("Calling login", {
        hasUserData: !!userDataWithId,
        hasPassword: !!userData.password,
        budgetId: userDataWithId.budgetId,
      });
      const result = await login(userData.password, userDataWithId);
      logger.auth("Login result", { success: !!result });

      if (result.success) {
        console.log("✅ Setup completed successfully");
      } else {
        console.error("❌ Setup failed:", result.error);
        alert(`Setup failed: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Setup error:", error);
      alert(`Setup error: ${error.message}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const exportData = async () => {
    try {
      console.log("📁 Starting export process...");

      // Get current data from localStorage
      const savedData = localStorage.getItem("envelopeBudgetData");
      if (!savedData) {
        alert("No data found to export");
        return;
      }

      // Decrypt the data
      const { encryptedData, iv } = JSON.parse(savedData);
      const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

      // Prepare export data with metadata
      const exportData = {
        ...decryptedData,
        exportMetadata: {
          exportedBy: currentUser?.userName || "Unknown User",
          exportDate: new Date().toISOString(),
          appVersion: "1.0.0",
          dataVersion: "1.0",
        },
      };

      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `VioletVault Budget Backup ${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("✅ Data exported successfully!");
      alert(
        `Successfully exported your budget data!\n\nEnvelopes: ${exportData.envelopes?.length || 0}\nBills: ${exportData.bills?.length || 0}\nTransactions: ${exportData.allTransactions?.length || 0}`
      );
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert(`Export failed: ${error.message}`);
    }
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      console.log("📁 Starting import process...");

      // Read the file
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Parse JSON
      const importedData = JSON.parse(fileContent);
      console.log("✅ File parsed successfully:", {
        envelopes: importedData.envelopes?.length || 0,
        bills: importedData.bills?.length || 0,
        savingsGoals: importedData.savingsGoals?.length || 0,
        allTransactions: importedData.allTransactions?.length || 0,
      });

      // Validate the data structure
      if (!importedData.envelopes || !Array.isArray(importedData.envelopes)) {
        throw new Error("Invalid backup file: missing or invalid envelopes data");
      }

      // Confirm import with user
      const confirmed = confirm(
        `Import ${importedData.envelopes?.length || 0} envelopes, ${importedData.bills?.length || 0} bills, and ${importedData.allTransactions?.length || 0} transactions?\n\nThis will replace your current data.`
      );

      if (!confirmed) {
        console.log("Import cancelled by user");
        return;
      }

      // Create backup of current data before import
      try {
        const currentData = localStorage.getItem("envelopeBudgetData");
        if (currentData) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          localStorage.setItem(`envelopeBudgetData_backup_${timestamp}`, currentData);
          console.log("✅ Current data backed up");
        }
      } catch (backupError) {
        console.warn("⚠️ Failed to create backup:", backupError);
      }

      // Prepare the data for loading - ensure user information is preserved
      console.log("🔍 Current auth state during import:", {
        hasCurrentUser: !!currentUser,
        currentUserName: currentUser?.userName,
        hasBudgetId: !!budgetId,
        importedUser: importedData.currentUser,
        exportedBy: importedData.exportedBy,
      });

      let processedCurrentUser;
      try {
        processedCurrentUser = importedData.currentUser ||
          currentUser || {
            id: `user_${Date.now()}`,
            userName: importedData.exportedBy || "Imported User",
            userColor: "#a855f7",
            budgetId: budgetId,
          };
      } catch (userError) {
        console.error("❌ Error creating user:", userError);
        processedCurrentUser = {
          id: `user_${Date.now()}`,
          userName: "Imported User",
          userColor: "#a855f7",
          budgetId: budgetId,
        };
      }

      const dataToLoad = {
        // Budget data from import
        envelopes: importedData.envelopes || [],
        bills: importedData.bills || [],
        savingsGoals: importedData.savingsGoals || [],
        supplementalAccounts: importedData.supplementalAccounts || [],
        unassignedCash: importedData.unassignedCash || 0,
        biweeklyAllocation: importedData.biweeklyAllocation || 0,
        paycheckHistory: importedData.paycheckHistory || [],
        actualBalance: importedData.actualBalance || 0,
        transactions: importedData.transactions || [],
        allTransactions: importedData.allTransactions || [],
        // Use the processed currentUser
        currentUser: processedCurrentUser,
        // Add any other imported metadata
        ...(importedData.exportMetadata && {
          importMetadata: {
            ...importedData.exportMetadata,
            importedAt: new Date().toISOString(),
            importedBy: currentUser?.userName,
          },
        }),
      };

      console.log("📋 Prepared data for saving:", {
        envelopes: dataToLoad.envelopes.length,
        bills: dataToLoad.bills.length,
        savingsGoals: dataToLoad.savingsGoals.length,
        transactions: dataToLoad.allTransactions.length,
        hasCurrentUser: !!dataToLoad.currentUser,
        currentUserBudgetId: dataToLoad.currentUser?.budgetId,
        currentUserName: dataToLoad.currentUser?.userName,
        currentUserSource: importedData.currentUser
          ? "imported"
          : currentUser
            ? "session"
            : "created",
      });

      // Encrypt and save the imported data
      console.log("🔐 Encrypting and saving imported data...");
      const encrypted = await encryptionUtils.encrypt(dataToLoad, encryptionKey);

      const saveData = {
        encryptedData: encrypted.data,
        salt: Array.from(salt),
        iv: encrypted.iv,
      };

      localStorage.setItem("envelopeBudgetData", JSON.stringify(saveData));

      // Verify the save worked
      const verification = localStorage.getItem("envelopeBudgetData");
      if (!verification) {
        throw new Error("Failed to save data to localStorage");
      }

      // Test decryption to ensure data integrity
      console.log("🔍 Verifying data integrity...");
      const { encryptedData: testEncrypted, iv: testIv } = JSON.parse(verification);
      const testDecrypted = await encryptionUtils.decrypt(testEncrypted, encryptionKey, testIv);

      console.log("✅ Data integrity verified:", {
        envelopes: testDecrypted.envelopes?.length || 0,
        bills: testDecrypted.bills?.length || 0,
        savingsGoals: testDecrypted.savingsGoals?.length || 0,
        hasCurrentUser: !!testDecrypted.currentUser,
        budgetId: testDecrypted.currentUser?.budgetId,
      });

      console.log("✅ Data imported and saved successfully!");

      // Data is saved to localStorage - BudgetContext will load it automatically
      console.log("📝 Data saved to localStorage - BudgetContext should load it automatically");

      console.log("🎉 Data import completed successfully!");

      // Show success message - data should load automatically
      alert(
        `Successfully imported data!\n\nEnvelopes: ${dataToLoad.envelopes.length}\nBills: ${dataToLoad.bills.length}\nTransactions: ${dataToLoad.allTransactions.length}\n\nData saved to localStorage. If it doesn't appear, try the Force Load Data button.`
      );

      return dataToLoad;
    } catch (error) {
      console.error("❌ Import failed:", error);
      console.error("❌ Import error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      alert(`Import failed: ${error.message}`);
    }

    // Clear the file input
    event.target.value = "";
  };

  const resetEncryptionAndStartFresh = async () => {
    if (
      confirm("This will permanently delete all your budget data and cannot be undone. Continue?")
    ) {
      try {
        // Clear all localStorage data
        localStorage.removeItem("envelopeBudgetData");

        // Clear any backup data that might exist
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("envelopeBudgetData")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Clear any cached Firebase data
        try {
          await firebaseSync?.clearAllData?.();
        } catch (syncError) {
          console.warn("Could not clear cloud data:", syncError);
        }

        logout();
        alert("All data has been cleared. You can now set up a new budget with a fresh password.");
      } catch (error) {
        console.error("Failed to reset encryption:", error);
        alert("Failed to clear all data. Please try refreshing the page.");
      }
    }
  };

  const resolveConflict = () => {
    // Implementation for conflict resolution
    setSyncConflicts(null);
  };

  if (!isUnlocked || !currentUser) {
    return <UserSetup onSetupComplete={handleSetup} />;
  }

  logger.budgetSync("Rendering BudgetProvider with props", {
    hasEncryptionKey: !!encryptionKey,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!budgetId,
    hasSalt: !!salt,
    currentUser: currentUser,
  });
  logger.budgetSync("budgetId value", { budgetId });

  return (
    <>
      <BudgetProvider
        encryptionKey={encryptionKey}
        currentUser={currentUser}
        budgetId={budgetId}
        salt={salt}
      >
        <MainContent
          currentUser={currentUser}
          encryptionKey={encryptionKey}
          budgetId={budgetId}
          onUserChange={handleLogout}
          onExport={exportData}
          onImport={importData}
          onLogout={handleLogout}
          onResetEncryption={resetEncryptionAndStartFresh}
          onActivityUpdate={handleActivityUpdate}
          activeUsers={activeUsers}
          recentActivity={recentActivity}
          syncConflicts={syncConflicts}
          onResolveConflict={resolveConflict}
          setSyncConflicts={setSyncConflicts}
          firebaseSync={firebaseSync}
        />
      </BudgetProvider>
    </>
  );
};

const MainContent = ({
  currentUser,
  onUserChange,
  onExport,
  onActivityUpdate,
  onImport,
  onLogout,
  onResetEncryption,
  activeUsers: _activeUsers,
  recentActivity: _recentActivity,
  syncConflicts,
  onResolveConflict,
  setSyncConflicts,
  firebaseSync,
}) => {
  const budget = useBudget();
  const [activeView, setActiveView] = useState("dashboard");

  // Handle import by saving data then loading into context
  const handleImport = async (event) => {
    const data = await onImport(event);
    if (data) {
      budget.loadData(data);
    }
  };

  const {
    envelopes,
    savingsGoals,
    unassignedCash,
    biweeklyAllocation,
    isOnline,
    isSyncing,
    lastSyncTime: _lastSyncTime,
    syncError: _syncError,
    getActiveUsers,
    getRecentActivity,
  } = budget;

  // Update activity data from Firebase sync
  useEffect(() => {
    if (getActiveUsers && getRecentActivity) {
      const updateActivityData = () => {
        try {
          const users = getActiveUsers();
          const activity = getRecentActivity();
          console.log("🔄 Updating activity data:", {
            users: users?.length || 0,
            activity: activity?.length || 0,
          });
          // Pass activity data up to Layout component via props
          if (onActivityUpdate) {
            onActivityUpdate({ users: users || [], activity: activity || [] });
          }
        } catch (error) {
          console.error("Failed to get activity data:", error);
        }
      };

      // Update immediately
      updateActivityData();

      // Update periodically to catch changes
      const interval = setInterval(updateActivityData, 5000);
      return () => clearInterval(interval);
    }
  }, [getActiveUsers, getRecentActivity, isSyncing, onActivityUpdate]);

  // Calculate totals
  const totalEnvelopeBalance = Array.isArray(envelopes)
    ? envelopes.reduce((sum, env) => sum + env.currentBalance, 0)
    : 0;
  const totalSavingsBalance = Array.isArray(savingsGoals)
    ? savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    : 0;
  const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="relative z-50">
          <Header
            currentUser={currentUser}
            onUserChange={onUserChange}
            onExport={onExport}
            onImport={handleImport}
            onLogout={onLogout}
            onResetEncryption={() => {
              // Reset the budget context data first
              budget.resetAllData();
              // Then call the original reset function (clears localStorage and calls logout)
              onResetEncryption();
            }}
          />
        </div>

        {/* Team Activity & Sync - Temporarily disabled to prevent browser crashes */}
        {/* <TeamActivitySync
          activeUsers={activeUsers}
          recentActivity={recentActivity}
          currentUser={currentUser}
          isOnline={isOnline}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          syncError={syncError}
        />
        */}

        {/* Navigation Tabs */}
        <div className="glassmorphism rounded-3xl mb-6 shadow-xl border border-white/20">
          <nav className="flex justify-center overflow-x-auto flex-wrap">
            <NavButton
              key="dashboard"
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
              icon={CreditCard}
              label="Dashboard"
            />
            <NavButton
              key="envelopes"
              active={activeView === "envelopes"}
              onClick={() => setActiveView("envelopes")}
              icon={Wallet}
              label="Envelopes"
            />
            <NavButton
              key="savings"
              active={activeView === "savings"}
              onClick={() => setActiveView("savings")}
              icon={Target}
              label="Savings Goals"
            />
            <NavButton
              key="supplemental"
              active={activeView === "supplemental"}
              onClick={() => setActiveView("supplemental")}
              icon={CreditCard}
              label="Supplemental"
            />
            <NavButton
              key="paycheck"
              active={activeView === "paycheck"}
              onClick={() => setActiveView("paycheck")}
              icon={DollarSign}
              label="Add Paycheck"
            />
            <NavButton
              key="bills"
              active={activeView === "bills"}
              onClick={() => setActiveView("bills")}
              icon={Calendar}
              label="Manage Bills"
            />
            <NavButton
              key="transactions"
              active={activeView === "transactions"}
              onClick={() => setActiveView("transactions")}
              icon={BookOpen}
              label="Transactions"
            />
            <NavButton
              key="analytics"
              active={activeView === "analytics"}
              onClick={() => setActiveView("analytics")}
              icon={BarChart3}
              label="Analytics"
            />
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            key="total-cash"
            icon={Wallet}
            label="Total Cash"
            value={totalCash}
            color="purple"
          />
          <SummaryCard
            key="unassigned-cash"
            icon={TrendingUp}
            label="Unassigned Cash"
            value={unassignedCash}
            color="emerald"
          />
          <SummaryCard
            key="savings-total"
            icon={Target}
            label="Savings Total"
            value={totalSavingsBalance}
            color="cyan"
          />
          <SummaryCard
            key="biweekly-need"
            icon={DollarSign}
            label="Biweekly Need"
            value={biweeklyAllocation}
            color="amber"
          />
        </div>

        {/* Main Content */}
        <ViewRenderer activeView={activeView} budget={budget} currentUser={currentUser} />

        {/* Loading/Syncing Overlay */}
        {isSyncing && (
          <div className="fixed bottom-4 right-4 glassmorphism rounded-2xl p-4 z-50">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Syncing...</span>
            </div>
          </div>
        )}

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed bottom-4 left-4 bg-amber-500 text-white rounded-2xl p-4 z-50">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Offline - Changes saved locally</span>
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

                <h3 className="text-xl font-bold text-gray-900 mb-4">Sync Conflict Detected</h3>
                <p className="text-gray-600 mb-6">
                  <strong>{syncConflicts.cloudUser?.userName}</strong> made changes on another
                  device. Would you like to load their latest changes?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSyncConflicts(null)}
                    className="flex-1 btn btn-secondary rounded-2xl py-3"
                  >
                    Keep Mine
                  </button>
                  <button
                    onClick={onResolveConflict}
                    className="flex-1 btn btn-primary rounded-2xl py-3"
                  >
                    Load Theirs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Version Footer */}
        <div className="mt-8 text-center">
          <div className="glassmorphism rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-purple-600">
                {getVersionInfo().displayName}
              </span>{" "}
              v{getVersionInfo().version}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Built with ❤️ for secure budgeting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`px-8 py-5 text-sm font-semibold border-b-2 transition-all ${
      active
        ? "border-purple-500 text-purple-600 bg-purple-50/50"
        : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
    }`}
  >
    <Icon className="h-5 w-5 inline mr-3" />
    {label}
  </button>
);

const SummaryCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
  };

  const textColorClasses = {
    purple: "text-gray-900",
    emerald: "text-emerald-600",
    cyan: "text-cyan-600",
    amber: "text-amber-600",
  };

  return (
    <div className="glassmorphism rounded-3xl p-6">
      <div className="flex items-center">
        <div className="relative mr-4">
          <div
            className={`absolute inset-0 ${colorClasses[color]} rounded-2xl blur-lg opacity-30`}
          ></div>
          <div className={`relative ${colorClasses[color]} p-3 rounded-2xl`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${textColorClasses[color]}`}>${value.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

const ViewRenderer = ({ activeView, budget, currentUser }) => {
  const {
    envelopes,
    bills,
    savingsGoals,
    supplementalAccounts,
    unassignedCash,
    biweeklyAllocation,
    paycheckHistory,
    actualBalance,
    transactions,
    allTransactions,
    setActualBalance,
    reconcileTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    setUnassignedCash,
    addBill,
    updateBill,
    deleteBill,
    addEnvelope,
    updateEnvelope,
    processPaycheck,
    setAllTransactions,
    setTransactions,
  } = budget;

  const views = {
    dashboard: (
      <Dashboard
        envelopes={envelopes}
        savingsGoals={savingsGoals}
        unassignedCash={unassignedCash}
        actualBalance={actualBalance}
        onUpdateActualBalance={setActualBalance}
        onReconcileTransaction={reconcileTransaction}
        transactions={transactions}
      />
    ),
    envelopes: (
      <div className="space-y-6">
        <SmartEnvelopeSuggestions
          transactions={transactions}
          envelopes={envelopes}
          onCreateEnvelope={addEnvelope}
          onUpdateEnvelope={updateEnvelope}
          dateRange="6months"
          minAmount={50}
          minTransactions={3}
        />
        <EnvelopeGrid />
      </div>
    ),
    savings: (
      <SavingsGoals
        savingsGoals={savingsGoals}
        unassignedCash={unassignedCash}
        onAddGoal={addSavingsGoal}
        onUpdateGoal={updateSavingsGoal}
        onDeleteGoal={deleteSavingsGoal}
        onDistributeToGoals={() => {}} // Will be implemented
      />
    ),
    supplemental: (
      <SupplementalAccounts
        supplementalAccounts={supplementalAccounts}
        onAddAccount={() => {}} // Will be implemented
        onUpdateAccount={() => {}} // Will be implemented
        onDeleteAccount={() => {}} // Will be implemented
        currentUser={currentUser}
      />
    ),
    paycheck: (
      <PaycheckProcessor
        biweeklyAllocation={biweeklyAllocation}
        envelopes={envelopes}
        paycheckHistory={paycheckHistory}
        onProcessPaycheck={processPaycheck}
        currentUser={currentUser}
      />
    ),
    bills: (
      <BillManager
        transactions={allTransactions}
        envelopes={envelopes}
        onPayBill={(updatedBill) => {
          // Update the bill in allTransactions
          const updatedTransactions = allTransactions.map((t) =>
            t.id === updatedBill.id ? updatedBill : t
          );
          setAllTransactions(updatedTransactions);
        }}
        onUpdateBill={(updatedBill) => {
          // Update the bill in allTransactions
          const updatedTransactions = allTransactions.map((t) =>
            t.id === updatedBill.id ? updatedBill : t
          );
          setAllTransactions(updatedTransactions);
        }}
        onCreateRecurringBill={(newBill) => {
          // Add new bill to allTransactions
          const billTransaction = {
            ...newBill,
            id: `bill_${Date.now()}`,
            type: "recurring_bill",
            date: new Date().toISOString().split("T")[0],
            isPaid: false,
            source: "manual",
          };
          setAllTransactions([...allTransactions, billTransaction]);
        }}
        onSearchNewBills={async () => {
          try {
            // This would integrate with email parsing or other bill detection services
            // For now, we'll show a placeholder notification
            alert(
              "Bill search feature would integrate with email parsing services to automatically detect new bills from your inbox."
            );
          } catch (error) {
            console.error("Failed to search for new bills:", error);
            alert("Failed to search for new bills. Please try again.");
          }
        }}
        onError={(error) => {
          console.error("Bill management error:", error);
          alert(`Error: ${error.message || error}`);
        }}
      />
    ),
    transactions: (
      <TransactionLedger
        transactions={allTransactions}
        envelopes={envelopes}
        onAddTransaction={() => {}} // Will be implemented
        onUpdateTransaction={() => {}} // Will be implemented
        onDeleteTransaction={() => {}} // Will be implemented
        onBulkImport={(newTransactions) => {
          console.log("🔄 onBulkImport called with transactions:", newTransactions.length);
          const updatedAllTransactions = [...allTransactions, ...newTransactions];
          const updatedTransactions = [...transactions, ...newTransactions];
          setAllTransactions(updatedAllTransactions);
          setTransactions(updatedTransactions);
          console.log(
            "💾 Bulk import complete. Total transactions:",
            updatedAllTransactions.length
          );
        }}
        currentUser={currentUser}
      />
    ),
    analytics: (
      <ChartsAndAnalytics
        transactions={allTransactions}
        envelopes={envelopes}
        bills={bills}
        paycheckHistory={paycheckHistory}
        savingsGoals={savingsGoals}
        currentUser={currentUser}
      />
    ),
  };

  return (
    <Suspense fallback={<LoadingSpinner message={`Loading ${activeView}...`} />}>
      {views[activeView]}
    </Suspense>
  );
};

export default Layout;
