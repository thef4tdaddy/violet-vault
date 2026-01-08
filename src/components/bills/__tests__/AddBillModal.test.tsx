import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AddBillModal from "../AddBillModal";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all hooks with default exports where needed
vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBillForm", () => ({
  useBillForm: vi.fn(() => ({
    formData: {
      name: "",
      amount: "",
      dueDate: "",
      frequency: "monthly",
      category: "",
      iconName: "",
    },
    isSubmitting: false,
    suggestedIconName: "DollarSign",
    iconSuggestions: [],
    categories: ["Utilities", "Housing", "Transportation"],
    handleSubmit: vi.fn(),
    updateField: vi.fn(),
    resetForm: vi.fn(),
    calculateBiweeklyAmount: vi.fn(),
    calculateMonthlyAmount: vi.fn(),
    getNextDueDate: vi.fn(),
  })),
}));

vi.mock("@/hooks/common/useEditLock", () => ({
  default: vi.fn(() => ({
    isLocked: false,
    isOwnLock: false,
    canEdit: true,
    lock: vi.fn(),
    breakLock: vi.fn(),
  })),
}));

vi.mock("@/hooks/ui/useMobileDetection", () => ({
  useMobileDetection: vi.fn(() => false),
}));

vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(() => ({
    budgetId: "test-budget",
    user: { id: "test-user", name: "Test User" },
  })),
}));

vi.mock("@/services/sync/editLockService", () => ({
  initializeEditLocks: vi.fn(),
}));

// Mock child components
vi.mock("../ui/EditLockIndicator", () => ({
  default: ({ isLocked }) =>
    isLocked ? <div data-testid="edit-lock-indicator">Locked</div> : null,
}));

vi.mock("../BillModalHeader", () => ({
  default: ({ editingBill, onClose }) => (
    <div data-testid="bill-modal-header">
      <h2>{editingBill ? "Edit Bill" : "Add Bill"}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock("../BillFormFields", () => ({
  default: ({ formData, updateField }) => (
    <div data-testid="bill-form-fields">
      <input
        data-testid="bill-name-input"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
      />
      <input
        data-testid="bill-amount-input"
        value={formData.amount}
        onChange={(e) => updateField("amount", e.target.value)}
      />
    </div>
  ),
}));

vi.mock("../mobile/SlideUpModal", () => ({
  default: ({ isOpen, onClose, children, title }) =>
    isOpen ? (
      <div data-testid="slide-up-modal">
        <h3>{title}</h3>
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    ) : null,
}));

describe("AddBillModal", () => {
  const mockOnClose = vi.fn();
  const mockOnAddBill = vi.fn();
  const mockOnUpdateBill = vi.fn();
  const mockOnDeleteBill = vi.fn();
  const mockOnError = vi.fn();
  let queryClient: QueryClient;

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onAddBill: mockOnAddBill,
    onUpdateBill: mockOnUpdateBill,
    onDeleteBill: mockOnDeleteBill,
    onError: mockOnError,
    editingBill: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithQuery = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      renderWithQuery(<AddBillModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId("bill-modal-header")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-modal-header")).toBeInTheDocument();
    });

    it("should display Add Bill title for new bills", () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByText("Add Bill")).toBeInTheDocument();
    });

    it("should display Edit Bill title when editing", () => {
      const editingBill = {
        id: "1",
        name: "Test Bill",
        amount: 100,
        dueDate: "2024-01-15",
      };

      renderWithQuery(<AddBillModal {...defaultProps} editingBill={editingBill} />);
      expect(screen.getByText("Edit Bill")).toBeInTheDocument();
    });

    it("should render form fields", () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-form-fields")).toBeInTheDocument();
    });

    it("should render modal header", () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-modal-header")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Form Fields", () => {
    it("should render name and amount inputs", () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);

      expect(screen.getByTestId("bill-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("bill-amount-input")).toBeInTheDocument();
    });
  });
});
