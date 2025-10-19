import { useState, useCallback } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

/**
 * Hook for managing Settings Dashboard UI state and navigation
 * Extracts settings navigation and modal management logic
 */
export const useSettingsDashboardUI = () => {
  const [activeSection, setActiveSection] = useState("general");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showLocalOnlySettings, setShowLocalOnlySettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEnvelopeChecker, setShowEnvelopeChecker] = useState(false);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
  }, []);

  const openPasswordModal = useCallback(() => {
    setShowPasswordModal(true);
  }, []);

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
  }, []);

  const openActivityFeed = useCallback(() => {
    setShowActivityFeed(true);
  }, []);

  const closeActivityFeed = useCallback(() => {
    setShowActivityFeed(false);
  }, []);

  const openLocalOnlySettings = useCallback(() => {
    setShowLocalOnlySettings(true);
  }, []);

  const closeLocalOnlySettings = useCallback(() => {
    setShowLocalOnlySettings(false);
  }, []);

  const openSecuritySettings = useCallback(() => {
    setShowSecuritySettings(true);
  }, []);

  const closeSecuritySettings = useCallback(() => {
    setShowSecuritySettings(false);
  }, []);

  const openResetConfirm = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const closeResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const openEnvelopeChecker = useCallback(() => {
    setShowEnvelopeChecker(true);
  }, []);

  const closeEnvelopeChecker = useCallback(() => {
    setShowEnvelopeChecker(false);
  }, []);

  return {
    // State
    activeSection,
    showPasswordModal,
    showActivityFeed,
    showLocalOnlySettings,
    showSecuritySettings,
    showResetConfirm,
    showEnvelopeChecker,

    // Actions
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
  };
};

/**
 * Hook for managing cloud sync functionality
 * Extracts cloud sync toggle and manual sync operations
 */
export const useCloudSyncManager = () => {
  const { cloudSyncEnabled, setCloudSyncEnabled } = useBudgetStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleToggleCloudSync = useCallback(async () => {
    const newValue = !cloudSyncEnabled;
    setCloudSyncEnabled(newValue);

    if (newValue) {
      logger.debug("🌩️ Cloud sync enabled - starting background sync");
      try {
        const { cloudSyncService } = await import("../../services/cloudSyncService");
        const { useAuth } = await import("../../stores/auth/authStore");
        const authState = useAuth.getState();

        if (authState.encryptionKey && authState.currentUser && authState.budgetId) {
          await cloudSyncService.start({
            encryptionKey: authState.encryptionKey,
            currentUser: authState.currentUser,
            budgetId: authState.budgetId,
          });
        }
      } catch (error) {
        logger.error("Failed to start cloud sync:", error);
      }
    } else {
      logger.debug("💾 Cloud sync disabled - stopping background sync");
      try {
        const { cloudSyncService } = await import("../../services/cloudSyncService");
        cloudSyncService.stop();
      } catch (error) {
        logger.error("Failed to stop cloud sync:", error);
      }
    }
  }, [cloudSyncEnabled, setCloudSyncEnabled]);

  const handleManualSync = useCallback(async () => {
    if (!cloudSyncEnabled || isSyncing) return;

    setIsSyncing(true);
    try {
      logger.debug("🔄 Manual sync triggered from settings");
      const { cloudSyncService } = await import("../../services/cloudSyncService");

      if (!cloudSyncService.isRunning) {
        logger.warn("⚠️ Cloud sync service not running, starting temporarily...");
        const { useAuth } = await import("../../stores/auth/authStore");
        const authState = useAuth.getState();

        if (authState.encryptionKey && authState.currentUser && authState.budgetId) {
          await cloudSyncService.start({
            encryptionKey: authState.encryptionKey,
            currentUser: authState.currentUser,
            budgetId: authState.budgetId,
          });
        } else {
          throw new Error("Missing authentication context for sync");
        }
      }

      const result = await cloudSyncService.forceSync();

      if (result.success) {
        logger.info("✅ Manual sync completed", result);
        // TODO: Could add a success toast notification here
      } else {
        logger.error("❌ Manual sync failed", result.error);
        // TODO: Could add an error toast notification here
      }
    } catch (error) {
      logger.error("❌ Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [cloudSyncEnabled, isSyncing]);

  return {
    // State
    cloudSyncEnabled,
    isSyncing,

    // Actions
    handleToggleCloudSync,
    handleManualSync,
  };
};

/**
 * Hook for settings sections configuration and navigation
 */
export const useSettingsSections = () => {
  // Check if we're in development mode for dev tools section
  const isDevelopmentMode = () => {
    return (
      typeof window !== "undefined" &&
      (import.meta.env.MODE === "development" ||
        window.location.hostname.includes("dev.") ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname === "127.0.0.1")
    );
  };

  const baseSections = [
    { id: "general", label: "General", icon: "Settings" },
    { id: "account", label: "Account", icon: "User" },
    { id: "security", label: "Security", icon: "Shield" },
    { id: "data", label: "Data", icon: "Cloud" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
  ];

  // Add Dev Tools section in development mode only
  const sections = isDevelopmentMode()
    ? [...baseSections, { id: "devtools", label: "Dev Tools", icon: "Wrench" }]
    : baseSections;

  return { sections };
};

/**
 * Hook for handling settings dashboard actions
 * Manages test history creation and other data operations
 */
export const useSettingsActions = () => {
  const handleCreateTestHistory = useCallback(async () => {
    try {
      const { createTestBudgetHistory } = await import("../../utils/common/testBudgetHistory");
      await createTestBudgetHistory();
      globalToast.showSuccess(
        "✅ Test budget history created! Check console for details.",
        "Test History Created"
      );
    } catch (error) {
      globalToast.showError("❌ Failed to create test history: " + error.message, "Test Failed", 8000);
    }
  }, []);

  const handleResetConfirmAction = useCallback((onClose, onResetEncryption) => {
    return () => {
      onClose();
      onResetEncryption();
    };
  }, []);

  return {
    handleCreateTestHistory,
    handleResetConfirmAction,
  };
};
