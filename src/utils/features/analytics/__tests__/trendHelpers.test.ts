import {
  formatCurrency,
  formatPercent,
  getTrendIconConfig,
  getGrowthRateColor,
  getCategoryChartColor,
  currencyTooltipFormatter,
  velocityTooltipFormatter,
} from "../trendHelpers";

describe("trendHelpers", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers as currency", () => {
      expect(formatCurrency(1234)).toBe("$1,234");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("should format zero as currency", () => {
      expect(formatCurrency(0)).toBe("$0");
    });

    it("should format negative numbers as currency", () => {
      expect(formatCurrency(-1234)).toBe("$-1,234");
    });

    it("should handle large numbers with commas", () => {
      expect(formatCurrency(1234567)).toBe("$1,234,567");
    });
  });

  describe("formatPercent", () => {
    it("should format positive percentages with plus sign", () => {
      expect(formatPercent(5.5)).toBe("+5.5%");
      expect(formatPercent(10)).toBe("+10%");
    });

    it("should format negative percentages without extra sign", () => {
      expect(formatPercent(-3.2)).toBe("-3.2%");
      expect(formatPercent(-10)).toBe("-10%");
    });

    it("should format zero without plus sign", () => {
      expect(formatPercent(0)).toBe("0%");
    });
  });

  describe("getTrendIconConfig", () => {
    it("should return increasing config for increasing trend", () => {
      const config = getTrendIconConfig("increasing");
      expect(config.bgClass).toBe("bg-red-100");
      expect(config.iconColor).toBe("text-red-600");
      expect(config.iconType).toBe("trending-up");
    });

    it("should return decreasing config for decreasing trend", () => {
      const config = getTrendIconConfig("decreasing");
      expect(config.bgClass).toBe("bg-green-100");
      expect(config.iconColor).toBe("text-green-600");
      expect(config.iconType).toBe("trending-down");
    });

    it("should return default config for stable trend", () => {
      const config = getTrendIconConfig("stable");
      expect(config.bgClass).toBe("bg-gray-100");
      expect(config.iconColor).toBe("text-gray-600");
      expect(config.iconType).toBe("bar-chart");
    });

    it("should return default config for unknown trend", () => {
      const config = getTrendIconConfig("unknown");
      expect(config.bgClass).toBe("bg-gray-100");
      expect(config.iconColor).toBe("text-gray-600");
      expect(config.iconType).toBe("bar-chart");
    });
  });

  describe("getGrowthRateColor", () => {
    it("should return red for positive growth", () => {
      expect(getGrowthRateColor(5.5)).toBe("text-red-600");
      expect(getGrowthRateColor(0.1)).toBe("text-red-600");
    });

    it("should return green for negative growth", () => {
      expect(getGrowthRateColor(-3.2)).toBe("text-green-600");
      expect(getGrowthRateColor(-0.1)).toBe("text-green-600");
    });

    it("should return green for zero growth", () => {
      expect(getGrowthRateColor(0)).toBe("text-green-600");
    });
  });

  describe("getCategoryChartColor", () => {
    it("should generate different colors for different indices", () => {
      const color0 = getCategoryChartColor(0);
      const color1 = getCategoryChartColor(1);
      const color2 = getCategoryChartColor(2);

      expect(color0).toBe("hsl(0, 70%, 50%)");
      expect(color1).toBe("hsl(60, 70%, 50%)");
      expect(color2).toBe("hsl(120, 70%, 50%)");
    });

    it("should follow the pattern for larger indices", () => {
      expect(getCategoryChartColor(6)).toBe("hsl(360, 70%, 50%)");
    });
  });

  describe("currencyTooltipFormatter", () => {
    it("should format currency values for tooltips", () => {
      const [value, name] = currencyTooltipFormatter(1234, "Income");
      expect(value).toBe("$1,234");
      expect(name).toBe("Income");
    });
  });

  describe("velocityTooltipFormatter", () => {
    it("should format percentage change values", () => {
      const [value, name] = velocityTooltipFormatter(5.5, "percentChange");
      expect(value).toBe("+5.5%");
      expect(name).toBe("Rate of Change");
    });

    it("should format currency for non-percentage values", () => {
      const [value, name] = velocityTooltipFormatter(1234, "change");
      expect(value).toBe("$1,234");
      expect(name).toBe("Amount Change");
    });
  });
});
