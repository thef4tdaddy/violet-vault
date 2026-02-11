import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Sentry from "@sentry/react";
import { initSentry, captureError, identifyUser, clearUser, getSentryEventUrl } from "../sentry";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
}));

// Mock logger
vi.mock("../logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("sentry.ts", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_ERROR_REPORTING_ENABLED", "true");
    vi.stubEnv("VITE_SENTRY_DSN", "https://key@org.ingest.sentry.io/123");
    vi.stubEnv("MODE", "production");

    // Reset window.location
    delete (window as any).location;
    window.location = { ...originalLocation, hostname: "localhost" } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.unstubAllEnvs();
  });

  describe("initSentry", () => {
    it("should initialize Sentry when enabled and DSN is present", () => {
      initSentry();
      expect(Sentry.init).toHaveBeenCalled();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: "https://key@org.ingest.sentry.io/123",
          environment: "production",
          release: expect.stringContaining("violetvault@"),
        })
      );
    });

    it("should handle release name with commit SHA", () => {
      vi.stubEnv("VITE_COMMIT_SHA", "abcdef123456");
      vi.stubEnv("MODE", "staging");
      initSentry();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          release: expect.stringContaining("abcdef1"),
        })
      );
    });

    it("should skip initialization if disabled", () => {
      vi.stubEnv("VITE_ERROR_REPORTING_ENABLED", "false");
      initSentry();
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it("should handle initialization errors gracefully", () => {
      vi.mocked(Sentry.init).mockImplementation(() => {
        throw new Error("Init fail");
      });
      expect(() => initSentry()).not.toThrow();
    });
  });

  describe("Environment Overrides", () => {
    it("should use staging configuration on staging domain", () => {
      delete (window as any).location;
      window.location = { ...originalLocation, hostname: "staging.violetvault.app" } as any;

      initSentry();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: "staging",
        })
      );
    });

    it("should use development configuration in development mode", () => {
      vi.stubEnv("MODE", "development");
      // Ensure we're not on staging domain to test MODE logic
      delete (window as any).location;
      window.location = { ...originalLocation, hostname: "localhost" } as any;

      initSentry();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: "development",
        })
      );
    });
  });

  describe("Event Filtering", () => {
    it("should filter out info and debug events", () => {
      initSentry();
      const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0].beforeSend!;

      const infoEvent = { level: "info" } as any;
      expect(beforeSend(infoEvent, {} as any)).toBeNull();

      const errorEvent = { level: "error" } as any;
      expect(beforeSend(errorEvent, {} as any)).not.toBeNull();
    });

    it("should filter out CORS/frame errors", () => {
      initSentry();
      const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0].beforeSend!;

      const corsEvent = { message: "Blocked a frame with origin..." } as any;
      expect(beforeSend(corsEvent, {} as any)).toBeNull();
    });

    it("should strip sensitive data from requests", () => {
      initSentry();
      const beforeSend = vi.mocked(Sentry.init).mock.calls[0][0].beforeSend!;

      const eventWithCookies = {
        request: {
          cookies: { session: "secret" },
          headers: { authorization: "Bearer secret", "user-agent": "Mozilla" },
        },
      } as any;

      const result = beforeSend(eventWithCookies, {} as any) as any;
      expect(result?.request?.cookies).toBeUndefined();
      expect(result?.request?.headers?.["authorization"]).toBeUndefined();
      expect(result?.request?.headers?.["user-agent"]).toBe("Mozilla");
    });
  });

  describe("Helper Functions", () => {
    it("captureError should call Sentry.captureException", () => {
      const error = new Error("Test error");
      const context = { foo: "bar" };
      captureError(error, context);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          contexts: { custom: context },
        })
      );
    });

    it("identifyUser should call Sentry.setUser", () => {
      identifyUser("user-123", { email: "test@example.com" });
      expect(Sentry.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-123",
          email: "test@example.com",
        })
      );
    });

    it("clearUser should call Sentry.setUser(null)", () => {
      clearUser();
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it("getSentryEventUrl should return valid URL if enabled", () => {
      const url = getSentryEventUrl("event-456");
      expect(url).toBe("https://org.sentry.io/issues/?project=123&query=event.id%3Aevent-456");
    });

    it("getSentryEventUrl should return null if disabled or DSN missing", () => {
      vi.stubEnv("VITE_ERROR_REPORTING_ENABLED", "false");
      const url = getSentryEventUrl("event-456");
      expect(url).toBeNull();
    });
  });
});
