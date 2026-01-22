import { describe, it, expect } from "vitest";
import { queryKeys } from "../queryKeys";

describe("queryKeys", () => {
  describe("analytics keys", () => {
    it("should have correct base key", () => {
      expect(queryKeys.analytics).toEqual(["analytics"]);
    });

    it("should generate prediction keys correctly", () => {
      const filters = { startDate: "2024-01-01" };
      expect(queryKeys.analyticsPredictions(filters)).toEqual([
        "analytics",
        "predictions",
        filters,
      ]);
    });

    it("should generate spending keys correctly", () => {
      expect(queryKeys.analyticsSpending("monthly")).toEqual(["analytics", "spending", "monthly"]);
    });

    it("should generate trends keys correctly", () => {
      expect(queryKeys.analyticsTrends("yearly")).toEqual(["analytics", "trends", "yearly"]);
    });

    it("should generate categories keys correctly", () => {
      expect(queryKeys.analyticsCategories("weekly")).toEqual([
        "analytics",
        "categories",
        "weekly",
      ]);
    });

    it("should generate report keys correctly", () => {
      const params = { type: "full" };
      expect(queryKeys.analyticsReport("export", params)).toEqual(["analytics", "export", params]);
    });
  });
});
