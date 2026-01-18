import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Card } from "../Card";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// Mock getIcon
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => MockIcon),
}));

describe("Card", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with children", () => {
      render(
        <Card>
          <div>Test Content</div>
        </Card>
      );
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render with default variant", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-white", "border-2", "border-black", "rounded-2xl");
    });

    it("should render with elevated variant", () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("shadow-lg");
    });

    it("should render with outlined variant", () => {
      const { container } = render(<Card variant="outlined">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-transparent");
    });

    it("should render with glass variant", () => {
      const { container } = render(<Card variant="glass">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-white/90", "backdrop-blur-xl");
    });
  });

  describe("Padding", () => {
    it("should apply default padding (md)", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("p-6");
    });

    it("should apply none padding", () => {
      const { container } = render(<Card padding="none">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("p-0");
    });

    it("should apply sm padding", () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("p-4");
    });

    it("should apply lg padding", () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("p-8");
    });
  });

  describe("Clickable", () => {
    it("should add clickable classes when onClick provided", () => {
      const { container } = render(<Card onClick={() => {}}>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("cursor-pointer", "hover:shadow-xl", "transition-shadow");
    });

    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Content</Card>);
      const card = screen.getByRole("button");

      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when Enter key pressed", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Content</Card>);
      const card = screen.getByRole("button");

      card.focus();
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when Space key pressed", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Content</Card>);
      const card = screen.getByRole("button");

      card.focus();
      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should have role=button when clickable", () => {
      render(<Card onClick={() => {}}>Content</Card>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      render(<Card onClick={() => {}}>Content</Card>);
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Card.Header", () => {
    it("should render with title", () => {
      render(
        <Card>
          <Card.Header title="Test Title" />
        </Card>
      );
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render with subtitle", () => {
      render(
        <Card>
          <Card.Header title="Title" subtitle="Test Subtitle" />
        </Card>
      );
      expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(
        <Card>
          <Card.Header icon="User" title="Title" />
        </Card>
      );
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("should render with actions", () => {
      render(
        <Card>
          <Card.Header title="Title" actions={<button>Action</button>} />
        </Card>
      );
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    });

    it("should have bottom border", () => {
      const { container } = render(
        <Card>
          <Card.Header title="Title" />
        </Card>
      );
      const header = container.querySelector(".border-b-2");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("border-black/10");
    });
  });

  describe("Card.Body", () => {
    it("should render children", () => {
      render(
        <Card>
          <Card.Body>Body Content</Card.Body>
        </Card>
      );
      expect(screen.getByText("Body Content")).toBeInTheDocument();
    });

    it("should be scrollable", () => {
      const { container } = render(
        <Card>
          <Card.Body>Content</Card.Body>
        </Card>
      );
      const body = container.querySelector(".overflow-auto");
      expect(body).toBeInTheDocument();
    });

    it("should merge custom className", () => {
      const { container } = render(
        <Card>
          <Card.Body className="custom-body">Content</Card.Body>
        </Card>
      );
      const body = container.querySelector(".custom-body");
      expect(body).toBeInTheDocument();
      expect(body).toHaveClass("overflow-auto");
    });
  });

  describe("Card.Footer", () => {
    it("should render children", () => {
      render(
        <Card>
          <Card.Footer>Footer Content</Card.Footer>
        </Card>
      );
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });

    it("should have top border", () => {
      const { container } = render(
        <Card>
          <Card.Footer>Content</Card.Footer>
        </Card>
      );
      const footer = container.querySelector(".border-t-2");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("border-black/10");
    });

    it("should merge custom className", () => {
      const { container } = render(
        <Card>
          <Card.Footer className="custom-footer">Content</Card.Footer>
        </Card>
      );
      const footer = container.querySelector(".custom-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("border-t-2");
    });
  });

  describe("Compound Components Together", () => {
    it("should render all components together", () => {
      render(
        <Card variant="elevated">
          <Card.Header
            icon="User"
            title="Profile"
            subtitle="User details"
            actions={<button>Edit</button>}
          />
          <Card.Body>Profile information</Card.Body>
          <Card.Footer>
            <button>Save</button>
          </Card.Footer>
        </Card>
      );

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("User details")).toBeInTheDocument();
      expect(screen.getByText("Profile information")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });
  });
});
