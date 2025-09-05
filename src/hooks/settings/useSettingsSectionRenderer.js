import React from "react";
import GeneralSettingsSection from "../../components/settings/sections/GeneralSettingsSection";
import AccountSettingsSection from "../../components/settings/sections/AccountSettingsSection";
import SecuritySettingsSection from "../../components/settings/sections/SecuritySettingsSection";
import DataManagementSection from "../../components/settings/sections/DataManagementSection";

/**
 * Hook to handle settings section rendering logic
 * Extracts the switch statement and section component mapping from the main component
 */
export const useSettingsSectionRenderer = ({
  // General Settings Props
  isLocalOnlyMode,
  cloudSyncEnabled,
  isSyncing,
  onOpenLocalOnlySettings,
  onToggleCloudSync,
  onManualSync,

  // Account Settings Props
  currentUser,
  onOpenPasswordModal,
  onLogout,
  onOpenResetConfirm,

  // Security Settings Props
  securityManager,
  onOpenSecuritySettings,

  // Data Management Props
  onOpenEnvelopeChecker,
  onOpenActivityFeed,
  onCreateTestHistory,
  onExport,
  onImport,
  onSync,
}) => {
  const renderSectionContent = (activeSection) => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSettingsSection
            isLocalOnlyMode={isLocalOnlyMode}
            cloudSyncEnabled={cloudSyncEnabled}
            isSyncing={isSyncing}
            onOpenLocalOnlySettings={onOpenLocalOnlySettings}
            onToggleCloudSync={onToggleCloudSync}
            onManualSync={onManualSync}
          />
        );

      case "account":
        return (
          <AccountSettingsSection
            currentUser={currentUser}
            onOpenPasswordModal={onOpenPasswordModal}
            onLogout={onLogout}
            onOpenResetConfirm={onOpenResetConfirm}
          />
        );

      case "security":
        return (
          <SecuritySettingsSection
            securityManager={securityManager}
            onOpenSecuritySettings={onOpenSecuritySettings}
          />
        );

      case "data":
        return (
          <DataManagementSection
            onOpenEnvelopeChecker={onOpenEnvelopeChecker}
            onOpenActivityFeed={onOpenActivityFeed}
            onCreateTestHistory={onCreateTestHistory}
            onExport={onExport}
            onImport={onImport}
            onSync={onSync}
          />
        );

      default:
        return null;
    }
  };

  return { renderSectionContent };
};

export default useSettingsSectionRenderer;
