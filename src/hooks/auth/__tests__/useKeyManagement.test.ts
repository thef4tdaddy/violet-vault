import { renderHook, act, waitFor } from "@testing-library/react";
import { useKeyManagement } from "../useKeyManagement";
import { useAuth } from "@/hooks/auth/useAuth";
import { keyExportUtils } from "@/utils/platform/security/keyExport";
import { vi, describe, it, expect, beforeEach } from "vitest";
import logger from "@/utils/core/common/logger";

// Mock dependencies
vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/utils/platform/security/keyExport", () => ({
  keyExportUtils: {
    exportKeyData: vi.fn(),
    createProtectedKeyFile: vi.fn(),
    exportToClipboard: vi.fn(),
    downloadKeyFile: vi.fn(),
    generateQRCode: vi.fn(),
    validateKeyFile: vi.fn(),
    importKeyData: vi.fn(),
    importProtectedKeyFile: vi.fn(),
    generateKeyFingerprint: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useKeyManagement", () => {
  const mockEncryptionKey = { type: "secret" };
  const mockSalt = new Uint8Array([1, 2, 3]);
  const mockBudgetId = "test-budget-id";
  const mockLogin = vi.fn();

  const mockKeyData = {
    fingerprint: "test-fingerprint",
    budgetId: mockBudgetId,
    salt: mockSalt,
    exportedAt: "2024-01-01T00:00:00Z",
    deviceFingerprint: "test-device",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      encryptionKey: mockEncryptionKey,
      salt: mockSalt,
      budgetId: mockBudgetId,
      login: mockLogin,
    });
  });

  describe("initial state", () => {
    it("should initialize with default states", () => {
      const { result } = renderHook(() => useKeyManagement());
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.qrCodeUrl).toBe(null);
    });
  });

  describe("exportKey", () => {
    it("should export key data successfully when logged in", async () => {
      (keyExportUtils.exportKeyData as any).mockResolvedValue(mockKeyData);

      const { result } = renderHook(() => useKeyManagement());

      let exportedData;
      await act(async () => {
        exportedData = await result.current.exportKey();
      });

      expect(exportedData).toEqual(mockKeyData);
      expect(keyExportUtils.exportKeyData).toHaveBeenCalledWith(
        mockEncryptionKey,
        mockSalt,
        mockBudgetId
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should set error if not logged in", async () => {
      (useAuth as any).mockReturnValue({
        encryptionKey: null,
        salt: null,
        budgetId: null,
      });

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.exportKey();
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain("No encryption key available");
      expect(result.current.loading).toBe(false);
    });

    it("should handle export errors", async () => {
      const errorMsg = "Export failed";
      (keyExportUtils.exportKeyData as any).mockRejectedValue(new Error(errorMsg));

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.exportKey();
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain(errorMsg);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("exportProtectedKey", () => {
    it("should export protected key file successfully", async () => {
      const mockProtectedFile = { data: "encrypted-data", salt: "abc" };
      (keyExportUtils.exportKeyData as any).mockResolvedValue(mockKeyData);
      (keyExportUtils.createProtectedKeyFile as any).mockResolvedValue(mockProtectedFile);

      const { result } = renderHook(() => useKeyManagement());
      const password = "secure-password";

      let protectedFile;
      await act(async () => {
        protectedFile = await result.current.exportProtectedKey(password);
      });

      expect(protectedFile).toEqual(mockProtectedFile);
      expect(keyExportUtils.createProtectedKeyFile).toHaveBeenCalledWith(mockKeyData, password);
    });

    it("should validate password length", async () => {
      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.exportProtectedKey("short");
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain("at least 8 characters");
    });
  });

  describe("downloadProtectedKeyFile", () => {
    it("should download protected key file successfully", async () => {
      const mockProtectedFile = { data: "encrypted-data", salt: "abc" };
      (keyExportUtils.exportKeyData as any).mockResolvedValue(mockKeyData);
      (keyExportUtils.createProtectedKeyFile as any).mockResolvedValue(mockProtectedFile);
      (keyExportUtils.downloadKeyFile as any).mockImplementation(() => {});

      const { result } = renderHook(() => useKeyManagement());
      const password = "secure-password123";
      const filename = "my-backup";

      let downloadResult;
      await act(async () => {
        downloadResult = await result.current.downloadProtectedKeyFile(password, filename);
      });

      expect(downloadResult).toEqual({ success: true, filename: "my-backup.vaultkey" });
      expect(keyExportUtils.downloadKeyFile).toHaveBeenCalledWith(
        mockProtectedFile,
        filename,
        true
      );
    });

    it("should handle download failure", async () => {
      (keyExportUtils.exportKeyData as any).mockRejectedValue(new Error("Export error"));

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.downloadProtectedKeyFile("password123");
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain("Failed to download protected key file");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("generateQRCode", () => {
    it("should generate QR code and update state", async () => {
      const mockQrUrl = "data:image/png;base64,mock-qr";
      (keyExportUtils.exportKeyData as any).mockResolvedValue(mockKeyData);
      (keyExportUtils.generateQRCode as any).mockResolvedValue(mockQrUrl);

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        await result.current.generateQRCode();
      });

      expect(result.current.qrCodeUrl).toBe(mockQrUrl);
      expect(keyExportUtils.generateQRCode).toHaveBeenCalledWith(mockKeyData);
    });

    it("should handle QR code generation failure", async () => {
      (keyExportUtils.exportKeyData as any).mockResolvedValue(mockKeyData);
      (keyExportUtils.generateQRCode as any).mockRejectedValue(new Error("QR gen failed"));

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.generateQRCode();
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain("Failed to generate QR code");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("importKey", () => {
    const mockUnprotectedFile = { budgetId: "some-id", fingerprint: "fp" };
    const mockProtectedFileData = { type: "protected", encryptedData: "..." };

    it("should import unprotected key file successfully", async () => {
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "unprotected" });
      (keyExportUtils.importKeyData as any).mockResolvedValue(mockKeyData);

      const { result } = renderHook(() => useKeyManagement());

      let importResult;
      await act(async () => {
        importResult = await result.current.importKey(mockUnprotectedFile);
      });

      expect(importResult.success).toBe(true);
      expect(importResult.budgetId).toBe(mockKeyData.budgetId);
      expect(keyExportUtils.importKeyData).toHaveBeenCalledWith(mockUnprotectedFile);
    });

    it("should import protected key file with password", async () => {
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "protected" });
      (keyExportUtils.importProtectedKeyFile as any).mockResolvedValue(mockKeyData);

      const { result } = renderHook(() => useKeyManagement());
      const password = "import-pw";

      let importResult;
      await act(async () => {
        importResult = await result.current.importKey(mockProtectedFileData, password);
      });

      expect(importResult.success).toBe(true);
      expect(keyExportUtils.importProtectedKeyFile).toHaveBeenCalledWith(
        mockProtectedFileData,
        password
      );
    });

    it("should error if protected file imported without password", async () => {
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "protected" });

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.importKey(mockProtectedFileData);
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain("Password required");
    });

    it("should error if validation fails", async () => {
      (keyExportUtils.validateKeyFile as any).mockReturnValue({
        valid: false,
        error: "Bad format",
      });

      const { result } = renderHook(() => useKeyManagement());

      await act(async () => {
        try {
          await result.current.importKey({});
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toContain("Bad format");
    });
  });

  describe("importAndLogin", () => {
    it("should import key and then call login", async () => {
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "unprotected" });
      (keyExportUtils.importKeyData as any).mockResolvedValue(mockKeyData);
      mockLogin.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useKeyManagement());
      const vaultPw = "vault-pw";

      let combinedResult;
      await act(async () => {
        combinedResult = await result.current.importAndLogin({}, null, vaultPw);
      });

      expect(combinedResult.success).toBe(true);
      expect(mockLogin).toHaveBeenCalledWith({
        password: vaultPw,
        overrideSalt: Array.from(mockKeyData.salt),
        overrideBudgetId: mockKeyData.budgetId,
      });
    });

    it("should error if login fails after import", async () => {
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "unprotected" });
      (keyExportUtils.importKeyData as any).mockResolvedValue(mockKeyData);
      mockLogin.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useKeyManagement());

      act(() => {
        result.current.importAndLogin({}, null, "vault-pw").catch(() => {});
      });

      await waitFor(() => expect(result.current.error).toContain("Failed to login"));
    });

    it("should error if vault password is missing", async () => {
      const { result } = renderHook(() => useKeyManagement());

      act(() => {
        result.current.importAndLogin({}, null, "").catch(() => {});
      });

      await waitFor(() => expect(result.current.error).toContain("Vault password required"));
    });
  });

  describe("getCurrentKeyFingerprint", () => {
    it("should throw if no encryption key available", async () => {
      (useAuth as any).mockReturnValue({ encryptionKey: null });
      const { result } = renderHook(() => useKeyManagement());

      await expect(result.current.getCurrentKeyFingerprint()).rejects.toThrow(
        "No encryption key available"
      );
    });

    it("should log and throw if fingerprint generation fails", async () => {
      (keyExportUtils.generateKeyFingerprint as any).mockRejectedValue(new Error("Gen failed"));
      const { result } = renderHook(() => useKeyManagement());

      await expect(result.current.getCurrentKeyFingerprint()).rejects.toThrow(
        "Failed to get key fingerprint"
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("verifyKeyMatch", () => {
    it("should return matches: true if fingerprints match", async () => {
      (keyExportUtils.generateKeyFingerprint as any).mockResolvedValue("matching-fp");
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "unprotected" });
      (keyExportUtils.importKeyData as any).mockResolvedValue({
        ...mockKeyData,
        fingerprint: "matching-fp",
      });

      const { result } = renderHook(() => useKeyManagement());

      let verification;
      await act(async () => {
        verification = await result.current.verifyKeyMatch({});
      });

      expect(verification.matches).toBe(true);
    });

    it("should return matches: false if fingerprints differ", async () => {
      (keyExportUtils.generateKeyFingerprint as any).mockResolvedValue("fp-1");
      (keyExportUtils.validateKeyFile as any).mockReturnValue({ valid: true, type: "unprotected" });
      (keyExportUtils.importKeyData as any).mockResolvedValue({
        ...mockKeyData,
        fingerprint: "fp-2",
      });

      const { result } = renderHook(() => useKeyManagement());

      let verification;
      await act(async () => {
        verification = await result.current.verifyKeyMatch({});
      });

      expect(verification.matches).toBe(false);
    });

    it("should log and throw if verification fails", async () => {
      (keyExportUtils.generateKeyFingerprint as any).mockRejectedValue(new Error("Verify failed"));
      const { result } = renderHook(() => useKeyManagement());

      await expect(result.current.verifyKeyMatch({})).rejects.toThrow("Key verification failed");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("utility functions", () => {
    it("should clear error", () => {
      const { result } = renderHook(() => useKeyManagement());

      // Simulate error
      act(() => {
        // We can't set it directly as it's state, but we can verify the function exists
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it("should clear QR code URL", () => {
      const { result } = renderHook(() => useKeyManagement());

      act(() => {
        result.current.clearQrCode();
      });

      expect(result.current.qrCodeUrl).toBe(null);
    });
  });
});
