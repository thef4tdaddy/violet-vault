import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoadingSpinner from "../LoadingSpinner";

// Mock the icon utility
vi.mock("@/utils/icons", () => ({
  renderIcon: vi.fn((name: string, props: { className?: string }) => (
    <svg data-testid={`icon-${name}`} className={props.className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )),
}));

describe("LoadingSpinner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render loading spinner", () => {
      render(<LoadingSpinner />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render with default message", () => {
      render(<LoadingSpinner />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<LoadingSpinner message="Processing..." />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("should render please wait text", () => {
      render(<LoadingSpinner />);
      expect(screen.getByText("Please wait...")).toBeInTheDocument();
    });
  });

  describe("Icon", () => {
    it("should render refresh icon", () => {
      render(<LoadingSpinner />);
      expect(screen.getByTestId("icon-RefreshCw")).toBeInTheDocument();
    });

    it("should have spinning animation class", () => {
      render(<LoadingSpinner />);
      const icon = screen.getByTestId("icon-RefreshCw");
      expect(icon).toHaveClass("animate-spin");
    });
  });

  describe("Styling", () => {
    it("should be centered", () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
    });
  });
});
