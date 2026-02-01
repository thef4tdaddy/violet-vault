/**
 * Tests for Bill Coverage Calculation Utilities
 */

import {
  getCoverageIcon,
  getCoverageBorderColor,
  getCoverageBackgroundColor,
  getCoverageProgressColor,
  getCoverageTextColor,
  formatCentsAsDollars,
  formatCentsAsCurrency,
  calculateCoveragePercent,
  getCoverageStatus,
  formatDaysUntilDue,
  getUrgencyLevel,
  getUrgencyColor,
  type CoverageStatus,
} from "../billCoverageCalculations";

describe("billCoverageCalculations", () => {
  describe("getCoverageIcon", () => {
    it("returns check mark for covered status", () => {
      expect(getCoverageIcon("covered")).toBe("✅");
    });

    it("returns warning for partial status", () => {
      expect(getCoverageIcon("partial")).toBe("⚠️");
    });

    it("returns X for uncovered status", () => {
      expect(getCoverageIcon("uncovered")).toBe("❌");
    });

    it("returns question mark for unknown status", () => {
      expect(getCoverageIcon("unknown" as CoverageStatus)).toBe("❓");
    });
  });

  describe("getCoverageBorderColor", () => {
    it("returns green border for covered", () => {
      expect(getCoverageBorderColor("covered")).toBe("border-green-500");
    });

    it("returns yellow border for partial", () => {
      expect(getCoverageBorderColor("partial")).toBe("border-yellow-500");
    });

    it("returns red border for uncovered", () => {
      expect(getCoverageBorderColor("uncovered")).toBe("border-red-500");
    });
  });

  describe("getCoverageBackgroundColor", () => {
    it("returns correct background colors for each status", () => {
      expect(getCoverageBackgroundColor("covered")).toBe("bg-green-50");
      expect(getCoverageBackgroundColor("partial")).toBe("bg-yellow-50");
      expect(getCoverageBackgroundColor("uncovered")).toBe("bg-red-50");
    });
  });

  describe("getCoverageProgressColor", () => {
    it("returns correct progress bar colors", () => {
      expect(getCoverageProgressColor("covered")).toBe("bg-green-500");
      expect(getCoverageProgressColor("partial")).toBe("bg-yellow-500");
      expect(getCoverageProgressColor("uncovered")).toBe("bg-red-500");
    });
  });

  describe("getCoverageTextColor", () => {
    it("returns correct text colors", () => {
      expect(getCoverageTextColor("covered")).toBe("text-green-700");
      expect(getCoverageTextColor("partial")).toBe("text-yellow-700");
      expect(getCoverageTextColor("uncovered")).toBe("text-red-700");
    });
  });

  describe("formatCentsAsDollars", () => {
    it("formats cents as dollars with 2 decimals", () => {
      expect(formatCentsAsDollars(12345)).toBe("123.45");
    });

    it("handles zero", () => {
      expect(formatCentsAsDollars(0)).toBe("0.00");
    });

    it("handles negative amounts", () => {
      expect(formatCentsAsDollars(-5000)).toBe("-50.00");
    });

    it("rounds to 2 decimal places", () => {
      expect(formatCentsAsDollars(1234)).toBe("12.34");
    });
  });

  describe("formatCentsAsCurrency", () => {
    it("formats with dollar sign", () => {
      expect(formatCentsAsCurrency(12345)).toBe("$123.45");
    });

    it("formats zero with dollar sign", () => {
      expect(formatCentsAsCurrency(0)).toBe("$0.00");
    });
  });

  describe("calculateCoveragePercent", () => {
    it("calculates 100% when fully covered", () => {
      expect(calculateCoveragePercent(10000, 10000)).toBe(100.0);
    });

    it("calculates 50% when half covered", () => {
      expect(calculateCoveragePercent(5000, 10000)).toBe(50.0);
    });

    it("calculates 150% when over-covered", () => {
      expect(calculateCoveragePercent(15000, 10000)).toBe(150.0);
    });

    it("returns 0 when bill amount is zero", () => {
      expect(calculateCoveragePercent(5000, 0)).toBe(0);
    });

    it("returns 0 when bill amount is negative", () => {
      expect(calculateCoveragePercent(5000, -1000)).toBe(0);
    });

    it("rounds to 1 decimal place", () => {
      expect(calculateCoveragePercent(3333, 10000)).toBe(33.3);
    });
  });

  describe("getCoverageStatus", () => {
    it("returns covered for 100%+", () => {
      expect(getCoverageStatus(100)).toBe("covered");
      expect(getCoverageStatus(150)).toBe("covered");
    });

    it("returns partial for 50-99%", () => {
      expect(getCoverageStatus(50)).toBe("partial");
      expect(getCoverageStatus(75)).toBe("partial");
      expect(getCoverageStatus(99.9)).toBe("partial");
    });

    it("returns uncovered for <50%", () => {
      expect(getCoverageStatus(49.9)).toBe("uncovered");
      expect(getCoverageStatus(25)).toBe("uncovered");
      expect(getCoverageStatus(0)).toBe("uncovered");
    });
  });

  describe("formatDaysUntilDue", () => {
    it("formats overdue bills", () => {
      expect(formatDaysUntilDue(-1)).toBe("Overdue");
      expect(formatDaysUntilDue(-10)).toBe("Overdue");
    });

    it("formats due today", () => {
      expect(formatDaysUntilDue(0)).toBe("Due today");
    });

    it("formats due tomorrow", () => {
      expect(formatDaysUntilDue(1)).toBe("Due tomorrow");
    });

    it("formats future days", () => {
      expect(formatDaysUntilDue(5)).toBe("Due in 5 days");
      expect(formatDaysUntilDue(30)).toBe("Due in 30 days");
    });
  });

  describe("getUrgencyLevel", () => {
    it("returns overdue for negative days", () => {
      expect(getUrgencyLevel(-1)).toBe("overdue");
      expect(getUrgencyLevel(-10)).toBe("overdue");
    });

    it("returns urgent for 0-2 days", () => {
      expect(getUrgencyLevel(0)).toBe("urgent");
      expect(getUrgencyLevel(1)).toBe("urgent");
      expect(getUrgencyLevel(2)).toBe("urgent");
    });

    it("returns soon for 3-7 days", () => {
      expect(getUrgencyLevel(3)).toBe("soon");
      expect(getUrgencyLevel(5)).toBe("soon");
      expect(getUrgencyLevel(7)).toBe("soon");
    });

    it("returns normal for 8+ days", () => {
      expect(getUrgencyLevel(8)).toBe("normal");
      expect(getUrgencyLevel(30)).toBe("normal");
    });
  });

  describe("getUrgencyColor", () => {
    it("returns correct colors for each urgency level", () => {
      expect(getUrgencyColor(-1)).toBe("text-red-700"); // overdue
      expect(getUrgencyColor(1)).toBe("text-orange-700"); // urgent
      expect(getUrgencyColor(5)).toBe("text-yellow-700"); // soon
      expect(getUrgencyColor(10)).toBe("text-slate-700"); // normal
    });
  });
});
