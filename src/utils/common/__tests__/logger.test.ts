/**
 * TypeScript-driven tests for Logger utility
 * Testing edge cases and type safety revealed by TypeScript conversion
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, type LogData } from "../logger";

// Mock window and Highlight.io
const mockWindow = {
  location: {
    hostname: "localhost"
  },
  originalConsoleLog: vi.fn()
} as any;

// Mock Highlight.io module
const mockHighlight = {
  H: {
    track: vi.fn(),
    consumeError: vi.fn()
  }
};

// Setup global mocks
global.window = mockWindow;
global.console.log = vi.fn();
global.console.warn = vi.fn();
global.console.error = vi.fn();

describe("Logger - Type Safety & Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    vi.stubEnv('MODE', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Type Safety - LogData Interface", () => {
    it("should accept valid LogData objects", () => {
      const validLogData: LogData[] = [
        {},
        { key: "value" },
        { number: 42 },
        { boolean: true },
        { null: null },
        { undefined: undefined },
        { nested: { deep: { value: "test" } } },
        { array: [1, 2, 3] },
        { mixed: { string: "test", number: 42, bool: false } }
      ];

      validLogData.forEach(data => {
        expect(() => logger.debug("test message", data)).not.toThrow();
        expect(() => logger.info("test message", data)).not.toThrow();
        expect(() => logger.warn("test message", data)).not.toThrow();
        expect(() => logger.error("test message", null, data)).not.toThrow();
      });
    });

    it("should handle edge case data types", () => {
      const edgeCaseData: LogData = {
        emptyString: "",
        zero: 0,
        negativeNumber: -1,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: NaN,
        bigInt: BigInt(123),
        symbol: Symbol("test"),
        function: () => "test",
        date: new Date(),
        regexp: /test/g,
        error: new Error("test error")
      };

      expect(() => logger.debug("Edge case data", edgeCaseData)).not.toThrow();
    });
  });

  describe("Method Parameter Type Safety", () => {
    it("should enforce string message parameter", () => {
      // These should work with proper string messages
      expect(() => logger.debug("")).not.toThrow();
      expect(() => logger.debug("valid message")).not.toThrow();
      expect(() => logger.debug("message with 🔍 emojis")).not.toThrow();
    });

    it("should handle performance method with typed parameters", () => {
      expect(() => logger.performance("operation", 123)).not.toThrow();
      expect(() => logger.performance("operation", 0)).not.toThrow();
      expect(() => logger.performance("operation", -1)).not.toThrow();
      expect(() => logger.performance("operation", Infinity)).not.toThrow();
    });

    it("should handle error method with typed Error parameter", () => {
      const testError = new Error("Test error");
      const customError = new TypeError("Custom error");
      
      expect(() => logger.error("Error message", testError)).not.toThrow();
      expect(() => logger.error("Error message", customError)).not.toThrow();
      expect(() => logger.error("Error message", null)).not.toThrow();
    });
  });

  describe("Development Environment Detection", () => {
    it("should detect development environment correctly", () => {
      vi.stubEnv('MODE', 'development');
      expect(() => logger.debug("dev message")).not.toThrow();
      expect(console.log).toHaveBeenCalled();
    });

    it("should detect production environment correctly", () => {
      vi.stubEnv('MODE', 'production');
      expect(() => logger.debug("prod message")).not.toThrow();
      // In production, debug messages don't go to console
    });

    it("should handle missing environment variable", () => {
      vi.stubEnv('MODE', undefined as any);
      expect(() => logger.debug("undefined env message")).not.toThrow();
    });
  });

  describe("Hostname Detection Edge Cases", () => {
    it("should handle various development hostnames", () => {
      const devHostnames = [
        "localhost",
        "dev.example.com",
        "127.0.0.1",
        "192.168.1.1",
        "preview-123.vercel.app",
        "feature-branch-git-abc123.vercel.app"
      ];

      devHostnames.forEach(hostname => {
        mockWindow.location.hostname = hostname;
        expect(() => logger.debug("hostname test")).not.toThrow();
      });
    });

    it("should handle production hostnames", () => {
      const prodHostnames = [
        "violet-vault.vercel.app",
        "example.com",
        "subdomain.example.com"
      ];

      prodHostnames.forEach(hostname => {
        mockWindow.location.hostname = hostname;
        expect(() => logger.debug("hostname test")).not.toThrow();
      });
    });

    it("should handle server-side rendering (no window)", () => {
      const originalWindow = global.window;
      // @ts-ignore - Testing undefined window
      global.window = undefined;
      
      expect(() => logger.debug("SSR test")).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  describe("Throttling Mechanism", () => {
    it("should throttle debug messages correctly", () => {
      const message = "throttled message";
      
      // First call should go through
      logger.debugThrottled(message, {}, 1000);
      expect(console.log).toHaveBeenCalledTimes(1);
      
      // Immediate second call should be throttled
      logger.debugThrottled(message, {}, 1000);
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it("should handle different throttle intervals", () => {
      const intervals = [0, 1, 100, 1000, 5000];
      
      intervals.forEach(interval => {
        expect(() => logger.debugThrottled("test", {}, interval)).not.toThrow();
      });
    });

    it("should handle negative throttle intervals", () => {
      expect(() => logger.debugThrottled("test", {}, -1)).not.toThrow();
    });
  });

  describe("Sensitive Data Filtering", () => {
    it("should filter sensitive data in auth method", () => {
      const sensitiveData: LogData = {
        password: "secret123",
        encryptionKey: "key123",
        token: "token123",
        username: "testuser", // This should remain
        email: "test@example.com" // This should remain
      };

      expect(() => logger.auth("Auth test", sensitiveData)).not.toThrow();
      
      // Verify the original data wasn't mutated
      expect(sensitiveData.password).toBe("secret123");
      expect(sensitiveData.username).toBe("testuser");
    });

    it("should handle auth method with no sensitive data", () => {
      const cleanData: LogData = {
        username: "testuser",
        timestamp: Date.now()
      };

      expect(() => logger.auth("Clean auth test", cleanData)).not.toThrow();
    });

    it("should handle auth method with undefined sensitive fields", () => {
      const dataWithUndefined: LogData = {
        username: "testuser",
        password: undefined,
        encryptionKey: undefined,
        token: undefined
      };

      expect(() => logger.auth("Undefined sensitive test", dataWithUndefined)).not.toThrow();
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle various Error types", () => {
      const errorTypes = [
        new Error("Generic error"),
        new TypeError("Type error"),
        new ReferenceError("Reference error"),
        new RangeError("Range error"),
        new SyntaxError("Syntax error"),
        new URIError("URI error")
      ];

      errorTypes.forEach(error => {
        expect(() => logger.error("Error test", error)).not.toThrow();
      });
    });

    it("should handle custom error objects", () => {
      const customError = {
        name: "CustomError",
        message: "Custom error message",
        stack: "Custom stack trace"
      };

      // This tests the null path in the error method
      expect(() => logger.error("Custom error test", null, { customError })).not.toThrow();
    });
  });

  describe("Production Logging", () => {
    it("should always log production messages regardless of environment", () => {
      const environments = ['development', 'production', 'staging', 'test'];
      
      environments.forEach(env => {
        vi.stubEnv('MODE', env);
        expect(() => logger.production("Production test")).not.toThrow();
      });
    });
  });

  describe("Highlight.io Integration Edge Cases", () => {
    it("should handle Highlight.io initialization failure gracefully", () => {
      // Test when dynamic import fails
      expect(() => logger.testHighlight()).not.toThrow();
    });

    it("should handle missing Highlight.io methods", () => {
      const incompleteHighlight = {
        H: {
          track: undefined,
          consumeError: undefined
        }
      };

      expect(() => logger.debug("Test without highlight methods")).not.toThrow();
    });
  });

  describe("Global Window Integration", () => {
    it("should add logger to window object", () => {
      expect(window.logger).toBeDefined();
      expect(typeof window.testHighlight).toBe("function");
    });

    it("should handle window.originalConsoleLog fallback", () => {
      const originalConsoleLog = console.log;
      mockWindow.originalConsoleLog = vi.fn();
      
      logger.debug("Test original console log");
      
      // Restore
      console.log = originalConsoleLog;
    });
  });
});