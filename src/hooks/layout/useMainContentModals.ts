/**
 * useMainContentModals - Consolidates all modal state management in MainContent
 * Reduces 5+ useState calls to a single hook
 */

import { useState } from "react";

interface ModalState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

interface SettingsModalState extends ModalState {
  initialSection: string;
}

interface UseMainContentModalsReturn {
  security: ModalState;
  settings: SettingsModalState;
}

export const useMainContentModals = (): UseMainContentModalsReturn => {
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialSection] = useState("general");

  return {
    security: {
      isOpen: showSecuritySettings,
      setOpen: setShowSecuritySettings,
    },
    settings: {
      isOpen: showSettingsModal,
      setOpen: setShowSettingsModal,
      initialSection: settingsInitialSection,
    },
  };
};
