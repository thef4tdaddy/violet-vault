import { useState, useCallback } from "react";
import { useSecurityManager } from "@/hooks/auth/useSecurityManager";

/**
 * Custom hook for SecuritySettings component business logic
 * Extracted from 427-line SecuritySettings.jsx for better maintainability
 */
export const useSecuritySettingsLogic = () => {
  const { isLocked, securitySettings, securityEvents, updateSettings, clearSecurityEvents } =
    useSecurityManager();

  // Local state for UI interactions
  const [showEvents, setShowEvents] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Setting change handler
  const handleSettingChange = useCallback(
    (setting: string, value: unknown) => {
      updateSettings({ [setting]: value });
    },
    [updateSettings]
  );

  // Export security events to JSON file
  const exportSecurityEvents = useCallback(() => {
    const dataStr = JSON.stringify(securityEvents, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `security-events-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [securityEvents]);

  // Calculate time until auto-lock
  const timeUntilAutoLock = useCallback(() => {
    if (!securitySettings.autoLockEnabled || isLocked) return null;
    // For now, return a simple status since we don't have time remaining calculation
    return "Active";
  }, [securitySettings.autoLockEnabled, isLocked]);

  // Toggle events display
  const toggleEventsDisplay = useCallback(() => {
    setShowEvents((prev) => !prev);
  }, []);

  // Show clear confirmation dialog
  const showClearConfirmDialog = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  // Hide clear confirmation dialog
  const hideClearConfirmDialog = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  // Confirm and clear security events
  const confirmClearEvents = useCallback(() => {
    clearSecurityEvents();
    setShowClearConfirm(false);
    setShowEvents(false);
  }, [clearSecurityEvents]);

  return {
    // Security manager data
    isLocked,
    securitySettings,
    securityEvents,

    // UI state
    showEvents,
    showClearConfirm,

    // Actions
    handleSettingChange,
    exportSecurityEvents,
    timeUntilAutoLock,
    toggleEventsDisplay,
    showClearConfirmDialog,
    hideClearConfirmDialog,
    confirmClearEvents,
  };
};
