import { useState, useEffect } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

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

  // Load saved user profile on component mount
  useEffect(() => {
    logger.debug("🔍 UserSetup mounted, checking for saved profile");
    const savedProfile = localStorage.getItem("userProfile");
    const savedData = localStorage.getItem("envelopeBudgetData");

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        logger.debug("📋 Found saved profile:", profile);
        setUserName(profile.userName || "");
        setUserColor(profile.userColor || "#a855f7");
        setIsReturningUser(true);
        logger.debug("👋 Returning user detected", {
          hasProfile: !!savedProfile,
          hasData: !!savedData,
          userName: profile.userName,
        });
      } catch (error) {
        logger.warn("Failed to load saved profile:", error);
        setIsReturningUser(false);
      }
    } else {
      logger.debug("📋 No saved profile found, new user");
      setIsReturningUser(false);
    }
  }, []);

  // Timeout utility to prevent hanging operations
  const handleWithTimeout = async (asyncFn, timeoutMs = 5000) => {
    return Promise.race([
      asyncFn(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs,
        ),
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
        globalToast.showError(
          "Please enter your password",
          "Password Required",
        );
        return;
      }

      setIsLoading(true);
      try {
        logger.debug("🚀 Attempting login for returning user...");
        await onSetupComplete({
          password: masterPassword,
          userName,
          userColor,
        });
        logger.debug("✅ Returning user login succeeded");
      } catch (error) {
        logger.error("❌ Login failed:", error);
        
        // Check if this is the new password validation error with suggestion
        if (error?.code === "INVALID_PASSWORD_OFFER_NEW_BUDGET" && error?.canCreateNew) {
          // Show confirmation dialog for creating new budget
          if (window.confirm(`${error.error}\n\n${error.suggestion}`)) {
            // User wants to create new budget - clear existing data and start fresh
            logger.debug("User chose to create new budget - clearing existing data");
            localStorage.removeItem("envelopeBudgetData");
            localStorage.removeItem("userProfile");
            window.location.reload(); // Refresh to start completely fresh
          }
          return; // Don't show generic error toast
        }
        
        globalToast.showError(
          "Incorrect password. Please try again.",
          "Login Failed",
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new users, proceed to step 2
      setStep(2);
    }
  };

  // Handle start tracking button click (step 2 alternative submission)
  const handleStartTrackingClick = async (e) => {
    e.preventDefault();
    logger.debug("🎯 Start Tracking button clicked:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Validation failed on Start Tracking:", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      globalToast.showError(
        "Please fill in both password and name",
        "Required Fields",
      );
      return;
    }

    setIsLoading(true);
    try {
      logger.debug("🚀 Calling onSetupComplete from Start Tracking...");

      // Add timeout protection
      await handleWithTimeout(async () => {
        await onSetupComplete({
          password: masterPassword,
          userName: userName.trim(),
          userColor,
        });
      }, 10000);

      logger.debug("✅ onSetupComplete succeeded from Start Tracking");
    } catch (error) {
      logger.error("❌ Setup failed from Start Tracking:", error);
      globalToast.showError(`Setup failed: ${error.message}`, "Setup Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear saved profile and start fresh
  const clearSavedProfile = () => {
    logger.debug("🗑️ Clearing saved profile");
    localStorage.removeItem("userProfile");
    setUserName("");
    setUserColor("#a855f7");
    setStep(1);
    setIsReturningUser(false);
  };

  // Handle password input change
  const handlePasswordChange = (value) => {
    logger.debug("🔐 Password input changed");
    setMasterPassword(value);
  };

  // Handle name input change  
  const handleNameChange = (value) => {
    logger.debug("👤 Name input changed:", value);
    setUserName(value);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
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

  return {
    // State
    step,
    masterPassword,
    userName,
    userColor,
    showPassword,
    isLoading,
    isReturningUser,

    // Actions
    handleSubmit,
    handleStep1Continue,
    handleStartTrackingClick,
    clearSavedProfile,
    handlePasswordChange,
    handleNameChange,
    togglePasswordVisibility,
    switchToChangeProfile,
    goBackToStep1,
    setUserColor,

    // Utilities
    handleWithTimeout,
  };
};