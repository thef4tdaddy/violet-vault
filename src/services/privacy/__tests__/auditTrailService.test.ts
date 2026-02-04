/**
 * Audit Trail Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { auditTrailService } from "../auditTrailService";
import type { AuditLogEntry } from "@/types/privacyAudit";
// Mock fake-indexeddb for testing

describe("AuditTrailService", () => {
  beforeEach(async () => {
    // Clear logs before each test
    await auditTrailService.clearLogs();
  });

  describe("logApiCall", () => {
    it("should log an API call", async () => {
      const entry: Omit<AuditLogEntry, "id"> = {
        timestamp: Date.now(),
        endpoint: "/api/analytics/test",
        method: "POST",
        encryptedPayloadSize: 1024,
        responseTimeMs: 50,
        success: true,
        encrypted: true,
      };

      const logEntry = await auditTrailService.logApiCall(entry);

      expect(logEntry).toBeDefined();
      expect(logEntry.id).toBeDefined();
      expect(logEntry.endpoint).toBe("/api/analytics/test");
      expect(logEntry.method).toBe("POST");
      expect(logEntry.success).toBe(true);
    });

    it("should log failed API calls with error message", async () => {
      const entry: Omit<AuditLogEntry, "id"> = {
        timestamp: Date.now(),
        endpoint: "/api/analytics/test",
        method: "POST",
        encryptedPayloadSize: 512,
        responseTimeMs: 100,
        success: false,
        encrypted: true,
        errorMessage: "Network error",
      };

      const logEntry = await auditTrailService.logApiCall(entry);

      expect(logEntry.success).toBe(false);
      expect(logEntry.errorMessage).toBe("Network error");
    });
  });

  describe("getLogs", () => {
    it("should return empty array when no logs exist", async () => {
      const count = await auditTrailService.getCount();
      expect(count).toBe(0);
    });

    it("should return logs sorted by timestamp (newest first)", async () => {
      const now = Date.now();

      await auditTrailService.logApiCall({
        timestamp: now,
        endpoint: "/api/test1",
        method: "POST",
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
        success: true,
        encrypted: true,
      });

      await auditTrailService.logApiCall({
        timestamp: now + 1000,
        endpoint: "/api/test2",
        method: "POST",
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
        success: true,
        encrypted: true,
      });

      const logs = await auditTrailService.getLogs();

      expect(logs).toHaveLength(2);
      expect(logs[0].endpoint).toBe("/api/test2"); // Newest first
      expect(logs[1].endpoint).toBe("/api/test1");
    });
  });

  describe("clearLogs", () => {
    it("should clear all logs", async () => {
      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test",
        method: "POST",
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
        success: true,
        encrypted: true,
      });

      let logs = await auditTrailService.getLogs();
      expect(logs).toHaveLength(1);

      await auditTrailService.clearLogs();

      logs = await auditTrailService.getLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe("exportLogsCSV", () => {
    it("should export logs to CSV format", async () => {
      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test",
        method: "POST",
        encryptedPayloadSize: 512,
        responseTimeMs: 25,
        success: true,
        encrypted: true,
      });

      const csv = await auditTrailService.exportLogsCSV();

      expect(csv).toContain('"Timestamp","Endpoint"');
      expect(csv).toContain('"/api/test"');
      expect(csv).toContain('"POST"');
      expect(csv).toContain('"Yes"'); // Encrypted
      expect(csv).toContain('"512"');
      expect(csv).toContain('"25"');
    });

    it("should handle empty logs", async () => {
      const csv = await auditTrailService.exportLogsCSV();

      expect(csv).toContain('"Timestamp","Endpoint"');
      // Should only have header row
      const rows = csv.split("\n");
      expect(rows).toHaveLength(1);
    });

    it("should properly escape special characters in CSV", async () => {
      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: '/api/test"endpoint',
        method: "POST",
        encryptedPayloadSize: 512,
        responseTimeMs: 25,
        success: false,
        encrypted: true,
        errorMessage: 'Error with "quotes" and, commas',
      });

      const csv = await auditTrailService.exportLogsCSV();

      // Verify quotes are escaped with double quotes
      expect(csv).toContain('"/api/test""endpoint"');
      expect(csv).toContain('"Error with ""quotes"" and, commas"');
    });

    it("should handle endpoints and errors with newlines", async () => {
      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test",
        method: "POST",
        encryptedPayloadSize: 512,
        responseTimeMs: 25,
        success: false,
        encrypted: true,
        errorMessage: "Error\nwith\nnewlines",
      });

      const csv = await auditTrailService.exportLogsCSV();

      // Verify the CSV is valid (wrapped in quotes)
      expect(csv).toContain('"Error\nwith\nnewlines"');
    });
  });

  describe("downloadCSV", () => {
    it("should handle the download process", async () => {
      const mockLink = { href: "", download: "", click: vi.fn() };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        if (tagName === "a") return mockLink as unknown as HTMLAnchorElement;
        return originalCreateElement(tagName);
      });
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test",
        method: "POST",
        success: true,
        encrypted: true,
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
      });

      await expect(auditTrailService.downloadCSV()).resolves.toBeUndefined();
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should handle download errors", async () => {
      vi.spyOn(auditTrailService, "exportLogsCSV").mockRejectedValueOnce(new Error("CSV failed"));
      await expect(auditTrailService.downloadCSV()).rejects.toThrow("CSV failed");
    });
  });

  describe("LRU eviction", () => {
    it("should enforce max 1000 entries and evict oldest", async () => {
      // Add 1001 entries to trigger eviction
      const testCount = 1001;
      const entries = [];
      const now = Date.now();

      // Use a more efficient way if possible, but let's stick to the service API
      // To speed up, we can use a loop but maybe not 1000 await calls
      // Actually, Dexie handles many calls fine.

      // Let's add 1000 entries
      for (let i = 0; i < testCount; i++) {
        entries.push(
          auditTrailService.logApiCall({
            timestamp: now + i,
            endpoint: `/api/test-${i}`,
            method: "POST",
            encryptedPayloadSize: 100,
            responseTimeMs: 10,
            success: true,
            encrypted: true,
          })
        );
      }

      await Promise.all(entries);

      const count = await auditTrailService.getCount();
      expect(count).toBe(1000); // 1001st addition should trigger eviction of 1

      const logs = await auditTrailService.getLogs();
      // Oldest (/api/test-0) should be gone
      expect(logs.find((l) => l.endpoint === "/api/test-0")).toBeUndefined();
      expect(logs.find((l) => l.endpoint === "/api/test-1000")).toBeDefined();
    });

    it("should handle eviction errors gracefully", async () => {
      // Mock db.auditLogs.count to throw to cover catch block in handleMaxEntries
      // This is a private method, hard to mock directly without casting
      const service = auditTrailService as any;
      vi.spyOn(service.db.auditLogs, "count").mockRejectedValueOnce(new Error("DB error"));

      // logApiCall should still succeed even if eviction fails (it catches error)
      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test",
        method: "POST",
        success: true,
        encrypted: true,
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
      });
      // No error should be thrown
    });
  });

  describe("error handling", () => {
    it("should handle getCount errors", async () => {
      const service = auditTrailService as any;
      vi.spyOn(service.db.auditLogs, "count").mockRejectedValueOnce(new Error("Count failed"));
      const count = await auditTrailService.getCount();
      expect(count).toBe(0);
    });

    it("should handle logApiCall errors", async () => {
      const service = auditTrailService as any;
      vi.spyOn(service.db.auditLogs, "add").mockRejectedValueOnce(new Error("Add failed"));
      await expect(
        auditTrailService.logApiCall({
          timestamp: Date.now(),
          endpoint: "/api/test",
          method: "POST",
          success: true,
          encrypted: true,
          encryptedPayloadSize: 100,
          responseTimeMs: 10,
        })
      ).rejects.toThrow("Add failed");
    });

    it("should handle getLogs errors", async () => {
      const service = auditTrailService as any;
      // Mock the entire chain to ensure catch block is hit
      vi.spyOn(service.db.auditLogs, "orderBy").mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValueOnce(new Error("Get failed")),
        }),
      } as any);

      const logs = await auditTrailService.getLogs();
      expect(logs).toEqual([]);
    });

    it("should handle clearLogs errors", async () => {
      const service = auditTrailService as any;
      vi.spyOn(service.db.auditLogs, "clear").mockRejectedValueOnce(new Error("Clear failed"));
      await expect(auditTrailService.clearLogs()).rejects.toThrow("Clear failed");
    });

    it("should cover initialization logic", async () => {
      const service = auditTrailService as any;
      // Force re-init by resetting the flag
      service.initialized = false;
      // Close db if open
      if (service.db.isOpen()) {
        await service.db.close();
      }

      await service.init();
      expect(service.initialized).toBe(true);
    });
  });

  describe("getCount", () => {
    it("should return correct count of logs", async () => {
      expect(await auditTrailService.getCount()).toBe(0);

      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test1",
        method: "POST",
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
        success: true,
        encrypted: true,
      });

      expect(await auditTrailService.getCount()).toBe(1);

      await auditTrailService.logApiCall({
        timestamp: Date.now(),
        endpoint: "/api/test2",
        method: "POST",
        encryptedPayloadSize: 100,
        responseTimeMs: 10,
        success: true,
        encrypted: true,
      });

      expect(await auditTrailService.getCount()).toBe(2);
    });
  });
});
