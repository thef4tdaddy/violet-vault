// src/components/layout/MainLayout.jsx
import React, { useState, useMemo, Suspense } from "react";
import { useBudgetStore } from "../../stores/budgetStore";
import useAuthFlow from "../../hooks/useAuthFlow";
import useDataManagement from "../../hooks/useDataManagement";
import usePasswordRotation from "../../hooks/usePasswordRotation";
import useNetworkStatus from "../../hooks/useNetworkStatus";
import useFirebaseSync from "../../hooks/useFirebaseSync";
import usePaydayPrediction from "../../hooks/usePaydayPrediction";
import UserSetup from "../auth/UserSetup";
import Header from "../ui/Header";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ToastContainer } from "../ui/Toast";
import useToast from "../../hooks/useToast";
import ViewRendererComponent from "./ViewRenderer";
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
  BookOpen,
  BarChart3,
} from "lucide-react";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";
import SyncStatusIndicators from "../sync/SyncStatusIndicators";
import ConflictResolutionModal from "../sync/ConflictResolutionModal";
import SummaryCards from "./SummaryCards";

// Heavy components now lazy loaded in ViewRenderer

const Layout = () => {
  logger.debug("Layout component is running");

  // Custom hooks for business logic
  const {
    isUnlocked,
    encryptionKey,
    currentUser,
    budgetId,
    salt,
    handleSetup,
    handleLogout,
    handleChangePassword,
    handleUpdateProfile,
  } = useAuthFlow();

  const { exportData, importData, resetEncryptionAndStartFresh } =
    useDataManagement();

  const {
    rotationDue,
    showRotationModal,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleRotationPasswordChange,
  } = usePasswordRotation();

  // Network status detection
  useNetworkStatus();

  const firebaseSync = useMemo(() => new FirebaseSync(), []);
  const [syncConflicts, setSyncConflicts] = useState(null);

  // Toast notifications
  const { toasts, removeToast } = useToast();

  logger.auth("Auth hook values", {
    isUnlocked,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!budgetId,
  });
  // Conflict resolution function
  const resolveConflict = () => {
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
      <MainContent
          currentUser={currentUser}
          encryptionKey={encryptionKey}
          budgetId={budgetId}
          onUserChange={handleLogout}
          onExport={exportData}
          onImport={importData}
          onLogout={handleLogout}
          onChangePassword={handleChangePassword}
          onResetEncryption={resetEncryptionAndStartFresh}
          syncConflicts={syncConflicts}
          onResolveConflict={resolveConflict}
          setSyncConflicts={setSyncConflicts}
          firebaseSync={firebaseSync}
          rotationDue={rotationDue}
          onUpdateProfile={handleUpdateProfile}
        />
      {showRotationModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Password Expired</h3>
            <p className="text-gray-700 mb-4">
              For security, please set a new password.
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRotationPasswordChange}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

const MainContent = ({
  currentUser,
  onUserChange,
  onExport,
  onImport,
  onLogout,
  onResetEncryption,
  onChangePassword,
  encryptionKey,
  budgetId,
  firebaseSync,
  syncConflicts,
  onResolveConflict,
  setSyncConflicts,
  rotationDue,
  onUpdateProfile,
}) => {
  const budget = useBudgetStore();
  const [activeView, setActiveView] = useState("dashboard");

  // Custom hooks for MainContent business logic
  const { handleManualSync } = useFirebaseSync(
    firebaseSync,
    encryptionKey,
    budgetId,
    currentUser,
  );

  // Handle import by saving data then loading into context
  const handleImport = async (event) => {
    const data = await onImport(event);
    if (data) {
      budget.loadData(data);
    }
  };

  // Handle change password - delegate to parent component
  const handleChangePassword = onChangePassword;

  const {
    envelopes,
    savingsGoals,
    unassignedCash,
    paycheckHistory,
    isOnline,
    isSyncing,
  } = budget;

  // Payday prediction notifications (after destructuring)
  usePaydayPrediction(paycheckHistory, !!currentUser);

  // Calculate totals
  const totalEnvelopeBalance = Array.isArray(envelopes)
    ? envelopes.reduce((sum, env) => sum + env.currentBalance, 0)
    : 0;
  const totalSavingsBalance = Array.isArray(savingsGoals)
    ? savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    : 0;
  const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

  // Calculate total biweekly funding need across all envelope types
  const totalBiweeklyNeed = Array.isArray(envelopes)
    ? envelopes.reduce((sum, env) => {
        // Auto-classify envelope type if not set
        const envelopeType =
          env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

        let biweeklyNeed = 0;
        if (envelopeType === "bill" && env.biweeklyAllocation) {
          biweeklyNeed = Math.max(
            0,
            env.biweeklyAllocation - env.currentBalance,
          );
        } else if (envelopeType === "variable" && env.monthlyBudget) {
          const biweeklyTarget = env.monthlyBudget / BIWEEKLY_MULTIPLIER;
          biweeklyNeed = Math.max(0, biweeklyTarget - env.currentBalance);
        } else if (envelopeType === "savings" && env.targetAmount) {
          const remainingToTarget = Math.max(
            0,
            env.targetAmount - env.currentBalance,
          );
          biweeklyNeed = Math.min(
            remainingToTarget,
            env.biweeklyAllocation || 0,
          );
        }

        return sum + biweeklyNeed;
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden pb-24 sm:pb-0">
      <div className="max-w-7xl mx-auto relative">
        <div className="relative z-50">
          <Header
            currentUser={currentUser}
            onUserChange={onUserChange}
            onExport={onExport}
            onImport={handleImport}
            onLogout={onLogout}
            onChangePassword={handleChangePassword}
            onResetEncryption={() => {
              // Reset the budget context data first
              budget.resetAllData();
              // Then call the original reset function (clears localStorage and calls logout)
              onResetEncryption();
            }}
            onSync={handleManualSync}
            onUpdateProfile={onUpdateProfile}
          />
        </div>
        {rotationDue && (
          <div className="mb-4 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg p-4 text-center">
            Your password is over 90 days old. Please change it.
          </div>
        )}

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
        <div className="glassmorphism rounded-t-3xl sm:rounded-3xl mb-6 sm:shadow-xl border border-white/20 fixed bottom-0 left-0 right-0 sm:static z-40">
          <nav className="flex justify-around overflow-x-auto">
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

        {/* Summary Cards - Enhanced with clickable unassigned cash distribution */}
        <SummaryCards
          totalCash={totalCash}
          unassignedCash={unassignedCash}
          totalSavingsBalance={totalSavingsBalance}
          biweeklyAllocation={totalBiweeklyNeed}
        />

        {/* Main Content */}
        <ViewRendererComponent
          activeView={activeView}
          budget={budget}
          currentUser={currentUser}
        />

        <SyncStatusIndicators isOnline={isOnline} isSyncing={isSyncing} />
        <ConflictResolutionModal
          syncConflicts={syncConflicts}
          onResolveConflict={onResolveConflict}
          onDismiss={() => setSyncConflicts(null)}
        />

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
    className={`flex-1 flex flex-col items-center sm:flex-row sm:px-6 px-2 py-3 text-xs sm:text-sm font-semibold border-t-2 sm:border-b-2 transition-all ${
      active
        ? "border-purple-500 text-purple-600 bg-purple-50/50"
        : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
    }`}
  >
    <Icon className="h-5 w-5 mb-1 sm:mb-0 sm:mr-3" />
    <span>{label}</span>
  </button>
);

// SummaryCard component removed - now using enhanced SummaryCards component with clickable functionality

export default Layout;
