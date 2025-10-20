import logger from "../common/logger";

/**
 * Validates share code format and content
 */
export const isValidShareCode = (code: string): boolean => {
  if (!code || typeof code !== "string") {
    logger.warn("isValidShareCode called with invalid input:", { code });
    return false;
  }

  if (!code.trim()) {
    logger.warn("isValidShareCode called with empty code");
    return false;
  }

  return true;
};
