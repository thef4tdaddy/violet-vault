import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GlobalPullToRefresh, { GlobalPullToRefreshProvider } from "../GlobalPullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, style, className, ...props }: any) => (
      <div className={className} style={style} {...props} data-testid="motion-div">
        {children}
      </div>
    ),
  },
  useMotionValue: (initial: any) => ({
    get: () => initial,
    set: vi.fn(),
  }),
  useSpring: (source: any) => source,
  useTransform: (value: any) => value,
}));

// Mock usePullToRefresh hook
const mockUsePullToRefresh = vi.fn();
vi.mock("@/hooks/platform/mobile/usePullToRefresh", () => ({
  default: (...args: any[]) => mockUsePullToRefresh(...args),
}));

// Mock other dependencies
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

vi.mock("@/utils", () => ({
  getIcon: (name: string) => () => <span data-testid={`icon-${name}`} />,
}));

describe("GlobalPullToRefresh", () => {
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as any).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    // Default hook implementation
    mockUsePullToRefresh.mockReturnValue({
      containerRef: { current: document.createElement("div") },
      dragHandlers: {},
      springY: 0,
      isPulling: false,
      isRefreshing: false,
      pullProgress: 0,
      pullRotation: 0,
      isReady: false,
    });
  });

  it("renders children correctly", () => {
    render(
      <GlobalPullToRefreshProvider>
        <div data-testid="child-content">Child Content</div>
      </GlobalPullToRefreshProvider>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("does not render modal when not pulling or refreshing", () => {
    render(
      <GlobalPullToRefreshProvider>
        <div>Content</div>
      </GlobalPullToRefreshProvider>
    );

    expect(screen.queryByText(/pull to refresh/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/release to refresh/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/refreshing/i)).not.toBeInTheDocument();
  });

  it("renders 'Pull to refresh' when pulling but not ready", () => {
    mockUsePullToRefresh.mockReturnValue({
      containerRef: { current: document.createElement("div") },
      dragHandlers: {},
      springY: 50,
      isPulling: true,
      isRefreshing: false,
      pullProgress: 0.5,
      pullRotation: 90,
      isReady: false,
    });

    render(
      <GlobalPullToRefreshProvider>
        <div>Content</div>
      </GlobalPullToRefreshProvider>
    );

    expect(screen.getByText("Pull to refresh")).toBeInTheDocument();
    expect(screen.getByTestId("icon-ArrowDown")).toBeInTheDocument();
  });

  it("renders 'Release to refresh' when ready", () => {
    mockUsePullToRefresh.mockReturnValue({
      containerRef: { current: document.createElement("div") },
      dragHandlers: {},
      springY: 100,
      isPulling: true,
      isRefreshing: false,
      pullProgress: 1,
      pullRotation: 180,
      isReady: true,
    });

    render(
      <GlobalPullToRefreshProvider>
        <div>Content</div>
      </GlobalPullToRefreshProvider>
    );

    expect(screen.getByText("Release to refresh")).toBeInTheDocument();
    expect(screen.getByTestId("icon-ArrowDown")).toBeInTheDocument();
  });

  it("renders 'Refreshing...' when refreshing", () => {
    mockUsePullToRefresh.mockReturnValue({
      containerRef: { current: document.createElement("div") },
      dragHandlers: {},
      springY: 100,
      isPulling: false,
      isRefreshing: true,
      pullProgress: 1,
      pullRotation: 180,
      isReady: true,
    });

    render(
      <GlobalPullToRefreshProvider>
        <div>Content</div>
      </GlobalPullToRefreshProvider>
    );

    expect(screen.getByText("Refreshing...")).toBeInTheDocument();
    expect(screen.getByTestId("icon-RotateCw")).toBeInTheDocument();
  });

  it("passes refresh function to usePullToRefresh that invalidates queries", async () => {
    render(
      <GlobalPullToRefreshProvider>
        <div>Content</div>
      </GlobalPullToRefreshProvider>
    );

    // Get the onRefresh callback passed to usePullToRefresh
    const onRefresh = mockUsePullToRefresh.mock.calls[0][0];

    // Execute it
    await onRefresh();

    expect(mockInvalidateQueries).toHaveBeenCalled();
  });
});
