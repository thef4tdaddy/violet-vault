import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyManagementUI, useKeyManagementOperations } from "../useKeyManagementUI";

// Mock dependencies
vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
  },
}));

import { globalToast } from "@/stores/ui/toastStore";

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

import logger from "@/utils/common/logger";

describe("useKeyManagementUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useKeyManagementUI());

    expect(result.current.activeTab).toBe("export");
    expect(result.current.showAdvanced).toBe(false);
    expect(result.current.exportPassword).toBe("");
    expect(result.current.importPassword).toBe("");
    expect(result.current.vaultPassword).toBe("");
    expect(result.current.showExportPassword).toBe(false);
    expect(result.current.showImportPassword).toBe(false);
    expect(result.current.showVaultPassword).toBe(false);
    expect(result.current.keyFingerprint).toBe("");
    expect(result.current.copiedToClipboard).toBe(false);
    expect(result.current.importResult).toBe(null);
  });

  it("should handle tab changes", () => {
    const { result } = renderHook(() => useKeyManagementUI());

    act(() => {
      result.current.handleTabChange("import");
    });

    expect(result.current.activeTab).toBe("import");
  });

  it("should toggle advanced settings", () => {
    const { result } = renderHook(() => useKeyManagementUI());

    act(() => {
      result.current.toggleAdvanced();
    });

    expect(result.current.showAdvanced).toBe(true);

    act(() => {
      result.current.toggleAdvanced();
    });

    expect(result.current.showAdvanced).toBe(false);
  });

  it("should toggle password visibility for all fields", () => {
    const { result } = renderHook(() => useKeyManagementUI());

    // Test export password visibility
    act(() => {
      result.current.togglePasswordVisibility("export");
    });
    expect(result.current.showExportPassword).toBe(true);

    // Test import password visibility
    act(() => {
      result.current.togglePasswordVisibility("import");
    });
    expect(result.current.showImportPassword).toBe(true);

    // Test vault password visibility
    act(() => {
      result.current.togglePasswordVisibility("vault");
    });
    expect(result.current.showVaultPassword).toBe(true);
  });

  it("should update passwords for all fields", () => {
    const { result } = renderHook(() => useKeyManagementUI());

    act(() => {
      result.current.updatePassword("export", "export123");
      result.current.updatePassword("import", "import456");
      result.current.updatePassword("vault", "vault789");
    });

    expect(result.current.exportPassword).toBe("export123");
    expect(result.current.importPassword).toBe("import456");
    expect(result.current.vaultPassword).toBe("vault789");
  });

  it("should reset state", () => {
    const { result } = renderHook(() => useKeyManagementUI());

    // Set some state
    act(() => {
      result.current.updatePassword("export", "test");
      result.current.setImportResult({
        success: true,
        importResult: {} as any,
        loginResult: {} as any,
      });
      result.current.setKeyFingerprint("test-fingerprint");
    });

    // Reset state
    act(() => {
      result.current.resetState();
    });

    expect(result.current.exportPassword).toBe("");
    expect(result.current.importPassword).toBe("");
    expect(result.current.vaultPassword).toBe("");
    expect(result.current.importResult).toBe(null);
    expect(result.current.copiedToClipboard).toBe(false);
    expect(result.current.keyFingerprint).toBe("");
  });

  it("should handle clipboard success with timeout", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useKeyManagementUI());

    act(() => {
      result.current.handleClipboardSuccess();
    });

    expect(result.current.copiedToClipboard).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.copiedToClipboard).toBe(false);

    vi.useRealTimers();
  });
});

describe("useKeyManagementOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateExportPassword", () => {
    it("should accept strong passwords", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const isValid = result.current.validateExportPassword("strongpassword123");

      expect(isValid).toBe(true);
    });

    it("should reject weak passwords", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const isValid = result.current.validateExportPassword("weak");

      expect(isValid).toBe(false);
      expect(globalToast.showError).toHaveBeenCalledWith(
        "Export password must be at least 8 characters long",
        "Password Too Short"
      );
    });

    it("should reject empty passwords", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const isValid = result.current.validateExportPassword("");

      expect(isValid).toBe(false);
      expect(globalToast.showError).toHaveBeenCalled();
    });
  });

  describe("validateImportRequirements", () => {
    it("should validate successful import requirements", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const keyFileData = { type: "unprotected" };
      const validation = { valid: true, type: "unprotected" };

      const isValid = result.current.validateImportRequirements(
        keyFileData,
        "",
        "vaultpassword",
        validation
      );

      expect(isValid).toBe(true);
    });

    it("should reject invalid key files", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const validation = { valid: false, error: "Invalid format" };

      const isValid = result.current.validateImportRequirements(
        {},
        "",
        "vaultpassword",
        validation
      );

      expect(isValid).toBe(false);
      expect(globalToast.showError).toHaveBeenCalledWith(
        "Invalid key file: Invalid format",
        "Invalid Key File",
        8000
      );
    });

    it("should require import password for protected files", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const validation = { valid: true, type: "protected" };

      const isValid = result.current.validateImportRequirements(
        {},
        "", // Empty import password
        "vaultpassword",
        validation
      );

      expect(isValid).toBe(false);
      expect(globalToast.showError).toHaveBeenCalledWith(
        "This key file is password protected. Please enter the export password.",
        "Password Required"
      );
    });

    it("should require vault password", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const validation = { valid: true, type: "unprotected" };

      const isValid = result.current.validateImportRequirements(
        {},
        "",
        "", // Empty vault password
        validation
      );

      expect(isValid).toBe(false);
      expect(globalToast.showError).toHaveBeenCalledWith(
        "Please enter your vault password to complete the import.",
        "Vault Password Required"
      );
    });
  });

  describe("handleFileRead", () => {
    it("should read and parse JSON file", async () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const mockFile = {
        text: vi.fn(() => Promise.resolve('{"type":"unprotected","key":[1,2,3]}')),
      };

      const data = await result.current.handleFileRead(mockFile as any);

      expect(data).toEqual({
        type: "unprotected",
        key: [1, 2, 3],
      });
    });

    it("should handle file read errors", async () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const mockFile = {
        text: vi.fn(() => Promise.reject(new Error("File read error"))),
      };

      await expect(result.current.handleFileRead(mockFile as any)).rejects.toThrow(
        "File read error"
      );
      expect(globalToast.showError).toHaveBeenCalledWith(
        "Failed to read key file. Please check the file format.",
        "File Read Error"
      );
    });

    it("should handle JSON parse errors", async () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const mockFile = {
        text: vi.fn(() => Promise.resolve("invalid-json")),
      };

      await expect(result.current.handleFileRead(mockFile as any)).rejects.toThrow();
      expect(globalToast.showError).toHaveBeenCalled();
    });
  });

  describe("handleImportError", () => {
    it("should handle import errors with message", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const error = new Error("Import failed");

      result.current.handleImportError(error);

      expect(logger.error).toHaveBeenCalledWith("Import failed:", error);
      expect(globalToast.showError).toHaveBeenCalledWith(
        "Import failed: Import failed",
        "Import Failed",
        8000
      );
    });

    it("should handle import errors without message", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const error = {} as Error;

      result.current.handleImportError(error);

      expect(globalToast.showError).toHaveBeenCalledWith(
        "Import failed: Unknown error",
        "Import Failed",
        8000
      );
    });
  });

  describe("handleOperationError", () => {
    it("should handle operation errors", () => {
      const { result } = renderHook(() => useKeyManagementOperations());

      const error = new Error("Operation failed");

      result.current.handleOperationError("Test operation", error);

      expect(logger.error).toHaveBeenCalledWith("Test operation failed:", error);
      expect(globalToast.showError).toHaveBeenCalledWith(
        "Test operation failed: Operation failed",
        "Test operation Failed"
      );
    });
  });
});
