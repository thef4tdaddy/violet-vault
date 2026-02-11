/**
 * Envelope Schema Tests
 * Tests for envelope validation schemas including SupplementalAccountSchema and GoalEnvelopeSchema
 */

import { describe, it, expect } from "vitest";
import {
  EnvelopeSchema,
  StandardEnvelopeSchema,
  GoalEnvelopeSchema,
  LiabilityEnvelopeSchema,
  SupplementalAccountSchema,
  validateEnvelope,
  validateEnvelopeSafe,
} from "../envelope";

describe("Envelope Schema Tests", () => {
  describe("EnvelopeSchema (Discriminated Union)", () => {
    it("should validate a standard envelope", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Groceries",
        category: "Food",
        type: "standard",
        archived: false,
        lastModified: Date.now(),
      };
      const result = EnvelopeSchema.safeParse(validEnvelope);
      expect(result.success).toBe(true);
    });

    it("should validate a goal envelope", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Vacation",
        category: "Savings",
        type: "goal",
        targetAmount: 2000,
        archived: false,
        lastModified: Date.now(),
      };
      const result = EnvelopeSchema.safeParse(validEnvelope);
      expect(result.success).toBe(true);
    });

    it("should validate a liability envelope", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Rent",
        category: "Housing",
        type: "liability",
        minimumPayment: 1200,
        archived: false,
        lastModified: Date.now(),
      };
      const result = EnvelopeSchema.safeParse(validEnvelope);
      expect(result.success).toBe(true);
    });

    it("should reject envelope with missing type", () => {
      const invalidEnvelope = {
        id: "env-123",
        name: "Groceries",
        category: "Food",
        archived: false,
        lastModified: Date.now(),
      };
      const result = EnvelopeSchema.safeParse(invalidEnvelope);
      expect(result.success).toBe(false);
    });
  });

  describe("StandardEnvelopeSchema", () => {
    it("should validate standard fields", () => {
      const env = {
        id: "env-1",
        name: "Standard",
        category: "Cat",
        type: "standard",
        archived: false,
        lastModified: Date.now(),
      };
      expect(StandardEnvelopeSchema.safeParse(env).success).toBe(true);
    });
  });

  describe("GoalEnvelopeSchema", () => {
    it("should require targetAmount", () => {
      const env = {
        id: "env-1",
        name: "Goal",
        category: "Cat",
        type: "goal",
        archived: false,
        lastModified: Date.now(),
      };
      expect(GoalEnvelopeSchema.safeParse(env).success).toBe(false);
    });

    it("should validate goal with targetAmount", () => {
      const env = {
        id: "env-1",
        name: "Goal",
        category: "Cat",
        type: "goal",
        targetAmount: 1000,
        archived: false,
        lastModified: Date.now(),
      };
      expect(GoalEnvelopeSchema.safeParse(env).success).toBe(true);
    });
  });

  describe("LiabilityEnvelopeSchema", () => {
    it("should validate liability with type", () => {
      const env = {
        id: "env-1",
        name: "Bill",
        category: "Bills",
        type: "bill",
        amount: 100,
        archived: false,
        lastModified: Date.now(),
      };
      expect(LiabilityEnvelopeSchema.safeParse(env).success).toBe(true);
    });
  });

  describe("validateEnvelope", () => {
    it("should return validated envelope for valid data", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Groceries",
        category: "Food",
        type: "standard",
        archived: false,
        lastModified: Date.now(),
      };

      const result = validateEnvelope(validEnvelope);
      expect(result.id).toBe("env-123");
      expect(result.type).toBe("standard");
    });
  });

  describe("validateEnvelopeSafe", () => {
    it("should return success result for valid data", () => {
      const validEnvelope = {
        id: "env-123",
        name: "Groceries",
        category: "Food",
        type: "standard",
        archived: false,
        lastModified: Date.now(),
      };

      const result = validateEnvelopeSafe(validEnvelope);
      expect(result.success).toBe(true);
    });
  });
});
