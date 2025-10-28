import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { encryptionUtils } from "../../../utils/security/encryption";
import logger from "../../../utils/common/logger";
import localStorageService from "../../../services/storage/localStorageService";
import type { UserData } from "../../../types/auth";

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
    mutationFn: async (updatedProfile: Partial<UserData>) => {
      try {
        if (!encryptionKey || !salt) {
          return { success: false, error: "Not authenticated." };
        }

        // Update localStorage profile
        const profileData = {
          userName: updatedProfile.userName,
          userColor: updatedProfile.userColor,
        };
        localStorageService.setUserProfile(profileData);

        // Update encrypted budget data
        const savedData = localStorageService.getBudgetData();
        if (savedData) {
          const { encryptedData, iv } = savedData;
          const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

          const updatedData = {
            ...decryptedData,
            currentUser: updatedProfile,
          };

          const encrypted = await encryptionUtils.encrypt(updatedData, encryptionKey);
          localStorageService.setBudgetData({
            encryptedData: encrypted.data,
            salt: Array.from(salt),
            iv: encrypted.iv,
          });
        }

        return { success: true, profile: updatedProfile };
      } catch (error) {
        logger.error("Failed to update profile:", error);
        return { success: false, error: (error as Error).message };
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
