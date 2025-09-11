import { useState, useEffect } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";
import { budgetDb } from "../../db/budgetDb";

/**
 * User Setup Hook
 * Manages all user setup state and business logic
 * Extracted from UserSetup component for better organization
 */
export const useUserSetup = (onSetupComplete) => {
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
      const savedProfile = localStorage.getItem("userProfile");
      const savedData = localStorage.getItem("envelopeBudgetData");

      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          logger.debug("📋 Found saved profile:", profile);
          setUserName(profile.userName || "");
          setUserColor(profile.userColor || "#a855f7");

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
              logger.warn("Failed to check Dexie for budget data:", dexieError);
            }
          }

          // Only treat as returning user if BOTH profile AND budget data exist
          if (hasBudgetData) {
            setIsReturningUser(true);
            logger.debug("👋 Returning user detected", {
              hasProfile: !!savedProfile,
              hasLocalStorageData: !!savedData,
              hasDexieData: hasBudgetData && !savedData,
              userName: profile.userName,
            });
          } else {
            logger.debug("📋 Profile found but no budget data - treating as new user");
            setIsReturningUser(false);
          }
        } catch (error) {
          logger.warn("Failed to load saved profile:", error);
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
  const handleWithTimeout = async (asyncFn, timeoutMs = 5000) => {
    return Promise.race([
      asyncFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  };

  // Handle final form submission (step 2)
  const handleSubmit = async (e) => {
    e.preventDefault();
    logger.debug("🔄 Form submitted - STEP 2 HANDLER:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Form validation failed:", {
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
      logger.error("❌ Setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle step 1 continue - different flow for returning vs new users
  const handleStep1Continue = async (e) => {
    e.preventDefault();
    logger.debug("🔄 Step 1 continue clicked:", {
      step,
      masterPassword: !!masterPassword,
      isReturningUser,
    });

    if (isReturningUser) {
      // For returning users, try to login directly
      if (!masterPassword) {
        globalToast.showError("Please enter your password", "Password Required");
        return;
      }

      setIsLoading(true);
      try {
        logger.debug("🚀 Attempting login for returning user...");
        // For returning users, only pass password to trigger existing user validation path
        await onSetupComplete(masterPassword);
        logger.debug("✅ Returning user login succeeded");
      } catch (error) {
        logger.error("❌ Login failed:", error);

        // Check if this is the new password validation error with suggestion
        if (error?.code === "INVALID_PASSWORD_OFFER_NEW_BUDGET" && error?.canCreateNew) {
          // Show error with suggestion - let the UI handle the confirmation flow
          globalToast.showError(
            `${error.error}\n\n${error.suggestion}`,
            "Password Mismatch - Create New Budget?"
          );
          return; // Don't show generic error toast
        }

        // Check if this is the no data found error with suggestion to start over
        if (error?.code === "NO_DATA_FOUND_OFFER_NEW_BUDGET" && error?.canCreateNew) {
          globalToast.showError(
            `${error.error}\n\n${error.suggestion}`,
            "No Data Found - Start Over?"
          );
          return; // Don't show generic error toast
        }

        globalToast.showError("Incorrect password. Please try again.", "Login Failed");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new users, proceed to step 2
      setStep(2);
    }
  };

  // Handle start tracking button click (step 2 -> step 3)
  const handleStartTrackingClick = async (e) => {
    e.preventDefault();
    logger.debug("🎯 Continue to Share Code step clicked:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Validation failed on Continue:", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      globalToast.showError("Please fill in both password and name", "Required Fields");
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
      logger.error("❌ Setup failed from Start Tracking:", error);
      globalToast.showError(`Setup failed: ${error.message}`, "Setup Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle final "Create Budget" button click (step 3)
  const handleCreateBudget = async (e) => {
    e.preventDefault();
    logger.debug("🚀 Create Budget button clicked:", {
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
        await onSetupComplete({
          password: masterPassword,
          userName: userName.trim(),
          userColor,
          shareCode, // Pass the share code that was displayed to the user
        });
      }, 10000);

      logger.debug("✅ onSetupComplete succeeded with share code");
    } catch (error) {
      logger.error("❌ Setup failed with share code:", error);
      globalToast.showError(`Setup failed: ${error.message}`, "Setup Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear saved profile and start fresh
  const clearSavedProfile = async () => {
    logger.debug("🗑️ Clearing saved profile and budget data");

    // Clear localStorage data
    localStorage.removeItem("userProfile");
    localStorage.removeItem("envelopeBudgetData");

    // Clear IndexedDB/Dexie data
    try {
      logger.debug("🗑️ Clearing Dexie database data");
      await budgetDb.clear();
      logger.debug("✅ Successfully cleared Dexie database");
    } catch (error) {
      logger.error("❌ Failed to clear Dexie database:", error);
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
      localStorage.removeItem(key);
      logger.debug(`🗑️ Cleared localStorage key: ${key}`);
    });

    setUserName("");
    setUserColor("#a855f7");
    setStep(1);
    setIsReturningUser(false);

    logger.debug("✅ Start Fresh complete - all user data cleared");
  };

  // Handle password input change
  const handlePasswordChange = (value) => {
    // Removed noisy debug log - fires on every keystroke
    setMasterPassword(value);
  };

  // Handle name input change
  const handleNameChange = (value) => {
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
