import { shareCodeUtils } from "../security/shareCodeUtils";
import logger from "@/utils/core/common/logger";

/**
 * Share Code Manager - Centralized share code generation and management
 * Ensures consistent share code handling across the entire auth flow
 */
export const shareCodeManager = {
  /**
   * Generate a new share code for a budget
   * This is the single source of truth for share code generation
   * @returns {string} 4-word BIP39 share code
   */
  generateShareCode(): string {
    const shareCode = shareCodeUtils.generateShareCode();

    logger.debug("Generated new share code", {
      shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
      source: "shareCodeManager",
    });

    return shareCode;
  },

  /**
   * Validate a share code format
   * @param {string} shareCode - The share code to validate
   * @returns {boolean} True if valid format
   */
  isValidShareCode(shareCode: string): boolean {
    if (!shareCode || typeof shareCode !== "string") {
      return false;
    }

    const words = shareCode.trim().split(/\s+/);
    return words.length === 4 && words.every((word) => word.length > 0);
  },

  /**
   * Format share code for display (capitalize words)
   * @param {string} shareCode - Raw share code
   * @returns {string} Formatted share code
   */
  formatForDisplay(shareCode: string): string {
    return shareCodeUtils.formatForDisplay(shareCode);
  },

  /**
   * Generate QR data for a share code
   * @param {string} shareCode - The share code
   * @param {Object} creatorInfo - Creator profile information
   * @returns {string} QR data string
   */
  generateQRData(shareCode: string, creatorInfo: Record<string, unknown> | null = null): string {
    return shareCodeUtils.generateQRData(shareCode, creatorInfo);
  },
};

export default shareCodeManager;
