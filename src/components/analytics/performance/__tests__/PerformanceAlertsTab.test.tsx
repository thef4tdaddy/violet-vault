import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PerformanceAlertsTab from "../PerformanceAlertsTab";
import React from "react";

// Mock the icons
vi.mock("../../../utils", () => ({
  getIcon: vi.fn(() => (props: any) => <div data-testid="icon" {...props} />),
}));

// Mock performance utils
vi.mock("@/utils/performanceUtils", () => ({
  getAlertIconType: vi.fn((type) => {
    switch (type) {
      case "critical":
        return { name: "AlertTriangle", color: "text-red-500" };
      case "warning":
        return { name: "AlertTriangle", color: "text-yellow-500" };
      default:
        return { name: "CheckCircle", color: "text-blue-500" };
    }
  }),
}));

describe("PerformanceAlertsTab", () => {
  it("renders empty state when no alerts provided", () => {
    render(<PerformanceAlertsTab alerts={[]} />);
    expect(screen.getByText("All Good!")).toBeDefined();
    expect(screen.getByText("No performance alerts at this time.")).toBeDefined();
  });

  it("renders a list of alerts", () => {
    const alerts = [
      {
        id: "1",
        title: "High Spending",
        message: "Your spending is high this month.",
        severity: "critical",
        type: "error",
        date: "2026-01-26",
      },
      {
        id: "2",
        title: "Low Savings",
        message: "You should save more.",
        severity: "warning",
        type: "warning",
        date: "2026-01-26",
        action: "Review goals",
        details: "Emergency Fund",
      },
      {
        id: "3",
        title: "On Track",
        message: "Keep it up.",
        severity: "info",
        type: "info",
        date: "2026-01-26",
      },
    ];

    render(<PerformanceAlertsTab alerts={alerts as any} />);

    expect(screen.getByText("High Spending")).toBeDefined();
    expect(screen.getByText("Low Savings")).toBeDefined();
    expect(screen.getByText("On Track")).toBeDefined();

    // Check severity badges
    expect(screen.getByText("critical")).toBeDefined();
    expect(screen.getByText("warning")).toBeDefined();
    expect(screen.getByText("info")).toBeDefined();

    // Check optional fields
    expect(screen.getByText("💡 Review goals")).toBeDefined();
    expect(screen.getByText("Affected: Emergency Fund")).toBeDefined();
  });

  it("applies correct severity styles", () => {
    const alerts = [
      {
        id: "1",
        title: "Critical",
        severity: "critical",
        message: "msg",
        date: "2026-01-26",
        type: "error",
      },
      {
        id: "2",
        title: "Warning",
        severity: "warning",
        message: "msg",
        date: "2026-01-26",
        type: "warning",
      },
      {
        id: "3",
        title: "Info",
        severity: "info",
        message: "msg",
        date: "2026-01-26",
        type: "info",
      },
    ];

    render(<PerformanceAlertsTab alerts={alerts as any} />);

    const criticalBadge = screen.getByText("critical");
    expect(criticalBadge.className).toContain("bg-red-100");

    const warningBadge = screen.getByText("warning");
    expect(warningBadge.className).toContain("bg-yellow-100");

    const infoBadge = screen.getByText("info");
    expect(infoBadge.className).toContain("bg-blue-100");
  });
});
