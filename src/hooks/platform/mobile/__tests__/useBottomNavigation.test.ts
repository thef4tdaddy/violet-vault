import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBottomNavigation } from "../useBottomNavigation";
import { useUnifiedReceipts } from "../../../hooks/platform/receipts/useUnifiedReceipts";

// Mock hooks
vi.mock("../../../hooks/platform/receipts/useUnifiedReceipts", () => ({
  useUnifiedReceipts: vi.fn(() => ({
    pendingReceipts: [],
    allReceipts: [],
    isLoading: false,
    error: null,
  })),
}));

// Mock react-router-dom location
let mockPathname = "/app/dashboard";
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ pathname: mockPathname }),
  };
});

// Mock utils
vi.mock("../../../utils", () => ({
  getIcon: vi.fn((name) => `Icon-${name}`),
}));

describe("useBottomNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/app/dashboard";
    // Reset window width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  it("should initialize with navigation items", () => {
    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.navigationItems).toBeDefined();
    expect(Array.isArray(result.current.navigationItems)).toBe(true);
    expect(result.current.navigationItems.length).toBeGreaterThan(0);
  });

  it("should have correct navigation item structure", () => {
    const { result } = renderHook(() => useBottomNavigation());

    const item = result.current.navigationItems[0];
    expect(item).toHaveProperty("key");
    expect(item).toHaveProperty("path");
    expect(item).toHaveProperty("icon");
    expect(item).toHaveProperty("label");
    expect(item).toHaveProperty("priority");
  });

  it("should identify active item based on location", () => {
    mockPathname = "/app/envelopes";

    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.activeItem).toBe("envelopes");
  });

  it("should default to dashboard when path not found", () => {
    mockPathname = "/unknown";

    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.activeItem).toBe("dashboard");
  });

  it("should show navigation on mobile in app routes", () => {
    mockPathname = "/app/dashboard";

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.isVisible).toBe(true);
  });

  it("should hide navigation on desktop", () => {
    mockPathname = "/app/dashboard";

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.isVisible).toBe(false);
  });

  it("should hide navigation outside app routes", () => {
    mockPathname = "/login";

    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.isVisible).toBe(false);
  });

  it("should filter items by priority", () => {
    const { result } = renderHook(() => useBottomNavigation());

    const visibleItems = result.current.getVisibleItems(5);

    expect(visibleItems.length).toBeLessThanOrEqual(5);
    expect(visibleItems.every((item) => item.priority)).toBe(true);
  });

  it("should prioritize priority 1 items", () => {
    const { result } = renderHook(() => useBottomNavigation());

    const visibleItems = result.current.getVisibleItems(3);
    const priority1Count = visibleItems.filter((item) => item.priority === 1).length;

    expect(priority1Count).toBeGreaterThan(0);
  });

  it("should check if item is active", () => {
    mockPathname = "/app/dashboard";

    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.isItemActive("dashboard")).toBe(true);
    expect(result.current.isItemActive("envelopes")).toBe(false);
  });

  it("should get item by key", () => {
    const { result } = renderHook(() => useBottomNavigation());

    const item = result.current.getItemByKey("dashboard");

    expect(item).toBeDefined();
    expect(item?.key).toBe("dashboard");
    expect(item?.path).toBe("/app/dashboard");
  });

  it("should return undefined for unknown key", () => {
    const { result } = renderHook(() => useBottomNavigation());

    const item = result.current.getItemByKey("nonexistent");

    expect(item).toBeUndefined();
  });

  it("should show scroll hint for many items", () => {
    const { result } = renderHook(() => useBottomNavigation());

    expect(result.current.shouldShowScrollHint).toBeDefined();
    expect(typeof result.current.shouldShowScrollHint).toBe("boolean");
  });

  it("should respond to window resize", () => {
    const { result, rerender } = renderHook(() => useBottomNavigation());

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    rerender();

    expect(result.current.isVisible).toBe(true);

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    rerender();

    expect(result.current.isVisible).toBe(false);
  });

  it("should handle all navigation item paths", () => {
    const paths = [
      "/app/dashboard",
      "/app/envelopes",
      "/app/savings",
      "/app/bills",
      "/app/transactions",
    ];

    paths.forEach((path) => {
      mockPathname = path;
      const { result } = renderHook(() => useBottomNavigation());
      expect(result.current.activeItem).toBeTruthy();
    });
  });

  it("should maintain stable navigation items reference", () => {
    const { result, rerender } = renderHook(() => useBottomNavigation());

    const firstItems = result.current.navigationItems;
    rerender();
    const secondItems = result.current.navigationItems;

    expect(firstItems).toBe(secondItems);
  });

  it("should include badgeCount for transactions if pending receipts exist", () => {
    vi.mocked(useUnifiedReceipts).mockReturnValue({
      pendingReceipts: [{}, {}] as any, // 2 pending receipts
      allReceipts: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useBottomNavigation());
    const transactionsItem = result.current.navigationItems.find(
      (item) => item.key === "transactions"
    );

    expect(transactionsItem).toHaveProperty("badgeCount", 2);
  });

  it("should update navigation items when pending receipts count changes", () => {
    // Start with 0
    vi.mocked(useUnifiedReceipts).mockReturnValue({
      pendingReceipts: [],
      allReceipts: [],
      isLoading: false,
      error: null,
    });

    const { result, rerender } = renderHook(() => useBottomNavigation());
    let transactionsItem = result.current.navigationItems.find(
      (item) => item.key === "transactions"
    );
    expect(transactionsItem?.badgeCount).toBe(0);

    // Update to 5
    vi.mocked(useUnifiedReceipts).mockReturnValue({
      pendingReceipts: new Array(5).fill({}),
      allReceipts: [],
      isLoading: false,
      error: null,
    });

    rerender();

    transactionsItem = result.current.navigationItems.find((item) => item.key === "transactions");
    expect(transactionsItem?.badgeCount).toBe(5);
  });
});
