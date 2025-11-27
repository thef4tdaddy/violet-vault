/**
 * Input Sanitization Utilities
 * Security hardening for user inputs to prevent XSS and injection attacks
 * Part of Issue #1371: Security Hardening Review and Implementation
 */

import logger from "@/utils/common/logger";

/**
 * Sanitize string input by removing potentially dangerous characters
 * Removes HTML tags, script tags, and other dangerous patterns
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== "string") {
    return String(input);
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, "");

  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Validate and sanitize URL
 * Ensures URL is safe and follows allowed protocols
 */
export const sanitizeUrl = (
  url: string,
  allowedProtocols: string[] = ["http:", "https:"]
): string | null => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Validate URL format
    const parsedUrl = new URL(url);

    // Check protocol is allowed
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      logger.warn("URL validation failed: protocol not allowed", {
        url: url.substring(0, 100),
        protocol: parsedUrl.protocol,
      });
      return null;
    }

    // Block javascript: and data: URLs (shouldn't pass URL constructor, but double-check)
    if (url.toLowerCase().startsWith("javascript:") || url.toLowerCase().startsWith("data:")) {
      logger.warn("URL validation failed: dangerous protocol detected", {
        url: url.substring(0, 100),
      });
      return null;
    }

    return parsedUrl.toString();
  } catch {
    // Invalid URL format
    logger.warn("URL validation failed: invalid URL format", {
      url: url.substring(0, 100),
    });
    return null;
  }
};

/**
 * Validate file type for uploads
 * Checks MIME type and file extension
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp", "application/json", "text/csv"]
): boolean => {
  if (!file || !(file instanceof File)) {
    return false;
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    logger.warn("File validation failed: MIME type not allowed", {
      fileName: file.name,
      mimeType: file.type,
    });
    return false;
  }

  // Additional check: verify extension matches MIME type
  const extension = file.name.split(".").pop()?.toLowerCase();
  const typeToExtension: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "application/json": ["json"],
    "text/csv": ["csv"],
  };

  if (extension && typeToExtension[file.type]) {
    if (!typeToExtension[file.type].includes(extension)) {
      logger.warn("File validation failed: extension doesn't match MIME type", {
        fileName: file.name,
        mimeType: file.type,
        extension,
      });
      return false;
    }
  }

  return true;
};

/**
 * Validate file size
 * Ensures file is within size limits
 */
export const validateFileSize = (file: File, maxSizeBytes: number = 10 * 1024 * 1024): boolean => {
  if (!file || !(file instanceof File)) {
    return false;
  }

  if (file.size > maxSizeBytes) {
    logger.warn("File validation failed: file too large", {
      fileName: file.name,
      fileSize: file.size,
      maxSize: maxSizeBytes,
    });
    return false;
  }

  return true;
};

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== "string") {
    return "file";
  }

  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[/\\?*|"<>:]/g, "");

  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, "");

  // Limit length
  sanitized = sanitized.substring(0, 255);

  // If empty after sanitization, use default
  if (!sanitized) {
    sanitized = "file";
  }

  return sanitized;
};

/**
 * Escape HTML special characters
 * Prevents XSS when rendering user content
 */
export const escapeHtml = (input: string): string => {
  if (typeof input !== "string") {
    return String(input);
  }

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
};

/**
 * Validate search input
 * Sanitizes search queries to prevent injection
 */
export const sanitizeSearchInput = (input: string): string => {
  if (typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters but allow normal search characters
  let sanitized = input.replace(/[<>"']/g, "");

  // Limit length
  sanitized = sanitized.substring(0, 500);

  return sanitized.trim();
};

/**
 * Parse numeric input from various formats
 */
const parseNumericInput = (input: unknown): number | null => {
  if (typeof input === "number") {
    return input;
  }

  if (typeof input === "string") {
    // Remove currency symbols and commas
    const cleaned = input.replace(/[$,]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
};

/**
 * Validate numeric input
 * Ensures input is a valid number within bounds
 */
export const validateNumericInput = (
  input: unknown,
  options: {
    min?: number;
    max?: number;
    allowNegative?: boolean;
    allowDecimal?: boolean;
  } = {}
): number | null => {
  const { min, max, allowNegative = true, allowDecimal = true } = options;

  const num = parseNumericInput(input);
  if (num === null || !isFinite(num)) {
    return null;
  }

  if (!allowNegative && num < 0) {
    return null;
  }

  if (!allowDecimal && num % 1 !== 0) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
};
