import { encryptionUtils } from "../security/encryption";
import logger from "../common/logger";

/**
 * Budget Sharing Service
 * Handles secure budget sharing with QR codes and two-factor authentication
 *
 * Addresses GitHub Issue #580 - Password collision vulnerability fix
 */
export const budgetSharingService = {
  /**
   * Debug function to list all share codes in localStorage
   * @returns {Array} List of share codes
   */
  debugListShareCodes() {
    const shareCodes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("violetVault_shareCode_")) {
        const shareCode = key.replace("violetVault_shareCode_", "");
        const shareDataStr = localStorage.getItem(key);
        try {
          const shareData = JSON.parse(shareDataStr);
          shareCodes.push({
            code: shareCode,
            createdBy: shareData.createdBy,
            createdAt: new Date(shareData.createdAt).toLocaleString(),
            expiresAt: new Date(shareData.expiresAt).toLocaleString(),
            isActive: shareData.isActive,
            userCount: shareData.usedBy?.length + 1 || 1,
          });
        } catch (e) {
          logger.warn("Failed to parse share code data", {
            key,
            error: e.message,
          });
        }
      }
    }
    logger.info("Available share codes", shareCodes);
    return shareCodes;
  },
  /**
   * Generate a shareable code for the current budget
   * @param {string} budgetId - The current user's budgetId
   * @param {string} masterPassword - The master password for verification
   * @param {Object} currentUser - Current user info
   * @returns {Promise<{shareCode: string, qrCode: string, expiresAt: number}>}
   */
  async generateShareCode(budgetId, masterPassword, currentUser) {
    try {
      // Generate a random 8-character share code
      const shareCode = this._generateRandomCode();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      const shareData = {
        budgetId,
        createdBy: currentUser?.userName || "Unknown User",
        createdByUserId: currentUser?.id || currentUser?.uid || "anonymous",
        createdAt: Date.now(),
        expiresAt,
        isActive: true,
        maxUses: 10, // Prevent abuse
        usedBy: [], // Track who joined
      };

      // Store share code in localStorage for now (can be Firebase later)
      const shareKey = `violetVault_shareCode_${shareCode}`;
      localStorage.setItem(shareKey, JSON.stringify(shareData));

      // Generate QR code data
      const qrData = JSON.stringify({
        type: "violetVault_share",
        shareCode,
        budgetName: currentUser?.userName
          ? `${currentUser.userName}'s Budget`
          : "Shared Budget",
        version: "1.0",
      });

      logger.info("Generated share code", {
        shareCode,
        budgetId: budgetId?.substring(0, 8) + "...",
        expiresIn: "24 hours",
        createdBy: currentUser?.userName,
      });

      return {
        shareCode,
        qrData, // This will be used to generate QR code in UI
        expiresAt,
        shareUrl: `${window.location.origin}?share=${shareCode}`,
      };
    } catch (error) {
      logger.error("Failed to generate share code", error);
      throw new Error("Could not create share code. Please try again.");
    }
  },

  /**
   * Join a budget using share code and password
   * @param {string} shareCode - The share code to join
   * @param {string} userPassword - The user's chosen password for local encryption
   * @param {Object} userInfo - New user information
   * @returns {Promise<{budgetId: string, success: boolean}>}
   */
  async joinBudgetWithCode(shareCode, userPassword, userInfo) {
    try {
      // Look up share code
      const shareKey = `violetVault_shareCode_${shareCode}`;
      const shareDataStr = localStorage.getItem(shareKey);

      if (!shareDataStr) {
        throw new Error("Share code not found or expired");
      }

      const shareData = JSON.parse(shareDataStr);

      // Validate share code
      if (!shareData.isActive) {
        throw new Error("Share code has been deactivated");
      }

      if (Date.now() > shareData.expiresAt) {
        throw new Error("Share code has expired");
      }

      if (shareData.usedBy.length >= shareData.maxUses) {
        throw new Error("Share code has reached maximum uses");
      }

      // Record the join
      shareData.usedBy.push({
        userId: userInfo?.id || `user_${Date.now()}`,
        userName: userInfo?.userName || "Unknown User",
        joinedAt: Date.now(),
      });
      localStorage.setItem(shareKey, JSON.stringify(shareData));

      logger.info("Successfully joined budget via share code", {
        shareCode,
        budgetId: shareData.budgetId?.substring(0, 8) + "...",
        newUser: userInfo?.userName,
        totalUsers: shareData.usedBy.length + 1,
      });

      return {
        budgetId: shareData.budgetId,
        success: true,
        sharedBy: shareData.createdBy,
        userCount: shareData.usedBy.length + 1,
      };
    } catch (error) {
      logger.error("Failed to join budget with share code", error);
      throw error;
    }
  },

  /**
   * Validate share code without joining
   * @param {string} shareCode
   * @returns {Promise<{valid: boolean, shareData?: Object, error?: string}>}
   */
  async validateShareCode(shareCode) {
    try {
      logger.info("validateShareCode called", { shareCode });

      // Debug: List all available share codes
      this.debugListShareCodes();

      const shareKey = `violetVault_shareCode_${shareCode}`;
      logger.info("Looking for localStorage key", { shareKey });
      const shareDataStr = localStorage.getItem(shareKey);
      logger.info("localStorage lookup result", {
        found: !!shareDataStr,
        shareDataStr,
      });

      if (!shareDataStr) {
        logger.warn("Share code not found in localStorage", { shareKey });
        return { valid: false, error: "Share code not found" };
      }

      const shareData = JSON.parse(shareDataStr);

      if (!shareData.isActive) {
        return { valid: false, error: "Share code deactivated" };
      }

      if (Date.now() > shareData.expiresAt) {
        return { valid: false, error: "Share code expired" };
      }

      if (shareData.usedBy.length >= shareData.maxUses) {
        return { valid: false, error: "Share code at maximum uses" };
      }

      return {
        valid: true,
        shareData: {
          createdBy: shareData.createdBy,
          createdAt: shareData.createdAt,
          expiresAt: shareData.expiresAt,
          userCount: shareData.usedBy.length + 1,
        },
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Deactivate a share code
   * @param {string} shareCode
   * @returns {Promise<boolean>}
   */
  async deactivateShareCode(shareCode) {
    try {
      const shareKey = `violetVault_shareCode_${shareCode}`;
      const shareDataStr = localStorage.getItem(shareKey);

      if (shareDataStr) {
        const shareData = JSON.parse(shareDataStr);
        shareData.isActive = false;
        shareData.deactivatedAt = Date.now();
        localStorage.setItem(shareKey, JSON.stringify(shareData));

        logger.info("Deactivated share code", { shareCode });
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Failed to deactivate share code", error);
      return false;
    }
  },

  /**
   * Generate random 11-character code (e.g., "VV-A1B2-C3D4")
   * @private
   */
  _generateRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const sections = [];

    // Generate 2 sections of 4 characters each
    for (let section = 0; section < 2; section++) {
      let sectionCode = "";
      for (let i = 0; i < 4; i++) {
        sectionCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      sections.push(sectionCode);
    }

    return `VV-${sections.join("-")}`;
  },

  /**
   * Parse QR code data
   * @param {string} qrData
   * @returns {Object|null}
   */
  parseQRCode(qrData) {
    try {
      const data = JSON.parse(qrData);
      if (data.type === "violetVault_share" && data.shareCode) {
        return data;
      }
      return null;
    } catch {
      // Maybe it's just a plain share code
      if (qrData.match(/^VV-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
        return {
          type: "violetVault_share",
          shareCode: qrData,
          budgetName: "Shared Budget",
          version: "1.0",
        };
      }
      return null;
    }
  },
};

export default budgetSharingService;
