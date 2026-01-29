import { render, screen, fireEvent } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import BottomNavItem from "../BottomNavItem";
import React from "react";

// Mock haptic feedback
vi.mock("@/utils/platform/haptics", () => ({
  hapticFeedback: vi.fn(),
}));

describe("BottomNavItem", () => {
  const mockProps = {
    to: "/test",
    icon: () => <div data-testid="test-icon" />,
    label: "Test Item",
    isActive: false,
  };

  it("renders correctly", () => {
    render(<BottomNavItem {...mockProps} />);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies active styles when isActive is true", () => {
    const { container } = render(<BottomNavItem {...mockProps} isActive={true} />);
    const link = container.querySelector("a");
    expect(link).toHaveClass("text-brand-600");
  });

  it("renders a badge when badgeCount > 0", () => {
    render(<BottomNavItem {...mockProps} badgeCount={5} />);
    expect(screen.getByTestId("bottom-nav-badge")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders '9+' when badgeCount > 9", () => {
    render(<BottomNavItem {...mockProps} badgeCount={12} />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("does not render a badge when badgeCount is 0", () => {
    render(<BottomNavItem {...mockProps} badgeCount={0} />);
    expect(screen.queryByTestId("bottom-nav-badge")).not.toBeInTheDocument();
  });

  it("calls onBadgeClick and stops propagation when badge is clicked", () => {
    const onBadgeClick = vi.fn();
    render(<BottomNavItem {...mockProps} badgeCount={5} onBadgeClick={onBadgeClick} />);

    const badge = screen.getByTestId("bottom-nav-badge");
    fireEvent.click(badge);

    expect(onBadgeClick).toHaveBeenCalled();
  });
});
