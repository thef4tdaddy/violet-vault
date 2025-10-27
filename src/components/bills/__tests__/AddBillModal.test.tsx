import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import AddBillModal from "../AddBillModal";
import userEvent from "@testing-library/user-event";
import useBillFormOriginal from "@/hooks/bills/useBillForm";
import useEditLockOriginal from "@/hooks/common/useEditLock";
import { useMobileDetectionOriginal } from "@/hooks/ui/useMobileDetection";
import { useAuthManagerOriginal } from "@/hooks/auth/useAuthManager";

// Mock all hooks
vi.mock("@/hooks/bills/useBillForm", () => ({
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

vi.mock("@/hooks/auth/useAuthManager", () => ({
  useAuthManager: vi.fn(() => ({
    securityContext: { budgetId: "test-budget" },
    user: { id: "test-user", name: "Test User" },
  })),
}));

vi.mock("@/services/editLockService", () => ({
  initializeEditLocks: vi.fn(),
}));

// Mock child components
vi.mock("../ui/EditLockIndicator", () => ({
  default: ({ isLocked }) =>
    isLocked ? <div data-testid="edit-lock-indicator">Locked</div> : null,
}));

vi.mock("../BillModalHeader", () => ({
  default: ({ title, onClose, onSubmit }) => (
    <div data-testid="bill-modal-header">
      <h2>{title}</h2>
      <button onClick={onClose}>Close</button>
      <button onClick={onSubmit}>Submit</button>
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

const useBillForm = useBillFormOriginal as unknown as Mock;
const useEditLock = useEditLockOriginal as unknown as Mock;
const useMobileDetection = useMobileDetectionOriginal as unknown as Mock;
const useAuthManager = useAuthManagerOriginal as unknown as Mock;

describe("AddBillModal", () => {
  const mockOnClose = vi.fn();
  const mockOnAddBill = vi.fn();
  const mockOnUpdateBill = vi.fn();
  const mockOnDeleteBill = vi.fn();
  const mockOnError = vi.fn();

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
  });

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<AddBillModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId("bill-modal-header")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-modal-header")).toBeInTheDocument();
    });

    it("should display Add Bill title for new bills", () => {
      render(<AddBillModal {...defaultProps} />);
      expect(screen.getByText("Add Bill")).toBeInTheDocument();
    });

    it("should display Edit Bill title when editing", () => {
      const editingBill = {
        id: "1",
        name: "Test Bill",
        amount: 100,
        dueDate: "2024-01-15",
      };

      render(<AddBillModal {...defaultProps} editingBill={editingBill} />);
      expect(screen.getByText("Edit Bill")).toBeInTheDocument();
    });

    it("should render form fields", () => {
      render(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-form-fields")).toBeInTheDocument();
    });

    it("should render modal header", () => {
      render(<AddBillModal {...defaultProps} />);
      expect(screen.getByTestId("bill-modal-header")).toBeInTheDocument();
    });
  });

  describe("Mobile Mode", () => {
    it("should render SlideUpModal on mobile", () => {
      useMobileDetection.mockReturnValue(true);

      render(<AddBillModal {...defaultProps} />);

      expect(screen.getByTestId("slide-up-modal")).toBeInTheDocument();
    });

    it("should not render SlideUpModal on desktop", () => {
      useMobileDetection.mockReturnValue(false);

      render(<AddBillModal {...defaultProps} />);

      expect(screen.queryByTestId("slide-up-modal")).not.toBeInTheDocument();
    });
  });

  describe("Form Handling", () => {
    it("should initialize useBillForm hook with correct props", () => {
      render(<AddBillModal {...defaultProps} />);

      expect(useBillForm).toHaveBeenCalledWith({
        editingBill: null,
        onAddBill: mockOnAddBill,
        onUpdateBill: mockOnUpdateBill,
        onDeleteBill: mockOnDeleteBill,
        onClose: mockOnClose,
        onError: mockOnError,
      });
    });

    it("should call resetForm when modal opens", () => {
      const mockResetForm = vi.fn();

      useBillForm.mockReturnValue({
        formData: {},
        isSubmitting: false,
        suggestedIconName: "",
        iconSuggestions: [],
        categories: [],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: mockResetForm,
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      });

      const { rerender } = render(<AddBillModal {...defaultProps} isOpen={false} />);
      
      rerender(<AddBillModal {...defaultProps} isOpen={true} />);

      expect(mockResetForm).toHaveBeenCalled();
    });

    it("should call handleSubmit when submit button is clicked", async () => {
      const mockHandleSubmit = vi.fn();

      useBillForm.mockReturnValue({
        formData: {},
        isSubmitting: false,
        suggestedIconName: "",
        iconSuggestions: [],
        categories: [],
        handleSubmit: mockHandleSubmit,
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      });

      render(<AddBillModal {...defaultProps} />);

      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("should call onClose when close button is clicked", async () => {
      render(<AddBillModal {...defaultProps} />);

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Edit Locking", () => {
    it("should not use edit lock for new bills", () => {
      render(<AddBillModal {...defaultProps} editingBill={null} />);

      expect(useEditLock).toHaveBeenCalledWith(null, null, expect.any(Object));
    });

    it("should use edit lock when editing existing bill", () => {
      const editingBill = {
        id: "test-bill-1",
        name: "Test Bill",
        amount: 100,
      };

      render(<AddBillModal {...defaultProps} editingBill={editingBill} />);

      expect(useEditLock).toHaveBeenCalledWith("bill", "test-bill-1", {
        autoAcquire: true,
        autoRelease: true,
        showToasts: true,
      });
    });

    it("should show edit lock indicator when locked", () => {
      useEditLock.mockReturnValue({
        isLocked: true,
        isOwnLock: false,
        canEdit: false,
        lock: vi.fn(),
        breakLock: vi.fn(),
      });

      const editingBill = { id: "1", name: "Test Bill", amount: 100 };

      render(<AddBillModal {...defaultProps} editingBill={editingBill} />);

      expect(screen.getByTestId("edit-lock-indicator")).toBeInTheDocument();
    });

    it("should not show edit lock indicator when not locked", () => {
      useEditLock.mockReturnValue({
        isLocked: false,
        isOwnLock: false,
        canEdit: true,
        lock: vi.fn(),
        breakLock: vi.fn(),
      });

      render(<AddBillModal {...defaultProps} />);

      expect(
        screen.queryByTestId("edit-lock-indicator")
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Fields", () => {
    it("should pass formData to BillFormFields", () => {
      const mockFormData = {
        name: "Test Bill",
        amount: "100",
        dueDate: "2024-01-15",
        frequency: "monthly",
        category: "Utilities",
        iconName: "DollarSign",
      };

      useBillForm.mockReturnValue({
        formData: mockFormData,
        isSubmitting: false,
        suggestedIconName: "",
        iconSuggestions: [],
        categories: [],
        handleSubmit: vi.fn(),
        updateField: vi.fn(),
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      });

      render(<AddBillModal {...defaultProps} />);

      const nameInput = screen.getByTestId("bill-name-input");
      expect(nameInput).toHaveValue("Test Bill");

      const amountInput = screen.getByTestId("bill-amount-input");
      expect(amountInput).toHaveValue("100");
    });

    it("should call updateField when form fields change", async () => {
      const mockUpdateField = vi.fn();

      useBillForm.mockReturnValue({
        formData: { name: "", amount: "" },
        isSubmitting: false,
        suggestedIconName: "",
        iconSuggestions: [],
        categories: [],
        handleSubmit: vi.fn(),
        updateField: mockUpdateField,
        resetForm: vi.fn(),
        calculateBiweeklyAmount: vi.fn(),
        calculateMonthlyAmount: vi.fn(),
        getNextDueDate: vi.fn(),
      });

      render(<AddBillModal {...defaultProps} />);

      const nameInput = screen.getByTestId("bill-name-input");
      await userEvent.type(nameInput, "New Bill");

      expect(mockUpdateField).toHaveBeenCalledWith("name", expect.any(String));
    });
  });
});
