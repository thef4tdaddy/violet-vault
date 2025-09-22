import { useState, useCallback, useEffect } from "react";
import { encryptionUtils } from "../../utils/security/encryption";
import { useAuthManager } from "./useAuthManager";
import { useChangePasswordMutation } from "./mutations/usePasswordMutations";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

/**
 * Custom hook for password rotation management
 * Extracts password rotation logic from Layout component
 */
const usePasswordRotation = () => {
  const { securityContext: { encryptionKey } } = useAuthManager();
  const changePasswordMutation = useChangePasswordMutation();
  const { showErrorToast, showSuccessToast } = useToastHelpers();
  const [rotationDue, setRotationDue] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check password age on component mount and when user unlocks
  useEffect(() => {
    const checkPasswordAge = () => {
      const stored = localStorage.getItem("passwordLastChanged");
      if (!stored) {
        localStorage.setItem("passwordLastChanged", Date.now().toString());
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

  const handleRotationPasswordChange = useCallback(async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match", "Password Mismatch");
      return;
    }

    try {
      // We need the current password for the change password mutation
      // For password rotation, we don't have the old password, so we'll need to use a different approach
      // TODO: This needs the current password - password rotation might need a different flow
      showErrorToast("Password rotation requires the current password", "Not Implemented");

      // For now, let's disable the rotation functionality until we implement a proper flow
      logger.warn("Password rotation attempted but requires current password implementation");

    } catch (error) {
      logger.error("Failed to change password:", error);
      showErrorToast(
        `Failed to change password: ${error.message}`,
        "Password Update Failed",
      );
    }
  }, [
    newPassword,
    confirmPassword,
    showErrorToast,
  ]);

  const dismissRotation = useCallback(() => {
    setShowRotationModal(false);
    // Don't reset rotationDue - user should still see warning banner
  }, []);

  const showRotationDialog = useCallback(() => {
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
