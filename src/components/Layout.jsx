// src/components/Layout.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BudgetProvider, useBudget } from "../contexts/BudgetContext";
import UserSetup from "./UserSetup";
import Header from "./Header";
import TeamActivitySync from "./TeamActivitySync";
import LoadingSpinner from "./LoadingSpinner";
import useEnvelopeSystem from "./EnvelopeSystem";
import { encryptionUtils } from "../utils/encryption";
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
const PaycheckProcessor = lazy(() => import("./PaycheckProcessor"));
const EnvelopeGrid = lazy(() => import("./EnvelopeGrid"));
const BillManager = lazy(() => import("./BillManager"));
const SavingsGoals = lazy(() => import("./SavingsGoals"));
const Dashboard = lazy(() => import("./Dashboard"));
const TransactionLedger = lazy(() => import("./TransactionLedger"));
const ChartsAndAnalytics = lazy(() => import("./ChartsAndAnalytics"));
const SupplementalAccounts = lazy(() => import("./SupplementalAccounts"));

const Layout = () => {
  const {
    isUnlocked,
    encryptionKey,
    currentUser,
    login,
    logout,
    updateUser,
    budgetId,
  } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [syncConflicts, setSyncConflicts] = useState(null);

  const handleSetup = async (userData, password) => {
    try {
      const result = await login(password, userData);
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
    // Implementation would use context data
    console.log("Export data functionality");
  };

  const importData = async (file) => {
    // Implementation would update context data
    console.log("Import data functionality");
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

  return (
    <BudgetProvider
      encryptionKey={encryptionKey}
      currentUser={currentUser}
      budgetId={budgetId}
    >
      <MainContent
        currentUser={currentUser}
        onUserChange={() => updateUser(null)}
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
  );
};

const MainContent = ({
  currentUser,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden">
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
