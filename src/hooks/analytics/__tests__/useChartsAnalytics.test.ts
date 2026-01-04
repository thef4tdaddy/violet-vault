import { renderHook, act } from "@testing-library/react";
import { useChartsAnalytics } from "../useChartsAnalytics";

describe("useChartsAnalytics", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useChartsAnalytics());

    expect(result.current.activeTab).toBe("overview");
    expect(result.current.chartType).toBe("line");
    expect(result.current.dateRange).toBe("3months");
  });

  it("should initialize with custom values", () => {
    const { result } = renderHook(() => useChartsAnalytics("3months", "trends"));

    expect(result.current.activeTab).toBe("trends");
    expect(result.current.dateRange).toBe("3months");
  });

  it("should handle date range changes", () => {
    const { result } = renderHook(() => useChartsAnalytics());

    act(() => {
      result.current.handleDateRangeChange({ target: { value: "6months" } });
    });

    expect(result.current.dateRange).toBe("6months");
  });

  it("should handle chart type changes", () => {
    const { result } = renderHook(() => useChartsAnalytics());

    act(() => {
      result.current.handleChartTypeChange("bar");
    });

    expect(result.current.chartType).toBe("bar");
  });

  it("should handle tab changes", () => {
    const { result } = renderHook(() => useChartsAnalytics());

    act(() => {
      result.current.handleTabChange("categories");
    });

    expect(result.current.activeTab).toBe("categories");
  });
});
