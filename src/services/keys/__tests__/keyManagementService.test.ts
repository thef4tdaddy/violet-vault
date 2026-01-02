import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { keyManagementService } from "../keyManagementService";

// Mock dependencies
// Note: keyManagementService is now parameter-driven and doesn't import auth store
// Auth data is passed as parameters, so no mocking needed for auth

vi.mock("@/utils/security/encryption", () => ({
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

vi.mock("@/utils/common/logger", () => ({
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
  const mockEncryptionKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const mockSalt = new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("getCurrentKeyFingerprint", () => {
    it("should generate fingerprint for encryption key", async () => {
      const fingerprint = await keyManagementService.getCurrentKeyFingerprint(mockEncryptionKey);

      expect(fingerprint).toBeTruthy();
      expect(typeof fingerprint).toBe("string");
      expect(fingerprint.includes("-")).toBe(true);
    });

    it("should throw error when no encryption key available", async () => {
      await expect(
        keyManagementService.getCurrentKeyFingerprint(null as unknown as Uint8Array)
      ).rejects.toThrow("No encryption key available");
    });
  });

  describe("copyKeyToClipboard", () => {
    it("should copy key to clipboard with auto-clear", async () => {
      vi.useFakeTimers();

      await keyManagementService.copyKeyToClipboard(mockEncryptionKey, mockSalt, 5);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"type":"unprotected"')
      );

      // Fast-forward time to test auto-clear
      vi.advanceTimersByTime(5000);

      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });

    it("should handle clipboard errors gracefully", async () => {
      (navigator.clipboard.writeText as Mock).mockRejectedValueOnce(new Error("Clipboard error"));

      await expect(
        keyManagementService.copyKeyToClipboard(mockEncryptionKey, mockSalt)
      ).rejects.toThrow("Failed to copy to clipboard");
    });
  });

  describe("downloadKeyFile", () => {
    it("should download unprotected key file", async () => {
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      (document.createElement as Mock).mockReturnValueOnce(mockLink);

      await keyManagementService.downloadKeyFile(mockEncryptionKey, mockSalt, "testuser");

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain("violetVault-key-testuser");
    });

    it("should handle missing auth state", async () => {
      await expect(
        keyManagementService.downloadKeyFile(
          null as unknown as Uint8Array,
          null as unknown as Uint8Array,
          "testuser"
        )
      ).rejects.toThrow("No encryption key or salt available");
    });
  });

  describe("downloadProtectedKeyFile", () => {
    it("should download password-protected key file", async () => {
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      (document.createElement as Mock).mockReturnValueOnce(mockLink);

      await keyManagementService.downloadProtectedKeyFile(
        mockEncryptionKey,
        mockSalt,
        "strongpassword123",
        "testuser"
      );

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain("violetVault-key-protected-testuser");
    });

    it("should reject weak passwords", async () => {
      await expect(
        keyManagementService.downloadProtectedKeyFile(mockEncryptionKey, mockSalt, "weak")
      ).rejects.toThrow("Export password must be at least 8 characters long");
    });
  });

  describe("generateQRCode", () => {
    it("should generate QR code placeholder", async () => {
      const qrUrl = await keyManagementService.generateQRCode(mockEncryptionKey, mockSalt);

      expect(qrUrl).toBeTruthy();
      expect(qrUrl.startsWith("data:image/svg+xml")).toBe(true);
    });

    it("should handle missing auth state", async () => {
      await expect(
        keyManagementService.generateQRCode(
          null as unknown as Uint8Array,
          null as unknown as Uint8Array
        )
      ).rejects.toThrow("No encryption key or salt available");
    });
  });

  describe("validateKeyFile", () => {
    it("should validate unprotected key file", () => {
      const keyFile = {
        version: "1.0",
        type: "unprotected" as const,
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
        type: "protected" as const,
        encryptedKey: [1, 2, 3, 4],
        exportSalt: [1, 2, 3, 4],
      };

      const result = keyManagementService.validateKeyFile(keyFile);

      expect(result.valid).toBe(true);
      expect(result.type).toBe("protected");
    });

    it("should reject invalid key files", () => {
      const invalidKeyFile = {
        version: "1.0",
        type: "unprotected" as const,
        // Missing required fields
      };

      const result = keyManagementService.validateKeyFile(invalidKeyFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid unprotected key format");
    });

    it("should handle malformed data gracefully", () => {
      const result = keyManagementService.validateKeyFile(null as never);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid file format");
    });
  });

  describe("importKeyData", () => {
    it("should import unprotected key data", async () => {
      const keyFile = {
        type: "unprotected" as const,
        key: [1, 2, 3, 4],
        salt: [5, 6, 7, 8],
      };

      const result = await keyManagementService.importKeyData(keyFile);

      expect(result).toBeDefined();
      expect(result.encryptionKey).toEqual(new Uint8Array([1, 2, 3, 4]));
      expect(result.salt).toEqual(new Uint8Array([5, 6, 7, 8]));
    });

    it("should import protected key data with password", async () => {
      const keyFile = {
        type: "protected" as const,
        encryptedKey: [1, 2, 3, 4],
        exportSalt: [1, 2, 3, 4],
      };

      const result = await keyManagementService.importKeyData(keyFile, "exportpassword");

      expect(result).toBeDefined();
      expect(result.encryptionKey).toBeDefined();
      expect(result.salt).toBeDefined();
    });

    it("should handle import errors", async () => {
      const keyFile = {
        type: "protected" as const,
        encryptedKey: [1, 2, 3, 4],
        exportSalt: [1, 2, 3, 4],
      };

      // No import password provided
      await expect(keyManagementService.importKeyData(keyFile)).rejects.toThrow(
        "Import password required for protected key file"
      );
    });
  });
});
