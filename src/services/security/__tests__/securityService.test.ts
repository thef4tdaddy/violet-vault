import { describe, it, expect, vi, beforeEach } from "vitest";
import { securityService } from "../securityService";

// Import types for testing
interface SecuritySettings {
  autoLockEnabled: boolean;
  autoLockTimeout: number;
  clipboardClearTimeout: number;
  securityLoggingEnabled: boolean;
  lockOnPageHide: boolean;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock navigator and window
Object.assign(global, {
  navigator: {
    userAgent: "Test User Agent",
  },
  window: {
    location: {
      href: "https://test.example.com",
    },
  },
});

describe("securityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe("getDefaultSettings", () => {
    it("should return default security settings", () => {
      const defaults = securityService.getDefaultSettings();

      expect(defaults).toEqual({
        autoLockEnabled: true,
        autoLockTimeout: 15,
        clipboardClearTimeout: 30,
        securityLoggingEnabled: true,
        lockOnPageHide: true,
      });
    });
  });

  describe("loadSettings", () => {
    it("should load settings from localStorage", () => {
      const savedSettings = {
        autoLockEnabled: false,
        autoLockTimeout: 30,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const result = securityService.loadSettings();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("violetVault_securitySettings");
      expect(result.autoLockEnabled).toBe(false);
      expect(result.autoLockTimeout).toBe(30);
    });

    it("should return defaults when no saved settings", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = securityService.loadSettings();

      expect(result).toEqual(securityService.getDefaultSettings());
    });

    it("should return defaults on parse error", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      const result = securityService.loadSettings();

      expect(result).toEqual(securityService.getDefaultSettings());
    });
  });

  describe("saveSettings", () => {
    it("should save settings to localStorage", () => {
      const settings: Partial<SecuritySettings> = { autoLockEnabled: false };

      securityService.saveSettings(settings as SecuritySettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "violetVault_securitySettings",
        JSON.stringify(settings)
      );
    });

    it("should handle save errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });

      expect(() => securityService.saveSettings({} as SecuritySettings)).not.toThrow();
    });
  });

  describe("loadSecurityEvents", () => {
    it("should load events from localStorage", () => {
      const events = [{ id: "1", type: "LOGIN", timestamp: "2023-01-01T00:00:00Z" }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(events));

      const result = securityService.loadSecurityEvents();

      expect(result).toEqual(events);
    });

    it("should return empty array when no events", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = securityService.loadSecurityEvents();

      expect(result).toEqual([]);
    });
  });

  describe("saveSecurityEvents", () => {
    it("should save events with limit of 100", () => {
      const events: SecurityEvent[] = Array.from({ length: 150 }, (_, i) => ({
        id: `event-${i}`,
        type: "TEST",
        timestamp: new Date().toISOString(),
        description: "Test event",
        metadata: {},
      }));

      securityService.saveSecurityEvents(events);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "violetVault_securityEvents",
        expect.stringContaining('"id":"event-50"') // Should start from event 50 (last 100)
      );
    });
  });

  describe("safeSerialize", () => {
    it("should handle primitive values", () => {
      expect(securityService.safeSerialize("string")).toBe("string");
      expect(securityService.safeSerialize(123)).toBe(123);
      expect(securityService.safeSerialize(true)).toBe(true);
      expect(securityService.safeSerialize(null)).toBe(null);
    });

    it("should handle arrays with limit", () => {
      const arr = Array.from({ length: 15 }, (_, i) => i);
      const result = securityService.safeSerialize(arr);

      expect(result).toHaveLength(10); // Limited to 10 items
    });

    it("should handle objects with key limit", () => {
      const obj = Object.fromEntries(
        Array.from({ length: 25 }, (_, i) => [`key${i}`, `value${i}`])
      );
      const result = securityService.safeSerialize(obj);

      expect(Object.keys(result)).toHaveLength(20); // Limited to 20 keys
    });

    it("should respect max depth", () => {
      const deepObj = { level1: { level2: { level3: { level4: "deep" } } } };
      const result = securityService.safeSerialize(deepObj, 2) as { level1: { level2: unknown } };

      expect(result.level1.level2).toBe("[Max Depth Reached]");
    });

    it("should handle circular references", () => {
      const obj: { name: string; self?: unknown } = { name: "test" };
      obj.self = obj;

      const result = securityService.safeSerialize(obj, 2) as {
        name: string;
        self: { name: string; self: unknown };
      };

      expect(result.name).toBe("test");
      // Circular references get serialized recursively until max depth
      // With maxDepth=2, we should see the structure go 2 levels deep
      expect(result.self).toBeDefined();
      expect(result.self.name).toBeDefined();
      expect(result.self.self).toBe("[Max Depth Reached]");
    });
  });

  describe("createSecurityEvent", () => {
    it("should create properly formatted security event", () => {
      const event = {
        type: "LOGIN_ATTEMPT",
        description: "User attempted login",
        metadata: { ip: "127.0.0.1", success: true },
      };

      const result = securityService.createSecurityEvent(event);

      expect(result).toMatchObject({
        type: "LOGIN_ATTEMPT",
        description: "User attempted login",
        metadata: expect.objectContaining({
          ip: "127.0.0.1",
          success: true,
          userAgent: "Test User Agent",
          url: "https://test.example.com",
        }),
      });
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it("should handle malformed events gracefully", () => {
      const badEvent: {
        type: number;
        description: null;
        metadata: { circular: { ref?: unknown } };
      } = {
        type: 123, // Invalid type
        description: null,
        metadata: { circular: {} },
      };
      badEvent.metadata.circular.ref = badEvent.metadata.circular;

      const result = securityService.createSecurityEvent(
        badEvent as unknown as Partial<SecurityEvent> & { type: string; description: string }
      );

      expect(result.type).toBe("UNKNOWN");
      expect(result.description).toBe("Security event");
      expect(result.metadata).toBeTruthy();
    });

    it("should create minimal event on serialization failure", () => {
      const stringifySpy = vi.spyOn(JSON, "stringify").mockImplementationOnce(() => {
        throw new Error("Serialization error");
      });

      const event = { type: "TEST", description: "Test event" };
      const result = securityService.createSecurityEvent(event);

      expect(result.type).toBe("TEST");
      expect(result.metadata.error).toBe("Serialization failed");

      stringifySpy.mockRestore();
    });
  });

  describe("logSecurityEvent", () => {
    it("should log event when logging enabled", () => {
      const settings: Partial<SecuritySettings> = { securityLoggingEnabled: true };
      const event = { type: "TEST", description: "Test event" };

      localStorageMock.getItem.mockReturnValue("[]");

      securityService.logSecurityEvent(event, settings as SecuritySettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "violetVault_securityEvents",
        expect.stringContaining("TEST")
      );
    });

    it("should not log when logging disabled", () => {
      const settings: Partial<SecuritySettings> = { securityLoggingEnabled: false };
      const event = { type: "TEST", description: "Test event" };

      securityService.logSecurityEvent(event, settings as SecuritySettings);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("clearSecurityEvents", () => {
    it("should remove events from localStorage", () => {
      securityService.clearSecurityEvents();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("violetVault_securityEvents");
    });
  });

  describe("getRecentSecurityEvents", () => {
    it("should return recent events in reverse order", () => {
      const events = [
        { id: "1", timestamp: "2023-01-01T00:00:00Z" },
        { id: "2", timestamp: "2023-01-02T00:00:00Z" },
        { id: "3", timestamp: "2023-01-03T00:00:00Z" },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(events));

      const result = securityService.getRecentSecurityEvents(2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("3"); // Most recent first
      expect(result[1].id).toBe("2");
    });
  });

  describe("getSecurityEventsByType", () => {
    it("should filter events by type", () => {
      const events = [
        { type: "LOGIN", id: "1" },
        { type: "LOGOUT", id: "2" },
        { type: "LOGIN", id: "3" },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(events));

      const result = securityService.getSecurityEventsByType("LOGIN");

      expect(result).toHaveLength(2);
      expect(result.every((event) => event.type === "LOGIN")).toBe(true);
    });
  });

  describe("getSecurityStats", () => {
    it("should generate statistics for events", () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const events = [
        { type: "LOGIN", timestamp: today.toISOString() },
        { type: "LOGOUT", timestamp: yesterday.toISOString() },
        { type: "LOGIN", timestamp: weekAgo.toISOString() },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(events));

      const stats = securityService.getSecurityStats();

      expect(stats.total).toBe(3);
      expect(stats.today).toBe(1);
      // All three events are within the week (today, yesterday, and exactly 7 days ago)
      expect(stats.thisWeek).toBe(3);
      expect(stats.byType.LOGIN).toBe(2);
      expect(stats.byType.LOGOUT).toBe(1);
    });

    it("should return empty stats on error", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const stats = securityService.getSecurityStats();

      expect(stats).toEqual({
        total: 0,
        today: 0,
        thisWeek: 0,
        byType: {},
      });
    });
  });
});
