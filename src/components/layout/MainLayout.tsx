import { useState, useEffect, useRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useLayoutData } from "@/hooks/layout";
import useDataManagement from "@/hooks/common/useDataManagement";
import usePasswordRotation from "@/hooks/auth/usePasswordRotation";
import useNetworkStatus from "@/hooks/common/useNetworkStatus";
import { useFirebaseSync } from "@/hooks/sync/useFirebaseSync";
import usePaydayPrediction from "@/hooks/budgeting/usePaydayPrediction";
import useDataInitialization from "@/hooks/common/useDataInitialization";
import AuthGateway from "../auth/AuthGateway";
import Header from "../ui/Header";
import { ToastContainer, type ToastItem } from "../ui/Toast";
import { useToastStore } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";
import { getVersionInfo } from "@/utils/common/version";
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
import { useOnboardingAutoComplete } from "@/hooks/common/useOnboardingAutoComplete";
import useOnboardingStore from "@/stores/ui/onboardingStore";
import { CorruptionRecoveryModal } from "../modals/CorruptionRecoveryModal";
import PasswordRotationModal from "../auth/PasswordRotationModal";
import LocalDataSecurityWarning from "../security/LocalDataSecurityWarning";
import AppRoutes from "./AppRoutes";
import { viewToPathMap } from "./routeConfig";
import BottomNavigationBar from "../mobile/BottomNavigationBar";

// ============================================================================
// Type Definitions
// ============================================================================

interface FirebaseSyncService {
  start: (config: unknown) => void;
  forceSync: () => Promise<unknown>;
  isRunning: boolean;
}

interface MainLayoutProps {
  firebaseSync: FirebaseSyncService;
}

interface MainContentProps {
  currentUser: unknown;
  auth: unknown;
  layoutData: unknown;
  _onExport: () => void;
  _onImport: (file: File) => Promise<void>;
  onLogout: () => void;
  onResetEncryption: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  firebaseSync: FirebaseSyncService;
  syncConflicts: unknown;
  onResolveConflict: () => void;
  setSyncConflicts: (conflicts: unknown) => void;
  rotationDue: boolean;
  isLocalOnlyMode: boolean;
  securityManager: unknown;
}

// ============================================================================
// Main Layout Component
// ============================================================================

const MainLayout = ({ firebaseSync }: MainLayoutProps): ReactNode => {
  const lastLogKeyRef = useRef<string | null>(null);

  // Navigation hooks
  const navigate = useNavigate();

  // Auth state
  const auth = useAuthManager();
  const { isUnlocked, user: currentUser, securityContext } = auth;
  const _legacy =
    ((auth as unknown as Record<string, unknown>)?._legacy as Record<string, unknown>) || {};
  const {
    isLocalOnlyMode: rawIsLocalOnlyMode = false,
    handleSetup,
    handleLogout: rawHandleLogout,
    handleChangePassword,
  } = _legacy;
  const _internal = (_legacy._internal as unknown as Record<string, unknown>) || {};
  const securityManager = _internal.securityManager || {};

  // Type guards for handler functions and values
  const isLocalOnlyMode = typeof rawIsLocalOnlyMode === "boolean" ? rawIsLocalOnlyMode : false;
  const handleLogout = (
    typeof rawHandleLogout === "function" ? rawHandleLogout : () => {}
  ) as () => void;
  const handleSetupFn = (typeof handleSetup === "function" ? handleSetup : () => {}) as () => void;
  const handleChangePasswordFn = (
    typeof handleChangePassword === "function" ? handleChangePassword : async () => {}
  ) as (old: string, newPwd: string) => Promise<void>;

  // Data hooks
  useDataInitialization();
  const layoutData = useLayoutData();
  const { exportData, importData, resetEncryptionAndStartFresh } = useDataManagement();

  // Password rotation
  const {
    rotationDue,
    showRotationModal,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleRotationPasswordChange,
  } = usePasswordRotation();

  // Network detection
  useNetworkStatus();

  // Sync conflicts state
  const [syncConflicts, setSyncConflicts] = useState(null);

  // Toast notifications
  const toastState = useToastStore((state) => ({
    toasts: (state as Record<string, unknown>)?.toasts,
    removeToast: (state as Record<string, unknown>)?.removeToast,
  }));
  const toasts = Array.isArray(toastState?.toasts) ? toastState.toasts : [];
  const removeToast =
    typeof toastState?.removeToast === "function"
      ? (toastState.removeToast as (id: string) => void)
      : () => {};

  // Log auth changes
  useEffect(() => {
    logger.auth("Auth hook values", {
      isUnlocked,
      hasCurrentUser: !!currentUser,
    });
  }, [isUnlocked, currentUser]);

  // Redirect to dashboard after login
  useEffect(() => {
    if (isUnlocked && currentUser) {
      navigate("/app/dashboard");
    }
  }, [isUnlocked, currentUser, navigate]);

  // Handle auth gateway
  const shouldShowGateway = (auth as unknown as Record<string, unknown>)?.shouldShowAuthGateway as
    | (() => boolean)
    | undefined;
  if (shouldShowGateway?.() ?? !isAuthenticated(auth)) {
    return <AuthGateway onSetupComplete={handleSetupFn} onLocalOnlyReady={() => {}} />;
  }

  // Log sync state
  const logKey = `${!!securityContext?.encryptionKey}-${!!currentUser}-${!!securityContext?.budgetId}`;
  if (lastLogKeyRef.current !== logKey) {
    logger.budgetSync("BudgetProvider state changed", {
      hasEncryptionKey: !!securityContext?.encryptionKey,
      hasCurrentUser: !!currentUser,
      hasBudgetId: !!securityContext?.budgetId,
    });
    lastLogKeyRef.current = logKey;
  }

  return (
    <>
      <LockScreen />
      <MainContent
        currentUser={currentUser}
        auth={auth}
        layoutData={layoutData}
        _onExport={exportData}
        _onImport={importData}
        onLogout={handleLogout}
        onChangePassword={handleChangePasswordFn}
        onResetEncryption={resetEncryptionAndStartFresh}
        syncConflicts={syncConflicts}
        onResolveConflict={() => setSyncConflicts(null)}
        setSyncConflicts={setSyncConflicts}
        firebaseSync={firebaseSync}
        rotationDue={rotationDue}
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
      <ToastContainer toasts={toasts as ToastItem[]} removeToast={removeToast} />
    </>
  );
};

// ============================================================================
// Main Content Component
// ============================================================================

const MainContent = ({
  currentUser,
  auth,
  layoutData,
  _onExport,
  _onImport,
  onLogout,
  onResetEncryption,
  onChangePassword,
  firebaseSync,
  syncConflicts,
  onResolveConflict,
  setSyncConflicts,
  rotationDue,
  isLocalOnlyMode,
  securityManager,
}: MainContentProps): ReactNode => {
  const resetAllData = useBudgetStore((state) => state.resetAllData);
  const navigate = useNavigate();

  // Onboarding state
  const onboardingState = useOnboardingStore((state) => ({
    isOnboarded: (state as Record<string, unknown>)?.isOnboarded,
  }));
  const isOnboarded =
    typeof onboardingState?.isOnboarded === "boolean" ? onboardingState.isOnboarded : false;

  // Extract layout data
  const budget = (layoutData as Record<string, unknown>)?.budget;
  const totalBiweeklyNeed = (layoutData as Record<string, unknown>)?.totalBiweeklyNeed;
  const paycheckHistory = (layoutData as Record<string, unknown>)?.paycheckHistory;
  const securityContext = (auth as Record<string, unknown>)?.securityContext;

  // Navigation helper
  const setActiveView = (view: string): void => {
    const path = viewToPathMap[view] || "/";
    navigate(path);
  };

  // Modal states
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialSection] = useState("general");
  const [showCorruptionModal, setShowCorruptionModal] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  // Security warning effect
  const isUnlockedAuth = (auth as Record<string, unknown>)?.isUnlocked;

  useEffect(() => {
    if (isUnlockedAuth && currentUser && isOnboarded) {
      // eslint-disable-next-line no-restricted-syntax
      const hasAcknowledged = localStorage.getItem("localDataSecurityAcknowledged");
      if (!hasAcknowledged) {
        const timer = setTimeout(() => {
          setShowSecurityWarning(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isUnlockedAuth, currentUser, isOnboarded]);

  // Corruption detection effect
  useEffect(() => {
    const handleCorruptionDetected = (event: Event) => {
      const customEvent = event as CustomEvent;
      logger.warn("🚨 Corruption modal triggered by sync service", customEvent.detail);
      setShowCorruptionModal(true);
    };

    window.addEventListener("syncCorruptionDetected", handleCorruptionDetected);
    return () => {
      window.removeEventListener("syncCorruptionDetected", handleCorruptionDetected);
    };
  }, []);

  // Firebase sync - use config object, not 4 separate args
  const userForSync = currentUser
    ? {
        uid: ((currentUser as Record<string, unknown>)?.uid as string) || "unknown",
        email: ((currentUser as Record<string, unknown>)?.email as string) || undefined,
      }
    : null;
  const { handleManualSync } = useFirebaseSync({
    firebaseSync,
    encryptionKey: (securityContext as Record<string, unknown>)?.encryptionKey as CryptoKey | null,
    budgetId: (securityContext as Record<string, unknown>)?.budgetId as string | null,
    currentUser: userForSync,
  });

  // Auto-complete onboarding
  useOnboardingAutoComplete();

  // UI state
  const isOnline = useBudgetStore((state) => state.isOnline);
  const isSyncing = useBudgetStore((state) => state.isSyncing);

  // Payday prediction
  usePaydayPrediction(paycheckHistory, !!currentUser);

  return (
    <OnboardingTutorial>
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-50">
            <Header />
          </div>

          {rotationDue && (
            <div className="mb-4 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg p-4 text-center">
              Your password is over 90 days old. Please change it.
            </div>
          )}

          <NavigationTabs />
          <OnboardingProgress />
          <SummaryCards />

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

          <BugReportButton />
          <BottomNavigationBar />

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

        <SecuritySettings
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
        />

        {showSettingsModal && (
          <SettingsDashboard
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            initialSection={settingsInitialSection}
            onExport={_onExport}
            onImport={_onImport}
            onLogout={onLogout}
            onResetEncryption={() => {
              resetAllData();
              onResetEncryption();
            }}
            onSync={handleManualSync}
            onChangePassword={onChangePassword}
            currentUser={currentUser}
            isLocalOnlyMode={isLocalOnlyMode}
            securityManager={securityManager}
          />
        )}

        <CorruptionRecoveryModal
          isOpen={showCorruptionModal}
          onClose={() => setShowCorruptionModal(false)}
        />

        {showSecurityWarning && (
          <LocalDataSecurityWarning
            onClose={() => setShowSecurityWarning(false)}
            onAcknowledge={() => setShowSecurityWarning(false)}
          />
        )}
      </div>
    </OnboardingTutorial>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function isAuthenticated(auth: unknown): boolean {
  return (auth as Record<string, unknown>)?.isAuthenticated === true;
}

export default MainLayout;
