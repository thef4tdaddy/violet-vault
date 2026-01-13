import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TableActions } from "../TableActions";
import type { TableAction } from "../TableActions";
import "@testing-library/jest-dom";

// Mock UI components and utilities
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/utils", () => ({
  getIcon: vi.fn((iconName: string) => {
    return function MockIcon({ className }: { className?: string }) {
      return <span className={className} data-testid={`icon-${iconName}`} />;
    };
  }),
}));

describe("TableActions", () => {
  const mockClearSelection = vi.fn();

  const mockActions: TableAction[] = [
    {
      label: "Delete",
      icon: "Trash",
      onClick: vi.fn(),
      variant: "destructive",
    },
    {
      label: "Export",
      icon: "Download",
      onClick: vi.fn(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when selectedCount is greater than 0", () => {
      render(
        <TableActions
          selectedCount={3}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      expect(screen.getByText("3 items selected")).toBeInTheDocument();
    });

    it("should not render when selectedCount is 0", () => {
      const { container } = render(
        <TableActions
          selectedCount={0}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render singular item text when selectedCount is 1", () => {
      render(
        <TableActions selectedCount={1} onClearSelection={mockClearSelection} actions={mockActions} />
      );

      expect(screen.getByText("1 item selected")).toBeInTheDocument();
    });

    it("should render plural items text when selectedCount is greater than 1", () => {
      render(
        <TableActions
          selectedCount={5}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      expect(screen.getByText("5 items selected")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={mockActions}
          className="custom-actions"
        />
      );

      expect(container.querySelector(".custom-actions")).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should render all action buttons", () => {
      render(
        <TableActions
          selectedCount={3}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
    });

    it("should render action buttons with icons", () => {
      render(
        <TableActions
          selectedCount={3}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      expect(screen.getByTestId("icon-Trash")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Download")).toBeInTheDocument();
    });

    it("should call action onClick when clicked", async () => {
      const action = { label: "Test Action", onClick: vi.fn() };

      render(
        <TableActions selectedCount={1} onClearSelection={mockClearSelection} actions={[action]} />
      );

      await userEvent.click(screen.getByText("Test Action"));

      expect(action.onClick).toHaveBeenCalledTimes(1);
    });

    it("should apply danger styling for destructive variant", () => {
      const destructiveAction: TableAction = {
        label: "Delete",
        onClick: vi.fn(),
        variant: "destructive",
      };

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={[destructiveAction]}
        />
      );

      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).toHaveClass("bg-red-600");
    });

    it("should apply default styling for default variant", () => {
      const defaultAction: TableAction = {
        label: "Edit",
        onClick: vi.fn(),
        variant: "default",
      };

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={[defaultAction]}
        />
      );

      const editButton = screen.getByText("Edit");
      expect(editButton).toHaveClass("bg-blue-600");
    });

    it("should disable button when disabled is true", () => {
      const disabledAction: TableAction = {
        label: "Disabled",
        onClick: vi.fn(),
        disabled: true,
      };

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={[disabledAction]}
        />
      );

      const button = screen.getByText("Disabled");
      expect(button).toBeDisabled();
    });

    it("should not call onClick when disabled button is clicked", async () => {
      const disabledAction: TableAction = {
        label: "Disabled",
        onClick: vi.fn(),
        disabled: true,
      };

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={[disabledAction]}
        />
      );

      const button = screen.getByText("Disabled");
      await userEvent.click(button);

      expect(disabledAction.onClick).not.toHaveBeenCalled();
    });

    it("should render action without icon", () => {
      const actionWithoutIcon: TableAction = {
        label: "No Icon",
        onClick: vi.fn(),
      };

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={[actionWithoutIcon]}
        />
      );

      expect(screen.getByText("No Icon")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-")).not.toBeInTheDocument();
    });
  });

  describe("Clear Button", () => {
    it("should render clear button", () => {
      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    it("should call onClearSelection when clear button is clicked", async () => {
      render(
        <TableActions
          selectedCount={3}
          onClearSelection={mockClearSelection}
          actions={mockActions}
        />
      );

      await userEvent.click(screen.getByText("Clear"));

      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe("Multiple Actions", () => {
    it("should render multiple actions in order", () => {
      const multipleActions: TableAction[] = [
        { label: "Action 1", onClick: vi.fn() },
        { label: "Action 2", onClick: vi.fn() },
        { label: "Action 3", onClick: vi.fn() },
      ];

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={multipleActions}
        />
      );

      const buttons = screen.getAllByRole("button");
      const actionButtons = buttons.slice(0, -1); // Exclude clear button

      expect(actionButtons[0]).toHaveTextContent("Action 1");
      expect(actionButtons[1]).toHaveTextContent("Action 2");
      expect(actionButtons[2]).toHaveTextContent("Action 3");
    });

    it("should call correct onClick for each action", async () => {
      const action1 = { label: "Action 1", onClick: vi.fn() };
      const action2 = { label: "Action 2", onClick: vi.fn() };

      render(
        <TableActions
          selectedCount={1}
          onClearSelection={mockClearSelection}
          actions={[action1, action2]}
        />
      );

      await userEvent.click(screen.getByText("Action 1"));
      expect(action1.onClick).toHaveBeenCalledTimes(1);
      expect(action2.onClick).not.toHaveBeenCalled();

      await userEvent.click(screen.getByText("Action 2"));
      expect(action2.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Empty Actions", () => {
    it("should render with empty actions array", () => {
      render(
        <TableActions selectedCount={1} onClearSelection={mockClearSelection} actions={[]} />
      );

      expect(screen.getByText("1 item selected")).toBeInTheDocument();
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });
  });
});
