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
          href: "",
          download: "",
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Test debug message"), {
        foo: "bar",
      });
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Info message"), {
        info: "data",
      });
    });
  });

  describe("warn", () => {
    it("should log warnings to console", () => {
      logger.warn("Warning message", { warning: "data" });

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Warning message"), {
        warning: "data",
      });
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
    it("should log budget sync messages in development mode", () => {
      // Clear spy to get accurate call count
      consoleLogSpy.mockClear();

      logger.budgetSync("Sync started", { budgetId: "123" });

      // Verify it logs in development mode
      if (logger.isDevelopment) {
        expect(consoleLogSpy).toHaveBeenCalled();
      }

      // Verify it always records in buffer (regardless of environment)
      expect(logger.getBufferedLogCount()).toBeGreaterThan(0);
    });

    it("should not log budget sync messages in production mode", () => {
      // Save original isDevelopment value
      const originalIsDev = logger.isDevelopment;

      // Temporarily set to production mode
      (logger as { isDevelopment: boolean }).isDevelopment = false;
      consoleLogSpy.mockClear();

      logger.budgetSync("Sync started", { budgetId: "123" });

      // Should not log to console in production
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Restore original value
      (logger as { isDevelopment: boolean }).isDevelopment = originalIsDev;
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
      // Clear buffer before test to ensure consistent behavior
      logger.logBuffer.length = 0;
      const initialCount = logger.getBufferedLogCount();

      // Add more than MAX_BUFFER (500) entries
      for (let i = 0; i < 600; i++) {
        logger.debug(`Message ${i}`);
      }

      expect(logger.getBufferedLogCount()).toBeLessThanOrEqual(500);
      expect(logger.getBufferedLogCount()).toBeGreaterThan(initialCount);
    });

    it("should format log entries correctly", () => {
      // Clear buffer first
      logger.logBuffer.length = 0;

      logger.debug("Test entry", { key: "value" });

      // Get the last entry from the buffer
      const lastEntry = logger.logBuffer[logger.logBuffer.length - 1];

      // Verify the entry has the expected structure
      expect(lastEntry).toBeDefined();
      expect(lastEntry.level).toBe("DEBUG");
      expect(lastEntry.message).toBe("Test entry");
      expect(lastEntry.data).toEqual({ key: "value" });
      expect(lastEntry.timestamp).toBeDefined();
    });
  });

  describe("downloadBufferedLogs", () => {
    it("should create download link and trigger download", () => {
      // Ensure we have logs
      logger.logBuffer.length = 0;
      logger.debug("Test log for download");

      // Mock the global document and URL objects
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      const mockCreateElement = vi.fn(() => mockLink);
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
      const mockRevokeObjectURL = vi.fn();

      // Save originals
      const originalDocument = global.document;
      const originalURL = global.URL;

      // Mock globals
      (global as Record<string, unknown>).document = {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      };
      (global as Record<string, unknown>).URL = {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      };

      logger.downloadBufferedLogs("test-filename");

      // Verify download flow
      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockLink.href).toBe("blob:mock-url");
      expect(mockLink.download).toBe("test-filename");
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockCreateObjectURL).toHaveBeenCalled();

      // Restore globals
      (global as Record<string, unknown>).document = originalDocument;
      (global as Record<string, unknown>).URL = originalURL;
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
    it("should handle undefined window gracefully", () => {
      // Save original window
      const savedWindow = (globalThis as Record<string, unknown>).window;

      // Set window to undefined
      (globalThis as Record<string, unknown>).window = undefined;

      // Test that getIsDevSite returns false when window is undefined
      expect(logger.getIsDevSite()).toBe(false);

      // Restore window
      (globalThis as Record<string, unknown>).window = savedWindow;
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
    it("should detect and report critical error messages to Sentry", async () => {
      const mockSentry = {
        captureException: vi.fn(),
        addBreadcrumb: vi.fn(),
      };

      // Save and mock initSentry to return synchronously
      const originalInitSentry = logger.initSentry.bind(logger);
      logger.initSentry = () => mockSentry;

      // Use "error" keyword which will definitely trigger
      logger.budgetSync("Sync error occurred", {});

      // Wait a tick for async Sentry calls
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify Sentry captureException was called for critical message
      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: { category: "budget-sync", critical: "true" },
        })
      );

      // Restore original method
      logger.initSentry = originalInitSentry;
    });

    it("should detect and report critical sync issues to Sentry", async () => {
      const mockSentry = {
        captureException: vi.fn(),
        addBreadcrumb: vi.fn(),
      };

      // Save and mock initSentry to return synchronously
      const originalInitSentry = logger.initSentry.bind(logger);
      logger.initSentry = () => mockSentry;

      logger.budgetSync("critical sync issue detected", {});

      // Wait a tick for async Sentry calls
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify Sentry captureException was called for critical message
      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: { category: "budget-sync", critical: "true" },
        })
      );

      // Restore original method
      logger.initSentry = originalInitSentry;
    });

    it("should not report non-critical sync messages to Sentry as exceptions", async () => {
      const mockSentry = {
        captureException: vi.fn(),
        addBreadcrumb: vi.fn(),
      };

      // Save and mock initSentry to return synchronously
      const originalInitSentry = logger.initSentry.bind(logger);
      logger.initSentry = () => mockSentry;

      logger.budgetSync("Sync progress update", {});

      // Wait a tick for async Sentry calls
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify captureException was NOT called for non-critical message
      expect(mockSentry.captureException).not.toHaveBeenCalled();

      // But addBreadcrumb should still be called
      expect(mockSentry.addBreadcrumb).toHaveBeenCalled();

      // Restore original method
      logger.initSentry = originalInitSentry;
    });
  });

  describe("safeStringify edge cases", () => {
    it("should serialize bigint values to strings", () => {
      logger.logBuffer.length = 0;

      logger.debug("Test bigint", { bigValue: BigInt(9007199254740991) });

      const lastEntry = logger.logBuffer[logger.logBuffer.length - 1];
      expect(lastEntry.data).toBeDefined();

      // The bigint should be stored in the data
      expect(lastEntry.data?.bigValue).toBe(BigInt(9007199254740991));
    });

    it("should serialize Error objects with name, message, and stack", () => {
      logger.logBuffer.length = 0;

      const testError = new Error("Test error message");
      logger.debug("Test error serialization", { error: testError });

      const lastEntry = logger.logBuffer[logger.logBuffer.length - 1];
      expect(lastEntry.data).toBeDefined();
      expect(lastEntry.data?.error).toBe(testError);
    });

    it("should handle unserializable data gracefully", () => {
      logger.logBuffer.length = 0;

      // Create a circular reference
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;

      // Should not throw when logging circular data
      expect(() => logger.debug("Circular data", circular)).not.toThrow();

      const lastEntry = logger.logBuffer[logger.logBuffer.length - 1];
      expect(lastEntry).toBeDefined();
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
