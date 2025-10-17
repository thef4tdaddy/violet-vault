import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { encryptionUtils } from "../../../utils/security/encryption";
import logger from "../../../utils/common/logger";
import { authStorageService } from "../../../services/authStorageService";

/**
 * Profile-related TanStack Query mutations
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

/**
 * Hook for profile update mutation
 */
export const useUpdateProfileMutation = () => {
  const { updateUser, encryptionKey, salt } = useAuth();

  return useMutation({
    mutationFn: async (updatedProfile) => {
      try {
        if (!encryptionKey || !salt) {
          return { success: false, error: "Not authenticated." };
        }

        // Update localStorage profile
        const profileData = {
          userName: updatedProfile.userName,
          userColor: updatedProfile.userColor,
        };
        authStorageService.saveUserProfile(profileData);

        // Update encrypted budget data
        const savedData = authStorageService.loadBudgetData();
        if (savedData) {
          const { encryptedData, iv } = savedData;
          const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

          const updatedData = {
            ...decryptedData,
            currentUser: updatedProfile,
          };

          const encrypted = await encryptionUtils.encrypt(updatedData, encryptionKey);
          authStorageService.saveBudgetData(encrypted.data, salt, encrypted.iv);
        }

        return { success: true, profile: updatedProfile };
      } catch (error) {
        logger.error("Failed to update profile:", error);
        return { success: false, error: error.message };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        updateUser(result.profile);
      }
    },
    onError: (error) => {
      logger.error("Update profile mutation failed", error);
    },
  });
};
