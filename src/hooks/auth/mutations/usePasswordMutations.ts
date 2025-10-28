import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { encryptionUtils } from "../../../utils/security/encryption";
import logger from "../../../utils/common/logger";
import localStorageService from "../../../services/storage/localStorageService";

/**
 * Password-related TanStack Query mutations
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

/**
 * Hook for password change mutation
 */
export const useChangePasswordMutation = () => {
  const { setError } = useAuth();

  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      try {
        const savedData = localStorageService.getBudgetData();
        if (!savedData) {
          return { success: false, error: "No saved data found." };
        }

        const { encryptedData, iv } = savedData;
        const oldKeyData = await encryptionUtils.deriveKey(oldPassword);
        const oldKey = oldKeyData.key;

        const decryptedData = await encryptionUtils.decrypt(encryptedData, oldKey, iv);

        const { key: newKey, salt: newSalt } = await encryptionUtils.generateKey(newPassword);
        const encrypted = await encryptionUtils.encrypt(decryptedData, newKey);

        localStorageService.setBudgetData({
          encryptedData: encrypted.data,
          salt: Array.from(newSalt),
          iv: encrypted.iv,
        });

        if (import.meta?.env?.MODE === "development") {
          const saltPreview =
            Array.from(newSalt.slice(0, 8))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("") + "...";
          logger.auth("Password changed with deterministic key", {
            saltPreview,
            keyType: newKey.constructor?.name || "unknown",
          });
        }

        return { success: true, newKey, newSalt };
      } catch (error) {
        logger.error("Password change failed.", error);
        if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
          return { success: false, error: "Invalid current password." };
        }
        return { success: false, error: error.message };
      }
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
      }
    },
    onError: (error) => {
      logger.error("Change password mutation failed", error);
      setError(error.message || "Failed to change password");
    },
  });
};
