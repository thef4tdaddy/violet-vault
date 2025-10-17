/**
 * Type-safe Error Handling for Firebase Services
 * Provides structured error categorization and handling
 */

import type { FirebaseError, ErrorCategory, TypedResponse } from "../../types/firebase";
import logger from "../../utils/common/logger";

// Enhanced error categories with specific Firebase/Firestore errors
export type DetailedErrorCategory =
  | "network_timeout"
  | "network_connection"
  | "network_cors"
  | "encryption_decrypt"
  | "encryption_encrypt"
  | "encryption_key_invalid"
  | "firebase_permission"
  | "firebase_quota"
  | "firebase_rate_limit"
  | "firestore_unavailable"
  | "validation_checksum"
  | "validation_corrupt"
  | "validation_format"
  | "storage_full"
  | "storage_unavailable"
  | "auth_unauthenticated"
  | "auth_expired"
  | "unknown";

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  readonly canRetry: boolean;
  readonly maxRetries: number;
  readonly retryDelay: number;
  readonly exponentialBackoff: boolean;
  readonly requiresUserAction: boolean;
  readonly recoveryActions: string[];
}

// Enhanced Firebase error with recovery information
export interface EnhancedFirebaseError extends FirebaseError {
  readonly detailedCategory: DetailedErrorCategory;
  readonly recoveryStrategy: ErrorRecoveryStrategy;
  readonly userMessage: string;
  readonly technicalDetails: string;
}

// Error patterns for categorization
const ERROR_PATTERNS: Record<
  DetailedErrorCategory,
  {
    patterns: string[];
    recovery: ErrorRecoveryStrategy;
    userMessage: string;
  }
> = {
  network_timeout: {
    patterns: ["timeout", "timed out", "request timeout"],
    recovery: {
      canRetry: true,
      maxRetries: 3,
      retryDelay: 2000,
      exponentialBackoff: true,
      requiresUserAction: false,
      recoveryActions: ["Check internet connection", "Retry operation"],
    },
    userMessage: "Connection timed out. Please check your internet connection and try again.",
  },
  network_connection: {
    patterns: ["network error", "connection", "fetch failed", "no network"],
    recovery: {
      canRetry: true,
      maxRetries: 2,
      retryDelay: 1000,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Check internet connection", "Try again later"],
    },
    userMessage: "Network connection problem. Please check your internet connection.",
  },
  network_cors: {
    patterns: ["cors", "cross-origin", "blocked by cors"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Contact support"],
    },
    userMessage: "There was a security issue with the connection. Please contact support.",
  },
  encryption_decrypt: {
    patterns: ["decrypt", "decryption failed", "invalid cipher", "data is too small"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Check encryption key", "Restore from backup"],
    },
    userMessage: "Unable to decrypt data. Your encryption key may be incorrect.",
  },
  encryption_encrypt: {
    patterns: ["encrypt", "encryption failed", "key derivation"],
    recovery: {
      canRetry: true,
      maxRetries: 1,
      retryDelay: 1000,
      exponentialBackoff: false,
      requiresUserAction: false,
      recoveryActions: ["Retry with same key"],
    },
    userMessage: "Unable to encrypt data. Please try again.",
  },
  encryption_key_invalid: {
    patterns: ["invalid key", "key error", "bad key"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Re-enter encryption key", "Reset password"],
    },
    userMessage: "Invalid encryption key. Please check your password.",
  },
  firebase_permission: {
    patterns: ["permission", "unauthorized", "access denied", "insufficient permissions"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Sign in again", "Contact support"],
    },
    userMessage: "Permission denied. Please sign in again or contact support.",
  },
  firebase_quota: {
    patterns: ["quota", "over limit", "exceeded quota"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Try again later", "Contact support"],
    },
    userMessage: "Storage quota exceeded. Please try again later or contact support.",
  },
  firebase_rate_limit: {
    patterns: ["rate limit", "too many requests", "throttled"],
    recovery: {
      canRetry: true,
      maxRetries: 2,
      retryDelay: 5000,
      exponentialBackoff: true,
      requiresUserAction: false,
      recoveryActions: ["Wait and retry"],
    },
    userMessage: "Too many requests. Please wait a moment and try again.",
  },
  firestore_unavailable: {
    patterns: ["firestore unavailable", "service unavailable", "firebase down"],
    recovery: {
      canRetry: true,
      maxRetries: 3,
      retryDelay: 10000,
      exponentialBackoff: true,
      requiresUserAction: false,
      recoveryActions: ["Wait for service recovery", "Try again later"],
    },
    userMessage: "Cloud service is temporarily unavailable. Please try again later.",
  },
  validation_checksum: {
    patterns: ["checksum", "checksum mismatch", "data integrity"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Clear corrupted data", "Restore from backup"],
    },
    userMessage: "Data integrity error. The data may be corrupted.",
  },
  validation_corrupt: {
    patterns: ["corrupt", "malformed", "invalid format"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Clear corrupted data", "Restore from backup"],
    },
    userMessage: "Data appears to be corrupted. Please restore from a backup.",
  },
  validation_format: {
    patterns: ["invalid data", "validation failed", "format error"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Check data format", "Contact support"],
    },
    userMessage: "Data format is invalid. Please check your input.",
  },
  storage_full: {
    patterns: ["storage full", "no space", "disk full"],
    recovery: {
      canRetry: false,
      maxRetries: 0,
      retryDelay: 0,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Free up space", "Contact support"],
    },
    userMessage: "Storage is full. Please free up space or contact support.",
  },
  storage_unavailable: {
    patterns: ["storage unavailable", "indexeddb", "database error"],
    recovery: {
      canRetry: true,
      maxRetries: 2,
      retryDelay: 2000,
      exponentialBackoff: false,
      requiresUserAction: false,
      recoveryActions: ["Clear browser cache", "Restart browser"],
    },
    userMessage: "Local storage is unavailable. Please try restarting your browser.",
  },
  auth_unauthenticated: {
    patterns: ["unauthenticated", "not signed in", "auth required"],
    recovery: {
      canRetry: true,
      maxRetries: 1,
      retryDelay: 1000,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Sign in", "Refresh page"],
    },
    userMessage: "Please sign in to continue.",
  },
  auth_expired: {
    patterns: ["token expired", "session expired", "auth expired"],
    recovery: {
      canRetry: true,
      maxRetries: 1,
      retryDelay: 1000,
      exponentialBackoff: false,
      requiresUserAction: true,
      recoveryActions: ["Sign in again", "Refresh page"],
    },
    userMessage: "Your session has expired. Please sign in again.",
  },
  unknown: {
    patterns: [],
    recovery: {
      canRetry: true,
      maxRetries: 1,
      retryDelay: 2000,
      exponentialBackoff: false,
      requiresUserAction: false,
      recoveryActions: ["Try again", "Contact support if problem persists"],
    },
    userMessage: "An unexpected error occurred. Please try again.",
  },
};

/**
 * Enhanced error handler with detailed categorization and recovery strategies
 */
export class EnhancedFirebaseErrorHandler {
  /**
   * Categorize error with detailed subcategories
   */
  categorizeDetailedError(error: unknown): DetailedErrorCategory {
    if (!(error instanceof Error)) {
      return "unknown";
    }

    const message = error.message.toLowerCase();

    // Check each category's patterns
    for (const [category, config] of Object.entries(ERROR_PATTERNS)) {
      if (config.patterns.some((pattern) => message.includes(pattern))) {
        return category as DetailedErrorCategory;
      }
    }

    return "unknown";
  }

  /**
   * Create enhanced Firebase error with recovery information
   */
  createEnhancedError(error: unknown, context?: Record<string, unknown>): EnhancedFirebaseError {
    const detailedCategory = this.categorizeDetailedError(error);
    const config = ERROR_PATTERNS[detailedCategory];
    const basicCategory = this.mapToBasicCategory(detailedCategory);

    const message = error instanceof Error ? error.message : String(error);
    const code = this.extractErrorCode(error) || "UNKNOWN_ERROR";

    return {
      code,
      message,
      category: basicCategory,
      detailedCategory,
      timestamp: Date.now(),
      context,
      recoveryStrategy: config.recovery,
      userMessage: config.userMessage,
      technicalDetails: message,
    };
  }

  /**
   * Handle error with automatic logging and recovery suggestions
   */
  handleError(error: unknown, context?: Record<string, unknown>): EnhancedFirebaseError {
    const enhancedError = this.createEnhancedError(error, context);

    // Log error with appropriate level based on category
    this.logError(enhancedError);

    return enhancedError;
  }

  /**
   * Create typed error response
   */
  createErrorResponse<T>(error: unknown, context?: Record<string, unknown>): TypedResponse<T> {
    const enhancedError = this.handleError(error, context);

    return {
      success: false,
      error: enhancedError,
      timestamp: Date.now(),
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: EnhancedFirebaseError): boolean {
    return error.recoveryStrategy.canRetry;
  }

  /**
   * Get next retry delay with exponential backoff
   */
  getRetryDelay(error: EnhancedFirebaseError, attempt: number): number {
    const baseDelay = error.recoveryStrategy.retryDelay;

    if (error.recoveryStrategy.exponentialBackoff) {
      return baseDelay * Math.pow(2, attempt);
    }

    return baseDelay;
  }

  private mapToBasicCategory(detailedCategory: DetailedErrorCategory): ErrorCategory {
    if (detailedCategory.startsWith("network_")) return "network";
    if (detailedCategory.startsWith("encryption_")) return "encryption";
    if (detailedCategory.startsWith("firebase_") || detailedCategory.startsWith("firestore_"))
      return "firebase";
    if (detailedCategory.startsWith("validation_")) return "validation";
    if (detailedCategory.startsWith("storage_")) return "storage";
    if (detailedCategory.startsWith("auth_")) return "authentication";
    return "unknown";
  }

  private extractErrorCode(error: unknown): string | null {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof (error as any).code === "string"
    ) {
      return (error as any).code;
    }
    return null;
  }

  private logError(error: EnhancedFirebaseError): void {
    const logContext = {
      code: error.code,
      category: error.category,
      detailedCategory: error.detailedCategory,
      canRetry: error.recoveryStrategy.canRetry,
      context: error.context,
    };

    // Log with appropriate level based on error severity
    if (error.detailedCategory === "unknown" || !error.recoveryStrategy.canRetry) {
      logger.error("Firebase service error", logContext);
    } else {
      logger.warn("Firebase service warning", logContext);
    }
  }
}

// Export singleton instance
export const enhancedFirebaseErrorHandler = new EnhancedFirebaseErrorHandler();
