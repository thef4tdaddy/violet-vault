import { useState, useCallback } from "react";

/**
 * Reusable Modal Management Hook
 * Generic hook for managing multiple modal states with standardized open/close patterns
 * Can be used across different components that need to manage multiple modals
 */
export const useModalManager = (initialModals: Record<string, boolean> = {}) => {
  const [modals, setModals] = useState<Record<string, boolean>>(initialModals);

  const openModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const toggleModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const closedModals: Record<string, boolean> = {};
      for (const key in prev) {
        closedModals[key] = false;
      }
      return closedModals;
    });
  }, []);

  const isModalOpen = useCallback(
    (modalName: string) => {
      return Boolean(modals[modalName]);
    },
    [modals]
  );

  const getOpenModalsCount = useCallback(() => {
    return Object.values(modals).filter(Boolean).length;
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isModalOpen,
    getOpenModalsCount,
  };
};

/**
 * Specialized hook for Settings Dashboard modals
 * Pre-configured with the specific modals used in settings
 */
export const useSettingsModals = () => {
  const initialModals = {
    passwordModal: false,
    activityFeed: false,
    localOnlySettings: false,
    securitySettings: false,
    privacySettings: false,
    resetConfirm: false,
    envelopeChecker: false,
  };

  const modalManager = useModalManager(initialModals);

  // Create convenience methods with specific names for settings modals
  return {
    ...modalManager,
    // Password Modal
    openPasswordModal: () => modalManager.openModal("passwordModal"),
    closePasswordModal: () => modalManager.closeModal("passwordModal"),
    showPasswordModal: modalManager.isModalOpen("passwordModal"),

    // Activity Feed
    openActivityFeed: () => modalManager.openModal("activityFeed"),
    closeActivityFeed: () => modalManager.closeModal("activityFeed"),
    showActivityFeed: modalManager.isModalOpen("activityFeed"),

    // Local Only Settings
    openLocalOnlySettings: () => modalManager.openModal("localOnlySettings"),
    closeLocalOnlySettings: () => modalManager.closeModal("localOnlySettings"),
    showLocalOnlySettings: modalManager.isModalOpen("localOnlySettings"),

    // Security Settings
    openSecuritySettings: () => modalManager.openModal("securitySettings"),
    closeSecuritySettings: () => modalManager.closeModal("securitySettings"),
    showSecuritySettings: modalManager.isModalOpen("securitySettings"),

    // Privacy Settings
    openPrivacySettings: () => modalManager.openModal("privacySettings"),
    closePrivacySettings: () => modalManager.closeModal("privacySettings"),
    showPrivacySettings: modalManager.isModalOpen("privacySettings"),

    // Reset Confirmation
    openResetConfirm: () => modalManager.openModal("resetConfirm"),
    closeResetConfirm: () => modalManager.closeModal("resetConfirm"),
    showResetConfirm: modalManager.isModalOpen("resetConfirm"),

    // Envelope Checker
    openEnvelopeChecker: () => modalManager.openModal("envelopeChecker"),
    closeEnvelopeChecker: () => modalManager.closeModal("envelopeChecker"),
    showEnvelopeChecker: modalManager.isModalOpen("envelopeChecker"),
  };
};

export default useModalManager;
