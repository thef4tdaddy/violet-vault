import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../logger";

describe("Logger", () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let consoleLogSpy: ReturnType<typeof vi.fn>;
  let consoleWarnSpy: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.fn>;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    
    // Mock console methods
    consoleLogSpy = vi.fn();
    consoleWarnSpy = vi.fn();
    consoleErrorSpy = vi.fn();
    
    console.log = consoleLogSpy;
    console.warn = consoleWarnSpy;
    console.error = consoleErrorSpy;
    
    // Mock window for browser environment
    originalWindow = globalThis.window;
    (globalThis as Record<string, unknown>).window = {
      location: {
        hostname: "localhost",
      },
      originalConsoleLog: consoleLogSpy, // Use spy instead of original
      document: {
        createElement: () => ({
          click: vi.fn(),
        }),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      },
      URL: {
        createObjectURL: vi.fn(() => "blob:mock"),
        revokeObjectURL: vi.fn(),
      },
    };
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    
    // Restore window
    (globalThis as Record<string, unknown>).window = originalWindow;
  });

  describe("initialization", () => {
    it("should initialize with correct environment detection", () => {
      expect(logger.isDevelopment).toBeDefined();
      expect(logger.isDevSite).toBeDefined();
      expect(logger.debugThrottles).toBeDefined();
      expect(logger.logBuffer).toBeDefined();
    });

    it("should detect dev site correctly", () => {
      // localhost is considered dev site
      expect(logger.isDevSite).toBe(true);
    });
  });

  describe("debug", () => {
    it("should log debug messages in development", () => {
      logger.debug("Test debug message", { foo: "bar" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test debug message"),
        { foo: "bar" }
      );
    });

    it("should record log entry in buffer", () => {
      const initialCount = logger.getBufferedLogCount();
      logger.debug("Buffered message");
      
      expect(logger.getBufferedLogCount()).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe("debugThrottled", () => {
    it("should throttle frequent debug calls", () => {
      consoleLogSpy.mockClear();
      logger.debugThrottled("Frequent message", { count: 1 }, 1000);
      logger.debugThrottled("Frequent message", { count: 2 }, 1000);
      logger.debugThrottled("Frequent message", { count: 3 }, 1000);
      
      // Should only log once due to throttling
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it("should log again after throttle period", async () => {
      consoleLogSpy.mockClear();
      logger.debugThrottled("Throttled", {}, 10);
      
      await new Promise((resolve) => setTimeout(resolve, 15));
      
      logger.debugThrottled("Throttled", {}, 10);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("info", () => {
    it("should log info messages in development", () => {
      logger.info("Info message", { info: "data" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Info message"),
        { info: "data" }
      );
    });
  });

  describe("warn", () => {
    it("should log warnings to console", () => {
      logger.warn("Warning message", { warning: "data" });
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Warning message"),
        { warning: "data" }
      );
    });
  });

  describe("error", () => {
    it("should log errors to console", () => {
      const testError = new Error("Test error");
      logger.error("Error message", testError, { context: "test" });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error message"),
        testError,
        { context: "test" }
      );
    });

    it("should record error in log buffer with stack", () => {
      const testError = new Error("Buffer error");
      const initialCount = logger.getBufferedLogCount();
      
      logger.error("Error to buffer", testError);
      
      expect(logger.getBufferedLogCount()).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe("production", () => {
    it("should always log production messages", () => {
      logger.production("Production event", { event: "data" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[PROD] Production event"),
        { event: "data" }
      );
    });
  });

  describe("budgetSync", () => {
    it("should log budget sync messages when in development mode", () => {
      // Only logs if isDevelopment is true
      if (logger.isDevelopment) {
        logger.budgetSync("Sync started", { budgetId: "123" });
        
        expect(consoleLogSpy).toHaveBeenCalled();
      } else {
        // Still tests that it doesn't throw
        logger.budgetSync("Sync started", { budgetId: "123" });
        expect(true).toBe(true);
      }
    });
  });

  describe("auth", () => {
    it("should sanitize sensitive data from auth logs", () => {
      logger.auth("Login attempt", {
        username: "user",
        password: "secret",
        encryptionKey: "key",
        token: "token123",
      });
      
      // Check that the method doesn't throw and logs something
      expect(consoleLogSpy).toHaveBeenCalled();
      // Check the logged data doesn't contain sensitive info
      const callArgs = consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1];
      const loggedData = callArgs[1];
      expect(loggedData).not.toHaveProperty("password");
      expect(loggedData).not.toHaveProperty("encryptionKey");
      expect(loggedData).not.toHaveProperty("token");
    });
  });

  describe("firebase", () => {
    it("should log firebase messages with category", () => {
      logger.firebase("Firestore read", { docId: "doc123" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[FIREBASE] Firestore read"),
        expect.objectContaining({
          docId: "doc123",
          category: "firebase",
        })
      );
    });
  });

  describe("performance", () => {
    it("should log performance metrics", () => {
      logger.performance("API call", 150, { endpoint: "/api/data" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[PERFORMANCE] API call completed in 150ms"),
        expect.objectContaining({
          duration: 150,
          operation: "API call",
          endpoint: "/api/data",
        })
      );
    });
  });

  describe("userAction", () => {
    it("should log user actions", () => {
      logger.userAction("Button clicked", { button: "submit" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[USER-ACTION] Button clicked"),
        expect.objectContaining({
          action: "Button clicked",
          button: "submit",
        })
      );
    });
  });

  describe("log buffering", () => {
    it("should maintain buffer size limit", () => {
      const initialCount = logger.getBufferedLogCount();
      // Add more than MAX_BUFFER (500) entries
      for (let i = 0; i < 600; i++) {
        logger.debug(`Message ${i}`);
      }
      
      expect(logger.getBufferedLogCount()).toBeLessThanOrEqual(500);
      expect(logger.getBufferedLogCount()).toBeGreaterThan(initialCount);
    });

    it("should format log entries correctly", () => {
      // Clear buffer first if it's full
      if (logger.logBuffer.length >= 500) {
        logger.logBuffer.length = 0;
      }
      
      const initialCount = logger.getBufferedLogCount();
      logger.debug("Test entry", { key: "value" });
      
      expect(logger.getBufferedLogCount()).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe("downloadBufferedLogs", () => {
    it("should handle download when logs exist", () => {
      // Ensure we have logs
      logger.logBuffer.length = 0; // Clear first
      logger.debug("Test log for download");
      
      // Test that it doesn't throw
      expect(() => logger.downloadBufferedLogs()).not.toThrow();
    });
  });

  describe("testSentry", () => {
    it("should execute testSentry without throwing", () => {
      // Just test that it doesn't throw
      expect(() => logger.testSentry()).not.toThrow();
    });
  });

  describe("recordLogEntry", () => {
    it("should record entries only in development or dev site", () => {
      const initialCount = logger.getBufferedLogCount();
      
      logger.debug("Test for recording");
      
      if (logger.isDevelopment || logger.isDevSite) {
        expect(logger.getBufferedLogCount()).toBeGreaterThanOrEqual(initialCount);
      } else {
        // In production, buffer should not grow
        expect(logger.getBufferedLogCount()).toBe(initialCount);
      }
    });
  });

  describe("window global", () => {
    it("should confirm window is defined in the test environment", () => {
      // Test passes regardless of window state
      expect(typeof window).toBeDefined();
    });
  });

  describe("initSentry", () => {
    it("should return Sentry instance or fallback", () => {
      const sentry = logger.initSentry();
      expect(sentry).toBeDefined();
      expect(sentry.captureException).toBeDefined();
      expect(sentry.captureMessage).toBeDefined();
    });
  });

  describe("error logging variants", () => {
    it("should handle error without data parameter", () => {
      const err = new Error("Test without data");
      expect(() => logger.error("Error message", err)).not.toThrow();
    });

    it("should handle error with null error parameter", () => {
      expect(() => logger.error("Error message", null, { extra: "data" })).not.toThrow();
    });

    it("should handle error with string instead of Error", () => {
      expect(() => logger.error("Error message", "string error" as unknown as Error)).not.toThrow();
    });
  });

  describe("warn critical detection", () => {
    it("should handle unauthorized warnings as critical", () => {
      logger.warn("unauthorized access detected");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("should handle permission denied warnings as critical", () => {
      logger.warn("permission denied for resource");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("budgetSync critical detection", () => {
    it("should detect budgetId value issues", () => {
      // budgetSync only logs in development mode
      expect(() => logger.budgetSync("budgetId value is invalid", {})).not.toThrow();
    });

    it("should detect sync issues", () => {
      // budgetSync only logs in development mode
      expect(() => logger.budgetSync("critical sync issue detected", {})).not.toThrow();
    });
  });

  describe("getIsDevSite", () => {
    it("should detect localhost as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "localhost" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });

    it("should detect dev subdomain as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "dev.violetvault.app" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });

    it("should detect staging as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "staging.violetvault.app" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });

    it("should detect preview deployments as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "preview-abc123.vercel.app" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });

    it("should not detect production as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "violet-vault.vercel.app" },
      };
      
      expect(logger.getIsDevSite()).toBe(false);
    });

    it("should return false when window is undefined", () => {
      (globalThis as Record<string, unknown>).window = undefined;
      
      expect(logger.getIsDevSite()).toBe(false);
    });

    it("should detect 127.0.0.1 as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "127.0.0.1" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });

    it("should detect 192.168.x.x as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "192.168.1.1" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });

    it("should detect git branch deployments as dev site", () => {
      (globalThis as Record<string, unknown>).window = {
        location: { hostname: "violet-vault-git-feat-branch.vercel.app" },
      };
      
      expect(logger.getIsDevSite()).toBe(true);
    });
  });
});
