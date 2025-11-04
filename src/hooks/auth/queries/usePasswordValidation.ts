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
 * Derive encryption key for password validation
 */
const deriveValidationKey = async (
  password: string,
  savedSalt: number[],
  shareCode?: string
): Promise<CryptoKey> => {
  if (shareCode) {
    const encoder = new TextEncoder();
    const shareCodeBytes = encoder.encode(shareCode);
    const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
    const saltArray = new Uint8Array(deterministicSalt);
    return encryptionUtils.deriveKeyFromSalt(password, saltArray);
  }

  const saltArray = new Uint8Array(savedSalt);
  return encryptionUtils.deriveKeyFromSalt(password, saltArray);
};

/**
 * Test password by attempting to decrypt saved data
 */
const testPasswordDecryption = async (
  password: string,
  savedData: { salt: number[]; encryptedData: number[]; iv: number[] },
  shareCode?: string
): Promise<{ isValid: boolean; reason?: string }> => {
  const testKey = await deriveValidationKey(password, savedData.salt, shareCode);

  try {
    await encryptionUtils.decrypt(savedData.encryptedData, testKey, savedData.iv);
    logger.auth("TanStack: Password validation successful");
    return { isValid: true };
  } catch {
    logger.auth("TanStack: Password validation failed - decryption failed");
    return { isValid: false, reason: "decryption_failed" };
  }
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

        const savedProfile = localStorageService.getUserProfile();
        return testPasswordDecryption(
          password,
          { salt: savedSalt, encryptedData, iv },
          savedProfile?.shareCode
        );
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
