/**
 * Tests for Allocation API Schemas - Issue #1847
 * Validates Zod schemas match Go backend types exactly
 */

import { describe, it, expect } from "vitest";
import {
  EnvelopeAllocationSchema,
  AllocationRequestSchema,
  AllocationResultSchema,
  AllocationErrorSchema,
  validateAllocationRequest,
  validateAllocationRequestSafe,
  validateAllocationResult,
  isAllocationError,
} from "../allocation";

describe("EnvelopeAllocationSchema", () => {
  it("should validate a valid envelope", () => {
    const envelope = {
      id: "rent",
      name: "Rent",
      monthlyTargetCents: 100000,
      currentBalanceCents: 50000,
      category: "bills" as const,
      priority: 1,
    };

    const result = EnvelopeAllocationSchema.safeParse(envelope);
    expect(result.success).toBe(true);
  });

  it("should validate envelope without optional fields", () => {
    const envelope = {
      id: "savings",
      monthlyTargetCents: 50000,
      currentBalanceCents: 25000,
    };

    const result = EnvelopeAllocationSchema.safeParse(envelope);
    expect(result.success).toBe(true);
  });

  it("should reject envelope with empty ID", () => {
    const envelope = {
      id: "",
      monthlyTargetCents: 100000,
      currentBalanceCents: 0,
    };

    const result = EnvelopeAllocationSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });

  it("should reject negative monthly target", () => {
    const envelope = {
      id: "rent",
      monthlyTargetCents: -100,
      currentBalanceCents: 0,
    };

    const result = EnvelopeAllocationSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });

  it("should reject negative current balance", () => {
    const envelope = {
      id: "rent",
      monthlyTargetCents: 100000,
      currentBalanceCents: -50,
    };

    const result = EnvelopeAllocationSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });

  it("should reject invalid category", () => {
    const envelope = {
      id: "rent",
      monthlyTargetCents: 100000,
      currentBalanceCents: 0,
      category: "invalid",
    };

    const result = EnvelopeAllocationSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });
});

describe("AllocationRequestSchema", () => {
  it("should validate a complete allocation request", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 250000,
      envelopes: [
        {
          id: "rent",
          monthlyTargetCents: 100000,
          currentBalanceCents: 0,
          category: "bills" as const,
        },
        {
          id: "savings",
          monthlyTargetCents: 50000,
          currentBalanceCents: 0,
          category: "savings" as const,
        },
      ],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should validate last_split strategy with previous allocation", () => {
    const request = {
      strategy: "last_split",
      paycheckAmountCents: 250000,
      envelopes: [{ id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }],
      previousAllocation: [{ envelopeId: "rent", amountCents: 100000 }],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should reject invalid strategy", () => {
    const request = {
      strategy: "invalid_strategy",
      paycheckAmountCents: 250000,
      envelopes: [{ id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject zero paycheck amount", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 0,
      envelopes: [{ id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject paycheck amount over $100,000", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 10_000_001,
      envelopes: [{ id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject empty envelopes array", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 250000,
      envelopes: [],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject more than 200 envelopes", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 250000,
      envelopes: Array(201).fill({ id: "env", monthlyTargetCents: 1000, currentBalanceCents: 0 }),
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe("AllocationResultSchema", () => {
  it("should validate a complete allocation result", () => {
    const result = {
      allocations: [
        { envelopeId: "rent", amountCents: 100000, reason: "Even split (40%)" },
        { envelopeId: "savings", amountCents: 50000, reason: "Even split (20%)" },
      ],
      totalAllocatedCents: 150000,
      remainingCents: 0,
      strategy: "even_split",
      executionTimeMs: 0.5,
    };

    const validation = AllocationResultSchema.safeParse(result);
    expect(validation.success).toBe(true);
  });

  it("should validate result without optional fields", () => {
    const result = {
      allocations: [{ envelopeId: "rent", amountCents: 100000 }],
      totalAllocatedCents: 100000,
      remainingCents: 0,
      strategy: "even_split",
    };

    const validation = AllocationResultSchema.safeParse(result);
    expect(validation.success).toBe(true);
  });

  it("should reject negative allocated amount", () => {
    const result = {
      allocations: [{ envelopeId: "rent", amountCents: -100 }],
      totalAllocatedCents: -100,
      remainingCents: 0,
      strategy: "even_split",
    };

    const validation = AllocationResultSchema.safeParse(result);
    expect(validation.success).toBe(false);
  });
});

describe("Validation Helpers", () => {
  it("validateAllocationRequest should parse valid request", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 250000,
      envelopes: [{ id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }],
    };

    expect(() => validateAllocationRequest(request)).not.toThrow();
  });

  it("validateAllocationRequest should throw on invalid request", () => {
    const request = {
      strategy: "invalid",
      paycheckAmountCents: 250000,
      envelopes: [],
    };

    expect(() => validateAllocationRequest(request)).toThrow();
  });

  it("validateAllocationRequestSafe should return success for valid request", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 250000,
      envelopes: [{ id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }],
    };

    const result = validateAllocationRequestSafe(request);
    expect(result.success).toBe(true);
  });

  it("validateAllocationRequestSafe should return error for invalid request", () => {
    const request = {
      strategy: "invalid",
      paycheckAmountCents: 0,
      envelopes: [],
    };

    const result = validateAllocationRequestSafe(request);
    expect(result.success).toBe(false);
  });

  it("isAllocationError should identify error responses", () => {
    const error = {
      error: "Validation error",
      message: "Invalid request",
      code: 400,
    };

    expect(isAllocationError(error)).toBe(true);
  });

  it("isAllocationError should reject non-error objects", () => {
    const notError = {
      allocations: [],
      totalAllocatedCents: 0,
      remainingCents: 0,
      strategy: "even_split",
    };

    expect(isAllocationError(notError)).toBe(false);
  });
});

describe("Edge Cases", () => {
  it("should handle single cent paycheck", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 1,
      envelopes: [{ id: "savings", monthlyTargetCents: 100, currentBalanceCents: 0 }],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should handle maximum paycheck amount", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 10_000_000,
      envelopes: [{ id: "savings", monthlyTargetCents: 1000000, currentBalanceCents: 0 }],
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should handle 200 envelopes (max)", () => {
    const request = {
      strategy: "even_split",
      paycheckAmountCents: 250000,
      envelopes: Array(200).fill({ id: "env", monthlyTargetCents: 1000, currentBalanceCents: 0 }),
    };

    const result = AllocationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });
});
