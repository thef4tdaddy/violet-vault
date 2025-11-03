import React, { lazy, Suspense } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import LoadingSpinner from "../ui/LoadingSpinner";
import SettingsLayout from "./layout/SettingsLayout";
import ResetConfirmModal from "./modals/ResetConfirmModal";
import LocalDataSecurityWarning from "../security/LocalDataSecurityWarning";
import { useSettingsModals } from "../../hooks/common/useModalManager";
import {
  useCloudSyncManager,
  useSettingsSections,
  useSettingsActions,
} from "../../hooks/settings/useSettingsDashboard";
import useSettingsSectionRenderer from "../../hooks/settings/useSettingsSectionRenderer";

// Lazy load heavy components
const ChangePasswordModal = lazy(() => import("../auth/ChangePasswordModal"));
const ActivityFeed = lazy(() => import("../activity/ActivityFeed"));
const LocalOnlyModeSettings = lazy(() => import("../auth/LocalOnlyModeSettings"));
const SecuritySettings = lazy(() => import("./SecuritySettings"));
const EnvelopeIntegrityChecker = lazy(() => import("./EnvelopeIntegrityChecker"));

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
}) => {
  // Use the reusable modal manager instead of the old hook
  const {
    showPasswordModal,
    showActivityFeed,
    showLocalOnlySettings,
    showSecuritySettings,
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
    openResetConfirm,
    closeResetConfirm,
    openEnvelopeChecker,
    closeEnvelopeChecker,
  } = useSettingsModals();

  // Section state management
  const [activeSection, setActiveSection] = React.useState(initialSection);

  // Local data security modal state (not in useSettingsModals to avoid circular dependency with MainLayout)
  const [showLocalDataSecurity, setShowLocalDataSecurity] = React.useState(false);

  // Update active section when initialSection changes (e.g., opening to specific section)
  React.useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  const handleSectionChange = React.useCallback((sectionId) => {
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

    // Data Management Props
    onOpenEnvelopeChecker: openEnvelopeChecker,
    onOpenActivityFeed: openActivityFeed,
    onCreateTestHistory: handleCreateTestHistory,
    onExport,
    onImport,
    onSync,
  });

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

      <Suspense fallback={<LoadingSpinner />}>
        {/* Password Change Modal */}
        {showPasswordModal && (
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={closePasswordModal}
            onChangePassword={onChangePassword}
          />
        )}

        {/* Activity Feed Modal */}
        {showActivityFeed && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
            <div className="glassmorphism rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative border-2 border-black">
              <Button
                onClick={closeActivityFeed}
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
              >
                {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
              </Button>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-48px)]">
                <ActivityFeed />
              </div>
            </div>
          </div>
        )}

        {/* Local-Only Mode Settings */}
        {showLocalOnlySettings && (
          <LocalOnlyModeSettings
            isOpen={showLocalOnlySettings}
            onClose={closeLocalOnlySettings}
            onModeSwitch={(mode) => {
              if (mode === "standard") {
                window.location.reload();
              }
            }}
          />
        )}

        {/* Security Settings */}
        {showSecuritySettings && securityManager && (
          <SecuritySettings isOpen={showSecuritySettings} onClose={closeSecuritySettings} />
        )}

        {/* Envelope Integrity Checker */}
        {showEnvelopeChecker && (
          <EnvelopeIntegrityChecker isOpen={showEnvelopeChecker} onClose={closeEnvelopeChecker} />
        )}

        {/* Local Data Security Warning */}
        {showLocalDataSecurity && (
          <LocalDataSecurityWarning
            onClose={() => setShowLocalDataSecurity(false)}
            onAcknowledge={() => setShowLocalDataSecurity(false)}
            forceShow={true}
          />
        )}
      </Suspense>
    </>
  );
};

export default SettingsDashboard;
