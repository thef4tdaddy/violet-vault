/**
 * Amount Entry Step Tests
 * Part of Issue #1837: Amount Entry Step
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmountEntryStep from "../AmountEntryStep";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import {
  PaycheckHistoryService,
  type PaycheckHistoryEntry,
} from "@/utils/core/services/paycheckHistory";

describe("AmountEntryStep", () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnFinish = vi.fn();

  beforeEach(() => {
    // Reset store
    act(() => {
      usePaycheckFlowStore.setState({
        isOpen: false,
        currentStep: 0,
        paycheckAmountCents: null,
        payerName: null,
        selectedStrategy: null,
        allocations: [],
      });
    });

    // Clear localStorage and mocks
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render payer name input", () => {
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByLabelText(/who paid you/i)).toBeInTheDocument();
    });

    it("should render amount input", () => {
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByLabelText(/paycheck amount/i)).toBeInTheDocument();
    });

    it("should auto-focus payer name input on mount", async () => {
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      await waitFor(() => {
        const payerInput = screen.getByLabelText(/who paid you/i);
        expect(document.activeElement).toBe(payerInput);
      });
    });

    it("should show tip about Enter key", () => {
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      expect(screen.getByText(/press/i)).toBeInTheDocument();
      expect(screen.getByText("Enter")).toBeInTheDocument();
    });
  });

  describe("Payer Name Input", () => {
    it("should update payer name in store on change", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Acme Corp");

      expect(usePaycheckFlowStore.getState().payerName).toBe("Acme Corp");
    });

    it("should persist previous payer name from store", () => {
      act(() => {
        usePaycheckFlowStore.setState({ payerName: "Previous Company" });
      });

      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i) as HTMLInputElement;
      expect(payerInput.value).toBe("Previous Company");
    });

    it("should clear payer name when input is cleared", async () => {
      const user = userEvent.setup();
      act(() => {
        usePaycheckFlowStore.setState({ payerName: "Acme Corp" });
      });

      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.clear(payerInput);

      expect(usePaycheckFlowStore.getState().payerName).toBeNull();
    });
  });

  describe("Autocomplete", () => {
    beforeEach(() => {
      // Add some history for autocomplete
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-15",
      });
      PaycheckHistoryService.addOrUpdate({
        payerName: "TechCo Inc",
        amountCents: 300000,
        date: "2026-01-20",
      });
    });

    it("should show autocomplete suggestions when typing", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Acme");

      await waitFor(() => {
        expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      });
    });

    it("should filter suggestions based on input", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Tech");

      await waitFor(() => {
        expect(screen.getByText("TechCo Inc")).toBeInTheDocument();
        expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
      });
    });

    it("should select suggestion on click", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Acme");

      const suggestion = await screen.findByText("Acme Corp");
      await user.click(suggestion);

      expect((payerInput as HTMLInputElement).value).toBe("Acme Corp");
    });

    it("should hide autocomplete when clicking outside", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />
      );

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Acme");

      await waitFor(() => {
        expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      });

      // Click outside
      await user.click(container);

      await waitFor(() => {
        expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
      });
    });
  });

  describe("History Pre-fill", () => {
    beforeEach(() => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-15",
      });
    });

    it("should pre-fill amount when matching employer is found", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Acme Corp");

      await waitFor(() => {
        const amountInput = screen.getByLabelText(/paycheck amount/i) as HTMLInputElement;
        expect(amountInput.value).toBe("2500.00");
      });
    });

    it("should show history hint when match found", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Acme Corp");

      await waitFor(() => {
        expect(screen.getByText(/last paycheck from acme corp/i)).toBeInTheDocument();
        expect(screen.getByText(/\$2,500.00/i)).toBeInTheDocument();
      });
    });

    it("should not show hint when no match found", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      await user.type(payerInput, "Unknown Company");

      await waitFor(() => {
        expect(screen.queryByText(/last paycheck from/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Amount Input", () => {
    it("should update amount on change", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2500.00");

      expect((amountInput as HTMLInputElement).value).toBe("2500.00");
    });

    it("should persist previous amount from store", () => {
      act(() => {
        usePaycheckFlowStore.setState({ paycheckAmountCents: 250000 });
      });

      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i) as HTMLInputElement;
      expect(amountInput.value).toBe("2500.00");
    });
  });

  describe("Validation", () => {
    it("should show error for amount below minimum", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "0.50");

      // Press Enter to trigger validation
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText(/minimum/i)).toBeInTheDocument();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it("should show error for amount above maximum", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2000000");

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText(/maximum/i)).toBeInTheDocument();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it("should accept valid amount", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2500.00");

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(usePaycheckFlowStore.getState().paycheckAmountCents).toBe(250000);
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it("should clear error when user types again", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);

      // Enter invalid amount
      await user.type(amountInput, "0.50");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText(/minimum/i)).toBeInTheDocument();
      });

      // Clear and type valid amount
      await user.clear(amountInput);
      await user.type(amountInput, "2500");

      await waitFor(() => {
        expect(screen.queryByText(/minimum/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should submit on Enter key in payer name field", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const payerInput = screen.getByLabelText(/who paid you/i);
      const amountInput = screen.getByLabelText(/paycheck amount/i);

      await user.type(payerInput, "Acme Corp");
      await user.type(amountInput, "2500.00");

      // Press Enter in payer field
      await act(async () => {
        payerInput.focus();
      });
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it("should submit on Enter key in amount field", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2500.00");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });
  });

  describe("Integration with Store", () => {
    it("should update store with amount in cents", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2500.00");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(usePaycheckFlowStore.getState().paycheckAmountCents).toBe(250000);
      });
    });

    it("should handle decimal amounts correctly", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2500.99");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(usePaycheckFlowStore.getState().paycheckAmountCents).toBe(250099);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty payer name", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "2500.00");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
        expect(usePaycheckFlowStore.getState().payerName).toBeNull();
      });
    });

    it("should handle very large valid amounts", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "999999.99");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(usePaycheckFlowStore.getState().paycheckAmountCents).toBe(99999999);
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it("should handle minimum valid amount ($1.00)", async () => {
      const user = userEvent.setup();
      render(<AmountEntryStep onNext={mockOnNext} onBack={mockOnBack} onFinish={mockOnFinish} />);

      const amountInput = screen.getByLabelText(/paycheck amount/i);
      await user.type(amountInput, "1.00");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(usePaycheckFlowStore.getState().paycheckAmountCents).toBe(100);
        expect(mockOnNext).toHaveBeenCalled();
      });
    });
  });
});
