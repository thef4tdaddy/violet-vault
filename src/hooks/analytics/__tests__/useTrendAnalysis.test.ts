import { renderHook } from "@testing-library/react";
import { useTrendAnalysis } from "../useTrendAnalysis";

describe("useTrendAnalysis", () => {
  const mockAnalyticsData = {
    categoryBreakdown: {
      Groceries: { expenses: 1200 },
      Gas: { expenses: 400 },
      Utilities: { expenses: 300 },
      Entertainment: { expenses: 200 },
      Dining: { expenses: 600 },
      Shopping: { expenses: 500 },
    },
  };

  it("should return empty arrays when no analytics data provided", () => {
    const { result } = renderHook(() => useTrendAnalysis(null, "all"));

    expect(result.current.spendingTrends).toEqual([]);
    expect(result.current.categoryTrends).toEqual([]);
  });

  it("should generate 12 months of spending trends", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    expect(result.current.spendingTrends).toHaveLength(12);

    const trend = result.current.spendingTrends[0];
    expect(trend).toHaveProperty("month");
    expect(trend).toHaveProperty("spending");
    expect(trend).toHaveProperty("income");
    expect(trend).toHaveProperty("net");
    expect(trend).toHaveProperty("forecast");
    expect(typeof trend.spending).toBe("number");
    expect(typeof trend.income).toBe("number");
  });

  it("should generate spending velocity data", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    expect(result.current.spendingVelocity).toHaveLength(11); // 12 trends - 1 for velocity calculation

    const velocity = result.current.spendingVelocity[0];
    expect(velocity).toHaveProperty("month");
    expect(velocity).toHaveProperty("change");
    expect(velocity).toHaveProperty("percentChange");
    expect(velocity).toHaveProperty("direction");
    expect(["increase", "decrease"]).toContain(velocity.direction);
  });

  it("should generate top 5 category trends", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    expect(result.current.categoryTrends).toHaveLength(5);

    // Should be sorted by current expenses (descending)
    const categories = result.current.categoryTrends;
    expect(categories[0].name).toBe("Groceries"); // Highest at 1200
    expect(categories[1].name).toBe("Dining"); // Second at 600

    // Each category should have trend data
    expect(categories[0].trend).toHaveLength(6);
    expect(categories[0].trend[0]).toHaveProperty("month");
    expect(categories[0].trend[0]).toHaveProperty("amount");
  });

  it("should generate seasonal patterns for 4 seasons", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    expect(result.current.seasonalPatterns).toHaveLength(4);

    const seasonNames = result.current.seasonalPatterns.map((s: { season: string }) => s.season);
    expect(seasonNames).toContain("Winter");
    expect(seasonNames).toContain("Spring");
    expect(seasonNames).toContain("Summer");
    expect(seasonNames).toContain("Fall");

    const season = result.current.seasonalPatterns[0];
    expect(season).toHaveProperty("avgSpending");
    expect(season).toHaveProperty("season");
    expect(season).toHaveProperty("categories");
  });

  it("should generate forecast insights", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    const insights = result.current.forecastInsights;
    expect(insights).toHaveProperty("projectedMonthlySpending");
    expect(insights).toHaveProperty("projectedSavings");
    expect(insights).toHaveProperty("confidenceLevel");
    expect(insights).toHaveProperty("trendDirection");

    if (typeof insights.projectedMonthlySpending === "number") {
      expect(typeof insights.projectedMonthlySpending).toBe("number");
    }
    if (typeof insights.confidenceLevel === "number") {
      expect(insights.confidenceLevel).toBeGreaterThanOrEqual(60);
      expect(insights.confidenceLevel).toBeLessThanOrEqual(100);
    }
    if (typeof insights.trendDirection === "string") {
      expect(["up", "down"]).toContain(insights.trendDirection);
    }
  });

  it("should generate derived insights", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    const insights = result.current.insights;
    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThan(0);
    
    if (insights.length > 0) {
      expect(insights[0]).toHaveProperty("type");
      expect(insights[0]).toHaveProperty("title");
      expect(insights[0]).toHaveProperty("description");
    }
  });

  it("should mark last 3 months as forecast", () => {
    const { result } = renderHook(() => useTrendAnalysis(mockAnalyticsData, "all"));

    const trends = result.current.spendingTrends;
    const forecastCount = trends.filter((t) => t.forecast).length;
    expect(forecastCount).toBe(3);

    // Last 3 should be forecast
    expect(trends[9].forecast).toBe(true);
    expect(trends[10].forecast).toBe(true);
    expect(trends[11].forecast).toBe(true);

    // Earlier months should not be forecast
    expect(trends[8].forecast).toBe(false);
  });
});
