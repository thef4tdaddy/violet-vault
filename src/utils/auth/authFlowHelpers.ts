/**
 * Authentication flow helper functions
 * Extracted from useAuthFlow for better maintainability and ESLint compliance
 */
import logger from "../common/logger";

/**
 * Handle existing user login flow
 */
export const handleExistingUserLogin = async (password, login) => {
  logger.auth("Existing user login - calling login with password only");
  const result = await login(password, null);
  logger.auth("Existing user login result", { success: !!result });

  if (result.success) {
    logger.production("Existing user login successful");
    return result;
  } else {
    logger.error("❌ Existing user login failed:", result.error);
    const error = new Error(result.error);
    error.code = result.code;
    error.canCreateNew = result.canCreateNew;
    error.suggestion = result.suggestion;
    throw error;
  }
};

/**
 * Handle shared budget join flow
 */
export const handleSharedBudgetJoin = async (password, userData, login) => {
  logger.auth("Shared budget join - using provided budgetId", {
    budgetId: userData.budgetId?.substring(0, 10) + "...",
    sharedBy: userData.sharedBy,
  });

  const result = await login(password, userData);
  logger.auth("Shared budget join result", { success: !!result });

  if (result.success) {
    logger.production("Shared budget join successful", {
      budgetId: userData.budgetId?.substring(0, 8) + "...",
    });
    return result;
  } else {
    logger.error("❌ Shared budget join failed:", result.error);
    const error = new Error(result.error);
    error.code = result.code;
    throw error;
  }
};

/**
 * Generate budget ID for new user
 */
export const generateNewUserBudgetId = async (password, shareCode) => {
  const { encryptionUtils } = await import("../security/encryption");

  if (!shareCode) {
    throw new Error("Share code missing from user data - should be provided by setup flow");
  }

  const budgetId = await encryptionUtils.generateBudgetId(password, shareCode);

  logger.auth("🔍 Generated new budget with share code system", {
    budgetIdPreview: budgetId.substring(0, 10) + "...",
    shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
    envMode: import.meta?.env?.MODE || "unknown",
  });

  return budgetId;
};

/**
 * Handle new user setup flow
 */
export const handleNewUserSetup = async (password, userData, login) => {
  const budgetId = await generateNewUserBudgetId(password, userData.shareCode);

  const userDataWithId = {
    ...userData,
    budgetId: budgetId,
  };

  logger.auth("Calling login", {
    hasUserData: !!userDataWithId,
    hasPassword: !!password,
    budgetId: userDataWithId.budgetId,
  });

  const result = await login(password, userDataWithId);
  logger.auth("Login result", { success: !!result });

  if (result.success) {
    logger.production("User login successful", {
      budgetId: userData.budgetId,
    });

    logger.auth("✅ Budget history system ready (Dexie-based)");

    if (!localStorage.getItem("passwordLastChanged")) {
      localStorage.setItem("passwordLastChanged", Date.now().toString());
    }

    return result;
  } else {
    logger.error("❌ Setup failed:", result.error);
    const error = new Error(result.error);
    error.code = result.code;
    error.canCreateNew = result.canCreateNew;
    error.suggestion = result.suggestion;
    throw error;
  }
};
