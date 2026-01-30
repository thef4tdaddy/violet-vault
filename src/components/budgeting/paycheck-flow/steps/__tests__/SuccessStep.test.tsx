/**
 * Success Step Tests
 * Part of Issue #161: Success Step
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuccessStep from "../SuccessStep";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";

describe("SuccessStep", () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnFinish = vi.fn();

  beforeEach(() => {
    // Reset store with default test data
    act(() => {
      usePaycheckFlowStore.setState({
        isOpen: false,
        currentStep: 3,
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

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render success heading", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("PAYCHECK ALLOCATED!")).toBeInTheDocument();
    });

    it("should display success icon", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should display total paycheck amount in message", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText(/Your \$2,500\.00 paycheck/i)).toBeInTheDocument();
    });

    it("should display payer name in message when provided", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText(/from Acme Corp/i)).toBeInTheDocument();
    });

    it("should not display payer name when not provided", () => {
      act(() => {
        usePaycheckFlowStore.setState({ payerName: null });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.queryByText(/from Acme Corp/i)).not.toBeInTheDocument();
    });
  });

  describe("Summary Statistics", () => {
    it("should display correct number of envelopes funded", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("Envelopes Funded")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument(); // 3 allocations
    });

    it("should display total allocated amount", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("Total Allocated")).toBeInTheDocument();
      // Amount appears in multiple places (summary card and message)
      expect(screen.getAllByText("$2,500.00").length).toBeGreaterThanOrEqual(1);
    });

    it("should update envelopes count when allocations change", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [
            { envelopeId: "env_a", amountCents: 50000 },
            { envelopeId: "env_b", amountCents: 50000 },
            { envelopeId: "env_c", amountCents: 50000 },
            { envelopeId: "env_d", amountCents: 50000 },
            { envelopeId: "env_e", amountCents: 50000 },
          ],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("5")).toBeInTheDocument(); // 5 envelopes
    });
  });

  describe("Allocations Display", () => {
    it("should display allocation list heading", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("YOUR ALLOCATIONS")).toBeInTheDocument();
    });

    it("should display all allocations", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("env_rent")).toBeInTheDocument();
      expect(screen.getByText("env_groceries")).toBeInTheDocument();
      expect(screen.getByText("env_savings")).toBeInTheDocument();
    });

    it("should display allocation amounts", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // $1,000 appears twice (rent + savings)
      expect(screen.getAllByText("$1,000.00")).toHaveLength(2);
      expect(screen.getByText("$500.00")).toBeInTheDocument();
    });

    it("should display allocation percentages", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // 40% appears twice (rent + savings are both $1000 / $2500)
      expect(screen.getAllByText("40.0% of paycheck")).toHaveLength(2);
      expect(screen.getByText("20.0% of paycheck")).toBeInTheDocument(); // groceries
    });

    it("should sort allocations by amount (largest first)", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [
            { envelopeId: "env_small", amountCents: 10000 },
            { envelopeId: "env_large", amountCents: 150000 },
            { envelopeId: "env_medium", amountCents: 90000 },
          ],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const allocations = screen.getAllByText(/env_/);
      expect(allocations[0]).toHaveTextContent("env_large");
      expect(allocations[1]).toHaveTextContent("env_medium");
      expect(allocations[2]).toHaveTextContent("env_small");
    });

    it("should limit to top 5 allocations when more exist", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: Array.from({ length: 10 }, (_, i) => ({
            envelopeId: `env_${i}`,
            amountCents: 25000, // $250 each
          })),
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const allocations = screen.getAllByText(/env_\d/);
      expect(allocations.length).toBeLessThanOrEqual(5); // Should show max 5
    });

    it("should not render allocations section when no allocations", () => {
      act(() => {
        usePaycheckFlowStore.setState({ allocations: [] });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.queryByText("YOUR ALLOCATIONS")).not.toBeInTheDocument();
    });
  });

  describe("Finish Button", () => {
    it("should render back to dashboard button", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByText(/✓ BACK TO DASHBOARD/i);
      expect(button).toBeInTheDocument();
    });

    it("should call onFinish when button clicked", async () => {
      const user = userEvent.setup();
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByText(/✓ BACK TO DASHBOARD/i);
      await user.click(button);

      expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it("should reset store when finish button clicked", async () => {
      const user = userEvent.setup();
      const resetSpy = vi.spyOn(usePaycheckFlowStore.getState(), "reset");

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const button = screen.getByText(/✓ BACK TO DASHBOARD/i);
      await user.click(button);

      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(mockOnFinish).toHaveBeenCalledTimes(1);

      resetSpy.mockRestore();
    });
  });

  describe("Currency Formatting", () => {
    it("should format large amounts with commas", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          paycheckAmountCents: 123456789, // $1,234,567.89
          allocations: [{ envelopeId: "env_test", amountCents: 123456789 }],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // Amount appears in multiple places (message and cards)
      expect(screen.getAllByText("$1,234,567.89").length).toBeGreaterThanOrEqual(1);
    });

    it("should format small amounts correctly", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          paycheckAmountCents: 100, // $1.00
          allocations: [{ envelopeId: "env_test", amountCents: 100 }],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getAllByText("$1.00").length).toBeGreaterThanOrEqual(1);
    });

    it("should handle zero amounts", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          paycheckAmountCents: 0,
          allocations: [],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // $0.00 appears in multiple places
      expect(screen.getAllByText("$0.00").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null paycheck amount", () => {
      act(() => {
        usePaycheckFlowStore.setState({ paycheckAmountCents: null });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // Should display $0.00 as fallback (appears in multiple places)
      expect(screen.getAllByText("$0.00").length).toBeGreaterThanOrEqual(1);
    });

    it("should handle single allocation", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [{ envelopeId: "env_only", amountCents: 250000 }],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText("1")).toBeInTheDocument(); // 1 envelope
      expect(screen.getByText("env_only")).toBeInTheDocument();
      expect(screen.getByText("100.0% of paycheck")).toBeInTheDocument();
    });

    it("should handle very long envelope names", () => {
      act(() => {
        usePaycheckFlowStore.setState({
          allocations: [
            {
              envelopeId: "env_this_is_a_very_long_envelope_name_that_might_wrap",
              amountCents: 250000,
            },
          ],
        });
      });

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(
        screen.getByText("env_this_is_a_very_long_envelope_name_that_might_wrap")
      ).toBeInTheDocument();
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

      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      // All three should round to 33.3%
      expect(screen.getAllByText("33.3% of paycheck")).toHaveLength(3);
    });
  });

  describe("Success Message", () => {
    it("should display celebration emoji", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText(/🎉/)).toBeInTheDocument();
    });

    it("should display success confirmation message", () => {
      render(<SuccessStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText(/Your envelopes have been updated successfully!/i)).toBeInTheDocument();
    });
  });
});
