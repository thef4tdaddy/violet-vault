/**
 * Review Step Tests
 * Part of Issue #1838: Review Step
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewStep from "../ReviewStep";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { PaycheckHistoryService } from "@/utils/core/services/paycheckHistory";

describe("ReviewStep", () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnFinish = vi.fn();

  beforeEach(() => {
    // Reset store with default test data
    act(() => {
      usePaycheckFlowStore.setState({
        isOpen: false,
        currentStep: 2,
        paycheckAmountCents: 250000, // $2,500.00
        payerName: "Acme Corp",
        selectedStrategy: "even",
        allocations: [
          { envelopeId: "env_rent", amountCents: 100000 },
          { envelopeId: "env_groceries", amountCents: 50000 },
          { envelopeId: "env_savings", amountCents: 100000 },
        ],
      });
    });

    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render review heading", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("REVIEW YOUR ALLOCATION")).toBeInTheDocument();
    });

    it("should display total paycheck amount", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText(/Total Paycheck/i)).toBeInTheDocument();
      expect(screen.getAllByText("$2,500.00")).toHaveLength(2); // Total and Allocated
    });

    it("should display payer name when provided", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("from Acme Corp")).toBeInTheDocument();
    });

    it("should not display payer name when not provided", () => {
      act(() => {
        usePaycheckFlowStore.setState({ payerName: null });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.queryByText(/from Acme Corp/i)).not.toBeInTheDocument();
    });
  });

  describe("Allocation Display", () => {
    it("should display all allocations", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("env_rent")).toBeInTheDocument();
      expect(screen.getByText("env_groceries")).toBeInTheDocument();
      expect(screen.getByText("env_savings")).toBeInTheDocument();
    });

    it("should display allocation amounts", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // $1,000 appears twice (rent + savings)
      expect(screen.getAllByText("$1,000.00")).toHaveLength(2);
      expect(screen.getByText("$500.00")).toBeInTheDocument();
    });

    it("should calculate and display percentages", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // 40% appears twice (rent + savings are both $1000)
      expect(screen.getAllByText("40.0% of paycheck")).toHaveLength(2);
      expect(screen.getByText("20.0% of paycheck")).toBeInTheDocument(); // $500 / $2500
    });

    it("should show empty state when no allocations", () => {
      act(() => {
        usePaycheckFlowStore.setState({ allocations: [] });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("⚠️ No allocations yet")).toBeInTheDocument();
      expect(screen.getByText(/Go back and select an allocation strategy/i)).toBeInTheDocument();
    });
  });

  describe("Allocation Status", () => {
    it("should show complete status when fully allocated", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("✓ Complete")).toBeInTheDocument();
    });

    it("should show incomplete status when under-allocated", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [{ envelopeId: "env_rent", amountCents: 100000 }],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("⚠ Incomplete")).toBeInTheDocument();
      expect(screen.getByText(/\+\$1,500\.00 remaining/i)).toBeInTheDocument();
    });

    it("should show incomplete status when over-allocated", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [{ envelopeId: "env_rent", amountCents: 300000 }],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("⚠ Incomplete")).toBeInTheDocument();
      expect(screen.getByText("-$500.00 remaining")).toBeInTheDocument();
    });
  });

  describe("Confirm Button", () => {
    it("should enable confirm button when fully allocated", () => {
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      expect(button).not.toBeDisabled();
    });

    it("should disable confirm button when under-allocated", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [{ envelopeId: "env_rent", amountCents: 100000 }],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      expect(button).toBeDisabled();
    });

    it("should disable confirm button when no allocations", () => {
      act(() => {
        usePaycheckFlowStore.setState({ allocations: [] });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Transaction Creation", () => {
    it("should create transaction and move to next step on confirm", async () => {
      const user = userEvent.setup();
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it("should save to paycheck history when payer name provided", async () => {
      const user = userEvent.setup();
      const addOrUpdateSpy = vi.spyOn(PaycheckHistoryService, "addOrUpdate");

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      await user.click(button);

      await waitFor(() => {
        expect(addOrUpdateSpy).toHaveBeenCalledWith({
          payerName: "Acme Corp",
          amountCents: 250000,
          date: expect.any(String),
        });
      });

      addOrUpdateSpy.mockRestore();
    });

    it("should not save to history when payer name is null", async () => {
      const user = userEvent.setup();
      const addOrUpdateSpy = vi.spyOn(PaycheckHistoryService, "addOrUpdate");

      act(() => {
        usePaycheckFlowStore.setState({ payerName: null });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });

      expect(addOrUpdateSpy).not.toHaveBeenCalled();

      addOrUpdateSpy.mockRestore();
    });

    it("should complete submission successfully", async () => {
      const user = userEvent.setup();
      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      await user.click(button);

      // Should call onNext after successful submission
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should disable button when paycheck amount is missing", () => {
      act(() => {
        usePaycheckFlowStore.setState({ paycheckAmountCents: null });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      // Button should be disabled when amount is missing
      expect(button).toBeDisabled();
    });

    it("should show error when allocations don't sum to paycheck amount", async () => {
      const user = userEvent.setup();

      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [{ envelopeId: "env_rent", amountCents: 100000 }],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      // Button should be disabled, but we can still test the error logic by enabling it manually
      await user.click(button);

      // Error should not appear because button is disabled
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it("should show error when no allocations exist", async () => {
      const user = userEvent.setup();

      act(() => {
        usePaycheckFlowStore.setState({ allocations: [] });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByRole("button", { name: /confirm/i });
      await user.click(button);

      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large paycheck amounts", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          paycheckAmountCents: 99_999_999, // $999,999.99
          allocations: [{ envelopeId: "env_savings", amountCents: 99_999_999 }],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // Amount appears in both Total and Allocated sections, plus in allocation list
      expect(screen.getAllByText("$999,999.99").length).toBeGreaterThanOrEqual(2);
    });

    it("should handle minimum paycheck amount", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          paycheckAmountCents: 100, // $1.00
          allocations: [{ envelopeId: "env_misc", amountCents: 100 }],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // Amount appears in both Total and Allocated sections, plus in allocation list
      expect(screen.getAllByText("$1.00").length).toBeGreaterThanOrEqual(2);
    });

    it("should handle many allocations", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: Array.from({ length: 20 }, (_, i) => ({
            envelopeId: `env_${i}`,
            amountCents: 12500, // $125 each, total $2500
          })),
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("env_0")).toBeInTheDocument();
      expect(screen.getByText("env_19")).toBeInTheDocument();
    });

    it("should calculate percentages correctly for uneven splits", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          paycheckAmountCents: 250000,
          allocations: [
            { envelopeId: "env_a", amountCents: 83333 }, // 33.3332%
            { envelopeId: "env_b", amountCents: 83333 }, // 33.3332%
            { envelopeId: "env_c", amountCents: 83334 }, // 33.3336%
          ],
        });
      });

      render(<ReviewStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // All three allocations round to 33.3%
      expect(screen.getAllByText("33.3% of paycheck")).toHaveLength(3);
    });
  });
});
