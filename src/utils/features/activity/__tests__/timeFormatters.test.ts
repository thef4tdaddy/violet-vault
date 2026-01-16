import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTimestamp } from "../timeFormatters";

describe("timeFormatters", () => {
  describe("formatTimestamp", () => {
    let mockDate: Date;

    beforeEach(() => {
      // Set a fixed date for consistent testing
      mockDate = new Date("2024-01-15T12:00:00.000Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'Just now' for timestamps less than 1 minute ago", () => {
      const timestamp = new Date("2024-01-15T11:59:30.000Z");
      expect(formatTimestamp(timestamp)).toBe("Just now");

      const timestamp2 = new Date("2024-01-15T11:59:59.000Z");
      expect(formatTimestamp(timestamp2)).toBe("Just now");
    });

    it("should return minutes ago for timestamps less than 1 hour ago", () => {
      const timestamp1 = new Date("2024-01-15T11:55:00.000Z");
      expect(formatTimestamp(timestamp1)).toBe("5m ago");

      const timestamp2 = new Date("2024-01-15T11:30:00.000Z");
      expect(formatTimestamp(timestamp2)).toBe("30m ago");

      const timestamp3 = new Date("2024-01-15T11:01:00.000Z");
      expect(formatTimestamp(timestamp3)).toBe("59m ago");
    });

    it("should return hours ago for timestamps less than 24 hours ago", () => {
      const timestamp1 = new Date("2024-01-15T11:00:00.000Z");
      expect(formatTimestamp(timestamp1)).toBe("1h ago");

      const timestamp2 = new Date("2024-01-15T06:00:00.000Z");
      expect(formatTimestamp(timestamp2)).toBe("6h ago");

      const timestamp3 = new Date("2024-01-15T00:00:00.000Z");
      expect(formatTimestamp(timestamp3)).toBe("12h ago");
    });

    it("should return 'Yesterday' for timestamps from previous day", () => {
      const timestamp = new Date("2024-01-14T12:00:00.000Z");
      expect(formatTimestamp(timestamp)).toBe("Yesterday");
    });

    it("should return days ago for timestamps less than 7 days ago", () => {
      const timestamp1 = new Date("2024-01-13T12:00:00.000Z");
      expect(formatTimestamp(timestamp1)).toBe("2d ago");

      const timestamp2 = new Date("2024-01-10T12:00:00.000Z");
      expect(formatTimestamp(timestamp2)).toBe("5d ago");

      const timestamp3 = new Date("2024-01-09T12:00:00.000Z");
      expect(formatTimestamp(timestamp3)).toBe("6d ago");
    });

    it("should return formatted date for timestamps 7 or more days ago", () => {
      const timestamp = new Date("2024-01-08T12:00:00.000Z");
      const result = formatTimestamp(timestamp);

      // Result should be a localized date string
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should handle timestamp as string", () => {
      const timestamp = "2024-01-15T11:55:00.000Z";
      expect(formatTimestamp(timestamp)).toBe("5m ago");
    });

    it("should handle timestamp as number (milliseconds)", () => {
      const timestamp = new Date("2024-01-15T11:55:00.000Z").getTime();
      expect(formatTimestamp(timestamp)).toBe("5m ago");
    });

    it("should handle timestamp as Date object", () => {
      const timestamp = new Date("2024-01-15T11:55:00.000Z");
      expect(formatTimestamp(timestamp)).toBe("5m ago");
    });

    it("should handle very old timestamps", () => {
      const timestamp = new Date("2020-01-01T00:00:00.000Z");
      const result = formatTimestamp(timestamp);

      // Should return a formatted date
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should handle edge case at exactly 1 minute", () => {
      const timestamp = new Date("2024-01-15T11:59:00.000Z");
      expect(formatTimestamp(timestamp)).toBe("1m ago");
    });

    it("should handle edge case at exactly 1 hour", () => {
      const timestamp = new Date("2024-01-15T11:00:00.000Z");
      expect(formatTimestamp(timestamp)).toBe("1h ago");
    });

    it("should handle edge case at exactly 24 hours", () => {
      const timestamp = new Date("2024-01-14T12:00:00.000Z");
      expect(formatTimestamp(timestamp)).toBe("Yesterday");
    });

    it("should handle edge case at exactly 7 days", () => {
      const timestamp = new Date("2024-01-08T12:00:00.000Z");
      const result = formatTimestamp(timestamp);

      // Should be formatted date, not "7d ago"
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should handle timestamps at exact boundaries", () => {
      // At exactly 60 seconds
      const oneMinute = new Date(mockDate.getTime() - 60 * 1000);
      expect(formatTimestamp(oneMinute)).toBe("1m ago");

      // At exactly 60 minutes
      const oneHour = new Date(mockDate.getTime() - 60 * 60 * 1000);
      expect(formatTimestamp(oneHour)).toBe("1h ago");

      // At exactly 24 hours
      const oneDay = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000);
      expect(formatTimestamp(oneDay)).toBe("Yesterday");
    });

    it("should handle future timestamps gracefully", () => {
      const futureTimestamp = new Date("2024-01-16T12:00:00.000Z");
      const result = formatTimestamp(futureTimestamp);

      // Future dates should return "Just now" or handle gracefully
      expect(result).toBeTruthy();
    });
  });
});
