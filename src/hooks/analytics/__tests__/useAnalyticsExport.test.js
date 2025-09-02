import { renderHook, act } from "@testing-library/react";
import { useAnalyticsExport } from "../useAnalyticsExport";

// Mock URL.createObjectURL and related methods
global.URL = {
  createObjectURL: jest.fn(() => "mock-url"),
  revokeObjectURL: jest.fn(),
};

// Mock document.createElement and click
const mockClick = jest.fn();
const mockLink = {
  href: "",
  download: "",
  click: mockClick,
  style: { visibility: "" },
};

global.document = {
  createElement: jest.fn(() => mockLink),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
};

describe("useAnalyticsExport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should export analytics data correctly", () => {
    const { result } = renderHook(() => useAnalyticsExport());

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

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");
  });

  it("should handle missing user data gracefully", () => {
    const { result } = renderHook(() => useAnalyticsExport());

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

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it("should handle undefined data gracefully", () => {
    const { result } = renderHook(() => useAnalyticsExport());

    act(() => {
      result.current.exportAnalyticsData({}, {});
    });

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });
});
