import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { BadgeButton } from "../BadgeButton";
import * as touchFeedback from "@/utils/ui/feedback/touchFeedback";

// Mock haptic feedback
vi.mock("@/utils/ui/feedback/touchFeedback", () => ({
  hapticFeedback: vi.fn(),
}));

describe("BadgeButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with numeric count", () => {
    render(<BadgeButton count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders with string count", () => {
    render(<BadgeButton count="!" />);
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("renders 99+ for counts over 99", () => {
    render(<BadgeButton count={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("returns null when count is 0 or negative", () => {
    const { container: c0 } = render(<BadgeButton count={0} />);
    expect(c0.firstChild).toBeNull();

    const { container: cn1 } = render(<BadgeButton count={-1} />);
    expect(cn1.firstChild).toBeNull();
  });

  it("returns null when count is empty string", () => {
    const { container } = render(<BadgeButton count="" />);
    expect(container.firstChild).toBeNull();
  });

  it("triggers haptic feedback and onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<BadgeButton count={1} onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(touchFeedback.hapticFeedback).toHaveBeenCalledWith(15, "medium");
    expect(handleClick).toHaveBeenCalled();
  });

  it("does not trigger haptics if disabled via prop", () => {
    render(<BadgeButton count={1} enableHaptics={false} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(touchFeedback.hapticFeedback).not.toHaveBeenCalled();
  });

  it("applies custom positionClass and className", () => {
    render(<BadgeButton count={1} positionClass="top-0 left-0" className="custom-test" />);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("top-0");
    expect(button).toHaveClass("left-0");
    expect(button).toHaveClass("custom-test");
  });
});
