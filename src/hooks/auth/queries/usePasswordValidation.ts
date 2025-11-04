import { useQuery } from "@tanstack/react-query";
import { encryptionUtils } from "../../../utils/security/encryption";
import logger from "../../../utils/common/logger";
import localStorageService from "../../../services/storage/localStorageService";

/**
 * Password validation TanStack Query
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Query Keys
export const passwordValidationQueryKeys = {
  validation: (password) => ["auth", "validation", password],
};

/**
 * Hook for password validation query
 */
export const usePasswordValidation = (password, _options = {}) => {
  return useQuery({
    queryKey: passwordValidationQueryKeys.validation(password),
    queryFn: async () => {
      if (!password) return null;

      try {
        logger.auth("TanStack: Password validation started", {
          hasPassword: !!password,
        });

        const savedData = localStorageService.getBudgetData();
        if (!savedData) {
          logger.auth("TanStack: No saved data found - cannot validate password");
          return {
            isValid: false,
            reason: "no_encrypted_data_to_validate_against",
          };
        }

        const { salt: savedSalt, encryptedData, iv } = savedData;

        if (!savedSalt || !encryptedData || !iv) {
          logger.auth("TanStack: Missing required encryption components");
          return { isValid: false, reason: "missing_encryption_components" };
        }

        // Check if user has a shareCode (shared budget)
        // If so, use deterministic salt from shareCode (same logic as login)
        const savedProfile = localStorageService.getUserProfile();
        const hasShareCode = savedProfile?.shareCode;

        let testKey: CryptoKey;

        if (hasShareCode) {
          // For shared budgets, derive deterministic salt from shareCode
          const encoder = new TextEncoder();
          const shareCodeBytes = encoder.encode(hasShareCode);
          const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
          const saltArray = new Uint8Array(deterministicSalt);
          testKey = await encryptionUtils.deriveKeyFromSalt(password, saltArray);
        } else {
          // For regular budgets, use saved salt from localStorage
          const saltArray = new Uint8Array(savedSalt);
          testKey = await encryptionUtils.deriveKeyFromSalt(password, saltArray);
        }

        try {
          await encryptionUtils.decrypt(encryptedData, testKey, iv);
          logger.auth("TanStack: Password validation successful");
          return { isValid: true };
        } catch {
          logger.auth("TanStack: Password validation failed - decryption failed");
          return { isValid: false, reason: "decryption_failed" };
        }
      } catch (error) {
        logger.error("TanStack: Password validation error", error);
        return {
          isValid: false,
          reason: "unexpected_error",
          error: error.message,
        };
      }
    },
    enabled: !!password && password.length > 0,
    staleTime: 0, // Always fresh validation
  });
};
