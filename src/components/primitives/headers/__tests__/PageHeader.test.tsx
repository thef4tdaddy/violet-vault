import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PageHeader from "../PageHeader";
import "@testing-library/jest-dom";

// Mock getIcon utility
vi.mock("@/utils/icons", () => ({
  getIcon: vi.fn((iconName: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <div className={className} data-testid={`icon-${iconName}`}>
        {iconName}
      </div>
    );
    MockIcon.displayName = iconName;
    return MockIcon;
  }),
}));

describe("PageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render title and subtitle", () => {
      render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    });

    it("should render without subtitle when not provided", () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.queryByText("Test Subtitle")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<PageHeader title="Test Title" className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Icon Rendering", () => {
    it("should render icon when provided", () => {
      render(<PageHeader title="Test Title" icon="Receipt" />);
      expect(screen.getByTestId("icon-Receipt")).toBeInTheDocument();
    });

    it("should not render icon when not provided", () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.queryByTestId(/^icon-/)).not.toBeInTheDocument();
    });

    it("should apply correct icon styling", () => {
      render(<PageHeader title="Test Title" icon="Receipt" />);
      const icon = screen.getByTestId("icon-Receipt");
      expect(icon).toHaveClass("h-8", "w-8", "text-white");
    });
  });

  describe("Breadcrumbs", () => {
    it("should render breadcrumbs when provided", () => {
      const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings" },
        { label: "Profile" },
      ];
      render(<PageHeader title="Test Title" breadcrumbs={breadcrumbs} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    it("should render clickable breadcrumb links", () => {
      const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Current" }];
      render(<PageHeader title="Test Title" breadcrumbs={breadcrumbs} />);
      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should render last breadcrumb without link", () => {
      const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Current" }];
      render(<PageHeader title="Test Title" breadcrumbs={breadcrumbs} />);
      const current = screen.getByText("Current");
      expect(current.tagName).toBe("SPAN");
    });

    it("should render chevron separators", () => {
      const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Settings" }];
      render(<PageHeader title="Test Title" breadcrumbs={breadcrumbs} />);
      expect(screen.getByTestId("icon-ChevronRight")).toBeInTheDocument();
    });

    it("should not render breadcrumbs when empty array", () => {
      render(<PageHeader title="Test Title" breadcrumbs={[]} />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("should not render breadcrumbs when not provided", () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("should render actions when provided", () => {
      render(<PageHeader title="Test Title" actions={<button>Add New</button>} />);
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    it("should render multiple action buttons", () => {
      render(
        <PageHeader
          title="Test Title"
          actions={
            <>
              <button>Search</button>
              <button>Add</button>
            </>
          }
        />
      );
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Add")).toBeInTheDocument();
    });

    it("should not render actions when not provided", () => {
      const { container } = render(<PageHeader title="Test Title" />);
      const buttons = container.querySelectorAll("button");
      expect(buttons).toHaveLength(0);
    });
  });

  describe("Layout and Responsiveness", () => {
    it("should apply responsive flex layout classes", () => {
      const { container } = render(<PageHeader title="Test Title" />);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass(
        "flex",
        "flex-col",
        "sm:flex-row",
        "sm:items-center",
        "sm:justify-between"
      );
    });

    it("should apply gap spacing", () => {
      const { container } = render(<PageHeader title="Test Title" />);
      expect(container.firstChild).toHaveClass("gap-4");
    });
  });

  describe("Complete Example", () => {
    it("should render all elements together", () => {
      const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Bills" }];
      render(
        <PageHeader
          title="Bill Manager"
          subtitle="Manage your scheduled expenses"
          icon="Receipt"
          breadcrumbs={breadcrumbs}
          actions={
            <>
              <button>Search</button>
              <button>Add Bill</button>
            </>
          }
          className="custom-header"
        />
      );

      expect(screen.getByText("Bill Manager")).toBeInTheDocument();
      expect(screen.getByText("Manage your scheduled expenses")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Receipt")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Bills")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Add Bill")).toBeInTheDocument();
    });
  });

  describe("Typography Styles", () => {
    it("should apply correct title styles", () => {
      render(<PageHeader title="Test Title" />);
      const title = screen.getByText("Test Title");
      expect(title).toHaveClass("text-2xl", "font-bold", "text-slate-900");
    });

    it("should apply correct subtitle styles", () => {
      render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
      const subtitle = screen.getByText("Test Subtitle");
      expect(subtitle).toHaveClass("text-sm", "text-slate-600", "mt-1");
    });
  });
});
