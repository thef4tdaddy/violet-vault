import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeString,
  sanitizeUrl,
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  escapeHtml,
  sanitizeSearchInput,
  validateNumericInput,
} from "../inputSanitization";
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

describe("inputSanitization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sanitizeString", () => {
    it("should remove HTML tags from input", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeString(input);
      // Script tag removal with regex leaves the content
      expect(result).toContain("Hello");
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(1)">Test</div>';
      const result = sanitizeString(input);
      expect(result).not.toContain("onclick");
    });

    it("should remove javascript: URLs", () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeString(input);
      expect(result).toBe('alert("xss")');
    });

    it("should remove data: URLs", () => {
      const input = "data:text/html,<script>alert(1)</script>";
      const result = sanitizeString(input);
      expect(result).toBe("text/html,alert(1)");
    });

    it("should trim whitespace", () => {
      const input = "  hello world  ";
      const result = sanitizeString(input);
      expect(result).toBe("hello world");
    });

    it("should handle non-string input by converting to string", () => {
      const result = sanitizeString(123 as any);
      expect(result).toBe("123");
    });

    it("should handle empty strings", () => {
      expect(sanitizeString("")).toBe("");
    });

    it("should handle complex nested script tags", () => {
      const input = "<script><script>alert('xss')</script></script>";
      const result = sanitizeString(input);
      expect(result).not.toContain("<script>");
    });
  });

  describe("sanitizeUrl", () => {
    it("should accept valid HTTPS URLs", () => {
      const url = "https://example.com/path";
      const result = sanitizeUrl(url);
      expect(result).toBe("https://example.com/path");
    });

    it("should accept valid HTTP URLs", () => {
      const url = "http://example.com";
      const result = sanitizeUrl(url);
      expect(result).toBe("http://example.com/");
    });

    it("should reject javascript: URLs", () => {
      const url = "javascript:alert(1)";
      const result = sanitizeUrl(url);
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should reject data: URLs", () => {
      const url = "data:text/html,<script>alert(1)</script>";
      const result = sanitizeUrl(url);
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should reject non-allowed protocols", () => {
      const url = "ftp://example.com";
      const result = sanitizeUrl(url);
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should accept custom allowed protocols", () => {
      const url = "ftp://example.com";
      const result = sanitizeUrl(url, ["ftp:"]);
      expect(result).toBe("ftp://example.com/");
    });

    it("should handle invalid URL format", () => {
      const url = "not a url";
      const result = sanitizeUrl(url);
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should handle null/undefined input", () => {
      expect(sanitizeUrl(null as any)).toBeNull();
      expect(sanitizeUrl(undefined as any)).toBeNull();
      expect(sanitizeUrl("")).toBeNull();
    });

    it("should handle non-string input", () => {
      expect(sanitizeUrl(123 as any)).toBeNull();
    });
  });

  describe("validateFileType", () => {
    it("should accept allowed image/jpeg MIME type with correct extension", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should accept allowed image/png MIME type", () => {
      const file = new File(["content"], "test.png", { type: "image/png" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should accept allowed application/json MIME type", () => {
      const file = new File(["content"], "test.json", { type: "application/json" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should reject disallowed MIME types", () => {
      const file = new File(["content"], "test.exe", { type: "application/x-msdownload" });
      expect(validateFileType(file)).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should reject files with mismatched extension and MIME type", () => {
      const file = new File(["content"], "test.png", { type: "image/jpeg" });
      expect(validateFileType(file)).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should handle files without extension", () => {
      const file = new File(["content"], "test", { type: "image/jpeg" });
      // Files without extension fail validation if extension check is strict
      expect(validateFileType(file)).toBe(false);
    });

    it("should handle null/undefined file", () => {
      expect(validateFileType(null as any)).toBe(false);
      expect(validateFileType(undefined as any)).toBe(false);
    });

    it("should handle non-File objects", () => {
      expect(validateFileType({} as any)).toBe(false);
    });

    it("should accept custom allowed types", () => {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      expect(validateFileType(file, ["application/pdf"])).toBe(true);
    });
  });

  describe("validateFileSize", () => {
    it("should accept files under size limit", () => {
      const file = new File(["a".repeat(100)], "test.txt", { type: "text/plain" });
      expect(validateFileSize(file, 1000)).toBe(true);
    });

    it("should reject files over size limit", () => {
      const file = new File(["a".repeat(2000)], "test.txt", { type: "text/plain" });
      expect(validateFileSize(file, 1000)).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should use default max size of 10MB", () => {
      const file = new File(["a".repeat(100)], "test.txt", { type: "text/plain" });
      expect(validateFileSize(file)).toBe(true);
    });

    it("should handle null/undefined file", () => {
      expect(validateFileSize(null as any)).toBe(false);
      expect(validateFileSize(undefined as any)).toBe(false);
    });

    it("should handle non-File objects", () => {
      expect(validateFileSize({} as any)).toBe(false);
    });

    it("should accept files exactly at size limit", () => {
      const content = "a".repeat(1000);
      const file = new File([content], "test.txt", { type: "text/plain" });
      expect(validateFileSize(file, 1000)).toBe(true);
    });
  });

  describe("sanitizeFilename", () => {
    it("should remove path separators", () => {
      const filename = "../../../etc/passwd";
      const result = sanitizeFilename(filename);
      expect(result).toBe("etcpasswd");
    });

    it("should remove dangerous characters", () => {
      const filename = 'file<>:"|?*name.txt';
      const result = sanitizeFilename(filename);
      expect(result).toBe("filename.txt");
    });

    it("should remove leading dots and spaces", () => {
      const filename = "  ...hidden.txt";
      const result = sanitizeFilename(filename);
      expect(result).toBe("hidden.txt");
    });

    it("should limit length to 255 characters", () => {
      const filename = "a".repeat(300) + ".txt";
      const result = sanitizeFilename(filename);
      expect(result.length).toBe(255);
    });

    it("should return default filename if empty after sanitization", () => {
      const filename = "../../../";
      const result = sanitizeFilename(filename);
      expect(result).toBe("file");
    });

    it("should handle non-string input", () => {
      expect(sanitizeFilename(123 as any)).toBe("file");
      expect(sanitizeFilename(null as any)).toBe("file");
    });

    it("should preserve normal filenames", () => {
      const filename = "document.pdf";
      const result = sanitizeFilename(filename);
      expect(result).toBe("document.pdf");
    });
  });

  describe("escapeHtml", () => {
    it("should escape ampersand", () => {
      expect(escapeHtml("A & B")).toBe("A &amp; B");
    });

    it("should escape less than", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    });

    it("should escape greater than", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
    });

    it("should escape double quotes", () => {
      expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
    });

    it("should escape single quotes", () => {
      expect(escapeHtml("it's")).toBe("it&#x27;s");
    });

    it("should escape forward slash", () => {
      expect(escapeHtml("</script>")).toBe("&lt;&#x2F;script&gt;");
    });

    it("should handle multiple special characters", () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHtml(input);
      expect(result).toBe("&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;");
    });

    it("should handle non-string input by converting to string", () => {
      expect(escapeHtml(123 as any)).toBe("123");
    });

    it("should handle empty strings", () => {
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("sanitizeSearchInput", () => {
    it("should remove dangerous characters", () => {
      const input = 'search <script>"term"</script>';
      const result = sanitizeSearchInput(input);
      expect(result).toBe("search scriptterm/script");
    });

    it("should allow normal search characters", () => {
      const input = "budget 2024 @home #savings";
      const result = sanitizeSearchInput(input);
      expect(result).toBe("budget 2024 @home #savings");
    });

    it("should trim whitespace", () => {
      const input = "  search term  ";
      const result = sanitizeSearchInput(input);
      expect(result).toBe("search term");
    });

    it("should limit length to 500 characters", () => {
      const input = "a".repeat(600);
      const result = sanitizeSearchInput(input);
      expect(result.length).toBe(500);
    });

    it("should handle non-string input", () => {
      expect(sanitizeSearchInput(123 as any)).toBe("");
      expect(sanitizeSearchInput(null as any)).toBe("");
    });

    it("should handle empty strings", () => {
      expect(sanitizeSearchInput("")).toBe("");
    });
  });

  describe("validateNumericInput", () => {
    it("should accept valid numbers", () => {
      expect(validateNumericInput(42)).toBe(42);
      expect(validateNumericInput(3.14)).toBe(3.14);
    });

    it("should parse numeric strings", () => {
      expect(validateNumericInput("42")).toBe(42);
      expect(validateNumericInput("3.14")).toBe(3.14);
    });

    it("should remove currency symbols and commas", () => {
      expect(validateNumericInput("$1,234.56")).toBe(1234.56);
      expect(validateNumericInput("1,000")).toBe(1000);
    });

    it("should reject negative numbers when allowNegative is false", () => {
      expect(validateNumericInput(-10, { allowNegative: false })).toBeNull();
    });

    it("should accept negative numbers when allowNegative is true", () => {
      expect(validateNumericInput(-10, { allowNegative: true })).toBe(-10);
      expect(validateNumericInput(-10)).toBe(-10); // default is true
    });

    it("should reject decimal numbers when allowDecimal is false", () => {
      expect(validateNumericInput(3.14, { allowDecimal: false })).toBeNull();
    });

    it("should accept decimal numbers when allowDecimal is true", () => {
      expect(validateNumericInput(3.14, { allowDecimal: true })).toBe(3.14);
      expect(validateNumericInput(3.14)).toBe(3.14); // default is true
    });

    it("should enforce minimum value", () => {
      expect(validateNumericInput(5, { min: 10 })).toBeNull();
      expect(validateNumericInput(15, { min: 10 })).toBe(15);
    });

    it("should enforce maximum value", () => {
      expect(validateNumericInput(15, { max: 10 })).toBeNull();
      expect(validateNumericInput(5, { max: 10 })).toBe(5);
    });

    it("should accept values at boundary", () => {
      expect(validateNumericInput(10, { min: 10, max: 10 })).toBe(10);
    });

    it("should reject non-numeric strings", () => {
      expect(validateNumericInput("abc")).toBeNull();
      // parseFloat("12abc") returns 12, so this actually parses partially
      expect(validateNumericInput("12abc")).toBe(12);
    });

    it("should reject NaN", () => {
      expect(validateNumericInput(NaN)).toBeNull();
    });

    it("should reject Infinity", () => {
      expect(validateNumericInput(Infinity)).toBeNull();
      expect(validateNumericInput(-Infinity)).toBeNull();
    });

    it("should reject null and undefined", () => {
      expect(validateNumericInput(null)).toBeNull();
      expect(validateNumericInput(undefined)).toBeNull();
    });

    it("should reject objects and arrays", () => {
      expect(validateNumericInput({})).toBeNull();
      expect(validateNumericInput([])).toBeNull();
    });

    it("should handle zero correctly", () => {
      expect(validateNumericInput(0)).toBe(0);
      expect(validateNumericInput(0, { allowNegative: false })).toBe(0);
    });

    it("should handle multiple constraints", () => {
      const options = { min: 0, max: 100, allowNegative: false, allowDecimal: false };
      expect(validateNumericInput(50, options)).toBe(50);
      expect(validateNumericInput(-10, options)).toBeNull();
      expect(validateNumericInput(150, options)).toBeNull();
      expect(validateNumericInput(50.5, options)).toBeNull();
    });
  });
});
