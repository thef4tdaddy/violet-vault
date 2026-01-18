import {
  formatCurrency,
  formatPercent,
  getTrendIconConfig,
  getGrowthRateColor,
  getCategoryChartColor,
  currencyTooltipFormatter,
  velocityTooltipFormatter,
  getTrendIcon,
  getTrendColor,
  getHealthColor,
  getHealthLabel,
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

  describe("getTrendIcon", () => {
    it("should return emoji for increasing trend", () => {
      expect(getTrendIcon("increasing")).toBe("📈");
    });

    it("should return emoji for decreasing trend", () => {
      expect(getTrendIcon("decreasing")).toBe("📉");
    });

    it("should return emoji for stable trend", () => {
      expect(getTrendIcon("stable")).toBe("➡️");
    });

    it("should return default for unknown trend", () => {
      expect(getTrendIcon("unknown")).toBe("➡️");
    });
  });

  describe("getTrendColor", () => {
    it("should return red for increasing trend", () => {
      expect(getTrendColor("increasing")).toBe("text-red-600");
    });

    it("should return green for decreasing trend", () => {
      expect(getTrendColor("decreasing")).toBe("text-green-600");
    });

    it("should return gray for stable trend", () => {
      expect(getTrendColor("stable")).toBe("text-gray-600");
    });

    it("should return default for unknown trend", () => {
      expect(getTrendColor("unknown")).toBe("text-gray-600");
    });
  });

  describe("getHealthColor", () => {
    it("should return green for excellent health (>= 80)", () => {
      expect(getHealthColor(80)).toBe("bg-green-500");
      expect(getHealthColor(100)).toBe("bg-green-500");
    });

    it("should return yellow for good health (>= 60)", () => {
      expect(getHealthColor(60)).toBe("bg-yellow-500");
      expect(getHealthColor(75)).toBe("bg-yellow-500");
    });

    it("should return orange for fair health (>= 40)", () => {
      expect(getHealthColor(40)).toBe("bg-orange-500");
      expect(getHealthColor(55)).toBe("bg-orange-500");
    });

    it("should return red for poor health (< 40)", () => {
      expect(getHealthColor(0)).toBe("bg-red-500");
      expect(getHealthColor(39)).toBe("bg-red-500");
    });
  });

  describe("getHealthLabel", () => {
    it("should return Excellent for score >= 80", () => {
      expect(getHealthLabel(80)).toBe("Excellent");
      expect(getHealthLabel(100)).toBe("Excellent");
    });

    it("should return Good for score >= 60", () => {
      expect(getHealthLabel(60)).toBe("Good");
      expect(getHealthLabel(75)).toBe("Good");
    });

    it("should return Fair for score >= 40", () => {
      expect(getHealthLabel(40)).toBe("Fair");
      expect(getHealthLabel(55)).toBe("Fair");
    });

    it("should return Needs Attention for score < 40", () => {
      expect(getHealthLabel(0)).toBe("Needs Attention");
      expect(getHealthLabel(39)).toBe("Needs Attention");
    });
  });
});
