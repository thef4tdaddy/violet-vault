import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DashboardShell from "../DashboardShell";
import "@testing-library/jest-dom";

describe("DashboardShell", () => {

  describe("Rendering", () => {
    it("should render the dashboard shell container", () => {
      render(<DashboardShell />);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toBeInTheDocument();
    });

    it("should apply glassmorphism styling", () => {
      render(<DashboardShell />);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toHaveClass("bg-purple-100/40");
      expect(shell).toHaveClass("backdrop-blur-sm");
      expect(shell).toHaveClass("border-2");
      expect(shell).toHaveClass("border-black");
      expect(shell).toHaveClass("rounded-lg");
    });

    it("should render top row when slots provided", () => {
      render(
        <DashboardShell
          logo={<div>Logo</div>}
          profile={<div>Profile</div>}
          paydayBanner={<div>PaydayBanner</div>}
        />
      );
      const topRow = screen.getByTestId("dashboard-top-row");
      expect(topRow).toBeInTheDocument();
    });

    it("should not render top row elements when no slots provided", () => {
      render(<DashboardShell />);
      const topRow = screen.getByTestId("dashboard-top-row");
      expect(topRow).toBeInTheDocument();
      expect(screen.queryByTestId("dashboard-logo")).not.toBeInTheDocument();
      expect(screen.queryByTestId("dashboard-profile")).not.toBeInTheDocument();
      expect(screen.queryByTestId("dashboard-payday-banner")).not.toBeInTheDocument();
    });

    it("should render children in content grid", () => {
      render(
        <DashboardShell>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </DashboardShell>
      );
      const contentGrid = screen.getByTestId("dashboard-content-grid");
      expect(contentGrid).toBeInTheDocument();
      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });

    it("should not render content grid when no children provided", () => {
      render(<DashboardShell />);
      expect(screen.queryByTestId("dashboard-content-grid")).not.toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should apply responsive grid classes to top row", () => {
      render(<DashboardShell logo={<div>Logo</div>} />);
      const topRow = screen.getByTestId("dashboard-top-row");
      expect(topRow).toHaveClass("grid");
      expect(topRow).toHaveClass("grid-cols-1");
      expect(topRow).toHaveClass("md:grid-cols-2");
      expect(topRow).toHaveClass("lg:grid-cols-3");
      expect(topRow).toHaveClass("gap-4");
    });

    it("should apply responsive grid classes to content grid", () => {
      render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );
      const contentGrid = screen.getByTestId("dashboard-content-grid");
      expect(contentGrid).toHaveClass("grid");
      expect(contentGrid).toHaveClass("grid-cols-1");
      expect(contentGrid).toHaveClass("md:grid-cols-2");
      expect(contentGrid).toHaveClass("lg:grid-cols-3");
      expect(contentGrid).toHaveClass("gap-4");
      expect(contentGrid).toHaveClass("md:gap-6");
    });

    it("should have proper gap spacing", () => {
      render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );
      const contentGrid = screen.getByTestId("dashboard-content-grid");
      expect(contentGrid.className).toMatch(/gap-\d+/);
    });
  });

  describe("Slot Rendering", () => {
    it("should render logo slot when provided", () => {
      const LogoComponent = () => <div data-testid="custom-logo">VioletVault</div>;
      render(<DashboardShell logo={<LogoComponent />} />);

      const logoSlot = screen.getByTestId("dashboard-logo");
      expect(logoSlot).toBeInTheDocument();
      expect(screen.getByTestId("custom-logo")).toBeInTheDocument();
      expect(screen.getByText("VioletVault")).toBeInTheDocument();
    });

    it("should render profile slot when provided", () => {
      const ProfileComponent = () => <div data-testid="custom-profile">User Name</div>;
      render(<DashboardShell profile={<ProfileComponent />} />);

      const profileSlot = screen.getByTestId("dashboard-profile");
      expect(profileSlot).toBeInTheDocument();
      expect(screen.getByTestId("custom-profile")).toBeInTheDocument();
      expect(screen.getByText("User Name")).toBeInTheDocument();
    });

    it("should render paydayBanner slot when provided", () => {
      const BannerComponent = () => <div data-testid="custom-banner">Payday: 5 days</div>;
      render(<DashboardShell paydayBanner={<BannerComponent />} />);

      const bannerSlot = screen.getByTestId("dashboard-payday-banner");
      expect(bannerSlot).toBeInTheDocument();
      expect(screen.getByTestId("custom-banner")).toBeInTheDocument();
      expect(screen.getByText("Payday: 5 days")).toBeInTheDocument();
    });

    it("should render all slots together", () => {
      render(
        <DashboardShell
          logo={<div data-testid="logo">Logo</div>}
          profile={<div data-testid="profile">Profile</div>}
          paydayBanner={<div data-testid="banner">Banner</div>}
        />
      );

      expect(screen.getByTestId("dashboard-logo")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-profile")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-payday-banner")).toBeInTheDocument();
    });

    it("should render multiple children in content grid", () => {
      render(
        <DashboardShell>
          <div data-testid="widget-1">Widget 1</div>
          <div data-testid="widget-2">Widget 2</div>
          <div data-testid="widget-3">Widget 3</div>
          <div data-testid="widget-4">Widget 4</div>
        </DashboardShell>
      );

      expect(screen.getByTestId("widget-1")).toBeInTheDocument();
      expect(screen.getByTestId("widget-2")).toBeInTheDocument();
      expect(screen.getByTestId("widget-3")).toBeInTheDocument();
      expect(screen.getByTestId("widget-4")).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("should apply custom className", () => {
      render(<DashboardShell className="custom-class" />);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toHaveClass("custom-class");
    });

    it("should merge custom className with default classes", () => {
      render(<DashboardShell className="my-custom-class" />);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toHaveClass("my-custom-class");
      expect(shell).toHaveClass("bg-purple-100/40");
      expect(shell).toHaveClass("backdrop-blur-sm");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty props gracefully", () => {
      render(<DashboardShell />);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toBeInTheDocument();
    });

    it("should handle null children", () => {
      render(<DashboardShell>{null}</DashboardShell>);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toBeInTheDocument();
    });

    it("should handle undefined children", () => {
      render(<DashboardShell>{undefined}</DashboardShell>);
      const shell = screen.getByTestId("dashboard-shell");
      expect(shell).toBeInTheDocument();
    });

    it("should handle mixed content types", () => {
      render(
        <DashboardShell>
          <div>Div Child</div>
          <span>Span Child</span>
          {null}
          {undefined}
          Text Child
        </DashboardShell>
      );

      const contentGrid = screen.getByTestId("dashboard-content-grid");
      expect(contentGrid).toBeInTheDocument();
      expect(screen.getByText("Div Child")).toBeInTheDocument();
      expect(screen.getByText("Span Child")).toBeInTheDocument();
      expect(screen.getByText("Text Child")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should have mobile-first grid structure", () => {
      render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );
      const contentGrid = screen.getByTestId("dashboard-content-grid");
      // Mobile first means grid-cols-1 is the base
      expect(contentGrid.className).toContain("grid-cols-1");
    });

    it("should have tablet breakpoint classes", () => {
      render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );
      const contentGrid = screen.getByTestId("dashboard-content-grid");
      expect(contentGrid.className).toContain("md:grid-cols-2");
    });

    it("should have desktop breakpoint classes", () => {
      render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );
      const contentGrid = screen.getByTestId("dashboard-content-grid");
      expect(contentGrid.className).toContain("lg:grid-cols-3");
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should accept ReactNode for all slots", () => {
      // This test ensures the component compiles with TypeScript
      const elements = {
        logo: <div>Logo</div>,
        profile: <span>Profile</span>,
        paydayBanner: <button>Banner</button>,
        children: <article>Content</article>,
      };

      render(<DashboardShell {...elements} />);
      expect(screen.getByText("Logo")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Banner")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
