import React, { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLayoutData } from "@/hooks/platform/ux/layout/useLayoutData";
import useDataManagement from "@/hooks/platform/data/useDataManagement";
import usePasswordRotation from "@/hooks/auth/usePasswordRotation";
import useNetworkStatus from "@/hooks/platform/common/useNetworkStatus";
import { useFirebaseSync } from "@/hooks/platform/sync/useFirebaseSync";
import usePaydayPrediction from "@/hooks/budgeting/transactions/scheduled/income/usePaydayPrediction";
import useDataInitialization from "@/hooks/platform/data/useDataInitialization";
import { useLayoutLifecycle } from "@/hooks/platform/ux/layout/useLayoutLifecycle";
import { useLayoutModals } from "@/hooks/platform/ux/layout/useLayoutModals";
import AuthGateway from "@/components/auth/AuthGateway";
import Header from "@/components/ui/Header";
import { ToastContainer, type ToastItem } from "@/components/ui/Toast";
import { useToastStore } from "@/stores/ui/toastStore";
import logger from "@/utils/core/common/logger";
import { getVersionInfo } from "@/utils/core/common/version";
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
import { useOnboardingAutoComplete } from "@/hooks/platform/common/useOnboardingAutoComplete";
import useOnboardingStore from "@/stores/ui/onboardingStore";
import { CorruptionRecoveryModal } from "@/components/modals/CorruptionRecoveryModal";
import PasswordRotationModal from "@/components/auth/PasswordRotationModal";
import LocalDataSecurityWarning from "@/components/security/LocalDataSecurityWarning";
import AppRoutes from "./AppRoutes";
import { viewToPathMap } from "./routeConfig";
import BottomNavigationBar from "@/components/mobile/BottomNavigationBar";
import { GlobalPullToRefreshProvider } from "@/components/mobile/GlobalPullToRefresh";
import type { UserData } from "@/types/auth";
import {
  getUserForSync,
  extractLayoutData,
  extractAuthData,
  hasSecurityAcknowledgement,
} from "./MainLayoutHelpers";

// ============================================================================
// Type Definitions
// ============================================================================

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

type AuthHookType = ReturnType<typeof useAuth>;
type LayoutDataType = ReturnType<typeof useLayoutData>;
type ExtractUserType = AuthHookType["user"];

interface MainContentProps {
  currentUser: ExtractUserType;
  auth: AuthHookType;
  layoutData: LayoutDataType;
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
  securityManager: AuthHookType["securityManager"];
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
  const auth = useAuth();
  const { isUnlocked, user: currentUser, securityContext } = auth;

  // Extract handlers and security context
  // Extract handlers and security context
  const isLocalOnlyMode = !!auth?.user?.isLocalOnly;
  const securityManager = auth?.securityManager;

  // Wrap async handlers
  const handleSetup = async (password: string, userData?: UserData) => {
    await auth.login({ password, userData });
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await auth.changePassword({ oldPassword, newPassword });
  };

  const handleLogout = auth?.logout || (() => {});

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
    dismissRotation,
  } = usePasswordRotation();

  // Network detection
  useNetworkStatus();

  // Sync conflicts state
  const [syncConflicts, setSyncConflicts] = useState<unknown>(null);

  // Toast notifications
  const toasts = useToastStore((state) => state.toasts);
  const removeToastById = useToastStore((state) => state.removeToast);
  const removeToast = useCallback(
    (id: string | number) => removeToastById(typeof id === "string" ? parseInt(id, 10) : id),
    [removeToastById]
  );

  // Consolidated logging for auth and sync state
  const logKey = `${isUnlocked}-${!!currentUser}-${!!securityContext?.budgetId}-${!!securityContext?.encryptionKey}`;
  useEffect(() => {
    if (lastLogKeyRef.current === logKey) return;

    logger.auth("Auth state change", {
      isUnlocked,
      hasCurrentUser: !!currentUser,
    });

    logger.budgetSync("Budget Sync state change", {
      hasEncryptionKey: !!securityContext?.encryptionKey,
      hasCurrentUser: !!currentUser,
      hasBudgetId: !!securityContext?.budgetId,
    });

    lastLogKeyRef.current = logKey;
  }, [logKey, isUnlocked, currentUser, securityContext?.budgetId, securityContext?.encryptionKey]);

  // Redirect to dashboard on login
  useEffect(() => {
    if (isUnlocked && currentUser && !location.pathname.startsWith("/app")) {
      navigate("/app/dashboard");
    }
  }, [isUnlocked, currentUser, location.pathname, navigate]);

  // Handle auth gateway
  if (auth.shouldShowAuthGateway() || !auth.isAuthenticated) {
    return (
      <AuthGateway
        onSetupComplete={(payload) => {
          if (typeof payload === "string") {
            return Promise.resolve(handleSetup(payload));
          }
          return Promise.resolve(handleSetup(payload.password, payload));
        }}
        onLocalOnlyReady={() => {}}
      />
    );
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
        onClose={dismissRotation}
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
  const resetAllData = useBudgetStore((state: UiStore) => state.resetAllData);
  const navigate = useNavigate();
  const location = useLocation();

  // Onboarding state
  const isOnboarded = useOnboardingStore((state) => state.isOnboarded);

  // Extract layout data using helper
  const { budget, totalBiweeklyNeed, paycheckHistory } = extractLayoutData(layoutData);
  const normalizedTotalBiweeklyNeed =
    typeof totalBiweeklyNeed === "number" ? totalBiweeklyNeed : Number(totalBiweeklyNeed ?? 0);

  // Extract auth data using helper
  const { securityContext, isUnlocked: isUnlockedAuth } = extractAuthData(auth);

  // Navigation helper
  const setActiveView = (view: string): void => {
    const path = viewToPathMap[view as keyof typeof viewToPathMap] || "/";
    navigate(path);
  };

  // Modal state management
  const modals = useLayoutModals();

  // Layout lifecycle (Corruption detection & Security warning)
  const {
    showSecurityWarning,
    setShowSecurityWarning,
    showCorruptionModal,
    setShowCorruptionModal,
  } = useLayoutLifecycle({
    isUnlocked: isUnlockedAuth,
    currentUser,
    isOnboarded,
    hasAcknowledgedSecurity: hasSecurityAcknowledgement(),
  });

  // Firebase sync - use helper to extract user
  const userForSync = getUserForSync(currentUser);
  const { handleManualSync } = useFirebaseSync({
    firebaseSync,
    encryptionKey: securityContext?.encryptionKey as CryptoKey | null,
    budgetId: securityContext?.budgetId as string | null,
    currentUser: userForSync,
  });

  // Auto-complete onboarding
  useOnboardingAutoComplete();

  // UI state
  const isOnline = useBudgetStore((state: UiStore) => state.isOnline);
  const isSyncing = useBudgetStore(
    (state: UiStore & { isSyncing?: boolean }) => state.isSyncing ?? false
  );

  // Payday prediction
  usePaydayPrediction(
    paycheckHistory as unknown as Array<{
      date: string | Date;
      amount: number;
      [key: string]: unknown;
    }> | null,
    !!currentUser
  );

  const navigateToAuth = useCallback(() => {
    navigate("/auth" + location.search);
  }, [navigate, location.search]);

  const updateUserProfile = useCallback(
    (updates: Partial<UserData>) => {
      auth.updateUser(updates);
    },
    [auth]
  );

  const handleHideSecurityWarning = useCallback(
    () => setShowSecurityWarning(false),
    [setShowSecurityWarning]
  );
  const handleHideCorruption = useCallback(
    () => setShowCorruptionModal(false),
    [setShowCorruptionModal]
  );
  const clearSyncConflicts = useCallback(() => setSyncConflicts(null), [setSyncConflicts]);

  return (
    <GlobalPullToRefreshProvider>
      <OnboardingTutorial>
        <MainContentLayoutView
          currentUser={currentUser}
          isLocalOnlyMode={isLocalOnlyMode}
          isOnline={isOnline}
          isSyncing={isSyncing}
          rotationDue={rotationDue}
          showSecurityWarning={showSecurityWarning}
          onHideSecurityWarning={handleHideSecurityWarning}
          onManualSync={handleManualSync}
          onNavigateToAuth={navigateToAuth}
          onUpdateProfile={updateUserProfile}
          modals={modals}
          showCorruptionModal={showCorruptionModal}
          onHideCorruptionModal={handleHideCorruption}
          budget={budget}
          totalBiweeklyNeed={normalizedTotalBiweeklyNeed}
          setActiveView={setActiveView}
          syncConflicts={syncConflicts}
          onResolveConflict={onResolveConflict}
          onClearConflict={clearSyncConflicts}
          onExport={_onExport}
          onImport={_onImport}
          onLogout={onLogout}
          onResetEncryption={onResetEncryption}
          resetAllData={resetAllData}
          onChangePassword={onChangePassword}
          securityManager={securityManager}
        />
      </OnboardingTutorial>
    </GlobalPullToRefreshProvider>
  );
};

type MainContentModals = ReturnType<typeof useLayoutModals>;

interface MainContentLayoutViewProps {
  currentUser: UserData | null;
  isLocalOnlyMode: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  rotationDue: boolean;
  showSecurityWarning: boolean;
  onHideSecurityWarning: () => void;
  onManualSync: () => void;
  onNavigateToAuth: () => void;
  onUpdateProfile: (updates: Partial<UserData>) => void;
  modals: MainContentModals;
  showCorruptionModal: boolean;
  onHideCorruptionModal: () => void;
  budget: LayoutDataType["budget"];
  totalBiweeklyNeed: number;
  setActiveView: (view: string) => void;
  syncConflicts: unknown;
  onResolveConflict: () => void;
  onClearConflict: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<
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
  resetAllData: () => void;
  onChangePassword: (old: string, pwd: string) => Promise<void>;
  securityManager: ReturnType<typeof useAuth>["securityManager"];
}

const MainContentLayoutView = ({
  currentUser,
  isLocalOnlyMode,
  isOnline,
  isSyncing,
  rotationDue,
  showSecurityWarning,
  onHideSecurityWarning,
  onManualSync,
  onNavigateToAuth,
  onUpdateProfile,
  modals,
  showCorruptionModal,
  onHideCorruptionModal,
  budget,
  totalBiweeklyNeed,
  setActiveView,
  syncConflicts,
  onResolveConflict,
  onClearConflict,
  onExport,
  onImport,
  onLogout,
  onResetEncryption,
  resetAllData,
  onChangePassword,
  securityManager,
}: MainContentLayoutViewProps) => {
  const { settings, security } = modals;

  return (
    <div className="min-h-screen bg-brand-900 p-4 sm:px-6 md:px-8 overflow-x-hidden pb-20 lg:pb-0">
      <div className="relative mx-auto max-w-7xl">
        {/* Main Content Area with "Inlaid" look - Triple Layered Border System */}
        <div className="bg-purple-100/40 rounded-[2.5rem] p-2 sm:p-4 hard-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
          <div className="bg-white rounded-[2rem] hard-border p-4 sm:p-8 relative z-10 transition-all duration-500 shadow-xl">
            <Header
              currentUser={currentUser}
              isLocalOnlyMode={isLocalOnlyMode}
              onUserChange={onNavigateToAuth}
              onUpdateProfile={onUpdateProfile}
              onShowSettings={(section) => settings.open(section)}
              onShowDataSettings={() => settings.open("general")}
            />

            {rotationDue && (
              <div className="mb-6 rounded-xl border-2 border-black bg-amber-100 p-4 text-center text-amber-900 font-bold">
                ⚠️ Your password is over 90 days old. Please change it in settings.
              </div>
            )}

            <NavigationTabs />
            <OnboardingProgress />
            <SummaryCards />

            <AppRoutes
              budget={(budget || {}) as Record<string, unknown>}
              currentUser={(currentUser || {}) as Record<string, unknown>}
              totalBiweeklyNeed={totalBiweeklyNeed}
              setActiveView={setActiveView}
            />

            <SyncStatusIndicators isOnline={isOnline} isSyncing={isSyncing} />

            <div className="mt-12 pt-8 border-t-2 border-black/10 text-center">
              <div className="inline-block bg-brand-50 rounded-2xl hard-border p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-sm text-gray-800">
                  <span className="font-black text-purple-700">{getVersionInfo().displayName}</span>{" "}
                  <span className="font-mono">v{getVersionInfo().version}</span>
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  Last updated: {getVersionInfo().buildDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ConflictResolutionModal
          syncConflicts={
            Array.isArray(syncConflicts) && syncConflicts.length > 0
              ? (syncConflicts[0] as unknown as { hasConflict: boolean })
              : null
          }
          onResolveConflict={onResolveConflict}
          onDismiss={onClearConflict}
        />

        <BottomNavigationBar />

        {!showSecurityWarning && <BugReportButton />}
      </div>

      <SecuritySettings isOpen={security.isOpen} onClose={() => security.setOpen(false)} />

      {settings.isOpen && (
        <SettingsDashboard
          isOpen={settings.isOpen}
          onClose={() => settings.close()}
          initialSection={settings.initialSection}
          onExport={onExport}
          onImport={onImport as unknown as () => void}
          onLogout={onLogout}
          onResetEncryption={() => {
            resetAllData();
            onResetEncryption();
          }}
          onSync={onManualSync}
          onChangePassword={onChangePassword as unknown as (password: string) => void}
          currentUser={currentUser as { userName?: string; userColor?: string }}
          isLocalOnlyMode={isLocalOnlyMode}
          securityManager={
            securityManager
              ? {
                  ...securityManager,
                  lockApp: securityManager.lockSession,
                }
              : null
          }
          onUpdateProfile={onUpdateProfile}
        />
      )}

      <CorruptionRecoveryModal isOpen={showCorruptionModal} onClose={onHideCorruptionModal} />

      {showSecurityWarning && (
        <LocalDataSecurityWarning
          onClose={onHideSecurityWarning}
          onAcknowledge={onHideSecurityWarning}
        />
      )}
    </div>
  );
};

export default MainLayout;
