/**
 * GotPaidCTA Component Tests - Issue #157
 * Ensures "Got Paid?" CTA meets acceptance criteria
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GotPaidCTA from "../GotPaidCTA";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";

// Mock dependencies
vi.mock("@/stores/ui/paycheckFlowStore");
vi.mock("@/hooks/dashboard/usePaydayProgress");

describe("GotPaidCTA", () => {
  const mockOpenWizard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock
    vi.mocked(usePaycheckFlowStore).mockReturnValue(mockOpenWizard);
  });

  describe("Visibility Logic", () => {
    it("should render when within +3 days of payday", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 2,
        hasError: false,
        hoursUntilPayday: 48,
        progressPercentage: 80,
        safeToSpend: 500,
        formattedPayday: {
          date: "Jan 15",
          shortText: "In 2 days",
          pattern: "Biweekly",
          confidence: 85,
        },
        isLoading: false,
      });

      render(<GotPaidCTA />);

      expect(screen.getByTestId("got-paid-cta")).toBeInTheDocument();
      expect(screen.getByText(/GOT PAID\?/i)).toBeInTheDocument();
    });

    it("should render when within -3 days of payday (overdue)", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: -2,
        hasError: false,
        hoursUntilPayday: null,
        progressPercentage: 100,
        safeToSpend: 500,
        formattedPayday: {
          date: "Jan 10",
          shortText: "2 days ago",
          pattern: "Biweekly",
          confidence: 85,
        },
        isLoading: false,
      });

      render(<GotPaidCTA />);

      expect(screen.getByTestId("got-paid-cta")).toBeInTheDocument();
    });

    it("should render on payday (0 days)", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 0,
        hasError: false,
        hoursUntilPayday: 12,
        progressPercentage: 100,
        safeToSpend: 500,
        formattedPayday: {
          date: "Today",
          shortText: "Today",
          pattern: "Biweekly",
          confidence: 90,
        },
        isLoading: false,
      });

      render(<GotPaidCTA />);

      expect(screen.getByTestId("got-paid-cta")).toBeInTheDocument();
    });

    it("should NOT render when more than 3 days until payday", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 7,
        hasError: false,
        hoursUntilPayday: null,
        progressPercentage: 50,
        safeToSpend: 500,
        formattedPayday: {
          date: "Jan 20",
          shortText: "In 7 days",
          pattern: "Biweekly",
          confidence: 85,
        },
        isLoading: false,
      });

      const { container } = render(<GotPaidCTA />);

      expect(screen.queryByTestId("got-paid-cta")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it("should NOT render when payday data has error", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 2,
        hasError: true,
        hoursUntilPayday: null,
        progressPercentage: 0,
        safeToSpend: 0,
        formattedPayday: null,
        isLoading: false,
      });

      const { container } = render(<GotPaidCTA />);

      expect(screen.queryByTestId("got-paid-cta")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it("should NOT render when daysUntilPayday is null", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: null,
        hasError: false,
        hoursUntilPayday: null,
        progressPercentage: 0,
        safeToSpend: 0,
        formattedPayday: null,
        isLoading: false,
      });

      const { container } = render(<GotPaidCTA />);

      expect(screen.queryByTestId("got-paid-cta")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });
  });

  describe("UI Interactions", () => {
    beforeEach(() => {
      // Setup valid state for UI tests
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 1,
        hasError: false,
        hoursUntilPayday: 24,
        progressPercentage: 90,
        safeToSpend: 500,
        formattedPayday: {
          date: "Tomorrow",
          shortText: "Tomorrow",
          pattern: "Biweekly",
          confidence: 85,
        },
        isLoading: false,
      });
    });

    it("should call openWizard when clicked", async () => {
      const user = userEvent.setup();

      render(<GotPaidCTA />);

      const button = screen.getByTestId("got-paid-cta");
      await user.click(button);

      expect(mockOpenWizard).toHaveBeenCalledTimes(1);
    });

    it("should have correct aria-label", () => {
      render(<GotPaidCTA />);

      const button = screen.getByTestId("got-paid-cta");

      expect(button).toHaveAttribute(
        "aria-label",
        "Start paycheck allocation wizard"
      );
    });

    it("should render dollar emoji", () => {
      render(<GotPaidCTA />);

      expect(screen.getByRole("img", { name: /money/i })).toBeInTheDocument();
    });
  });

  describe("Styling & Design", () => {
    beforeEach(() => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 1,
        hasError: false,
        hoursUntilPayday: 24,
        progressPercentage: 90,
        safeToSpend: 500,
        formattedPayday: {
          date: "Tomorrow",
          shortText: "Tomorrow",
          pattern: "Biweekly",
          confidence: 85,
        },
        isLoading: false,
      });
    });

    it("should apply Hard Lines aesthetic classes", () => {
      render(<GotPaidCTA />);

      const button = screen.getByTestId("got-paid-cta");

      // Check for key Hard Lines design classes
      expect(button.className).toMatch(/border-2/);
      expect(button.className).toMatch(/border-fuchsia-500/);
      expect(button.className).toMatch(/rounded-lg/);
      expect(button.className).toMatch(/shadow-\[4px_4px_0px_0px_rgba\(0,0,0,1\)\]/);
    });

    it("should have active:scale-95 for tactile feedback", () => {
      render(<GotPaidCTA />);

      const button = screen.getByTestId("got-paid-cta");

      expect(button.className).toMatch(/active:scale-95/);
    });

    it("should apply custom className prop", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 1,
        hasError: false,
        hoursUntilPayday: 24,
        progressPercentage: 90,
        safeToSpend: 500,
        formattedPayday: {
          date: "Tomorrow",
          shortText: "Tomorrow",
          pattern: "Biweekly",
          confidence: 85,
        },
        isLoading: false,
      });

      render(<GotPaidCTA className="custom-class" />);

      const button = screen.getByTestId("got-paid-cta");

      expect(button.className).toMatch(/custom-class/);
    });
  });

  describe("Content", () => {
    beforeEach(() => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        daysUntilPayday: 0,
        hasError: false,
        hoursUntilPayday: 12,
        progressPercentage: 100,
        safeToSpend: 500,
        formattedPayday: {
          date: "Today",
          shortText: "Today",
          pattern: "Weekly",
          confidence: 90,
        },
        isLoading: false,
      });
    });

    it("should display 'GOT PAID?' text", () => {
      render(<GotPaidCTA />);

      expect(screen.getByText(/GOT PAID\?/)).toBeInTheDocument();
    });

    it("should display subtitle text", () => {
      render(<GotPaidCTA />);

      expect(
        screen.getByText(/Allocate your paycheck in 60 seconds/i)
      ).toBeInTheDocument();
    });
  });
});
