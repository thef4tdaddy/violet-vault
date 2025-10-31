/**
 * Factory Utils Tests
 * Tests for factory utility functions
 */

import { describe, it, expect } from "vitest";
import {
  generateId,
  generateTimestamp,
  generateTimestampFor,
  generateAmount,
  generateRecentDate,
  generateFutureDate,
  generateColor,
  generateText,
  pickRandom,
  mergeDefaults,
} from "../factoryUtils";

describe("Factory Utils", () => {
  describe("generateId", () => {
    it("should generate a unique ID", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should generate valid UUID format", () => {
      const id = generateId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(id).toMatch(uuidRegex);
    });
  });

  describe("generateTimestamp", () => {
    it("should generate current timestamp", () => {
      const timestamp = generateTimestamp();
      const now = Date.now();

      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThanOrEqual(now + 100); // Allow small delta
    });
  });

  describe("generateTimestampFor", () => {
    it("should generate timestamp for specific date", () => {
      const date = new Date("2024-01-01");
      const timestamp = generateTimestampFor(date);

      expect(timestamp).toBe(date.getTime());
    });
  });

  describe("generateAmount", () => {
    it("should generate amount within default range", () => {
      const amount = generateAmount();

      expect(amount).toBeGreaterThanOrEqual(10);
      expect(amount).toBeLessThanOrEqual(1000);
    });

    it("should generate amount within custom range", () => {
      const amount = generateAmount(100, 200);

      expect(amount).toBeGreaterThanOrEqual(100);
      expect(amount).toBeLessThanOrEqual(200);
    });

    it("should generate integer amounts", () => {
      const amount = generateAmount();

      expect(Number.isInteger(amount)).toBe(true);
    });
  });

  describe("generateRecentDate", () => {
    it("should generate date in the past", () => {
      const date = generateRecentDate();
      const now = new Date();

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it("should generate date within specified days ago", () => {
      const daysAgo = 30;
      const date = generateRecentDate(daysAgo);
      const now = new Date();
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - daysAgo);

      expect(date.getTime()).toBeGreaterThanOrEqual(minDate.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(now.getTime());
    });
  });

  describe("generateFutureDate", () => {
    it("should generate date in the future", () => {
      const date = generateFutureDate();
      const now = new Date();

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it("should generate date within specified days ahead", () => {
      const daysAhead = 30;
      const date = generateFutureDate(daysAhead);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + daysAhead);

      expect(date.getTime()).toBeGreaterThanOrEqual(now.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(maxDate.getTime());
    });
  });

  describe("generateColor", () => {
    it("should generate valid hex color", () => {
      const color = generateColor();
      const hexRegex = /^#[0-9A-F]{6}$/i;

      expect(color).toMatch(hexRegex);
    });

    it("should generate colors from predefined palette", () => {
      const validColors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E2",
        "#F8B739",
        "#52C93F",
      ];
      const color = generateColor();

      expect(validColors).toContain(color);
    });
  });

  describe("generateText", () => {
    it("should generate text of default length", () => {
      const text = generateText();

      expect(text).toHaveLength(10);
    });

    it("should generate text of custom length", () => {
      const length = 25;
      const text = generateText(length);

      expect(text).toHaveLength(length);
    });

    it("should generate alphanumeric text", () => {
      const text = generateText(100);
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;

      expect(text).toMatch(alphanumericRegex);
    });
  });

  describe("pickRandom", () => {
    it("should pick item from array", () => {
      const array = ["a", "b", "c", "d", "e"];
      const item = pickRandom(array);

      expect(array).toContain(item);
    });

    it("should work with different types", () => {
      const numbers = [1, 2, 3, 4, 5];
      const number = pickRandom(numbers);

      expect(numbers).toContain(number);
    });

    it("should handle single-item array", () => {
      const array = ["only-item"];
      const item = pickRandom(array);

      expect(item).toBe("only-item");
    });
  });

  describe("mergeDefaults", () => {
    it("should merge defaults with overrides", () => {
      const defaults = { a: 1, b: 2, c: 3 };
      const overrides = { b: 20, c: 30 };
      const result = mergeDefaults(defaults, overrides);

      expect(result).toEqual({ a: 1, b: 20, c: 30 });
    });

    it("should return defaults when no overrides", () => {
      const defaults = { a: 1, b: 2 };
      const result = mergeDefaults(defaults);

      expect(result).toEqual(defaults);
    });

    it("should handle undefined overrides", () => {
      const defaults = { a: 1, b: 2 };
      const result = mergeDefaults(defaults, undefined);

      expect(result).toEqual(defaults);
    });

    it("should preserve original defaults object", () => {
      const defaults = { a: 1, b: 2 };
      const overrides = { b: 20 };
      mergeDefaults(defaults, overrides);

      expect(defaults).toEqual({ a: 1, b: 2 });
    });
  });
});
