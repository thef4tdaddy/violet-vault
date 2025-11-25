import React from "react";
import GeneralSettingsSection from "@/components/settings/sections/GeneralSettingsSection";
import AccountSettingsSection from "@/components/settings/sections/AccountSettingsSection";
import SecuritySettingsSection from "@/components/settings/sections/SecuritySettingsSection";
import DataManagementSection from "@/components/settings/sections/DataManagementSection";
import NotificationSettingsSection from "@/components/settings/sections/NotificationSettingsSection";
import DevToolsSection from "@/components/settings/sections/DevToolsSection";
import SyncHealthDashboard from "@/components/sync/SyncHealthDashboard";

// Type definitions for user and security manager
interface User {
  uid?: string;
  userName?: string;
  userColor?: string;
  email?: string;
  displayName?: string;
  [key: string]: unknown;
}

interface UserProfile {
  userName?: string;
  userColor?: string;
  email?: string;
  displayName?: string;
  [key: string]: unknown;
}

interface SecurityManager {
  isLocked?: boolean;
  hasEncryptionKey?: boolean;
  lockApp: () => void;
}

interface SettingsSectionRendererProps {
  // General Settings Props
  isLocalOnlyMode: boolean;
  cloudSyncEnabled: boolean;
  isSyncing: boolean;
  onOpenLocalOnlySettings: () => void;
  onToggleCloudSync: () => void;
  onManualSync: () => void;

  // Account Settings Props
  currentUser: User;
  onOpenPasswordModal: () => void;
  onLogout: () => void;
  onOpenResetConfirm: () => void;
  onUpdateProfile: (profile: UserProfile) => void;

  // Security Settings Props
  securityManager: SecurityManager;
  onOpenSecuritySettings: () => void;
  onShowLocalDataSecurity: () => void;

  // Data Management Props
  onOpenActivityFeed: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSync: () => void;

  // Dev Tools Props
  onOpenEnvelopeChecker: () => void;
  onCreateTestHistory: () => void;
}

/**
 * Hook to handle settings section rendering logic.
 * Extracts the switch statement and section component mapping from the main dashboard.
 */
const useSettingsSectionRenderer = (props: SettingsSectionRendererProps) => {
  const {
    isLocalOnlyMode,
    cloudSyncEnabled,
    isSyncing,
    onOpenLocalOnlySettings,
    onToggleCloudSync,
    onManualSync,
    currentUser,
    onOpenPasswordModal,
    onLogout,
    onOpenResetConfirm,
    onUpdateProfile,
    securityManager,
    onOpenSecuritySettings,
    onShowLocalDataSecurity,
    onOpenActivityFeed,
    onExport,
    onImport,
    onSync,
    onOpenEnvelopeChecker,
    onCreateTestHistory,
  } = props;

  const renderSectionContent = (activeSection: string) => {
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

      case "sync-health":
        return React.createElement(SyncHealthDashboard);

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
