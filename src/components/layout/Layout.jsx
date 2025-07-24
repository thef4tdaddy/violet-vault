// src/components/Layout.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BudgetProvider, useBudget } from "../../contexts/BudgetContext";
import UserSetup from "../auth/UserSetup";
import Header from "../ui/Header";
import TeamActivitySync from "../sync/TeamActivitySync";
import LoadingSpinner from "../ui/LoadingSpinner";
import useEnvelopeSystem from "../budgeting/EnvelopeSystem";
import { encryptionUtils } from "../../utils/encryption";
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
const EnvelopeGrid = lazy(() => import("../budgeting/EnvelopeGrid"));
const BillManager = lazy(() => import("../bills/BillManager"));
const SavingsGoals = lazy(() => import("../savings/SavingsGoals"));
const Dashboard = lazy(() => import("./Dashboard"));
const TransactionLedger = lazy(
  () => import("../transactions/TransactionLedger")
);
const ChartsAndAnalytics = lazy(
  () => import("../analytics/ChartsAndAnalytics")
);
const SupplementalAccounts = lazy(
  () => import("../accounts/SupplementalAccounts")
);

const Layout = () => {
  console.log("🚀 Layout component is running");

  const {
    isUnlocked,
    encryptionKey,
    currentUser,
    login,
    logout,
    updateUser,
    budgetId,
    salt,
  } = useAuth();

  console.log("🔍 Layout: Auth hook values", {
    isUnlocked,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!budgetId,
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [syncConflicts, setSyncConflicts] = useState(null);

  const handleSetup = async (userData, password) => {
    try {
      // Generate budgetId if not present
      const userDataWithId = {
        ...userData,
        budgetId:
          userData.budgetId ||
          `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const result = await login(password, userDataWithId);
      if (result.success) {
        console.log("✅ Setup completed successfully");
      } else {
        console.error("❌ Setup failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Setup error:", error);
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
      const decryptedData = await encryptionUtils.decrypt(
        encryptedData,
        encryptionKey,
        iv
      );

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

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
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
        throw new Error(
          "Invalid backup file: missing or invalid envelopes data"
        );
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
          localStorage.setItem(
            `envelopeBudgetData_backup_${timestamp}`,
            currentData
          );
          console.log("✅ Current data backed up");
        }
      } catch (backupError) {
        console.warn("⚠️ Failed to create backup:", backupError);
      }

      // Prepare the data for loading - ensure user information is preserved
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
        // Preserve current user info (critical for login)
        currentUser: currentUser,
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
      });

      // Encrypt and save the imported data
      console.log("🔐 Encrypting and saving imported data...");
      const encrypted = await encryptionUtils.encrypt(
        dataToLoad,
        encryptionKey
      );

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
      const { encryptedData: testEncrypted, iv: testIv } =
        JSON.parse(verification);
      const testDecrypted = await encryptionUtils.decrypt(
        testEncrypted,
        encryptionKey,
        testIv
      );

      console.log("✅ Data integrity verified:", {
        envelopes: testDecrypted.envelopes?.length || 0,
        bills: testDecrypted.bills?.length || 0,
        savingsGoals: testDecrypted.savingsGoals?.length || 0,
        hasCurrentUser: !!testDecrypted.currentUser,
        budgetId: testDecrypted.currentUser?.budgetId,
      });

      console.log("✅ Data imported and saved successfully!");

      // Show success message and reload
      alert(
        `Successfully imported data!\n\nEnvelopes: ${dataToLoad.envelopes.length}\nBills: ${dataToLoad.bills.length}\nTransactions: ${dataToLoad.allTransactions.length}\n\nPage will refresh to load the imported data.`
      );

      // Refresh the page to load the new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("❌ Import failed:", error);
      alert(
        `Import failed: ${error.message}\n\nPlease ensure you're uploading a valid VioletVault backup file.`
      );
    }

    // Clear the file input
    event.target.value = "";
  };

  const resetEncryptionAndStartFresh = async () => {
    if (
      confirm(
        "This will permanently delete all your budget data and cannot be undone. Continue?"
      )
    ) {
      try {
        localStorage.removeItem("envelopeBudgetData");
        logout();
        alert(
          "All data has been cleared. You can now set up a new budget with a fresh password."
        );
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

  // Debug info - show in UI for live site debugging
  const debugInfo = (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <div>
        <strong>Debug Info:</strong>
      </div>
      <div>✅ Layout rendered</div>
      <div>User: {currentUser?.userName || "None"}</div>
      <div>BudgetId: {budgetId ? "✅" : "❌"}</div>
      <div>EncryptionKey: {encryptionKey ? "✅" : "❌"}</div>
    </div>
  );

  console.log("🏗️ Layout: Rendering BudgetProvider with props", {
    hasEncryptionKey: !!encryptionKey,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!budgetId,
    hasSalt: !!salt,
    currentUser: currentUser,
  });

  return (
    <>
      {debugInfo}
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
          activeUsers={activeUsers}
          recentActivity={recentActivity}
          syncConflicts={syncConflicts}
          onResolveConflict={resolveConflict}
        />
      </BudgetProvider>
    </>
  );
};

const MainContent = ({
  currentUser,
  encryptionKey,
  budgetId,
  onUserChange,
  onExport,
  onImport,
  onLogout,
  onResetEncryption,
  activeUsers,
  recentActivity,
  syncConflicts,
  onResolveConflict,
}) => {
  const budget = useBudget();
  const [activeView, setActiveView] = useState("dashboard");
  const [debugInfo, setDebugInfo] = useState(null);

  // Debug panel for live site
  const forceLoadData = async () => {
    try {
      console.log("🔄 Force loading data from localStorage...");
      const savedData = localStorage.getItem("envelopeBudgetData");

      if (!savedData) {
        alert("No data found in localStorage");
        return;
      }

      if (!encryptionKey || !currentUser || !budgetId) {
        alert("Missing authentication data");
        return;
      }

      const { salt: savedSalt, encryptedData, iv } = JSON.parse(savedData);
      const decryptedData = await encryptionUtils.decrypt(
        encryptedData,
        encryptionKey,
        iv
      );

      console.log("✅ Force load decrypted data:", {
        envelopes: decryptedData.envelopes?.length || 0,
        bills: decryptedData.bills?.length || 0,
        savingsGoals: decryptedData.savingsGoals?.length || 0,
      });

      // Use the loadData action to force load the data
      budget.loadData(decryptedData);

      // Refresh the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      alert("Data loaded! Page will refresh...");
    } catch (error) {
      console.error("❌ Force load failed:", error);
      alert("Failed to load data: " + error.message);
    }
  };

  const budgetDebugInfo = (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <div>
        <strong>Budget Debug:</strong>
      </div>
      <div>Envelopes: {budget.envelopes?.length || 0}</div>
      <div>Bills: {budget.bills?.length || 0}</div>
      <div>Savings: {budget.savingsGoals?.length || 0}</div>
      <div>Unassigned: ${budget.unassignedCash || 0}</div>
      <div>Debug: {JSON.stringify(budget._debug || {})}</div>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <button
          onClick={forceLoadData}
          style={{
            padding: "8px 12px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Force Load Data
        </button>
        <button
          onClick={() => {
            const data = localStorage.getItem("envelopeBudgetData");
            if (data) {
              const parsed = JSON.parse(data);
              console.log("🔍 localStorage contents:", {
                hasEncryptedData: !!parsed.encryptedData,
                hasSalt: !!parsed.salt,
                hasIv: !!parsed.iv,
                encryptedDataLength: parsed.encryptedData?.length || 0,
              });
              alert(
                `localStorage data found:\nEncrypted: ${!!parsed.encryptedData}\nSalt: ${!!parsed.salt}\nIV: ${!!parsed.iv}\nData length: ${parsed.encryptedData?.length || 0}`
              );
            } else {
              console.log("❌ No data in localStorage");
              alert("No data found in localStorage");
            }
          }}
          style={{
            padding: "8px 12px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Check Storage
        </button>
        <button
          onClick={async () => {
            try {
              const data = localStorage.getItem("envelopeBudgetData");
              if (!data) {
                setDebugInfo("No localStorage data found");
                return;
              }

              const { encryptedData, iv } = JSON.parse(data);
              const decrypted = await encryptionUtils.decrypt(
                encryptedData,
                encryptionKey,
                iv
              );

              // Set debug info to display in UI
              setDebugInfo({
                success: true,
                topLevelKeys: Object.keys(decrypted),
                envelopesLength: decrypted.envelopes?.length || 0,
                billsLength: decrypted.bills?.length || 0,
                savingsGoalsLength: decrypted.savingsGoals?.length || 0,
                allTransactionsLength: decrypted.allTransactions?.length || 0,
                unassignedCash: decrypted.unassignedCash || 0,
                hasCurrentUser: !!decrypted.currentUser,
                userName: decrypted.currentUser?.userName || "None",
                firstEnvelope: decrypted.envelopes?.[0]
                  ? {
                      id: decrypted.envelopes[0].id,
                      name: decrypted.envelopes[0].name,
                      amount: decrypted.envelopes[0].amount,
                      currentBalance: decrypted.envelopes[0].currentBalance,
                    }
                  : null,
                firstBill: decrypted.bills?.[0]
                  ? {
                      id: decrypted.bills[0].id,
                      name: decrypted.bills[0].name,
                      amount: decrypted.bills[0].amount,
                    }
                  : null,
              });

              alert(
                `Manual decrypt worked!\nEnvelopes: ${decrypted.envelopes?.length || 0}\nBills: ${decrypted.bills?.length || 0}\nUser: ${decrypted.currentUser?.userName || "None"}\n\nCheck debug panel for details`
              );
            } catch (error) {
              setDebugInfo({
                success: false,
                error: error.message,
              });
              alert("Manual decrypt failed: " + error.message);
            }
          }}
          style={{
            padding: "8px 12px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Test Decrypt
        </button>
      </div>
    </div>
  );

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
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
  } = budget;

  // Calculate totals
  const totalEnvelopeBalance = envelopes.reduce(
    (sum, env) => sum + env.currentBalance,
    0
  );
  const totalSavingsBalance = savingsGoals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );
  const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

  // Debug display panel
  const debugDisplay = debugInfo && (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "11px",
        zIndex: 9999,
        maxWidth: "400px",
        maxHeight: "300px",
        overflow: "auto",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <strong>Decrypt Test Results:</strong>
        <button
          onClick={() => setDebugInfo(null)}
          style={{
            float: "right",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "3px",
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
      {typeof debugInfo === "string" ? (
        <div>{debugInfo}</div>
      ) : debugInfo.success ? (
        <div>
          <div>
            <strong>Top Level Keys:</strong> {debugInfo.topLevelKeys.join(", ")}
          </div>
          <div>
            <strong>Envelopes:</strong> {debugInfo.envelopesLength}
          </div>
          <div>
            <strong>Bills:</strong> {debugInfo.billsLength}
          </div>
          <div>
            <strong>Savings Goals:</strong> {debugInfo.savingsGoalsLength}
          </div>
          <div>
            <strong>Transactions:</strong> {debugInfo.allTransactionsLength}
          </div>
          <div>
            <strong>Unassigned Cash:</strong> ${debugInfo.unassignedCash}
          </div>
          <div>
            <strong>User:</strong> {debugInfo.userName}
          </div>
          {debugInfo.firstEnvelope && (
            <div>
              <strong>First Envelope:</strong> {debugInfo.firstEnvelope.name} -
              ${debugInfo.firstEnvelope.currentBalance}
            </div>
          )}
          {debugInfo.firstBill && (
            <div>
              <strong>First Bill:</strong> {debugInfo.firstBill.name} - $
              {debugInfo.firstBill.amount}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: "red" }}>
          <strong>Error:</strong> {debugInfo.error}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden">
      {budgetDebugInfo}
      {debugDisplay}
      <div className="max-w-7xl mx-auto relative z-10">
        <Header
          currentUser={currentUser}
          onUserChange={onUserChange}
          onExport={onExport}
          onImport={onImport}
          onLogout={onLogout}
          onResetEncryption={onResetEncryption}
        />

        {/* Team Activity & Sync */}
        <TeamActivitySync
          activeUsers={activeUsers}
          recentActivity={recentActivity}
          currentUser={currentUser}
          isOnline={isOnline}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          syncError={syncError}
        />

        {/* Navigation Tabs */}
        <div className="glassmorphism rounded-3xl mb-6 shadow-xl border border-white/20">
          <nav className="flex justify-center overflow-x-auto flex-wrap">
            <NavButton
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
              icon={CreditCard}
              label="Dashboard"
            />
            <NavButton
              active={activeView === "envelopes"}
              onClick={() => setActiveView("envelopes")}
              icon={Wallet}
              label="Envelopes"
            />
            <NavButton
              active={activeView === "savings"}
              onClick={() => setActiveView("savings")}
              icon={Target}
              label="Savings Goals"
            />
            <NavButton
              active={activeView === "supplemental"}
              onClick={() => setActiveView("supplemental")}
              icon={CreditCard}
              label="Supplemental"
            />
            <NavButton
              active={activeView === "paycheck"}
              onClick={() => setActiveView("paycheck")}
              icon={DollarSign}
              label="Add Paycheck"
            />
            <NavButton
              active={activeView === "bills"}
              onClick={() => setActiveView("bills")}
              icon={Calendar}
              label="Manage Bills"
            />
            <NavButton
              active={activeView === "transactions"}
              onClick={() => setActiveView("transactions")}
              icon={BookOpen}
              label="Transactions"
            />
            <NavButton
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
            icon={Wallet}
            label="Total Cash"
            value={totalCash}
            color="purple"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Unassigned Cash"
            value={unassignedCash}
            color="emerald"
          />
          <SummaryCard
            icon={Target}
            label="Savings Total"
            value={totalSavingsBalance}
            color="cyan"
          />
          <SummaryCard
            icon={DollarSign}
            label="Biweekly Need"
            value={biweeklyAllocation}
            color="amber"
          />
        </div>

        {/* Main Content */}
        <ViewRenderer
          activeView={activeView}
          budget={budget}
          currentUser={currentUser}
        />

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
          <p className={`text-2xl font-bold ${textColorClasses[color]}`}>
            ${value.toFixed(2)}
          </p>
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
    processPaycheck,
  } = budget;

  // Use the envelope system hook for envelope operations
  const envelopeSystem = useEnvelopeSystem();

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
      <EnvelopeGrid
        envelopes={envelopes}
        unassignedCash={unassignedCash}
        onSpend={envelopeSystem.spendFromEnvelope}
        onTransfer={envelopeSystem.transferBetweenEnvelopes}
        onUpdateUnassigned={setUnassignedCash}
      />
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
        bills={bills}
        onAddBill={addBill}
        onUpdateBill={updateBill}
        onDeleteBill={deleteBill}
      />
    ),
    transactions: (
      <TransactionLedger
        transactions={allTransactions}
        envelopes={envelopes}
        onAddTransaction={() => {}} // Will be implemented
        onUpdateTransaction={() => {}} // Will be implemented
        onDeleteTransaction={() => {}} // Will be implemented
        onBulkImport={() => {}} // Will be implemented
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
    <Suspense
      fallback={<LoadingSpinner message={`Loading ${activeView}...`} />}
    >
      {views[activeView]}
    </Suspense>
  );
};

export default Layout;
