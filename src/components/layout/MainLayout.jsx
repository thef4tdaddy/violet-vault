// src/components/layout/MainLayout.jsx
import React, { useState, useMemo, Suspense } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore";
import useBudgetData from "../../hooks/budgeting/useBudgetData";
import useAuthFlow from "../../hooks/auth/useAuthFlow";
import useDataManagement from "../../hooks/common/useDataManagement";
import usePasswordRotation from "../../hooks/auth/usePasswordRotation";
import useNetworkStatus from "../../hooks/common/useNetworkStatus";
import useFirebaseSync from "../../hooks/sync/useFirebaseSync";
import usePaydayPrediction from "../../hooks/budgeting/usePaydayPrediction";
import { useLocalOnlyMode } from "../../hooks/common/useLocalOnlyMode";
import useDataInitialization from "../../hooks/common/useDataInitialization";
import AuthGateway from "../auth/AuthGateway";
import Header from "../ui/Header";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ToastContainer } from "../ui/Toast";
import { useToastStore } from "../../stores/ui/toastStore";
import ViewRendererComponent from "./ViewRenderer";
import { cloudSyncService } from "../../services/cloudSyncService";
import logger from "../../utils/common/logger";
import { getVersionInfo } from "../../utils/common/version";
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
import NavigationTabs from "./NavigationTabs";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";
import SyncStatusIndicators from "../sync/SyncStatusIndicators";
import ConflictResolutionModal from "../sync/ConflictResolutionModal";
import SummaryCards from "./SummaryCards";
import BugReportButton from "../feedback/BugReportButton";
import LockScreen from "../security/LockScreen";
import SecuritySettings from "../settings/SecuritySettings";
import SettingsDashboard from "../settings/SettingsDashboard";
import { useSecurityManager } from "../../hooks/auth/useSecurityManager";
import OnboardingTutorial from "../onboarding/OnboardingTutorial";
import OnboardingProgress from "../onboarding/OnboardingProgress";
import { useOnboardingAutoComplete } from "../../hooks/common/useOnboardingAutoComplete";

// Heavy components now lazy loaded in ViewRenderer

const Layout = () => {
  logger.debug("Layout component is running");

  // Security manager hook
  const securityManager = useSecurityManager();

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

  // Local-only mode hooks
  const { isLocalOnlyMode, localOnlyUser } = useLocalOnlyMode();

  // Initialize data from Dexie to Zustand on app startup
  useDataInitialization(); // Return values not currently used

  const { exportData, importData, resetEncryptionAndStartFresh } = useDataManagement();

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

  const firebaseSync = useMemo(() => cloudSyncService, []);
  const [syncConflicts, setSyncConflicts] = useState(null);

  // Toast notifications from Zustand store
  const { toasts, removeToast } = useToastStore();

  logger.auth("Auth hook values", {
    isUnlocked,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!budgetId,
  });
  // Conflict resolution function
  const resolveConflict = () => {
    setSyncConflicts(null);
  };

  // Handle local-only mode or standard authentication
  const handleLocalOnlyReady = (localUser) => {
    logger.debug("Local-only mode ready with user", { userId: localUser.id });
    // Local-only mode doesn't need further setup, let MainLayout render
  };

  // Show authentication gateway if neither standard nor local-only mode is ready
  if (!isLocalOnlyMode && (!isUnlocked || !currentUser)) {
    return <AuthGateway onSetupComplete={handleSetup} onLocalOnlyReady={handleLocalOnlyReady} />;
  }

  // In local-only mode but user not ready yet
  if (isLocalOnlyMode && !localOnlyUser) {
    return <AuthGateway onSetupComplete={handleSetup} onLocalOnlyReady={handleLocalOnlyReady} />;
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
      {/* Security Lock Screen - renders on top of everything when locked */}
      <LockScreen />

      <MainContent
        currentUser={isLocalOnlyMode ? localOnlyUser : currentUser}
        encryptionKey={encryptionKey}
        budgetId={isLocalOnlyMode ? localOnlyUser?.budgetId : budgetId}
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
        isLocalOnlyMode={isLocalOnlyMode}
        securityManager={securityManager}
      />
      {showRotationModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Password Expired</h3>
            <p className="text-gray-700 mb-4">For security, please set a new password.</p>
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
  isLocalOnlyMode = false,
  securityManager,
}) => {
  const budget = useBudgetStore();
  const [activeView, setActiveView] = useState("dashboard");
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Custom hooks for MainContent business logic
  const { handleManualSync } = useFirebaseSync(firebaseSync, encryptionKey, budgetId, currentUser);

  // Auto-complete onboarding steps based on user actions
  useOnboardingAutoComplete();

  // Handle backup import through data management hook
  const handleImport = async (event) => {
    await onImport(event);
  };

  // Handle change password - delegate to parent component
  const handleChangePassword = onChangePassword;

  // Get TanStack Query data
  const {
    envelopes = [],
    // savingsGoals = [], // Not currently used
    // unassignedCash = 0, // Not currently used
    paycheckHistory: tanStackPaycheckHistory,
  } = useBudgetData();

  // Get UI state from Zustand
  const { isOnline, isSyncing } = budget;

  // Payday prediction notifications using TanStack Query data
  usePaydayPrediction(tanStackPaycheckHistory, !!currentUser);

  // Calculate totals - TODO: These are calculated but not currently used
  // const totalEnvelopeBalance = Array.isArray(envelopes)
  //   ? envelopes.reduce((sum, env) => sum + env.currentBalance, 0)
  //   : 0;
  // const totalSavingsBalance = Array.isArray(savingsGoals)
  //   ? savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  //   : 0;

  // Calculate total biweekly funding need across all envelope types
  const totalBiweeklyNeed = Array.isArray(envelopes)
    ? envelopes.reduce((sum, env) => {
        // Auto-classify envelope type if not set
        const envelopeType = env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

        let biweeklyNeed = 0;
        if (envelopeType === "bill" && env.biweeklyAllocation) {
          biweeklyNeed = Math.max(0, env.biweeklyAllocation - env.currentBalance);
        } else if (envelopeType === "variable" && env.monthlyBudget) {
          const biweeklyTarget = env.monthlyBudget / BIWEEKLY_MULTIPLIER;
          biweeklyNeed = Math.max(0, biweeklyTarget - env.currentBalance);
        } else if (envelopeType === "savings" && env.targetAmount) {
          const remainingToTarget = Math.max(0, env.targetAmount - env.currentBalance);
          biweeklyNeed = Math.min(remainingToTarget, env.biweeklyAllocation || 0);
        }

        return sum + biweeklyNeed;
      }, 0)
    : 0;

  return (
    <OnboardingTutorial setActiveView={setActiveView}>
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-50">
            <Header
              currentUser={currentUser}
              onUserChange={onUserChange}
              onUpdateProfile={onUpdateProfile}
              isLocalOnlyMode={isLocalOnlyMode}
              onShowSettings={() => setShowSettingsModal(true)}
            />
          </div>
          {rotationDue && (
            <div className="mb-4 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg p-4 text-center">
              Your password is over 90 days old. Please change it.
            </div>
          )}


          {/* Navigation Tabs */}
          <NavigationTabs activeView={activeView} onViewChange={setActiveView} />

          {/* Onboarding Progress */}
          <OnboardingProgress />

          {/* Summary Cards - Enhanced with clickable unassigned cash distribution */}
          <SummaryCards />

          {/* Main Content */}
          <ViewRendererComponent
            activeView={activeView}
            budget={budget}
            currentUser={currentUser}
            totalBiweeklyNeed={totalBiweeklyNeed}
            setActiveView={setActiveView}
          />

          <SyncStatusIndicators isOnline={isOnline} isSyncing={isSyncing} />
          <ConflictResolutionModal
            syncConflicts={syncConflicts}
            onResolveConflict={onResolveConflict}
            onDismiss={() => setSyncConflicts(null)}
          />

          {/* Bug Report Button */}
          <BugReportButton />

          {/* Version Footer */}
          <div className="mt-8 text-center">
            <div className="glassmorphism rounded-2xl p-4 max-w-md mx-auto border border-gray-800/20">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-purple-600">
                  {getVersionInfo().displayName}
                </span>{" "}
                v{getVersionInfo().version}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {getVersionInfo().buildDate}
              </p>
              <p className="text-xs text-gray-500 mt-1">Built with ❤️ for secure budgeting</p>
            </div>
          </div>
        </div>

        {/* Security Settings Modal */}
        <SecuritySettings
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
        />

        {/* Settings Dashboard Modal */}
        {showSettingsModal && (
          <SettingsDashboard
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onExport={onExport}
            onImport={handleImport}
            onLogout={onLogout}
            onResetEncryption={() => {
              // Reset the budget context data first
              budget.resetAllData();
              // Then call the original reset function (clears localStorage and calls logout)
              onResetEncryption();
            }}
            onSync={handleManualSync}
            onChangePassword={handleChangePassword}
            currentUser={currentUser}
            onUserChange={onUserChange}
            onUpdateProfile={onUpdateProfile}
            isLocalOnlyMode={isLocalOnlyMode}
            securityManager={securityManager}
          />
        )}
      </div>
    </OnboardingTutorial>
  );
};

// SummaryCard component removed - now using enhanced SummaryCards component with clickable functionality

export default Layout;
