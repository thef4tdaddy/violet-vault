/**
 * Word-based Share Code Utilities
 * Generates human-readable 4-word share codes for deterministic budget IDs
 * Replaces device-specific budget ID system with user-controlled share codes
 *
 * Created for GitHub Issue #588
 */
import * as bip39 from "bip39";
import { Buffer } from "buffer";
import logger from "../common/logger";

// Make Buffer available globally for BIP39
globalThis.Buffer = Buffer;

export const shareCodeUtils = {
  /**
   * Generate a 4-word share code from random entropy
   * @returns {string} 4 words separated by spaces (e.g., "ketchup monkey checkbook randomness")
   */
  generateShareCode() {
    try {
      // Generate 128 bits of entropy (16 bytes) for 12-word mnemonic
      // We'll use only the first 4 words for simplicity
      const mnemonic = bip39.generateMnemonic(128);
      const words = mnemonic.split(" ").slice(0, 4);
      const shareCode = words.join(" ");

      logger.info("Generated new share code", {
        wordCount: words.length,
        preview: words[0] + " " + words[1] + " ...",
      });

      return shareCode;
    } catch (error) {
      logger.error("Failed to generate share code", error);
      throw new Error("Share code generation failed");
    }
  },

  /**
   * Validate that a share code has the correct format
   * @param {string} shareCode - The share code to validate
   * @returns {boolean} True if valid 4-word format
   */
  validateShareCode(shareCode) {
    if (!shareCode || typeof shareCode !== "string") {
      return false;
    }

    const words = shareCode.trim().split(" ");

    // Must be exactly 4 words
    if (words.length !== 4) {
      return false;
    }

    // Each word must be valid BIP39 word
    const wordlist = bip39.getDefaultWordlist();
    return words.every((word) => wordlist.includes(word.toLowerCase()));
  },

  /**
   * Normalize share code format (lowercase, single spaces)
   * @param {string} shareCode - The share code to normalize
   * @returns {string} Normalized share code
   */
  normalizeShareCode(shareCode) {
    if (!shareCode) return "";

    return shareCode.toLowerCase().trim().replace(/\s+/g, " "); // Replace multiple spaces with single space
  },

  /**
   * Generate deterministic budget ID from password and share code
   * @param {string} password - User's master password
   * @param {string} shareCode - 4-word share code
   * @returns {Promise<string>} Budget ID in format "budget_xxxxxxxxxxxxxxxx"
   */
  async generateBudgetId(password, shareCode) {
    if (!password || !shareCode) {
      throw new Error("Both password and share code are required for budget ID generation");
    }

    const normalizedShareCode = this.normalizeShareCode(shareCode);

    if (!this.validateShareCode(normalizedShareCode)) {
      throw new Error("Invalid share code format - must be exactly 4 valid words");
    }

    try {
      // Use SHA-256 with password + normalized share code for deterministic budget ID
      const encoder = new TextEncoder();
      const data = encoder.encode(`budget_seed_${password}_${normalizedShareCode}_violet_vault`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = new Uint8Array(hashBuffer);

      // Convert to hex string and take first 16 characters for reasonable length
      const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const budgetId = `budget_${hashHex.substring(0, 16)}`;

      logger.info("Generated deterministic budget ID", {
        budgetIdPreview: budgetId.substring(0, 10) + "...",
        shareCodePreview: normalizedShareCode.split(" ").slice(0, 2).join(" ") + " ...",
      });

      return budgetId;
    } catch (error) {
      logger.error("Budget ID generation failed", error);
      throw new Error("Failed to generate budget ID from share code");
    }
  },

  /**
   * Generate QR code data for share code
   * @param {string} shareCode - The 4-word share code
   * @returns {string} QR code data string
   */
  generateQRData(shareCode) {
    const normalizedShareCode = this.normalizeShareCode(shareCode);

    if (!this.validateShareCode(normalizedShareCode)) {
      throw new Error("Invalid share code for QR generation");
    }

    // Format: VV-SHARE-words (compatible with existing QR system)
    return `VV-SHARE-${normalizedShareCode.replace(/\s+/g, "-")}`;
  },

  /**
   * Parse share code from QR data
   * @param {string} qrData - QR code data string
   * @returns {string|null} Share code or null if invalid
   */
  parseQRData(qrData) {
    if (!qrData || typeof qrData !== "string") {
      return null;
    }

    const match = qrData.match(/^VV-SHARE-(.+)$/);
    if (!match) {
      return null;
    }

    const shareCode = match[1].replace(/-/g, " ");

    if (this.validateShareCode(shareCode)) {
      return this.normalizeShareCode(shareCode);
    }

    return null;
  },

  /**
   * Get user-friendly display format for share code
   * @param {string} shareCode - The share code to format
   * @returns {string} Formatted share code for display
   */
  formatForDisplay(shareCode) {
    const normalized = this.normalizeShareCode(shareCode);

    if (!this.validateShareCode(normalized)) {
      return shareCode; // Return as-is if invalid
    }

    // Capitalize first letter of each word for display
    return normalized
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },
};

export default shareCodeUtils;
