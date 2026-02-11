import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AddBillModal from "../AddBillModal";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBillForm } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillForm";

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

vi.mock("@/hooks/core/auth/security/useEditLock", () => ({
  default: vi.fn(() => ({
    isLocked: false,
    isOwnLock: false,
    canEdit: true,
    lock: vi.fn(),
    breakLock: vi.fn(),
  })),
}));

vi.mock("@/hooks/platform/common/useMobileDetection", () => ({
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
  default: ({ isLocked }: { isLocked: boolean }) =>
    isLocked ? <div data-testid="edit-lock-indicator">Locked</div> : null,
}));

vi.mock("@/components/primitives/modals/FormModal", () => ({
  default: ({
    isOpen,
    onClose,
    children,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
  }) =>
    isOpen ? (
      <div data-testid="form-modal">
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../BillFormFields", () => ({
  default: ({ formData, updateField }: { formData: any; updateField: any }) => (
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
  default: ({
    isOpen,
    onClose,
    children,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
  }) =>
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
      expect(screen.queryByTestId("form-modal")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("form-modal")).toBeInTheDocument();
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
      expect(screen.getByTestId("form-modal")).toBeInTheDocument();
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

    it("should update name field when user types", async () => {
      const mockUpdateField = vi.fn();
      vi.mocked(useBillForm).mockReturnValue({
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
        categories: ["Utilities"],
        handleSubmit: vi.fn(),
        updateField: mockUpdateField,
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);

      const nameInput = screen.getByTestId("bill-name-input");
      await userEvent.type(nameInput, "Electric Bill");

      expect(mockUpdateField).toHaveBeenCalled();
    });

    it("should update amount field when user types", async () => {
      const mockUpdateField = vi.fn();
      vi.mocked(useBillForm).mockReturnValue({
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
        categories: ["Utilities"],
        handleSubmit: vi.fn(),
        updateField: mockUpdateField,
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);

      const amountInput = screen.getByTestId("bill-amount-input");
      await userEvent.type(amountInput, "150.50");

      expect(mockUpdateField).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null editingBill", () => {
      renderWithQuery(<AddBillModal {...defaultProps} editingBill={null} />);
      expect(screen.getByText("Add Bill")).toBeInTheDocument();
    });

    it("should handle undefined editingBill", () => {
      renderWithQuery(<AddBillModal {...defaultProps} editingBill={undefined} />);
      expect(screen.getByText("Add Bill")).toBeInTheDocument();
    });

    it("should handle submitting state", () => {
      vi.mocked(useBillForm).mockReturnValue({
        formData: {
          name: "Test Bill",
          amount: "100",
          dueDate: "2024-01-15",
          frequency: "monthly",
          category: "Utilities",
          iconName: "Zap",
        },
        isSubmitting: true,
        suggestedIconName: "DollarSign",
        iconSuggestions: [],
        categories: ["Utilities"],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("form-modal")).toBeInTheDocument();
    });

    it("should handle empty form data", () => {
      vi.mocked(useBillForm).mockReturnValue({
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
        categories: [],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-name-input")).toHaveValue("");
    });

    it("should handle pre-filled form data when editing", () => {
      const editingBill = {
        id: "1",
        name: "Rent",
        amount: 1500,
        dueDate: "2024-01-01",
        frequency: "monthly",
        category: "Housing",
      };

      vi.mocked(useBillForm).mockReturnValue({
        formData: {
          name: "Rent",
          amount: "1500",
          dueDate: "2024-01-01",
          frequency: "monthly",
          category: "Housing",
          iconName: "Home",
        },
        isSubmitting: false,
        suggestedIconName: "Home",
        iconSuggestions: [],
        categories: ["Housing"],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} editingBill={editingBill} />);
      expect(screen.getByText("Edit Bill")).toBeInTheDocument();
      expect(screen.getByTestId("bill-name-input")).toHaveValue("Rent");
    });

    it("should handle large amount values", () => {
      vi.mocked(useBillForm).mockReturnValue({
        formData: {
          name: "Big Bill",
          amount: "999999.99",
          dueDate: "2024-01-15",
          frequency: "monthly",
          category: "Other",
          iconName: "DollarSign",
        },
        isSubmitting: false,
        suggestedIconName: "DollarSign",
        iconSuggestions: [],
        categories: ["Other"],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-amount-input")).toHaveValue("999999.99");
    });

    it("should handle very long bill names", () => {
      const longName = "A".repeat(100);
      vi.mocked(useBillForm).mockReturnValue({
        formData: {
          name: longName,
          amount: "100",
          dueDate: "2024-01-15",
          frequency: "monthly",
          category: "Utilities",
          iconName: "Zap",
        },
        isSubmitting: false,
        suggestedIconName: "Zap",
        iconSuggestions: [],
        categories: ["Utilities"],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-name-input")).toHaveValue(longName);
    });

    it("should handle special characters in bill name", () => {
      const specialName = "Rent & Utilities (Main)";
      vi.mocked(useBillForm).mockReturnValue({
        formData: {
          name: specialName,
          amount: "1200",
          dueDate: "2024-01-15",
          frequency: "monthly",
          category: "Housing",
          iconName: "Home",
        },
        isSubmitting: false,
        suggestedIconName: "Home",
        iconSuggestions: [],
        categories: ["Housing"],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      } as any);

      renderWithQuery(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-name-input")).toHaveValue(specialName);
    });
  });
});
