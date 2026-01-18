import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withAsyncOperation,
  validateEncryptionContext,
  validateExportPassword,
} from "../asyncOperationHelpers";
import logger from "@/utils/core/common/logger";

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("asyncOperationHelpers", () => {
  describe("withAsyncOperation", () => {
    const mockSetLoading = vi.fn();
    const mockSetError = vi.fn();
    const handlers = {
      setLoading: mockSetLoading,
      setError: mockSetError,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should execute operation successfully and manage state", async () => {
      const mockOperation = vi.fn().mockResolvedValue("success");
      const result = await withAsyncOperation(mockOperation, handlers, "Test operation");

      expect(result).toBe("success");
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockOperation).toHaveBeenCalled();
    });

    it("should handle errors and set error state", async () => {
      const mockError = new Error("Operation failed");
      const mockOperation = vi.fn().mockRejectedValue(mockError);

      await expect(withAsyncOperation(mockOperation, handlers, "Test operation")).rejects.toThrow(
        "Test operation: Operation failed"
      );

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetError).toHaveBeenCalledWith("Test operation: Operation failed");
      expect(logger.error).toHaveBeenCalledWith("Test operation", mockError);
    });

    it("should always set loading to false even if operation fails", async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error("Failure"));

      try {
        await withAsyncOperation(mockOperation, handlers, "Test operation");
      } catch {
        // Expected
      }

      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it("should handle non-Error thrown values", async () => {
      const mockOperation = vi.fn().mockRejectedValue("string error");

      await expect(withAsyncOperation(mockOperation, handlers, "Test operation")).rejects.toThrow(
        "Test operation: string error"
      );

      expect(mockSetError).toHaveBeenCalledWith("Test operation: string error");
    });
  });

  describe("validateEncryptionContext", () => {
    it("should return validated context when all parameters are provided", () => {
      const mockKey = {} as CryptoKey;
      const mockSalt = new Uint8Array([1, 2, 3]);
      const mockBudgetId = "test-budget";

      const result = validateEncryptionContext(mockKey, mockSalt, mockBudgetId);

      expect(result).toEqual({
        encryptionKey: mockKey,
        salt: mockSalt,
        budgetId: mockBudgetId,
      });
    });

    it("should throw when encryptionKey is missing", () => {
      expect(() => {
        validateEncryptionContext(null, new Uint8Array([1, 2, 3]), "budgetId");
      }).toThrow("No encryption key available - please login first");
    });

    it("should throw when salt is missing", () => {
      const mockKey = {} as CryptoKey;
      expect(() => {
        validateEncryptionContext(mockKey, null, "budgetId");
      }).toThrow("No encryption key available - please login first");
    });

    it("should throw when budgetId is missing", () => {
      const mockKey = {} as CryptoKey;
      expect(() => {
        validateEncryptionContext(mockKey, new Uint8Array([1, 2, 3]), null);
      }).toThrow("No encryption key available - please login first");
    });

    it("should throw when all parameters are missing", () => {
      expect(() => {
        validateEncryptionContext(null, null, null);
      }).toThrow("No encryption key available - please login first");
    });
  });

  describe("validateExportPassword", () => {
    it("should not throw for valid password", () => {
      expect(() => {
        validateExportPassword("12345678");
      }).not.toThrow();
    });

    it("should not throw for password longer than minimum", () => {
      expect(() => {
        validateExportPassword("verylongpassword");
      }).not.toThrow();
    });

    it("should throw for password shorter than minimum length", () => {
      expect(() => {
        validateExportPassword("short");
      }).toThrow("Export password must be at least 8 characters long");
    });

    it("should throw for empty password", () => {
      expect(() => {
        validateExportPassword("");
      }).toThrow("Export password must be at least 8 characters long");
    });

    it("should use custom minimum length when provided", () => {
      expect(() => {
        validateExportPassword("12345", 10);
      }).toThrow("Export password must be at least 10 characters long");
    });

    it("should accept password that meets custom minimum length", () => {
      expect(() => {
        validateExportPassword("1234567890", 10);
      }).not.toThrow();
    });
  });
});
