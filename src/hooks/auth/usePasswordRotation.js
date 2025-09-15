import { useState, useCallback, useEffect } from "react";
import { encryptionUtils } from "../../utils/security/encryption";
import { useAuth } from "../../stores/auth/authStore.jsx";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

/**
 * Custom hook for password rotation management
 * Extracts password rotation logic from Layout component
 */
const usePasswordRotation = () => {
  const { encryptionKey } = useAuth();
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
      const savedData = localStorage.getItem("envelopeBudgetData");
      if (!savedData) {
        throw new Error("No data found");
      }

      const { encryptedData, iv } = JSON.parse(savedData);
      const decrypted = await encryptionUtils.decrypt(
        encryptedData,
        encryptionKey,
        iv,
      );
      const { key, salt: newSalt } =
        await encryptionUtils.generateKey(newPassword);
      const reencrypted = await encryptionUtils.encrypt(decrypted, key);

      const saveData = {
        encryptedData: reencrypted.data,
        salt: Array.from(newSalt),
        iv: reencrypted.iv,
      };

      localStorage.setItem("envelopeBudgetData", JSON.stringify(saveData));

      // Update the auth store with new encryption details
      const { setEncryption } = useAuth.getState();
      setEncryption({ key, salt: newSalt });

      localStorage.setItem("passwordLastChanged", Date.now().toString());
      setShowRotationModal(false);
      setRotationDue(false);
      setNewPassword("");
      setConfirmPassword("");
      showSuccessToast(
        "Your password has been successfully updated",
        "Password Updated",
      );
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
    encryptionKey,
    showErrorToast,
    showSuccessToast,
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
