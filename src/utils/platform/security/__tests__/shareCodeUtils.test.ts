import { describe, it, expect, vi, beforeEach } from "vitest";
import { shareCodeUtils } from "../shareCodeUtils";
import logger from "@/utils/core/common/logger";

// Mock logger to avoid noise
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("shareCodeUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateShareCode", () => {
    it("should generate a 4-word share code", () => {
      const shareCode = shareCodeUtils.generateShareCode();
      const words = shareCode.split(" ");

      expect(words.length).toBe(4);
      expect(shareCode).toMatch(/^[a-z]+ [a-z]+ [a-z]+ [a-z]+$/);
    });

    it("should generate unique codes across multiple calls", () => {
      const numberOfCodes = 50;
      const codes = Array.from({ length: numberOfCodes }, () =>
        shareCodeUtils.generateShareCode()
      );
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(numberOfCodes);
    });

    it("should generate valid BIP39 words", () => {
      const shareCode = shareCodeUtils.generateShareCode();
      const isValid = shareCodeUtils.validateShareCode(shareCode);

      expect(isValid).toBe(true);
    });

    it("should log generation info", () => {
      shareCodeUtils.generateShareCode();
      expect(logger.info).toHaveBeenCalledWith(
        "Generated new share code",
        expect.objectContaining({
          wordCount: 4,
        })
      );
    });
  });

  describe("validateShareCode", () => {
    it("should validate correct 4-word share codes", () => {
      // Using known valid BIP39 words
      const validCode = "abandon ability able about";
      expect(shareCodeUtils.validateShareCode(validCode)).toBe(true);
    });

    it("should reject codes with wrong word count", () => {
      expect(shareCodeUtils.validateShareCode("word1 word2")).toBe(false);
      expect(shareCodeUtils.validateShareCode("word1 word2 word3")).toBe(false);
      expect(shareCodeUtils.validateShareCode("word1 word2 word3 word4 word5")).toBe(false);
    });

    it("should reject codes with invalid BIP39 words", () => {
      const invalidCode = "invalid notaword fakecode wrongword";
      expect(shareCodeUtils.validateShareCode(invalidCode)).toBe(false);
    });

    it("should reject empty or null input", () => {
      expect(shareCodeUtils.validateShareCode("")).toBe(false);
      expect(shareCodeUtils.validateShareCode(null as any)).toBe(false);
      expect(shareCodeUtils.validateShareCode(undefined as any)).toBe(false);
    });

    it("should reject non-string input", () => {
      expect(shareCodeUtils.validateShareCode(123 as any)).toBe(false);
      expect(shareCodeUtils.validateShareCode({} as any)).toBe(false);
    });

    it("should handle extra whitespace", () => {
      const code = "  abandon ability able about  ";
      // validateShareCode actually trims, so this passes
      expect(shareCodeUtils.validateShareCode(code)).toBe(true);
    });

    it("should be case-insensitive for validation", () => {
      const mixedCase = "Abandon Ability Able About";
      // Validation uses toLowerCase, so mixed case works
      expect(shareCodeUtils.validateShareCode(mixedCase)).toBe(true);
    });
  });

  describe("normalizeShareCode", () => {
    it("should convert to lowercase", () => {
      const input = "Abandon Ability Able About";
      const result = shareCodeUtils.normalizeShareCode(input);
      expect(result).toBe("abandon ability able about");
    });

    it("should trim whitespace", () => {
      const input = "  abandon ability able about  ";
      const result = shareCodeUtils.normalizeShareCode(input);
      expect(result).toBe("abandon ability able about");
    });

    it("should replace multiple spaces with single space", () => {
      const input = "abandon  ability   able    about";
      const result = shareCodeUtils.normalizeShareCode(input);
      expect(result).toBe("abandon ability able about");
    });

    it("should handle empty strings", () => {
      expect(shareCodeUtils.normalizeShareCode("")).toBe("");
    });

    it("should handle null/undefined by returning empty string", () => {
      expect(shareCodeUtils.normalizeShareCode(null as any)).toBe("");
      expect(shareCodeUtils.normalizeShareCode(undefined as any)).toBe("");
    });

    it("should preserve already normalized codes", () => {
      const normalized = "abandon ability able about";
      const result = shareCodeUtils.normalizeShareCode(normalized);
      expect(result).toBe(normalized);
    });
  });

  describe("generateBudgetId", () => {
    const password = "test-password-123";
    const shareCode = "abandon ability able about";

    it("should generate deterministic budget ID", async () => {
      const id1 = await shareCodeUtils.generateBudgetId(password, shareCode);
      const id2 = await shareCodeUtils.generateBudgetId(password, shareCode);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^budget_[a-f0-9]{16}$/);
    });

    it("should generate different IDs for different passwords", async () => {
      const id1 = await shareCodeUtils.generateBudgetId("password1", shareCode);
      const id2 = await shareCodeUtils.generateBudgetId("password2", shareCode);

      expect(id1).not.toBe(id2);
    });

    it("should generate different IDs for different share codes", async () => {
      const id1 = await shareCodeUtils.generateBudgetId(password, "abandon ability able about");
      const id2 = await shareCodeUtils.generateBudgetId(password, "zoo zone zebra zero");

      expect(id1).not.toBe(id2);
    });

    it("should normalize share code before generating ID", async () => {
      const id1 = await shareCodeUtils.generateBudgetId(password, "abandon ability able about");
      const id2 = await shareCodeUtils.generateBudgetId(
        password,
        "  Abandon  Ability  Able  About  "
      );

      expect(id1).toBe(id2);
    });

    it("should throw error if password is missing", async () => {
      await expect(shareCodeUtils.generateBudgetId("", shareCode)).rejects.toThrow(
        "Both password and share code are required"
      );
    });

    it("should throw error if share code is missing", async () => {
      await expect(shareCodeUtils.generateBudgetId(password, "")).rejects.toThrow(
        "Both password and share code are required"
      );
    });

    it("should throw error if share code is invalid", async () => {
      await expect(shareCodeUtils.generateBudgetId(password, "invalid code here")).rejects.toThrow(
        "Invalid share code format"
      );
    });

    it("should log budget ID generation", async () => {
      await shareCodeUtils.generateBudgetId(password, shareCode);
      expect(logger.info).toHaveBeenCalledWith(
        "Generated deterministic budget ID",
        expect.any(Object)
      );
    });
  });

  describe("generateQRData", () => {
    const shareCode = "abandon ability able about";

    it("should generate QR data without creator info", () => {
      const qrData = shareCodeUtils.generateQRData(shareCode);
      const parsed = JSON.parse(qrData);

      expect(parsed.type).toBe("violetVault_share");
      expect(parsed.shareCode).toBe(shareCode);
      expect(parsed.version).toBe("2.0");
      expect(parsed.createdBy).toBeUndefined();
    });

    it("should generate QR data with creator info", () => {
      const creatorInfo = { userName: "TestUser", userColor: "#FF0000" };
      const qrData = shareCodeUtils.generateQRData(shareCode, creatorInfo);
      const parsed = JSON.parse(qrData);

      expect(parsed.type).toBe("violetVault_share");
      expect(parsed.shareCode).toBe(shareCode);
      expect(parsed.createdBy).toBe("TestUser");
      expect(parsed.creatorColor).toBe("#FF0000");
      expect(parsed.createdAt).toBeGreaterThan(0);
    });

    it("should normalize share code before generating QR data", () => {
      const qrData = shareCodeUtils.generateQRData("  Abandon  Ability  Able  About  ");
      const parsed = JSON.parse(qrData);

      expect(parsed.shareCode).toBe("abandon ability able about");
    });

    it("should throw error for invalid share code", () => {
      expect(() => shareCodeUtils.generateQRData("invalid code")).toThrow(
        "Invalid share code for QR generation"
      );
    });

    it("should handle null creator info", () => {
      const qrData = shareCodeUtils.generateQRData(shareCode, null);
      const parsed = JSON.parse(qrData);

      expect(parsed.createdBy).toBeUndefined();
    });

    it("should handle creator info without color", () => {
      const creatorInfo = { userName: "TestUser" };
      const qrData = shareCodeUtils.generateQRData(shareCode, creatorInfo);
      const parsed = JSON.parse(qrData);

      expect(parsed.createdBy).toBe("TestUser");
      expect(parsed.creatorColor).toBeUndefined();
    });
  });

  describe("parseQRData", () => {
    const shareCode = "abandon ability able about";

    it("should parse valid JSON format QR data", () => {
      const qrData = JSON.stringify({
        type: "violetVault_share",
        shareCode: shareCode,
        version: "2.0",
      });

      const result = shareCodeUtils.parseQRData(qrData);

      expect(result).not.toBeNull();
      expect(result?.shareCode).toBe(shareCode);
      expect(result?.version).toBe("2.0");
      expect(result?.createdBy).toBeNull();
    });

    it("should parse QR data with creator info", () => {
      const qrData = JSON.stringify({
        type: "violetVault_share",
        shareCode: shareCode,
        createdBy: "TestUser",
        creatorColor: "#FF0000",
        createdAt: 1234567890,
        version: "2.0",
      });

      const result = shareCodeUtils.parseQRData(qrData);

      expect(result?.shareCode).toBe(shareCode);
      expect(result?.createdBy).toBe("TestUser");
      expect(result?.creatorColor).toBe("#FF0000");
      expect(result?.createdAt).toBe(1234567890);
    });

    it("should parse legacy format QR data", () => {
      const legacyData = "VV-SHARE-abandon-ability-able-about";
      const result = shareCodeUtils.parseQRData(legacyData);

      expect(result).not.toBeNull();
      expect(result?.shareCode).toBe(shareCode);
      expect(result?.version).toBe("1.0");
      expect(result?.createdBy).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      const result = shareCodeUtils.parseQRData("not valid json");
      expect(result).toBeNull();
    });

    it("should return null for wrong type", () => {
      const qrData = JSON.stringify({
        type: "wrong_type",
        shareCode: shareCode,
      });

      const result = shareCodeUtils.parseQRData(qrData);
      expect(result).toBeNull();
    });

    it("should return null for missing shareCode", () => {
      const qrData = JSON.stringify({
        type: "violetVault_share",
        version: "2.0",
      });

      const result = shareCodeUtils.parseQRData(qrData);
      expect(result).toBeNull();
    });

    it("should return null for invalid share code in data", () => {
      const qrData = JSON.stringify({
        type: "violetVault_share",
        shareCode: "invalid code",
        version: "2.0",
      });

      const result = shareCodeUtils.parseQRData(qrData);
      expect(result).toBeNull();
    });

    it("should return null for empty or null input", () => {
      expect(shareCodeUtils.parseQRData("")).toBeNull();
      expect(shareCodeUtils.parseQRData(null as any)).toBeNull();
      expect(shareCodeUtils.parseQRData(undefined as any)).toBeNull();
    });

    it("should normalize share code when parsing", () => {
      const qrData = JSON.stringify({
        type: "violetVault_share",
        shareCode: "  Abandon  Ability  Able  About  ",
        version: "2.0",
      });

      const result = shareCodeUtils.parseQRData(qrData);
      expect(result?.shareCode).toBe("abandon ability able about");
    });
  });

  describe("formatForDisplay", () => {
    it("should capitalize first letter of each word", () => {
      const input = "abandon ability able about";
      const result = shareCodeUtils.formatForDisplay(input);

      expect(result).toBe("Abandon Ability Able About");
    });

    it("should normalize before formatting", () => {
      const input = "  abandon  ability  able  about  ";
      const result = shareCodeUtils.formatForDisplay(input);

      expect(result).toBe("Abandon Ability Able About");
    });

    it("should return as-is for invalid codes", () => {
      const invalid = "invalid code";
      const result = shareCodeUtils.formatForDisplay(invalid);

      expect(result).toBe(invalid);
    });

    it("should handle empty strings", () => {
      expect(shareCodeUtils.formatForDisplay("")).toBe("");
    });

    it("should handle mixed case input", () => {
      const input = "AbAnDoN aBiLiTy AbLe AbOuT";
      const result = shareCodeUtils.formatForDisplay(input);

      expect(result).toBe("Abandon Ability Able About");
    });
  });

  describe("integration tests", () => {
    it("should complete full workflow: generate -> QR -> parse", () => {
      const shareCode = shareCodeUtils.generateShareCode();
      const qrData = shareCodeUtils.generateQRData(shareCode);
      const parsed = shareCodeUtils.parseQRData(qrData);

      expect(parsed).not.toBeNull();
      expect(parsed?.shareCode).toBe(shareCode);
    });

    it("should generate consistent budget IDs from QR parsed codes", async () => {
      const password = "test-pass";
      const shareCode = shareCodeUtils.generateShareCode();

      const qrData = shareCodeUtils.generateQRData(shareCode);
      const parsed = shareCodeUtils.parseQRData(qrData);

      const id1 = await shareCodeUtils.generateBudgetId(password, shareCode);
      const id2 = await shareCodeUtils.generateBudgetId(password, parsed!.shareCode);

      expect(id1).toBe(id2);
    });

    it("should maintain share code through normalize -> validate cycle", () => {
      const original = "abandon ability able about";
      const normalized = shareCodeUtils.normalizeShareCode(original);
      const isValid = shareCodeUtils.validateShareCode(normalized);

      expect(isValid).toBe(true);
      expect(normalized).toBe(original);
    });
  });
});
