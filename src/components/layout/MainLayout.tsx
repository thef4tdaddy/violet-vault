import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useLayoutData } from "@/hooks/layout";
import useDataManagement from "@/hooks/common/useDataManagement";
import usePasswordRotation from "@/hooks/auth/usePasswordRotation";
import useNetworkStatus from "@/hooks/common/useNetworkStatus";
import { useFirebaseSync } from "@/hooks/sync/useFirebaseSync";
import usePaydayPrediction from "@/hooks/budgeting/usePaydayPrediction";
import useDataInitialization from "@/hooks/common/useDataInitialization";
import { useMainLayoutHandlers } from "@/hooks/layout/useMainLayoutHandlers";
import { useSecurityWarning } from "@/hooks/layout/useSecurityWarning";
import { useCorruptionDetection } from "@/hooks/layout/useCorruptionDetection";
import { useMainContentModals } from "@/hooks/layout/useMainContentModals";
import AuthGateway from "@/components/auth/AuthGateway";
import Header from "@/components/ui/Header";
import { ToastContainer, type ToastItem } from "@/components/ui/Toast";
import { useToastStore } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";
import { getVersionInfo } from "@/utils/common/version";
import NavigationTabs from "./NavigationTabs";
import SyncStatusIndicators from "@/components/sync/SyncStatusIndicators";
import ConflictResolutionModal from "@/components/sync/ConflictResolutionModal";
import SummaryCards from "./SummaryCards";
import BugReportButton from "@/components/feedback/BugReportButton";
import LockScreen from "@/components/security/LockScreen";
import SecuritySettings from "@/components/settings/SecuritySettings";
import SettingsDashboard from "@/components/settings/SettingsDashboard";
import OnboardingTutorial from "@/components/onboarding/OnboardingTutorial";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import { useOnboardingAutoComplete } from "@/hooks/common/useOnboardingAutoComplete";
import useOnboardingStore from "@/stores/ui/onboardingStore";
import { CorruptionRecoveryModal } from "@/components/modals/CorruptionRecoveryModal";
import PasswordRotationModal from "@/components/auth/PasswordRotationModal";
import LocalDataSecurityWarning from "@/components/security/LocalDataSecurityWarning";
import AppRoutes from "./AppRoutes";
import { viewToPathMap } from "./routeConfig";
import BottomNavigationBar from "@/components/mobile/BottomNavigationBar";
import { GlobalPullToRefreshProvider } from "@/components/mobile/GlobalPullToRefresh";
import {
  getUserForSync,
  extractLayoutData,
  extractAuthData,
  hasSecurityAcknowledgement,
} from "./MainLayoutHelpers";

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
  _onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<
    | {
        success: boolean;
        imported: {
          envelopes: number;
          bills: number;
          transactions: number;
          savingsGoals: number;
          debts: number;
          paycheckHistory: number;
          auditLog: number;
        };
      }
    | undefined
  >;
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
  const location = useLocation();

  // Auth state
  const auth = useAuthManager();
  const { isUnlocked, user: currentUser, securityContext } = auth;

  // Extract handlers and security context
  const { isLocalOnlyMode, handleLogout, handleSetup, handleChangePassword, securityManager } =
    useMainLayoutHandlers(auth);

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
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  // Log auth changes
  useEffect(() => {
    logger.auth("Auth hook values", {
      isUnlocked,
      hasCurrentUser: !!currentUser,
    });
  }, [isUnlocked, currentUser]);

  // Redirect to dashboard only if user just logged in and isn't on an app route yet
  useEffect(() => {
    if (isUnlocked && currentUser && !location.pathname.startsWith("/app")) {
      navigate("/app/dashboard");
    }
  }, [isUnlocked, currentUser, location.pathname, navigate]);

  // Log sync state changes
  const logKey = `${!!securityContext?.encryptionKey}-${!!currentUser}-${!!securityContext?.budgetId}`;
  useEffect(() => {
    if (lastLogKeyRef.current !== logKey) {
      logger.budgetSync("BudgetProvider state changed", {
        hasEncryptionKey: !!securityContext?.encryptionKey,
        hasCurrentUser: !!currentUser,
        hasBudgetId: !!securityContext?.budgetId,
      });
      lastLogKeyRef.current = logKey;
    }
  }, [logKey, securityContext?.encryptionKey, currentUser, securityContext?.budgetId]);

  // Handle auth gateway
  const shouldShowGateway = (auth as unknown as Record<string, unknown>)?.shouldShowAuthGateway as
    | (() => boolean)
    | undefined;
  if (shouldShowGateway?.() ?? !isAuthenticated(auth)) {
    return <AuthGateway onSetupComplete={handleSetup} onLocalOnlyReady={() => {}} />;
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
        onChangePassword={handleChangePassword}
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
  const resetAllData = useBudgetStore(
    (state: Record<string, unknown>) =>
      (state as Record<string, unknown>).resetAllData as () => void
  );
  const navigate = useNavigate();

  // Onboarding state
  const isOnboarded = useOnboardingStore((state) => state.isOnboarded);

  // Extract layout data using helper
  const { budget, totalBiweeklyNeed, paycheckHistory } = extractLayoutData(layoutData);

  // Extract auth data using helper
  const { securityContext, isUnlocked: isUnlockedAuth } = extractAuthData(auth);

  // Navigation helper
  const setActiveView = (view: string): void => {
    const path = viewToPathMap[view] || "/";
    navigate(path);
  };

  // Modal state management
  const modals = useMainContentModals();

  // Security warning management using helper
  const { showSecurityWarning, setShowSecurityWarning } = useSecurityWarning({
    isUnlocked: isUnlockedAuth,
    currentUser,
    isOnboarded,
    hasAcknowledged: hasSecurityAcknowledgement(),
  });

  // Corruption detection management
  const { showCorruptionModal, setShowCorruptionModal } = useCorruptionDetection();

  // Firebase sync - use helper to extract user
  const userForSync = getUserForSync(currentUser);
  const { handleManualSync } = useFirebaseSync({
    firebaseSync,
    encryptionKey: (securityContext as Record<string, unknown>)?.encryptionKey as CryptoKey | null,
    budgetId: (securityContext as Record<string, unknown>)?.budgetId as string | null,
    currentUser: userForSync,
  });

  // Auto-complete onboarding
  useOnboardingAutoComplete();

  // UI state
  const isOnline = useBudgetStore(
    (state: Record<string, unknown>) => (state as Record<string, unknown>).isOnline as boolean
  );
  const isSyncing = useBudgetStore(
    (state: Record<string, unknown>) => (state as Record<string, unknown>).isSyncing as boolean
  );

  // Payday prediction
  usePaydayPrediction(paycheckHistory, !!currentUser);

  return (
    <GlobalPullToRefreshProvider>
      <OnboardingTutorial>
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-4 sm:px-6 md:px-8 overflow-x-hidden pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-10">
            <Header
              currentUser={currentUser}
              onUserChange={() => {}}
              onUpdateProfile={() => {}}
              isLocalOnlyMode={isLocalOnlyMode}
              onShowSettings={() => modals.settings.setOpen(true)}
              onShowDataSettings={() => modals.security.setOpen(true)}
            />
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

          <BottomNavigationBar />
          
          {/* Bug Report Button - Floating (separate from main content flow) */}
          {!showSecurityWarning && <BugReportButton />}

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
          isOpen={modals.security.isOpen}
          onClose={() => modals.security.setOpen(false)}
        />

        {modals.settings.isOpen && (
          <SettingsDashboard
            isOpen={modals.settings.isOpen}
            onClose={() => modals.settings.setOpen(false)}
            initialSection={modals.settings.initialSection}
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
            onUpdateProfile={async (updates) => {
              // Update profile through auth manager
              (auth as { updateUser: (updates: unknown) => void }).updateUser(updates);
            }}
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
    </GlobalPullToRefreshProvider>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function isAuthenticated(auth: unknown): boolean {
  return (auth as Record<string, unknown>)?.isAuthenticated === true;
}

export default MainLayout;
