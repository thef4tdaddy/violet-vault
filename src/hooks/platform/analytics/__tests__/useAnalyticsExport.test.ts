import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { useAnalyticsExport } from "../useAnalyticsExport";

describe("useAnalyticsExport", () => {
  // Mock URL.createObjectURL and related methods
  const mockCreateObjectURL = vi.fn(() => "mock-url");
  const mockRevokeObjectURL = vi.fn();

  // Mock document.createElement and click
  const mockClick = vi.fn();
  const mockLink = {
    href: "",
    download: "",
    click: mockClick,
    style: { visibility: "" },
    setAttribute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  it("should export analytics data correctly", () => {
    const { result } = renderHook(() => useAnalyticsExport());

    // Mock DOM manipulation after hook is rendered
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    const mockData = {
      dateRange: "3months",
      metrics: { totalIncome: 5000, totalExpenses: 3000 },
      monthlyTrends: [{ month: "Jan", income: 2500 }],
      envelopeSpending: [{ name: "Food", amount: 500 }],
      categoryBreakdown: [{ name: "Dining", amount: 200 }],
    };

    const mockUser = { userName: "Test User" };

    act(() => {
      result.current.exportAnalyticsData(mockData, mockUser);
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("mock-url");

    vi.restoreAllMocks();
  });

  it("should handle missing user data gracefully", () => {
    const { result } = renderHook(() => useAnalyticsExport());

    // Mock DOM manipulation after hook is rendered
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    const mockData = {
      dateRange: "1month",
      metrics: {},
      monthlyTrends: [],
      envelopeSpending: [],
      categoryBreakdown: [],
    };

    act(() => {
      result.current.exportAnalyticsData(mockData, null);
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("should handle undefined data gracefully", () => {
    const { result } = renderHook(() => useAnalyticsExport());

    // Mock DOM manipulation after hook is rendered
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    act(() => {
      result.current.exportAnalyticsData({}, {});
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
