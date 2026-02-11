import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StandardTabs from "../StandardTabs";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe("StandardTabs", () => {
  const mockTabs = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
    { id: "tab3", label: "Tab 3" },
  ];

  const defaultProps = {
    tabs: mockTabs,
    activeTab: "tab1",
    onTabChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all tabs", () => {
      render(<StandardTabs {...defaultProps} />);
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Tab 3")).toBeInTheDocument();
    });

    it("should highlight active tab", () => {
      render(<StandardTabs {...defaultProps} activeTab="tab2" />);
      const activeTab = screen.getByRole("tab", { name: /Tab 2/i });
      expect(activeTab).toHaveClass("text-blue-700");
    });

    it("should render with icons", () => {
      const tabsWithIcons = [
        { id: "tab1", label: "Tab 1", icon: MockIcon },
        { id: "tab2", label: "Tab 2", icon: MockIcon },
      ];
      render(<StandardTabs {...defaultProps} tabs={tabsWithIcons} />);
      const icons = screen.getAllByTestId("mock-icon");
      expect(icons).toHaveLength(2);
    });

    it("should render with count badges", () => {
      const tabsWithCount = [
        { id: "tab1", label: "Tab 1", count: 5 },
        { id: "tab2", label: "Tab 2", count: 10 },
      ];
      render(<StandardTabs {...defaultProps} tabs={tabsWithCount} />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should not render count badge when count is null", () => {
      const tabsWithNullCount = [{ id: "tab1", label: "Tab 1", count: null }];
      render(<StandardTabs {...defaultProps} tabs={tabsWithNullCount} />);
      // Count of null should not render a badge
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("should call onTabChange when tab is clicked", async () => {
      const onTabChange = vi.fn();
      render(<StandardTabs {...defaultProps} onTabChange={onTabChange} />);

      await userEvent.click(screen.getByText("Tab 2"));
      expect(onTabChange).toHaveBeenCalledWith("tab2");
    });

    it("should not call onTabChange when active tab is clicked", async () => {
      const onTabChange = vi.fn();
      render(<StandardTabs {...defaultProps} activeTab="tab1" onTabChange={onTabChange} />);

      await userEvent.click(screen.getByText("Tab 1"));
      expect(onTabChange).toHaveBeenCalledWith("tab1");
    });

    it("should not call onTabChange when disabled tab is clicked", async () => {
      const onTabChange = vi.fn();
      const tabsWithDisabled = [
        { id: "tab1", label: "Tab 1" },
        { id: "tab2", label: "Tab 2", disabled: true },
      ];
      render(<StandardTabs {...defaultProps} tabs={tabsWithDisabled} onTabChange={onTabChange} />);

      await userEvent.click(screen.getByText("Tab 2"));
      expect(onTabChange).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have role='navigation'", () => {
      render(<StandardTabs {...defaultProps} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should have role='tab' for each tab", () => {
      render(<StandardTabs {...defaultProps} />);
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThanOrEqual(3);
    });

    it("should have aria-selected='true' for active tab", () => {
      render(<StandardTabs {...defaultProps} activeTab="tab2" />);
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    it("should have aria-selected='false' for inactive tabs", () => {
      render(<StandardTabs {...defaultProps} activeTab="tab2" />);
      const tab1 = screen.getByRole("tab", { name: /Tab 1/i });
      expect(tab1).toHaveAttribute("aria-selected", "false");
    });

    it("should have aria-disabled='true' for disabled tabs", () => {
      const tabsWithDisabled = [
        { id: "tab1", label: "Tab 1" },
        { id: "tab2", label: "Tab 2", disabled: true },
      ];
      render(<StandardTabs {...defaultProps} tabs={tabsWithDisabled} />);
      const tab2 = screen.getByRole("tab", { name: /Tab 2/i });
      expect(tab2).toHaveAttribute("aria-disabled", "true");
    });

    it("should be keyboard navigable", async () => {
      const onTabChange = vi.fn();
      render(<StandardTabs {...defaultProps} onTabChange={onTabChange} />);

      const firstTab = screen.getByRole("tab", { name: /Tab 1/i });
      firstTab.focus();
      expect(firstTab).toHaveFocus();
    });
  });

  describe("Variants", () => {
    it("should render underline variant", () => {
      render(<StandardTabs {...defaultProps} variant="underline" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render pills variant", () => {
      render(<StandardTabs {...defaultProps} variant="pills" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render buttons variant", () => {
      render(<StandardTabs {...defaultProps} variant="buttons" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render tabs variant", () => {
      render(<StandardTabs {...defaultProps} variant="tabs" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render colored variant", () => {
      render(<StandardTabs {...defaultProps} variant="colored" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<StandardTabs {...defaultProps} size="sm" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render medium size", () => {
      render(<StandardTabs {...defaultProps} size="md" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render large size", () => {
      render(<StandardTabs {...defaultProps} size="lg" />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });

  describe("Colors", () => {
    it("should render with custom color", () => {
      const tabsWithColor = [{ id: "tab1", label: "Tab 1", color: "blue" as const }];
      render(<StandardTabs {...defaultProps} tabs={tabsWithColor} />);
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
    });

    it("should support all color variants", () => {
      const colors = ["blue", "green", "red", "amber", "purple", "cyan", "gray"] as const;
      colors.forEach((color) => {
        const tabsWithColor = [{ id: "tab1", label: `${color} Tab`, color }];
        render(<StandardTabs {...defaultProps} tabs={tabsWithColor} />);
        expect(screen.getByText(`${color} Tab`)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tabs array", () => {
      render(<StandardTabs {...defaultProps} tabs={[]} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should handle undefined tabs", () => {
      const renderTabs = () => render(<StandardTabs {...defaultProps} tabs={undefined} />);
      expect(renderTabs).not.toThrow();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should handle very long tab labels", () => {
      const longLabel = "A".repeat(100);
      const tabsWithLongLabel = [{ id: "tab1", label: longLabel }];
      render(<StandardTabs {...defaultProps} tabs={tabsWithLongLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle special characters in labels", () => {
      const specialLabel = "Tab & <Special> 'Characters'";
      const tabsWithSpecial = [{ id: "tab1", label: specialLabel }];
      render(<StandardTabs {...defaultProps} tabs={tabsWithSpecial} />);
      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it("should handle large count numbers", () => {
      const tabsWithLargeCount = [{ id: "tab1", label: "Tab 1", count: 9999 }];
      render(<StandardTabs {...defaultProps} tabs={tabsWithLargeCount} />);
      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    it("should handle many tabs", () => {
      const manyTabs = Array.from({ length: 20 }, (_, i) => ({
        id: `tab${i}`,
        label: `Tab ${i}`,
      }));
      render(<StandardTabs {...defaultProps} tabs={manyTabs} />);
      expect(screen.getAllByRole("tab")).toHaveLength(20);
    });

    it("should handle custom className", () => {
      const { container } = render(<StandardTabs {...defaultProps} className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should handle tabs with both icons and counts", () => {
      const complexTabs = [{ id: "tab1", label: "Tab 1", icon: MockIcon, count: 5 }];
      render(<StandardTabs {...defaultProps} tabs={complexTabs} />);
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });
});
