import React from "react";
import GeneralSettingsSection from "../../components/settings/sections/GeneralSettingsSection";
import AccountSettingsSection from "../../components/settings/sections/AccountSettingsSection";
import SecuritySettingsSection from "../../components/settings/sections/SecuritySettingsSection";
import DataManagementSection from "../../components/settings/sections/DataManagementSection";
import NotificationSettingsSection from "../../components/settings/sections/NotificationSettingsSection";
import DevToolsSection from "../../components/settings/sections/DevToolsSection";
import TipSettings from "../../components/tips/TipSettings";

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
  onUpdateProfile,

  // Security Settings Props
  securityManager,
  onOpenSecuritySettings,
  onShowLocalDataSecurity,

  // Data Management Props
  onOpenActivityFeed,
  onExport,
  onImport,
  onSync,

  // Dev Tools Props
  onOpenEnvelopeChecker,
  onCreateTestHistory,
}) => {
  const renderSectionContent = (activeSection) => {
    switch (activeSection) {
      case "general":
        return React.createElement(GeneralSettingsSection, {
          isLocalOnlyMode,
          cloudSyncEnabled,
          isSyncing,
          onOpenLocalOnlySettings,
          onToggleCloudSync,
          onManualSync,
        });

      case "account":
        return React.createElement(AccountSettingsSection, {
          currentUser,
          onOpenPasswordModal,
          onLogout,
          onOpenResetConfirm,
          onUpdateProfile,
        });

      case "security":
        return React.createElement(SecuritySettingsSection, {
          securityManager,
          onOpenSecuritySettings,
          onShowLocalDataSecurity,
        });

      case "data":
        return React.createElement(DataManagementSection, {
          onOpenActivityFeed,
          onExport,
          onImport,
          onSync,
        });

      case "notifications":
        return React.createElement(NotificationSettingsSection);

      case "tips":
        return React.createElement(TipSettings);

      case "devtools":
        return React.createElement(DevToolsSection, {
          onOpenEnvelopeChecker,
          onCreateTestHistory,
        });

      default:
        return null;
    }
  };

  return { renderSectionContent };
};

export default useSettingsSectionRenderer;
