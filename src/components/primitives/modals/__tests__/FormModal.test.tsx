import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import FormModal from "../FormModal";

describe("FormModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    title: "Test Form",
    children: <input type="text" placeholder="Test Input" />,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<FormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render title", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByText("Test Form")).toBeInTheDocument();
    });

    it("should render subtitle when provided", () => {
      render(<FormModal {...defaultProps} subtitle="Fill out the form" />);
      expect(screen.getByText("Fill out the form")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText("Test Input")).toBeInTheDocument();
    });
  });

  describe("Button Labels", () => {
    it("should render default submit button label", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    });

    it("should render custom submit button label", () => {
      render(<FormModal {...defaultProps} submitLabel="Save" />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("should render default cancel button label", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("should render custom cancel button label", () => {
      render(<FormModal {...defaultProps} cancelLabel="Close" />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should call onSubmit when form is submitted", async () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(<FormModal {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should prevent default form submission", async () => {
      const onSubmit = vi.fn();
      render(<FormModal {...defaultProps} onSubmit={onSubmit} />);

      const form = screen.getByRole("dialog").querySelector("form");
      fireEvent.submit(form!);

      expect(onSubmit).toHaveBeenCalled();
    });

    it("should call onClose when cancel button is clicked", async () => {
      const onClose = vi.fn();
      render(<FormModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<FormModal {...defaultProps} loading />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("should disable buttons when loading", () => {
      render(<FormModal {...defaultProps} loading />);
      expect(screen.getByRole("button", { name: /Processing/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("should not disable buttons when not loading", () => {
      render(<FormModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    });

    it("should not submit form when loading", async () => {
      const onSubmit = vi.fn();
      render(<FormModal {...defaultProps} onSubmit={onSubmit} loading />);

      await userEvent.click(screen.getByRole("button", { name: /Processing/i }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Size Variants", () => {
    it("should apply medium size by default", () => {
      render(<FormModal {...defaultProps} />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-md");
    });

    it("should apply small size", () => {
      render(<FormModal {...defaultProps} size="sm" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-sm");
    });

    it("should apply large size", () => {
      render(<FormModal {...defaultProps} size="lg" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-lg");
    });

    it("should apply extra large size", () => {
      render(<FormModal {...defaultProps} size="xl" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-xl");
    });
  });

  describe("Compound Components", () => {
    describe("FormModal.Field", () => {
      it("should render field label", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Field label="Username">
              <input type="text" />
            </FormModal.Field>
          </FormModal>
        );
        expect(screen.getByText("Username")).toBeInTheDocument();
      });

      it("should show required indicator", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Field label="Username" required>
              <input type="text" />
            </FormModal.Field>
          </FormModal>
        );
        expect(screen.getByText("*")).toBeInTheDocument();
      });

      it("should render error message", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Field label="Username" error="Username is required">
              <input type="text" />
            </FormModal.Field>
          </FormModal>
        );
        expect(screen.getByText("Username is required")).toBeInTheDocument();
      });

      it("should render helper text", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Field label="Username" helperText="Enter your username">
              <input type="text" />
            </FormModal.Field>
          </FormModal>
        );
        expect(screen.getByText("Enter your username")).toBeInTheDocument();
      });

      it("should not show helper text when error is present", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Field
              label="Username"
              error="Username is required"
              helperText="Enter your username"
            >
              <input type="text" />
            </FormModal.Field>
          </FormModal>
        );
        expect(screen.queryByText("Enter your username")).not.toBeInTheDocument();
        expect(screen.getByText("Username is required")).toBeInTheDocument();
      });
    });

    describe("FormModal.Section", () => {
      it("should render section without title", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Section>
              <div data-testid="section-content">Content</div>
            </FormModal.Section>
          </FormModal>
        );
        expect(screen.getByTestId("section-content")).toBeInTheDocument();
      });

      it("should render section with title", () => {
        render(
          <FormModal {...defaultProps}>
            <FormModal.Section title="Personal Information">
              <div data-testid="section-content">Content</div>
            </FormModal.Section>
          </FormModal>
        );
        expect(screen.getByText("Personal Information")).toBeInTheDocument();
        expect(screen.getByTestId("section-content")).toBeInTheDocument();
      });
    });
  });

  describe("Async onSubmit", () => {
    it("should handle async onSubmit", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<FormModal {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
