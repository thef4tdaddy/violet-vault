// src/components/layout/MainLayout.jsx
import React, { useState, Suspense, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useAuthenticationManager } from "../../hooks/auth";
import { useLayoutData } from "../../hooks/layout";
import useDataManagement from "../../hooks/common/useDataManagement";
import usePasswordRotation from "../../hooks/auth/usePasswordRotation";
import useNetworkStatus from "../../hooks/common/useNetworkStatus";
import useFirebaseSync from "../../hooks/sync/useFirebaseSync";
import usePaydayPrediction from "../../hooks/budgeting/usePaydayPrediction";
import useDataInitialization from "../../hooks/common/useDataInitialization";
import AuthGateway from "../auth/AuthGateway";
import Header from "../ui/Header";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ToastContainer } from "../ui/Toast";
import { useToastStore } from "../../stores/ui/toastStore";
import ViewRendererComponent from "./ViewRenderer";
import logger from "../../utils/common/logger";
import { getVersionInfo } from "../../utils/common/version";
import NavigationTabs from "./NavigationTabs";
import SyncStatusIndicators from "../sync/SyncStatusIndicators";
import ConflictResolutionModal from "../sync/ConflictResolutionModal";
import SummaryCards from "./SummaryCards";
import BugReportButton from "../feedback/BugReportButton";
import LockScreen from "../security/LockScreen";
import SecuritySettings from "../settings/SecuritySettings";
import SettingsDashboard from "../settings/SettingsDashboard";
import OnboardingTutorial from "../onboarding/OnboardingTutorial";
import OnboardingProgress from "../onboarding/OnboardingProgress";
import { useOnboardingAutoComplete } from "../../hooks/common/useOnboardingAutoComplete";
import { CorruptionRecoveryModal } from "../modals/CorruptionRecoveryModal";
import PasswordRotationModal from "../auth/PasswordRotationModal";
import AppRoutes from "./AppRoutes";
import { pathToViewMap, viewToPathMap } from "./routeConfig";

// Heavy components now lazy loaded in ViewRenderer

const Layout = ({ firebaseSync }) => {
  // Removed noisy debug log - layout renders constantly

  // Consolidated authentication manager
  const auth = useAuthenticationManager();
  const {
    isUnlocked,
    currentUser,
    isLocalOnlyMode,
    _localOnlyUser,
    securityContext,
    handleSetup,
    handleLogout,
    handleChangePassword,
    handleUpdateProfile,
    shouldShowAuthGateway,
    _internal: { securityManager },
  } = auth;

  // Initialize data from Dexie to Zustand on app startup
  useDataInitialization(); // Return values not currently used

  // Use centralized layout data hook
  const layoutData = useLayoutData();

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

  const [syncConflicts, setSyncConflicts] = useState(null);

  // Toast notifications from Zustand store
  const { toasts, removeToast } = useToastStore();

  // Log auth state changes only (not on every render)
  useEffect(() => {
    logger.auth("Auth hook values", {
      isUnlocked,
      hasCurrentUser: !!currentUser,
      hasBudgetId: !!securityContext.budgetId,
    });
  }, [isUnlocked, currentUser, securityContext.budgetId]);

  // Conflict resolution function
  const resolveConflict = () => {
    setSyncConflicts(null);
  };

  // Handle local-only mode or standard authentication
  const handleLocalOnlyReady = (localUser) => {
    logger.debug("Local-only mode ready with user", { userId: localUser.id });
    // Local-only mode doesn't need further setup, let MainLayout render
  };

  // Use centralized auth gateway check
  if (shouldShowAuthGateway()) {
    return (
      <AuthGateway
        onSetupComplete={handleSetup}
        onLocalOnlyReady={handleLocalOnlyReady}
      />
    );
  }

  logger.budgetSync("Rendering BudgetProvider with props", {
    hasEncryptionKey: !!securityContext.encryptionKey,
    hasCurrentUser: !!currentUser,
    hasBudgetId: !!securityContext.budgetId,
    hasSalt: !!securityContext.salt,
    currentUser: currentUser,
  });
  logger.budgetSync("budgetId value", { budgetId: securityContext.budgetId });

  return (
    <>
      {/* Security Lock Screen - renders on top of everything when locked */}
      <LockScreen />

      <MainContent
        currentUser={currentUser}
        auth={auth}
        layoutData={layoutData}
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
      <PasswordRotationModal
        isOpen={showRotationModal}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        onSubmit={handleRotationPasswordChange}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

const MainContent = ({
  currentUser,
  auth,
  layoutData,
  onUserChange,
  onExport,
  onImport,
  onLogout,
  onResetEncryption,
  onChangePassword,
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
  // Get current route for view determination
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from shared hooks
  const { securityContext } = auth;
  const { totalBiweeklyNeed, paycheckHistory: tanStackPaycheckHistory } =
    layoutData;

  // Helper function to get current view from URL
  const getCurrentViewFromPath = (pathname) => {
    return pathToViewMap[pathname] || "dashboard";
  };

  // Not currently used but kept for future compatibility
  const _activeView = getCurrentViewFromPath(location.pathname);

  // Helper function for components that still need programmatic navigation
  const setActiveView = (view) => {
    const path = viewToPathMap[view] || "/";
    navigate(path);
  };
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] =
    useState("general");
  const [showCorruptionModal, setShowCorruptionModal] = useState(false);

  // Functions to open settings to specific sections
  const openSettings = (section = "general") => {
    setSettingsInitialSection(section);
    setShowSettingsModal(true);
  };

  const openGeneralSettings = () => openSettings("general");
  const openDataSettings = () => openSettings("data");

  // Listen for corruption detection events
  useEffect(() => {
    const handleCorruptionDetected = (event) => {
      logger.warn(
        "🚨 Corruption modal triggered by sync service",
        event.detail,
      );
      setShowCorruptionModal(true);
    };

    window.addEventListener("syncCorruptionDetected", handleCorruptionDetected);

    return () => {
      window.removeEventListener(
        "syncCorruptionDetected",
        handleCorruptionDetected,
      );
    };
  }, []);

  // Custom hooks for MainContent business logic
  const { handleManualSync } = useFirebaseSync(
    firebaseSync,
    securityContext.encryptionKey,
    securityContext.budgetId,
    currentUser,
  );

  // Auto-complete onboarding steps based on user actions
  useOnboardingAutoComplete();

  // Handle backup import through data management hook
  const handleImport = async (event) => {
    await onImport(event);
  };

  // Handle change password - delegate to parent component
  const handleChangePassword = onChangePassword;

  // Get UI state from Zustand
  const { isOnline, isSyncing } = budget;

  // Payday prediction notifications using TanStack Query data
  usePaydayPrediction(tanStackPaycheckHistory, !!currentUser);

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
              onShowSettings={openGeneralSettings}
              onShowDataSettings={openDataSettings}
            />
          </div>
          {rotationDue && (
            <div className="mb-4 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg p-4 text-center">
              Your password is over 90 days old. Please change it.
            </div>
          )}

          {/* Navigation Tabs */}
          <NavigationTabs />

          {/* Onboarding Progress */}
          <OnboardingProgress />

          {/* Summary Cards - Enhanced with clickable unassigned cash distribution */}
          <SummaryCards />

          {/* Main Content - Using extracted AppRoutes component */}
          <AppRoutes
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
              <p className="text-xs text-gray-500 mt-1">
                Built with ❤️ for secure budgeting
              </p>
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
            initialSection={settingsInitialSection}
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

        {/* Corruption Recovery Modal */}
        <CorruptionRecoveryModal
          isOpen={showCorruptionModal}
          onClose={() => setShowCorruptionModal(false)}
        />
      </div>
    </OnboardingTutorial>
  );
};

// SummaryCard component removed - now using enhanced SummaryCards component with clickable functionality

export default Layout;
