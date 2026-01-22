import { render, screen } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import PaydayBanner from "../PaydayBanner";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";
import React from "react";

// Mock the hook
vi.mock("@/hooks/dashboard/usePaydayProgress", () => ({
  usePaydayProgress: vi.fn(),
}));

// Mock icon utility
vi.mock("@/utils", () => ({
  getIcon: () => {
    return () => null;
  },
}));

// Mock StylizedButtonText component
vi.mock("@/components/ui", () => ({
  StylizedButtonText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe("PaydayBanner", () => {
  const mockProgressData = {
    daysUntilPayday: 7,
    hoursUntilPayday: 168,
    progressPercentage: 50,
    safeToSpend: 1200.5,
    formattedPayday: {
      displayText: "Payday predicted in 7 days",
      shortText: "7 days",
      confidence: 95,
      pattern: "biweekly",
      date: "1/22/2024",
    },
    isLoading: false,
    hasError: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePaydayProgress).mockReturnValue(mockProgressData);
  });

  describe("loading state", () => {
    it("should render loading skeleton when isLoading is true", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        isLoading: true,
      });

      const { container } = render(<PaydayBanner />);

      const loadingElement = container.querySelector(".animate-pulse");
      expect(loadingElement).toBeTruthy();
    });
  });

  describe("error state", () => {
    it("should render error message when hasError is true", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        hasError: true,
      });

      render(<PaydayBanner />);

      expect(screen.getByText(/ERROR LOADING PAYDAY DATA/i)).toBeTruthy();
    });

    it("should have red styling for error state", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        hasError: true,
      });

      const { container } = render(<PaydayBanner />);

      const errorDiv = container.querySelector(".from-red-50\\/95");
      expect(errorDiv).toBeTruthy();
    });
  });

  describe("no payday prediction", () => {
    it("should render message when no formattedPayday available", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        formattedPayday: null,
        daysUntilPayday: null,
      });

      render(<PaydayBanner />);

      expect(screen.getByText(/Add at least 2 paycheck transactions/i)).toBeTruthy();
    });

    it("should render message when daysUntilPayday is null", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: null,
      });

      render(<PaydayBanner />);

      expect(screen.getByText(/Add at least 2 paycheck transactions/i)).toBeTruthy();
    });
  });

  describe("normal display", () => {
    it("should render payday banner with all data", () => {
      render(<PaydayBanner />);

      expect(screen.getByTestId("payday-banner")).toBeTruthy();
      expect(screen.getByText("7 DAYS")).toBeTruthy();
      expect(screen.getByTestId("safe-to-spend")).toBeTruthy();
      expect(screen.getByText("$1200.50")).toBeTruthy();
    });

    it("should render progress bar with correct percentage", () => {
      render(<PaydayBanner />);

      const progressBar = screen.getByTestId("progress-bar");
      expect(progressBar).toBeTruthy();
      expect(progressBar.style.width).toBe("50%");
    });

    it("should render formatted payday date", () => {
      render(<PaydayBanner />);

      expect(screen.getByText("1/22/2024")).toBeTruthy();
    });

    it("should render confidence and pattern", () => {
      render(<PaydayBanner />);

      expect(screen.getByText(/biweekly/i)).toBeTruthy();
      expect(screen.getByText(/95% confidence/i)).toBeTruthy();
    });
  });

  describe("countdown text variations", () => {
    it("should display TODAY when daysUntilPayday is 0", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 0,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("TODAY")).toBeTruthy();
    });

    it("should display TOMORROW when daysUntilPayday is 1", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 1,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("TOMORROW")).toBeTruthy();
    });

    it("should display OVERDUE when daysUntilPayday is negative", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: -2,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("OVERDUE")).toBeTruthy();
    });

    it("should display days count for other values", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 14,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("14 DAYS")).toBeTruthy();
    });
  });

  describe("hours display", () => {
    it("should show hours remaining when within 48 hours", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 1,
        hoursUntilPayday: 36,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("36h remaining")).toBeTruthy();
    });

    it("should not show hours when more than 48 hours away", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 7,
        hoursUntilPayday: 168,
      });

      render(<PaydayBanner />);

      expect(screen.queryByText(/h remaining/)).toBeNull();
    });

    it("should not show hours when hoursUntilPayday is null", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        hoursUntilPayday: null,
      });

      render(<PaydayBanner />);

      expect(screen.queryByText(/h remaining/)).toBeNull();
    });

    it("should not show hours when hoursUntilPayday is 0 or negative", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        hoursUntilPayday: 0,
      });

      render(<PaydayBanner />);

      expect(screen.queryByText(/h remaining/)).toBeNull();
    });
  });

  describe("color coding", () => {
    it("should use green color for today", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 0,
      });

      const { container } = render(<PaydayBanner />);

      const countdownElement = container.querySelector(".text-green-600");
      expect(countdownElement).toBeTruthy();
    });

    it("should use emerald color for tomorrow", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 1,
      });

      const { container } = render(<PaydayBanner />);

      const countdownElement = container.querySelector(".text-emerald-600");
      expect(countdownElement).toBeTruthy();
    });

    it("should use amber color for 2-3 days", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 3,
      });

      const { container } = render(<PaydayBanner />);

      const countdownElement = container.querySelector(".text-amber-600");
      expect(countdownElement).toBeTruthy();
    });

    it("should use red color for overdue", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: -1,
      });

      const { container } = render(<PaydayBanner />);

      const countdownElement = container.querySelector(".text-red-600");
      expect(countdownElement).toBeTruthy();
    });

    it("should use purple color for 4+ days", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        daysUntilPayday: 10,
      });

      const { container } = render(<PaydayBanner />);

      const countdownElement = container.querySelector(".text-purple-600");
      expect(countdownElement).toBeTruthy();
    });
  });

  describe("glassmorphism styling", () => {
    it("should have glassmorphism styles", () => {
      render(<PaydayBanner />);

      const banner = screen.getByTestId("payday-banner");
      expect(banner.className).toContain("bg-gradient-to-br");
      expect(banner.className).toContain("backdrop-blur-3xl");
      expect(banner.className).toContain("border-2");
      expect(banner.className).toContain("border-black");
      expect(banner.className).toContain("rounded-xl");
      expect(banner.className).toContain("shadow-2xl");
    });
  });

  describe("responsive design", () => {
    it("should have mobile title visible", () => {
      const { container } = render(<PaydayBanner />);

      const mobileTitle = container.querySelector(".sm\\:hidden");
      expect(mobileTitle).toBeTruthy();
    });

    it("should have desktop title visible", () => {
      const { container } = render(<PaydayBanner />);

      const desktopTitle = container.querySelector(".hidden.sm\\:block");
      expect(desktopTitle).toBeTruthy();
    });
  });

  describe("safe-to-spend display", () => {
    it("should format safe-to-spend with 2 decimal places", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        safeToSpend: 1234.56,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("$1234.56")).toBeTruthy();
    });

    it("should display zero correctly", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        safeToSpend: 0,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("$0.00")).toBeTruthy();
    });

    it("should handle large amounts", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        safeToSpend: 10000.99,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("$10000.99")).toBeTruthy();
    });
  });

  describe("progress percentage", () => {
    it("should render progress percentage text", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        progressPercentage: 67.5,
      });

      render(<PaydayBanner />);

      expect(screen.getByText("68%")).toBeTruthy();
    });

    it("should handle 0% progress", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        progressPercentage: 0,
      });

      render(<PaydayBanner />);

      const progressBar = screen.getByTestId("progress-bar");
      expect(progressBar.style.width).toBe("0%");
    });

    it("should handle 100% progress", () => {
      vi.mocked(usePaydayProgress).mockReturnValue({
        ...mockProgressData,
        progressPercentage: 100,
      });

      render(<PaydayBanner />);

      const progressBar = screen.getByTestId("progress-bar");
      expect(progressBar.style.width).toBe("100%");
    });
  });
});
