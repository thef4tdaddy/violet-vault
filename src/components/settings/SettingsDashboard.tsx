import React, { lazy, Suspense } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import SettingsLayout from "./layout/SettingsLayout";
import ResetConfirmModal from "./modals/ResetConfirmModal";
import LocalDataSecurityWarning from "../security/LocalDataSecurityWarning";
import { useSettingsModals } from "../../hooks/platform/ux/useModalManager";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import {
  useCloudSyncManager,
  useSettingsSections,
  useSettingsActions,
} from "@/hooks/platform/settings/useSettingsDashboard";
import useSettingsSectionRenderer from "@/hooks/platform/settings/useSettingsSectionRenderer";

// Lazy load heavy components
const ChangePasswordModal = lazy(() => import("../auth/ChangePasswordModal"));
const ActivityFeed = lazy(() => import("../activity/ActivityFeed"));
const LocalOnlyModeSettings = lazy(() => import("../auth/LocalOnlyModeSettings"));
const SecuritySettings = lazy(() => import("./SecuritySettings"));
const PrivacySettings = lazy(() => import("./PrivacySettings"));
const EnvelopeIntegrityChecker = lazy(() => import("./EnvelopeIntegrityChecker"));

// Type definitions
interface SecurityManager {
  isLocked?: boolean;
  hasEncryptionKey?: boolean;
  lockApp: () => void;
}

interface UserProfile {
  userName?: string;
  userColor?: string;
  email?: string;
  displayName?: string;
  [key: string]: unknown;
}

/**
 * Helper component to render all settings modals
 */
const SettingsModals = ({
  showPasswordModal,
  showActivityFeed,
  showLocalOnlySettings,
  showSecuritySettings,
  showPrivacySettings,
  showEnvelopeChecker,
  showLocalDataSecurity,
  activityFeedModalRef,
  securityManager,
  onChangePassword,
  onClosePasswordModal,
  onCloseActivityFeed,
  onCloseLocalOnlySettings,
  onCloseSecuritySettings,
  onClosePrivacySettings,
  onCloseEnvelopeChecker,
  onCloseLocalDataSecurity,
}: {
  showPasswordModal: boolean;
  showActivityFeed: boolean;
  showLocalOnlySettings: boolean;
  showSecuritySettings: boolean;
  showPrivacySettings: boolean;
  showEnvelopeChecker: boolean;
  showLocalDataSecurity: boolean;
  activityFeedModalRef: React.RefObject<HTMLDivElement | null>;
  securityManager: SecurityManager | null;
  onChangePassword: (password: string) => void;
  onClosePasswordModal: () => void;
  onCloseActivityFeed: () => void;
  onCloseLocalOnlySettings: () => void;
  onCloseSecuritySettings: () => void;
  onClosePrivacySettings: () => void;
  onCloseEnvelopeChecker: () => void;
  onCloseLocalDataSecurity: () => void;
}) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={onClosePasswordModal}
          onChangePassword={
            onChangePassword as unknown as (
              current: string,
              newPass: string
            ) => Promise<{ success: boolean; message?: string }>
          }
        />
      )}
      {showActivityFeed && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60 overflow-y-auto">
          <div
            ref={activityFeedModalRef}
            className="glassmorphism rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative border-2 border-black my-auto"
          >
            <ModalCloseButton
              onClick={onCloseActivityFeed}
              className="absolute top-4 right-4 z-10"
            />
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-48px)]">
              <ActivityFeed />
            </div>
          </div>
        </div>
      )}
      {showLocalOnlySettings && (
        <LocalOnlyModeSettings
          isOpen={showLocalOnlySettings}
          onClose={onCloseLocalOnlySettings}
          onModeSwitch={(mode) => {
            if (mode === "standard") {
              window.location.reload();
            }
          }}
        />
      )}
      {showSecuritySettings && securityManager && (
        <SecuritySettings isOpen={showSecuritySettings} onClose={onCloseSecuritySettings} />
      )}
      {showPrivacySettings && (
        <PrivacySettings isOpen={showPrivacySettings} onClose={onClosePrivacySettings} />
      )}
      {showEnvelopeChecker && (
        <EnvelopeIntegrityChecker isOpen={showEnvelopeChecker} onClose={onCloseEnvelopeChecker} />
      )}
      {showLocalDataSecurity && (
        <LocalDataSecurityWarning
          onClose={onCloseLocalDataSecurity}
          onAcknowledge={onCloseLocalDataSecurity}
          forceShow={true}
        />
      )}
    </Suspense>
  );
};

/**
 * Unified Settings Dashboard - Refactored with extracted components
 * Consolidated all app settings into organized sections with standardized UI
 */
const SettingsDashboard = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onLogout,
  onResetEncryption,
  onSync,
  onChangePassword,
  currentUser,
  isLocalOnlyMode = false,
  securityManager,
  initialSection = "general",
  onUpdateProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onLogout: () => void;
  onResetEncryption: () => void;
  onSync: () => void;
  onChangePassword: (password: string) => void;
  currentUser: { userName?: string; userColor?: string };
  isLocalOnlyMode?: boolean;
  securityManager: SecurityManager | null;
  initialSection?: string;
  onUpdateProfile: (profile: UserProfile) => void;
}) => {
  // Use the reusable modal manager instead of the old hook
  const {
    showPasswordModal,
    showActivityFeed,
    showLocalOnlySettings,
    showSecuritySettings,
    showPrivacySettings,
    showResetConfirm,
    showEnvelopeChecker,
    openPasswordModal,
    closePasswordModal,
    openActivityFeed,
    closeActivityFeed,
    openLocalOnlySettings,
    closeLocalOnlySettings,
    openSecuritySettings,
    closeSecuritySettings,
    openPrivacySettings,
    closePrivacySettings,
    openResetConfirm,
    closeResetConfirm,
    openEnvelopeChecker,
    closeEnvelopeChecker,
  } = useSettingsModals();

  // Section state management
  const [activeSection, setActiveSection] = React.useState(initialSection);

  // Local data security modal state (not in useSettingsModals to avoid circular dependency with MainLayout)
  const [showLocalDataSecurity, setShowLocalDataSecurity] = React.useState(false);
  const activityFeedModalRef = useModalAutoScroll(showActivityFeed);

  // Update active section when initialSection changes (e.g., opening to specific section)
  React.useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  const handleSectionChange = React.useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);

  const handleShowLocalDataSecurity = React.useCallback(() => {
    setShowLocalDataSecurity(true);
  }, []);

  const { cloudSyncEnabled, isSyncing, handleToggleCloudSync, handleManualSync } =
    useCloudSyncManager();

  const { sections } = useSettingsSections();
  const { handleCreateTestHistory, handleResetConfirmAction } = useSettingsActions();

  // Use the extracted section renderer hook
  const { renderSectionContent } = useSettingsSectionRenderer({
    // General Settings Props
    isLocalOnlyMode,
    cloudSyncEnabled,
    isSyncing,
    onOpenLocalOnlySettings: openLocalOnlySettings,
    onToggleCloudSync: handleToggleCloudSync,
    onManualSync: handleManualSync,

    // Account Settings Props
    currentUser,
    onOpenPasswordModal: openPasswordModal,
    onLogout,
    onOpenResetConfirm: openResetConfirm,
    onUpdateProfile,

    // Security Settings Props
    securityManager,
    onOpenSecuritySettings: openSecuritySettings,
    onShowLocalDataSecurity: handleShowLocalDataSecurity,

    // Privacy Settings Props
    onOpenPrivacySettings: openPrivacySettings,

    // Data Management Props
    onOpenEnvelopeChecker: openEnvelopeChecker,
    onOpenActivityFeed: openActivityFeed,
    onCreateTestHistory: handleCreateTestHistory,
    onExport,
    onImport,
    onSync,
  });

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      <SettingsLayout
        isOpen={isOpen}
        onClose={onClose}
        activeSection={activeSection}
        sections={sections}
        onSectionChange={handleSectionChange}
      >
        {renderSectionContent(activeSection)}
      </SettingsLayout>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={closeResetConfirm}
        onConfirm={handleResetConfirmAction(onClose, onResetEncryption)}
      />

      <SettingsModals
        showPasswordModal={showPasswordModal}
        showActivityFeed={showActivityFeed}
        showLocalOnlySettings={showLocalOnlySettings}
        showSecuritySettings={showSecuritySettings}
        showPrivacySettings={showPrivacySettings}
        showEnvelopeChecker={showEnvelopeChecker}
        showLocalDataSecurity={showLocalDataSecurity}
        activityFeedModalRef={activityFeedModalRef}
        securityManager={securityManager}
        onChangePassword={onChangePassword}
        onClosePasswordModal={closePasswordModal}
        onCloseActivityFeed={closeActivityFeed}
        onCloseLocalOnlySettings={closeLocalOnlySettings}
        onCloseSecuritySettings={closeSecuritySettings}
        onClosePrivacySettings={closePrivacySettings}
        onCloseEnvelopeChecker={closeEnvelopeChecker}
        onCloseLocalDataSecurity={() => setShowLocalDataSecurity(false)}
      />
    </>
  );
};

export default SettingsDashboard;
