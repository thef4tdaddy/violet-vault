import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";

// Mock all hooks and services BEFORE importing component
vi.mock("@/hooks/budgeting/envelopes/useEnvelopeForm");
vi.mock("@/hooks/platform/common/useMobileDetection");
vi.mock("@/hooks/platform/ux/useModalAutoScroll");

// Now import component and mocked modules
import CreateEnvelopeModal from "../CreateEnvelopeModal";
import useEnvelopeForm from "@/hooks/budgeting/envelopes/useEnvelopeForm";
import { useMobileDetection } from "@/hooks/platform/common/useMobileDetection";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

// Get mocked functions
const mockUseEnvelopeForm = vi.mocked(useEnvelopeForm);
const mockUseMobileDetection = vi.mocked(useMobileDetection);
const mockUseModalAutoScroll = vi.mocked(useModalAutoScroll);

// Mock child components
vi.mock("../CreateEnvelopeModalComponents", () => ({
  ModalContent: ({
    onCancel,
    onSubmit,
    onBillSelection,
    allBills,
  }: {
    onCancel: (event: any) => void;
    onSubmit: (event: any) => void;
    onBillSelection: (id: string) => void;
    allBills: any[];
  }) => (
    <div data-testid="modal-content">
      <button onClick={onCancel} data-testid="cancel-button">
        Cancel
      </button>
      <button onClick={onSubmit} data-testid="submit-button">
        Create
      </button>
      <div data-testid="bill-list">
        {allBills.map((bill) => (
          <button
            key={bill.id}
            data-testid={`bill-${bill.id}`}
            onClick={() => onBillSelection(bill.id)}
          >
            {bill.name}
          </button>
        ))}
      </div>
    </div>
  ),
  DesktopModalHeader: ({ onClose }: { onClose: (event: any) => void }) => (
    <div data-testid="desktop-modal-header">
      <button onClick={onClose} data-testid="header-close-button">
        Close
      </button>
    </div>
  ),
}));

vi.mock("@/components/mobile/SlideUpModal", () => ({
  default: ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: (event: any) => void;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="slide-up-modal">
        <h3>{title}</h3>
        <button onClick={onClose} data-testid="slide-up-close-button">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

describe("CreateEnvelopeModal", () => {
  const mockOnClose = vi.fn();
  const mockOnCreateEnvelope = vi.fn();
  const mockOnCreateBill = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onCreateEnvelope: mockOnCreateEnvelope,
    onCreateBill: mockOnCreateBill,
    existingEnvelopes: [],
    allBills: [],
    currentUser: { userName: "User", userColor: "#a855f7" },
  };

  const defaultMockReturn = {
    formData: {
      name: "",
      monthlyAmount: "",
      currentBalance: "",
      category: "essential",
      color: "#4CAF50",
      frequency: "monthly",
      description: "",
      priority: "medium",
      autoAllocate: true,
      icon: "Target",
      envelopeType: "variable",
      monthlyBudget: "",
      biweeklyAllocation: "",
      targetAmount: "",
    },
    errors: {},
    isLoading: false,
    canSubmit: true,
    calculatedAmounts: {
      monthlyAmount: 0,
      biweeklyAllocation: 0,
      monthlyBudget: 0,
      targetAmount: 0,
      currentBalance: 0,
      annualAmount: 0,
      weeklyAmount: 0,
      frequencyMultiplier: 12,
    },
    updateFormField: vi.fn(),
    updateFormData: vi.fn(),
    handleSubmit: vi.fn(),
    handleClose: vi.fn(),
    resetForm: vi.fn(),
    validateForm: vi.fn(),
    isDirty: false,
    hasRequiredFields: false,
    isEditing: false,
    envelopeId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseMobileDetection.mockReturnValue(false);
    mockUseModalAutoScroll.mockReturnValue({ current: null } as any);
    mockUseEnvelopeForm.mockReturnValue(defaultMockReturn as any);
  });

  it("should not render when isOpen is false", () => {
    render(<CreateEnvelopeModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
  });

  it("should render desktop modal when not mobile", () => {
    mockUseMobileDetection.mockReturnValue(false);
    render(<CreateEnvelopeModal {...defaultProps} />);
    expect(screen.getByTestId("desktop-modal-header")).toBeInTheDocument();
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("should render mobile modal when mobile", () => {
    mockUseMobileDetection.mockReturnValue(true);
    render(<CreateEnvelopeModal {...defaultProps} />);
    expect(screen.getByTestId("slide-up-modal")).toBeInTheDocument();
    expect(screen.getByText("Create Envelope")).toBeInTheDocument();
  });

  it("should call handleClose when cancel button is clicked", async () => {
    const mockHandleClose = vi.fn();
    mockUseEnvelopeForm.mockReturnValue({
      ...defaultMockReturn,
      handleClose: mockHandleClose,
    } as any);

    render(<CreateEnvelopeModal {...defaultProps} />);
    await userEvent.click(screen.getByTestId("cancel-button"));
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it("should call handleSubmit when submit button is clicked", async () => {
    const mockHandleSubmit = vi.fn();
    mockUseEnvelopeForm.mockReturnValue({
      ...defaultMockReturn,
      handleSubmit: mockHandleSubmit,
    } as any);

    render(<CreateEnvelopeModal {...defaultProps} />);
    await userEvent.click(screen.getByTestId("submit-button"));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should call onCreateEnvelope when useEnvelopeForm's onSave is triggered", async () => {
    render(<CreateEnvelopeModal {...defaultProps} />);

    // Extract the onSave prop passed to the hook
    const onSaveProp = mockUseEnvelopeForm.mock.calls[0][0].onSave;
    await onSaveProp({ name: "New Env" });

    expect(mockOnCreateEnvelope).toHaveBeenCalledWith({ name: "New Env" });
  });

  it("should update form data when a bill is selected", async () => {
    const mockUpdateFormData = vi.fn();
    mockUseEnvelopeForm.mockReturnValue({
      ...defaultMockReturn,
      updateFormData: mockUpdateFormData,
    } as any);

    const bills = [{ id: "bill-1", name: "Electric", amount: 100 }];
    render(<CreateEnvelopeModal {...defaultProps} allBills={bills} />);

    await userEvent.click(screen.getByTestId("bill-bill-1"));

    expect(mockUpdateFormData).toHaveBeenCalled();
  });

  it("should render correctly with _forceMobileMode", () => {
    render(<CreateEnvelopeModal {...defaultProps} _forceMobileMode={true} />);
    expect(screen.getByTestId("slide-up-modal")).toBeInTheDocument();
  });
});
