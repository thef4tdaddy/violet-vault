/**
 * useMainContentModals - Consolidates all modal state management in MainContent
 * Reduces 5+ useState calls to a single hook
 */

import { useState } from "react";

interface ModalState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

interface SettingsModalState {
  isOpen: boolean;
  initialSection: string;
  setOpen: (open: boolean, options?: { initialSection?: string }) => void;
  open: (section?: string) => void;
  close: () => void;
}

interface UseMainContentModalsReturn {
  security: ModalState;
  settings: SettingsModalState;
}

export const useMainContentModals = (): UseMainContentModalsReturn => {
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState("general");

  const setSettingsOpen = (open: boolean, options: { initialSection?: string } = {}) => {
    if (open) {
      if (options.initialSection) {
        setSettingsInitialSection(options.initialSection);
      }
      setShowSettingsModal(true);
      return;
    }

    setShowSettingsModal(false);
    setSettingsInitialSection("general");
  };

  const openSettings = (section = "general") => {
    setSettingsOpen(true, { initialSection: section });
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  return {
    security: {
      isOpen: showSecuritySettings,
      setOpen: setShowSecuritySettings,
    },
    settings: {
      isOpen: showSettingsModal,
      setOpen: setSettingsOpen,
      initialSection: settingsInitialSection,
      open: openSettings,
      close: closeSettings,
    },
  };
};
