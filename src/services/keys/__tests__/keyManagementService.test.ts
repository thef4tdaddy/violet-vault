import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { keyManagementService } from "../keyManagementService";

// Mock dependencies
vi.mock("../../../stores/auth/authStore", () => ({
  useAuth: {
    getState: vi.fn(() => ({
      encryptionKey: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
      salt: new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]),
      currentUser: "testuser",
      budgetId: "test-budget-id",
    })),
  },
}));

vi.mock("../../../utils/security/encryption", () => ({
  encryptionUtils: {
    deriveKey: vi.fn(() =>
      Promise.resolve({
        key: new Uint8Array([17, 18, 19, 20, 21, 22, 23, 24]),
        salt: new Uint8Array([25, 26, 27, 28, 29, 30, 31, 32]),
      })
    ),
    encrypt: vi.fn(() => Promise.resolve("encrypted-data")),
    decrypt: vi.fn(() => Promise.resolve('{"key":[1,2,3,4],"salt":[5,6,7,8]}')),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock DOM APIs
Object.assign(global, {
  crypto: {
    subtle: {
      digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
    },
  },
  navigator: {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve("")),
    },
    userAgent: "test-agent",
  },
  document: {
    createElement: vi.fn(() => ({
      href: "",
      download: "",
      click: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  URL: {
    createObjectURL: vi.fn(() => "blob:test"),
    revokeObjectURL: vi.fn(),
  },
  Blob: vi.fn(() => ({})),
  btoa: vi.fn((str) => Buffer.from(str).toString("base64")),
});

describe("keyManagementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("getCurrentKeyFingerprint", () => {
    it("should generate fingerprint for encryption key", async () => {
      const fingerprint = await keyManagementService.getCurrentKeyFingerprint();

      expect(fingerprint).toBeTruthy();
      expect(typeof fingerprint).toBe("string");
      expect(fingerprint.includes("-")).toBe(true);
    });

    it("should throw error when no encryption key available", async () => {
      const { useAuth } = await import("../../../stores/auth/authStore");
      useAuth.getState.mockReturnValueOnce({
        encryptionKey: null,
        salt: null,
      });

      await expect(keyManagementService.getCurrentKeyFingerprint()).rejects.toThrow(
        "No encryption key available"
      );
    });
  });

  describe("copyKeyToClipboard", () => {
    it("should copy key to clipboard with auto-clear", async () => {
      vi.useFakeTimers();

      await keyManagementService.copyKeyToClipboard(5);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"type":"unprotected"')
      );

      // Fast-forward time to test auto-clear
      vi.advanceTimersByTime(5000);

      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });

    it("should handle clipboard errors gracefully", async () => {
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error("Clipboard error"));

      await expect(keyManagementService.copyKeyToClipboard()).rejects.toThrow(
        "Failed to copy to clipboard"
      );
    });
  });

  describe("downloadKeyFile", () => {
    it("should download unprotected key file", async () => {
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      document.createElement.mockReturnValueOnce(mockLink);

      await keyManagementService.downloadKeyFile();

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain("violetVault-key-testuser");
    });

    it("should handle missing auth state", async () => {
      const { useAuth } = await import("../../../stores/auth/authStore");
      useAuth.getState.mockReturnValueOnce({
        encryptionKey: null,
        salt: null,
      });

      await expect(keyManagementService.downloadKeyFile()).rejects.toThrow(
        "No encryption key or salt available"
      );
    });
  });

  describe("downloadProtectedKeyFile", () => {
    it("should download password-protected key file", async () => {
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      document.createElement.mockReturnValueOnce(mockLink);

      await keyManagementService.downloadProtectedKeyFile("strongpassword123");

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain("violetVault-key-protected-testuser");
    });

    it("should reject weak passwords", async () => {
      await expect(keyManagementService.downloadProtectedKeyFile("weak")).rejects.toThrow(
        "Export password must be at least 8 characters long"
      );
    });
  });

  describe("generateQRCode", () => {
    it("should generate QR code placeholder", async () => {
      const qrUrl = await keyManagementService.generateQRCode();

      expect(qrUrl).toBeTruthy();
      expect(qrUrl.startsWith("data:image/svg+xml")).toBe(true);
    });

    it("should handle missing auth state", async () => {
      const { useAuth } = await import("../../../stores/auth/authStore");
      useAuth.getState.mockReturnValueOnce({
        encryptionKey: null,
        salt: null,
      });

      await expect(keyManagementService.generateQRCode()).rejects.toThrow(
        "No encryption key or salt available"
      );
    });
  });

  describe("validateKeyFile", () => {
    it("should validate unprotected key file", () => {
      const keyFile = {
        version: "1.0",
        type: "unprotected",
        key: [1, 2, 3, 4],
        salt: [5, 6, 7, 8],
      };

      const result = keyManagementService.validateKeyFile(keyFile);

      expect(result.valid).toBe(true);
      expect(result.type).toBe("unprotected");
    });

    it("should validate protected key file", () => {
      const keyFile = {
        version: "1.0",
        type: "protected",
        encryptedKey: "encrypted-data",
        exportSalt: [1, 2, 3, 4],
      };

      const result = keyManagementService.validateKeyFile(keyFile);

      expect(result.valid).toBe(true);
      expect(result.type).toBe("protected");
    });

    it("should reject invalid key files", () => {
      const invalidKeyFile = {
        version: "1.0",
        type: "unprotected",
        // Missing required fields
      };

      const result = keyManagementService.validateKeyFile(invalidKeyFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid unprotected key format");
    });

    it("should handle malformed data gracefully", () => {
      const result = keyManagementService.validateKeyFile(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid file format");
    });
  });

  describe("importAndLogin", () => {
    it("should import unprotected key and login", async () => {
      const keyFile = {
        type: "unprotected",
        key: [1, 2, 3, 4],
        salt: [5, 6, 7, 8],
        user: "imported-user",
        budgetId: "imported-budget",
      };

      const { useAuth } = await import("../../../stores/auth/authStore");
      const mockLogin = vi.fn(() => Promise.resolve());
      useAuth.getState.mockReturnValueOnce({
        login: mockLogin,
      });

      const result = await keyManagementService.importAndLogin(keyFile, null, "vaultpassword");

      expect(result.success).toBe(true);
      expect(result.user).toBe("imported-user");
      expect(mockLogin).toHaveBeenCalledWith("vaultpassword", expect.any(Object));
    });

    it("should import protected key and login", async () => {
      const keyFile = {
        type: "protected",
        encryptedKey: "encrypted-data",
        exportSalt: [1, 2, 3, 4],
        user: "protected-user",
      };

      const { useAuth } = await import("../../../stores/auth/authStore");
      const mockLogin = vi.fn(() => Promise.resolve());
      useAuth.getState.mockReturnValueOnce({
        login: mockLogin,
      });

      const result = await keyManagementService.importAndLogin(
        keyFile,
        "exportpassword",
        "vaultpassword"
      );

      expect(result.success).toBe(true);
      expect(mockLogin).toHaveBeenCalled();
    });

    it("should handle import errors", async () => {
      const keyFile = {
        type: "protected",
        encryptedKey: "encrypted-data",
        exportSalt: [1, 2, 3, 4],
      };

      // No import password provided
      await expect(
        keyManagementService.importAndLogin(keyFile, null, "vaultpassword")
      ).rejects.toThrow("Import password required for protected key file");
    });
  });
});
