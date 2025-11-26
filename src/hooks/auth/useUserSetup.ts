import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";
import { budgetDb, clearData } from "../../db/budgetDb";
import localStorageService from "../../services/storage/localStorageService";
import type { UserData } from "@/types/auth";

// Type definitions for user setup
interface UserProfile {
  userName?: string;
  userColor?: string;
  shareCode?: string;
}

interface ErrorWithCode {
  code?: string;
  error?: string;
  suggestion?: string;
  canCreateNew?: boolean;
}

type SetupPayload = string | (UserData & { password: string });

export type UserSetupPayload = SetupPayload;

type AsyncFunction = () => Promise<void>;

/**
 * User Setup Hook
 * Manages all user setup state and business logic
 * Extracted from UserSetup component for better organization
 */
export const useUserSetup = (onSetupComplete: (payload: SetupPayload) => Promise<void>) => {
  // State management
  const [step, setStep] = useState(1);
  const [masterPassword, setMasterPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#a855f7");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [shareCode, setShareCode] = useState("");

  // Load saved user profile on component mount
  useEffect(() => {
    const checkUserData = async () => {
      logger.debug("🔍 UserSetup mounted, checking for saved profile");
      const savedProfile = localStorageService.getUserProfile() as UserProfile | null;
      const savedData = localStorageService.getBudgetData();

      if (savedProfile) {
        try {
          logger.debug("📋 Found saved profile", { savedProfile });
          setUserName(savedProfile.userName || "");
          setUserColor(savedProfile.userColor || "#a855f7");

          // Check for budget data in localStorage first, then Dexie
          let hasBudgetData = !!savedData;

          if (!hasBudgetData) {
            try {
              // Check Dexie for budget data
              const envelopeCount = await budgetDb.envelopes.count();
              const billCount = await budgetDb.bills.count();
              hasBudgetData = envelopeCount > 0 || billCount > 0;

              if (hasBudgetData) {
                logger.debug("📋 Found budget data in Dexie", {
                  envelopeCount,
                  billCount,
                });
              }
            } catch (dexieError) {
              logger.warn("Failed to check Dexie for budget data", { error: dexieError });
            }
          }

          // Only treat as returning user if BOTH profile AND budget data exist
          if (hasBudgetData) {
            setIsReturningUser(true);
            logger.debug("👋 Returning user detected", {
              hasProfile: !!savedProfile,
              hasLocalStorageData: !!savedData,
              hasDexieData: hasBudgetData && !savedData,
              userName: savedProfile.userName,
            });
          } else {
            logger.debug("📋 Profile found but no budget data - treating as new user");
            setIsReturningUser(false);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.warn("Failed to load saved profile", { error: errorMessage });
          setIsReturningUser(false);
        }
      } else {
        logger.debug("📋 No saved profile found, new user");
        setIsReturningUser(false);
      }
    };

    checkUserData();
  }, []);

  // Timeout utility to prevent hanging operations
  const handleWithTimeout = async (asyncFn: AsyncFunction, timeoutMs = 5000) => {
    return Promise.race([
      asyncFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  };

  // Handle final form submission (step 2)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    logger.debug("🔄 Form submitted - STEP 2 HANDLER", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Form validation failed", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      return;
    }

    setIsLoading(true);
    try {
      logger.debug("🚀 Calling onSetupComplete...");
      await onSetupComplete({
        password: masterPassword,
        userName: userName.trim(),
        userColor,
      });
      logger.debug("✅ onSetupComplete succeeded");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("❌ Setup failed", { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle step 1 continue - different flow for returning vs new users
  const handleStep1Continue = async (e: FormEvent) => {
    e.preventDefault();
    logger.debug("🔄 Step 1 continue clicked", {
      step,
      masterPassword: !!masterPassword,
      isReturningUser,
    });

    if (isReturningUser) {
      // For returning users, try to login directly
      if (!masterPassword) {
        globalToast.showError("Please enter your password", "Password Required", 8000);
        return;
      }

      setIsLoading(true);
      try {
        logger.debug("🚀 Attempting login for returning user...");
        // For returning users, only pass password to trigger existing user validation path
        await onSetupComplete(masterPassword);
        logger.debug("✅ Returning user login succeeded");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("❌ Login failed", { error: errorMessage });

        // Check if this is a new password validation error with suggestion
        if (error && typeof error === "object" && "code" in error) {
          const errorWithCode = error as ErrorWithCode;
          if (
            errorWithCode.code === "INVALID_PASSWORD_OFFER_NEW_BUDGET" &&
            errorWithCode.canCreateNew
          ) {
            // Show error with suggestion - let the UI handle the confirmation flow
            globalToast.showError(
              `${errorWithCode.error}\n\n${errorWithCode.suggestion}`,
              "Password Mismatch - Create New Budget?"
            );
            return; // Don't show generic error toast
          }

          // Check if this is a no data found error with suggestion to start over
          if (
            errorWithCode.code === "NO_DATA_FOUND_OFFER_NEW_BUDGET" &&
            errorWithCode.canCreateNew
          ) {
            globalToast.showError(
              `${errorWithCode.error}\n\n${errorWithCode.suggestion}`,
              "No Data Found - Start Over?"
            );
            return; // Don't show generic error toast
          }
        }

        globalToast.showError("Incorrect password. Please try again.", "Login Failed", 8000);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new users, proceed to step 2
      setStep(2);
    }
  };

  // Handle start tracking button click (step 2 -> step 3)
  const handleStartTrackingClick = async (e: FormEvent) => {
    e.preventDefault();
    logger.debug("🎯 Continue to Share Code step clicked", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Validation failed on Continue", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      globalToast.showError("Please fill in both password and name", "Required Fields", 8000);
      return;
    }

    setIsLoading(true);
    try {
      // Generate share code for Step 3 using centralized manager
      const { shareCodeManager } = await import("../../utils/auth/shareCodeManager");
      const generatedShareCode = shareCodeManager.generateShareCode();

      setShareCode(generatedShareCode);
      setStep(3); // Move to share code display step

      logger.debug("✅ Moved to Step 3 (Share Code Display)");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("❌ Setup failed from Start Tracking", { error: errorMessage });
      globalToast.showError(`Setup failed: ${errorMessage}`, "Setup Failed", 8000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle final "Create Budget" button click (step 3)
  const handleCreateBudget = async (e?: FormEvent) => {
    e?.preventDefault();
    logger.debug("🚀 Create Budget button clicked", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
      shareCode: !!shareCode,
    });

    setIsLoading(true);
    try {
      logger.debug("🚀 Calling onSetupComplete with share code...");

      // Add timeout protection
      await handleWithTimeout(async () => {
        // Pass password as first param, userData as second param for new user creation
        await onSetupComplete({
          password: masterPassword,
          userName: userName.trim(),
          userColor,
          shareCode,
        });
      }, 10000);

      logger.debug("✅ onSetupComplete succeeded with share code");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("❌ Setup failed with share code", { error: errorMessage });
      globalToast.showError(`Setup failed: ${errorMessage}`, "Setup Failed", 8000);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear saved profile and start fresh
  const clearSavedProfile = async () => {
    logger.debug("🗑️ Clearing saved profile and budget data");

    // Clear localStorage data
    localStorageService.removeItem("userProfile");
    localStorageService.removeBudgetData();

    // Clear IndexedDB/Dexie data
    try {
      logger.debug("🗑️ Clearing Dexie database data");
      await clearData();
      logger.debug("✅ Successfully cleared Dexie database");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("❌ Failed to clear Dexie database", { error: errorMessage });
      globalToast.showError(
        "Failed to clear local data completely. Some data may persist.",
        "Clear Data Warning"
      );
    }

    // Clear additional localStorage keys that might persist user data
    const keysToRemove = [
      "localDataSecurityAcknowledged",
      "localDataSecurityAcknowledgedAt",
      "envelopeBudgetLastSync",
      "cloudSyncEnabled",
      "userSettings",
    ];

    keysToRemove.forEach((key) => {
      localStorageService.removeItem(key);
      logger.debug(`🗑️ Cleared localStorage key: ${key}`);
    });

    setUserName("");
    setUserColor("#a855f7");
    setStep(1);
    setIsReturningUser(false);

    logger.debug("✅ Start Fresh complete - all user data cleared");
  };

  // Handle password input change
  const handlePasswordChange = (value: string) => {
    // Removed noisy debug log - fires on every keystroke
    setMasterPassword(value);
  };

  // Handle name input change
  const handleNameChange = (value: string) => {
    // Removed noisy debug log - fires on every keystroke
    setUserName(value);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle returning user flow changes
  const switchToChangeProfile = () => {
    setIsReturningUser(false);
    setStep(2);
  };

  // Navigate back to step 1
  const goBackToStep1 = () => {
    setStep(1);
  };

  // Navigate back to step 2 from step 3
  const goBackToStep2 = () => {
    setStep(2);
  };

  return {
    // State
    step,
    masterPassword,
    userName,
    userColor,
    showPassword,
    isLoading,
    isReturningUser,
    shareCode,

    // Actions
    handleSubmit,
    handleStep1Continue,
    handleStartTrackingClick,
    handleCreateBudget,
    clearSavedProfile,
    handlePasswordChange,
    handleNameChange,
    togglePasswordVisibility,
    switchToChangeProfile,
    goBackToStep1,
    goBackToStep2,
    setUserColor,

    // Utilities
    handleWithTimeout,
  };
};
