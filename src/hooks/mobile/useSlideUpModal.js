import { useState, useCallback } from "react";

/**
 * Custom hook for managing slide-up modal state
 *
 * Provides convenient methods for opening/closing modals
 * and managing modal configuration
 *
 * Part of Issue #164 - Implement Slide-Up Modals for Mobile Flows
 */
const useSlideUpModal = (initialConfig = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    height: "three-quarters",
    title: "",
    showHandle: true,
    backdrop: true,
    ...initialConfig,
  });

  const openModal = useCallback((newConfig = {}) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(
    (newConfig = {}) => {
      if (isOpen) {
        closeModal();
      } else {
        openModal(newConfig);
      }
    },
    [isOpen, openModal, closeModal],
  );

  const updateConfig = useCallback((newConfig) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return {
    isOpen,
    config,
    openModal,
    closeModal,
    toggleModal,
    updateConfig,
  };
};

export default useSlideUpModal;
