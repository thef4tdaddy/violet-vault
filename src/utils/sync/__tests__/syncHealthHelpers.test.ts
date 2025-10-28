import {
  getStatusColor,
  getStatusBackgroundColor,
  getStatusText,
  getStatusDescription,
  formatLastChecked,
  getStatusPriority,
  requiresImmediateAttention,
  hasRecoveryActions,
  formatRecoveryResult,
  getActionButtonStyle,
} from "../syncHealthHelpers";

describe("syncHealthHelpers", () => {
  describe("getStatusColor", () => {
    it("should return blue for loading states", () => {
      expect(getStatusColor({ status: "HEALTHY", isLoading: true }, false)).toBe("text-blue-500");
      expect(getStatusColor({ status: "HEALTHY" }, true)).toBe("text-blue-500");
    });

    it("should return appropriate colors for each status", () => {
      expect(getStatusColor({ status: "HEALTHY" }, false)).toBe("text-green-500");
      expect(getStatusColor({ status: "ISSUES_DETECTED" }, false)).toBe("text-yellow-500");
      expect(getStatusColor({ status: "ERROR" }, false)).toBe("text-red-500");
      expect(getStatusColor({ status: "CRITICAL_FAILURE" }, false)).toBe("text-red-500");
      expect(getStatusColor({ status: "UNKNOWN" }, false)).toBe("text-gray-400");
    });
  });

  describe("getStatusBackgroundColor", () => {
    it("should return blue background for loading states", () => {
      expect(getStatusBackgroundColor({ status: "HEALTHY", isLoading: true }, false)).toBe(
        "bg-blue-100"
      );
      expect(getStatusBackgroundColor({ status: "HEALTHY" }, true)).toBe("bg-blue-100");
    });

    it("should return appropriate background colors for each status", () => {
      expect(getStatusBackgroundColor({ status: "HEALTHY" }, false)).toBe("bg-green-100");
      expect(getStatusBackgroundColor({ status: "ISSUES_DETECTED" }, false)).toBe("bg-yellow-100");
      expect(getStatusBackgroundColor({ status: "ERROR" }, false)).toBe("bg-red-100");
      expect(getStatusBackgroundColor({ status: "CRITICAL_FAILURE" }, false)).toBe("bg-red-100");
      expect(getStatusBackgroundColor({ status: "UNKNOWN" }, false)).toBe("bg-gray-100");
    });
  });

  describe("getStatusText", () => {
    it("should return appropriate text for loading and syncing states", () => {
      expect(getStatusText({ status: "HEALTHY", isLoading: true }, false)).toBe("Checking...");
      expect(getStatusText({ status: "HEALTHY" }, true)).toBe("Syncing...");
    });

    it("should return appropriate text for each status", () => {
      expect(getStatusText({ status: "HEALTHY" }, false)).toBe("Sync Healthy");
      expect(getStatusText({ status: "ISSUES_DETECTED", failedTests: 3 }, false)).toBe("3 Issues");
      expect(getStatusText({ status: "ISSUES_DETECTED" }, false)).toBe("0 Issues");
      expect(getStatusText({ status: "ERROR" }, false)).toBe("Sync Error");
      expect(getStatusText({ status: "CRITICAL_FAILURE" }, false)).toBe("Critical Error");
      expect(getStatusText({ status: "UNKNOWN" }, false)).toBe("Unknown");
    });
  });

  describe("getStatusDescription", () => {
    it("should return appropriate descriptions for loading and syncing states", () => {
      expect(getStatusDescription({ status: "HEALTHY", isLoading: true }, false)).toBe(
        "Checking sync health status..."
      );
      expect(getStatusDescription({ status: "HEALTHY" }, true)).toBe(
        "Background sync operation in progress..."
      );
    });

    it("should return appropriate descriptions for each status", () => {
      expect(getStatusDescription({ status: "HEALTHY" }, false)).toBe(
        "All sync systems are functioning normally"
      );
      expect(getStatusDescription({ status: "ISSUES_DETECTED", failedTests: 2 }, false)).toBe(
        "2 sync issues detected that may need attention"
      );
      expect(getStatusDescription({ status: "ERROR" }, false)).toBe(
        "Sync error detected - some operations may not be working"
      );
      expect(getStatusDescription({ status: "CRITICAL_FAILURE" }, false)).toBe(
        "Critical sync failure - immediate attention required"
      );
      expect(getStatusDescription({ status: "UNKNOWN" }, false)).toBe("Sync status unknown");
    });
  });

  describe("formatLastChecked", () => {
    it("should return 'Never checked' for null/undefined", () => {
      expect(formatLastChecked(null)).toBe("Never checked");
      expect(formatLastChecked(undefined)).toBe("Never checked");
    });

    it("should return 'Just now' for very recent times", () => {
      const now = new Date();
      expect(formatLastChecked(now.toISOString())).toBe("Just now");
    });

    it("should format minutes correctly", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatLastChecked(fiveMinutesAgo.toISOString())).toBe("5 minutes ago");

      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
      expect(formatLastChecked(oneMinuteAgo.toISOString())).toBe("1 minute ago");
    });

    it("should format hours correctly", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatLastChecked(twoHoursAgo.toISOString())).toBe("2 hours ago");

      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      expect(formatLastChecked(oneHourAgo.toISOString())).toBe("1 hour ago");
    });

    it("should format dates for old times", () => {
      const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const result = formatLastChecked(yesterday.toISOString());
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Should be a date string
    });

    it("should handle invalid dates", () => {
      expect(formatLastChecked("invalid-date")).toBe("Invalid date");
    });
  });

  describe("getStatusPriority", () => {
    it("should return correct priority for each status", () => {
      expect(getStatusPriority({ status: "CRITICAL_FAILURE" })).toBe("critical");
      expect(getStatusPriority({ status: "ERROR" })).toBe("high");
      expect(getStatusPriority({ status: "ISSUES_DETECTED" })).toBe("medium");
      expect(getStatusPriority({ status: "HEALTHY" })).toBe("low");
      expect(getStatusPriority({ status: "UNKNOWN" })).toBe("unknown");
    });
  });

  describe("requiresImmediateAttention", () => {
    it("should return true for error states", () => {
      expect(requiresImmediateAttention({ status: "ERROR" })).toBe(true);
      expect(requiresImmediateAttention({ status: "CRITICAL_FAILURE" })).toBe(true);
    });

    it("should return false for non-error states", () => {
      expect(requiresImmediateAttention({ status: "HEALTHY" })).toBe(false);
      expect(requiresImmediateAttention({ status: "ISSUES_DETECTED" })).toBe(false);
      expect(requiresImmediateAttention({ status: "UNKNOWN" })).toBe(false);
    });
  });

  describe("hasRecoveryActions", () => {
    it("should return true when recovery functions are available", () => {
      global.window.runMasterSyncValidation = vi.fn();
      global.window.forceCloudDataReset = vi.fn();

      expect(hasRecoveryActions()).toBe(true);

      // Cleanup
      delete global.window.runMasterSyncValidation;
      delete global.window.forceCloudDataReset;
    });

    it("should return false when no recovery functions are available", () => {
      expect(hasRecoveryActions()).toBe(false);
    });

    it("should return true when only one recovery function is available", () => {
      global.window.runMasterSyncValidation = vi.fn();

      expect(hasRecoveryActions()).toBe(true);

      // Cleanup
      delete global.window.runMasterSyncValidation;
    });
  });

  describe("formatRecoveryResult", () => {
    it("should return null for null/undefined results", () => {
      expect(formatRecoveryResult(null)).toBe(null);
      expect(formatRecoveryResult(undefined)).toBe(null);
    });

    it("should format successful results", () => {
      const result = {
        success: true,
        message: "Operation completed",
        details: "All systems restored",
      };

      const formatted = formatRecoveryResult(result);
      expect(formatted).toEqual({
        type: "success",
        message: "Operation completed",
        details: "All systems restored",
      });
    });

    it("should format failed results", () => {
      const result = {
        success: false,
        error: "Operation failed",
        details: "Network error",
      };

      const formatted = formatRecoveryResult(result);
      expect(formatted).toEqual({
        type: "error",
        message: "Operation failed",
        details: "Network error",
      });
    });

    it("should use default messages when not provided", () => {
      const successResult = { success: true };
      const failedResult = { success: false };

      expect(formatRecoveryResult(successResult).message).toBe(
        "Recovery operation completed successfully"
      );
      expect(formatRecoveryResult(failedResult).message).toBe("Recovery operation failed");
    });
  });

  describe("getActionButtonStyle", () => {
    const baseStyle =
      "px-3 py-2 text-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all font-bold";
    const mockSyncStatus = { status: "HEALTHY" };

    it("should return validate button style", () => {
      const style = getActionButtonStyle("validate", mockSyncStatus);
      expect(style).toBe(
        `${baseStyle} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700`
      );
    });

    it("should return reset button style", () => {
      const style = getActionButtonStyle("reset", mockSyncStatus);
      expect(style).toBe(
        `${baseStyle} bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600`
      );
    });

    it("should return refresh button style", () => {
      const style = getActionButtonStyle("refresh", mockSyncStatus);
      expect(style).toBe(
        `${baseStyle} bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700`
      );
    });

    it("should return default button style for unknown types", () => {
      const style = getActionButtonStyle("unknown", mockSyncStatus);
      expect(style).toBe(
        `${baseStyle} bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80`
      );
    });
  });
});
