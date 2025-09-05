import React, { lazy, Suspense } from "react";
import { X } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import SettingsLayout from "./layout/SettingsLayout";
import GeneralSettingsSection from "./sections/GeneralSettingsSection";
import AccountSettingsSection from "./sections/AccountSettingsSection";
import SecuritySettingsSection from "./sections/SecuritySettingsSection";
import DataManagementSection from "./sections/DataManagementSection";
import ResetConfirmModal from "./modals/ResetConfirmModal";
import {
  useSettingsDashboardUI,
  useCloudSyncManager,
  useSettingsSections,
  useSettingsActions,
} from "../../hooks/settings/useSettingsDashboard";

// Lazy load heavy components
const ChangePasswordModal = lazy(() => import("../auth/ChangePasswordModal"));
const ActivityFeed = lazy(() => import("../activity/ActivityFeed"));
const LocalOnlyModeSettings = lazy(
  () => import("../auth/LocalOnlyModeSettings"),
);
const SecuritySettings = lazy(() => import("./SecuritySettings"));
const EnvelopeIntegrityChecker = lazy(
  () => import("./EnvelopeIntegrityChecker"),
);

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
}) => {
  const {
    activeSection,
    showPasswordModal,
    showActivityFeed,
    showLocalOnlySettings,
    showSecuritySettings,
    showResetConfirm,
    showEnvelopeChecker,
    handleSectionChange,
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
  } = useSettingsDashboardUI();

  const {
    cloudSyncEnabled,
    isSyncing,
    handleToggleCloudSync,
    handleManualSync,
  } = useCloudSyncManager();

  const { sections } = useSettingsSections();
  const { handleCreateTestHistory, handleResetConfirmAction } =
    useSettingsActions();

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSettingsSection
            isLocalOnlyMode={isLocalOnlyMode}
            cloudSyncEnabled={cloudSyncEnabled}
            isSyncing={isSyncing}
            onOpenLocalOnlySettings={openLocalOnlySettings}
            onToggleCloudSync={handleToggleCloudSync}
            onManualSync={handleManualSync}
          />
        );

      case "account":
        return (
          <AccountSettingsSection
            currentUser={currentUser}
            onOpenPasswordModal={openPasswordModal}
            onLogout={onLogout}
            onOpenResetConfirm={openResetConfirm}
          />
        );

      case "security":
        return (
          <SecuritySettingsSection
            securityManager={securityManager}
            onOpenSecuritySettings={openSecuritySettings}
          />
        );

      case "data":
        return (
          <DataManagementSection
            onOpenEnvelopeChecker={openEnvelopeChecker}
            onOpenActivityFeed={openActivityFeed}
            onCreateTestHistory={handleCreateTestHistory}
            onExport={onExport}
            onImport={onImport}
            onSync={onSync}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SettingsLayout
        isOpen={isOpen}
        onClose={onClose}
        activeSection={activeSection}
        sections={sections}
        onSectionChange={handleSectionChange}
      >
        {renderSectionContent()}
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
              <button
                onClick={closeActivityFeed}
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
              >
                <X className="h-5 w-5" />
              </button>
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
          <SecuritySettings
            isOpen={showSecuritySettings}
            onClose={closeSecuritySettings}
          />
        )}

        {/* Envelope Integrity Checker */}
        {showEnvelopeChecker && (
          <EnvelopeIntegrityChecker
            isOpen={showEnvelopeChecker}
            onClose={closeEnvelopeChecker}
          />
        )}
      </Suspense>
    </>
  );
};

export default SettingsDashboard;
