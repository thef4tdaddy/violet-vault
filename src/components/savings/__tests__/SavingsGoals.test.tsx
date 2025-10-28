import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import SavingsGoals from "../SavingsGoals";
import userEvent from "@testing-library/user-event";
import useSavingsGoalsActionsOriginal from "../../../hooks/savings/useSavingsGoalsActions";

// Mock the custom hook
vi.mock("../../../hooks/savings/useSavingsGoalsActions", () => ({
  default: vi.fn(() => ({
    showDistributeModal: false,
    editingGoal: null,
    handleGoalSubmit: vi.fn(),
    handleEditGoal: vi.fn(),
    handleDeleteGoal: vi.fn(),
    handleDistribute: vi.fn(),
    openAddForm: vi.fn(),
    openDistributeModal: vi.fn(),
    handleCloseModals: vi.fn(),
    isAddEditModalOpen: false,
  })),
}));

// Type cast the mocked hook
const useSavingsGoalsActions = useSavingsGoalsActionsOriginal as unknown as Mock;

// Mock child components
vi.mock("../SavingsSummaryCard", () => ({
  default: ({ savingsGoals }) => (
    <div data-testid="savings-summary">Goals: {savingsGoals.length}</div>
  ),
}));

vi.mock("../SavingsGoalCard", () => ({
  default: ({ goal, onEdit, onDelete }) => (
    <div data-testid={`goal-card-${goal.id}`}>
      <span>{goal.name}</span>
      <button onClick={() => onEdit(goal)}>Edit</button>
      <button onClick={() => onDelete(goal.id)}>Delete</button>
    </div>
  ),
}));

vi.mock("../AddEditGoalModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="add-edit-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../DistributeModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="distribute-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../../../utils", () => ({
  getIcon: vi.fn(() => "div"),
}));

vi.mock("../../../utils/savings/savingsFormUtils", () => ({
  SAVINGS_PRIORITIES: ["High", "Medium", "Low"],
}));

describe("SavingsGoals", () => {
  const mockOnAddGoal = vi.fn();
  const mockOnUpdateGoal = vi.fn();
  const mockOnDeleteGoal = vi.fn();
  const mockOnDistributeToGoals = vi.fn();

  const defaultProps = {
    savingsGoals: [],
    unassignedCash: 0,
    onAddGoal: mockOnAddGoal,
    onUpdateGoal: mockOnUpdateGoal,
    onDeleteGoal: mockOnDeleteGoal,
    onDistributeToGoals: mockOnDistributeToGoals,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<SavingsGoals {...defaultProps} />);
      expect(screen.getByTestId("savings-summary")).toBeInTheDocument();
    });

    it("should render Add Goal button", () => {
      render(<SavingsGoals {...defaultProps} />);
      expect(screen.getByText("Add Goal")).toBeInTheDocument();
    });

    it("should display empty state when no goals exist", () => {
      render(<SavingsGoals {...defaultProps} />);
      expect(screen.getByText(/No savings goals yet/i)).toBeInTheDocument();
    });

    it("should render goals when they exist", () => {
      const goals = [
        { id: "1", name: "Vacation Fund", balance: 500, targetAmount: 2000 },
        { id: "2", name: "Emergency Fund", balance: 1000, targetAmount: 5000 },
      ];

      render(<SavingsGoals {...defaultProps} savingsGoals={goals} />);

      expect(screen.getByTestId("goal-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("goal-card-2")).toBeInTheDocument();
      expect(screen.getByText("Vacation Fund")).toBeInTheDocument();
      expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
    });

    it("should display distribute button when unassigned cash is available", () => {
      const goals = [{ id: "1", name: "Goal", balance: 0, targetAmount: 100 }];

      render(<SavingsGoals {...defaultProps} savingsGoals={goals} unassignedCash={100} />);

      expect(screen.getByText(/Distribute Cash/i)).toBeInTheDocument();
    });

    it("should not display distribute button when no unassigned cash", () => {
      const goals = [{ id: "1", name: "Goal", balance: 0, targetAmount: 100 }];

      render(<SavingsGoals {...defaultProps} savingsGoals={goals} unassignedCash={0} />);

      expect(screen.queryByText(/Distribute Cash/i)).not.toBeInTheDocument();
    });

    it("should not display distribute button when no goals exist", () => {
      render(<SavingsGoals {...defaultProps} savingsGoals={[]} unassignedCash={100} />);

      expect(screen.queryByText(/Distribute Cash/i)).not.toBeInTheDocument();
    });

    it("should display summary card with goal count", () => {
      const goals = [
        { id: "1", name: "Goal 1", balance: 100, targetAmount: 200 },
        { id: "2", name: "Goal 2", balance: 200, targetAmount: 300 },
      ];

      render(<SavingsGoals {...defaultProps} savingsGoals={goals} />);

      expect(screen.getByText("Goals: 2")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call openAddForm when Add Goal button is clicked", async () => {
      const mockOpenAddForm = vi.fn();

      useSavingsGoalsActions.mockReturnValue({
        showDistributeModal: false,
        editingGoal: null,
        handleGoalSubmit: vi.fn(),
        handleEditGoal: vi.fn(),
        handleDeleteGoal: vi.fn(),
        handleDistribute: vi.fn(),
        openAddForm: mockOpenAddForm,
        openDistributeModal: vi.fn(),
        handleCloseModals: vi.fn(),
        isAddEditModalOpen: false,
      });

      render(<SavingsGoals {...defaultProps} />);

      const addButton = screen.getByText("Add Goal");
      await userEvent.click(addButton);

      expect(mockOpenAddForm).toHaveBeenCalled();
    });

    it("should call openDistributeModal when Distribute Cash button is clicked", async () => {
      const mockOpenDistributeModal = vi.fn();

      useSavingsGoalsActions.mockReturnValue({
        showDistributeModal: false,
        editingGoal: null,
        handleGoalSubmit: vi.fn(),
        handleEditGoal: vi.fn(),
        handleDeleteGoal: vi.fn(),
        handleDistribute: vi.fn(),
        openAddForm: vi.fn(),
        openDistributeModal: mockOpenDistributeModal,
        handleCloseModals: vi.fn(),
        isAddEditModalOpen: false,
      });

      const goals = [{ id: "1", name: "Goal", balance: 0, targetAmount: 100 }];

      render(<SavingsGoals {...defaultProps} savingsGoals={goals} unassignedCash={100} />);

      const distributeButton = screen.getByText(/Distribute Cash/i);
      await userEvent.click(distributeButton);

      expect(mockOpenDistributeModal).toHaveBeenCalled();
    });
  });

  describe("Modal States", () => {
    it("should show AddEditModal when isAddEditModalOpen is true", async () => {
      useSavingsGoalsActions.mockReturnValue({
        showDistributeModal: false,
        editingGoal: null,
        handleGoalSubmit: vi.fn(),
        handleEditGoal: vi.fn(),
        handleDeleteGoal: vi.fn(),
        handleDistribute: vi.fn(),
        openAddForm: vi.fn(),
        openDistributeModal: vi.fn(),
        handleCloseModals: vi.fn(),
        isAddEditModalOpen: true,
      });

      render(<SavingsGoals {...defaultProps} />);

      expect(screen.getByTestId("add-edit-modal")).toBeInTheDocument();
    });

    it("should show DistributeModal when showDistributeModal is true", async () => {
      useSavingsGoalsActions.mockReturnValue({
        showDistributeModal: true,
        editingGoal: null,
        handleGoalSubmit: vi.fn(),
        handleEditGoal: vi.fn(),
        handleDeleteGoal: vi.fn(),
        handleDistribute: vi.fn(),
        openAddForm: vi.fn(),
        openDistributeModal: vi.fn(),
        handleCloseModals: vi.fn(),
        isAddEditModalOpen: false,
      });

      render(<SavingsGoals {...defaultProps} />);

      expect(screen.getByTestId("distribute-modal")).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should handle missing savingsGoals prop", () => {
      render(<SavingsGoals {...defaultProps} savingsGoals={undefined} />);

      expect(screen.getByText(/No savings goals yet/i)).toBeInTheDocument();
    });

    it("should handle missing unassignedCash prop", () => {
      render(<SavingsGoals {...defaultProps} unassignedCash={undefined} />);

      expect(screen.getByTestId("savings-summary")).toBeInTheDocument();
    });
  });

  describe("Props Passing", () => {
    it("should pass correct props to useSavingsGoalsActions hook", async () => {
      render(<SavingsGoals {...defaultProps} />);

      expect(useSavingsGoalsActions).toHaveBeenCalledWith({
        onAddGoal: mockOnAddGoal,
        onUpdateGoal: mockOnUpdateGoal,
        onDeleteGoal: mockOnDeleteGoal,
        onDistributeToGoals: mockOnDistributeToGoals,
      });
    });
  });
});
