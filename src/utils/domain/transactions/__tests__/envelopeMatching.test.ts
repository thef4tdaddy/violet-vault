/**
 * Tests for Envelope Matching Utility
 * Simplified for debugging
 */

import { describe, it, expect } from "vitest";
import { suggestEnvelope } from "../envelopeMatching";

describe("envelopeMatching", () => {
  it("matches by name directly", () => {
    const envs = [
      { id: "1", name: "Grocery", category: "Food" },
      { id: "2", name: "Rent", category: "Housing" },
    ] as any;

    const result = suggestEnvelope("Grocery store", envs);
    expect(result).toBeDefined();
    expect(result?.id).toBe("1");
  });

  it("matches by keyword mapping", () => {
    const envs = [{ id: "1", name: "Grocery", category: "Food" }] as any;

    // "kroger" matches "grocery" mapping
    // "Grocery" name includes "grocery"
    const result = suggestEnvelope("Kroger purchase", envs);
    expect(result).toBeDefined();
    expect(result?.id).toBe("1");
  });

  it("returns null on no match", () => {
    const envs = [] as any;
    const result = suggestEnvelope("Anything", envs);
    expect(result).toBeNull();
  });
});
