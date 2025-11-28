import { useState, useCallback, useEffect } from "react";
import { useAuthManager } from "./useAuthManager";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";
import localStorageService from "../../services/storage/localStorageService";

/**
 * Password rotation hook return type
 */
interface UsePasswordRotationReturn {
  // State
  rotationDue: boolean;
  showRotationModal: boolean;
  newPassword: string;
  confirmPassword: string;

  // Actions
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleRotationPasswordChange: () => Promise<void>;
  dismissRotation: () => void;
  showRotationDialog: () => void;
}

/**
 * Custom hook for password rotation management
 * Extracts password rotation logic from Layout component
 */
const usePasswordRotation = (): UsePasswordRotationReturn => {
  const {
    securityContext: { encryptionKey },
  } = useAuthManager();
  const { showErrorToast } = useToastHelpers();
  const [rotationDue, setRotationDue] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check password age on component mount and when user unlocks
  useEffect(() => {
    const checkPasswordAge = (): void => {
      const stored = localStorageService.getItem("passwordLastChanged");
      if (!stored) {
        localStorageService.setItem("passwordLastChanged", Date.now().toString());
      } else {
        const age = Date.now() - parseInt(stored, 10);
        // 90 days = 90 * 24 * 60 * 60 * 1000 milliseconds
        if (age >= 90 * 24 * 60 * 60 * 1000) {
          setRotationDue(true);
          setShowRotationModal(true);
        }
      }
    };

    if (encryptionKey) {
      checkPasswordAge();
    }
  }, [encryptionKey]);

  const handleRotationPasswordChange = useCallback(async (): Promise<void> => {
    if (!newPassword || newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match", "Password Mismatch");
      return;
    }

    try {
      // Password rotation requires the current password for security
      // This feature requires user to re-authenticate or provide current password
      // before updating to a new password
      showErrorToast("Password rotation requires the current password", "Not Implemented");

      // Password rotation functionality is limited until a re-authentication flow is implemented
      logger.warn("Password rotation attempted but requires current password implementation");
    } catch (error) {
      logger.error("Failed to change password:", error);
      showErrorToast(
        `Failed to change password: ${(error as Error).message}`,
        "Password Update Failed"
      );
    }
  }, [newPassword, confirmPassword, showErrorToast]);

  const dismissRotation = useCallback((): void => {
    setShowRotationModal(false);
    // Don't reset rotationDue - user should still see warning banner
  }, []);

  const showRotationDialog = useCallback((): void => {
    setShowRotationModal(true);
  }, []);

  return {
    // State
    rotationDue,
    showRotationModal,
    newPassword,
    confirmPassword,

    // Actions
    setNewPassword,
    setConfirmPassword,
    handleRotationPasswordChange,
    dismissRotation,
    showRotationDialog,
  };
};

export default usePasswordRotation;
