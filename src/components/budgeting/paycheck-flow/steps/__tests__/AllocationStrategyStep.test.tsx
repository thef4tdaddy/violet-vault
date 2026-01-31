/**
 * Tests for AllocationStrategyStep - Issue #1844
 * Comprehensive test coverage for Quick Strategies UI Integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AllocationStrategyStep from "../AllocationStrategyStep";

// Import custom matchers for Vitest
import "@testing-library/jest-dom";

// Standard top-level imports for mocked hooks
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { budgetDb } from "@/db/budgetDb";
import {
  allocateEvenSplit,
  allocateLastSplit,
  AllocationServiceError,
} from "@/services/api/allocationService";
import {
  getPredictionFromHistory,
  detectFrequencyFromAmount,
} from "@/services/api/predictionService";

// Mock the stores and hooks
vi.mock("@/stores/ui/paycheckFlowStore", () => ({
  usePaycheckFlowStore: vi.fn(),
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(),
  default: () => ({ envelopes: [], isLoading: false, error: null }),
}));

// Mock API services
vi.mock("@/services/api/allocationService", () => ({
  allocateEvenSplit: vi.fn(),
  allocateLastSplit: vi.fn(),
  AllocationServiceError: class extends Error {
    constructor(
      message: string,
      public status: number
    ) {
      super(message);
      this.name = "AllocationServiceError";
    }
  },
}));

vi.mock("@/services/api/predictionService", () => ({
  getPredictionFromHistory: vi.fn(),
  detectFrequencyFromAmount: vi.fn(),
  PredictionServiceError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = "PredictionServiceError";
    }
  },
}));

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    getPaycheckHistory: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  __esModule: true,
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AllocationStrategyStep", () => {
  const mockProps = {
    onNext: vi.fn(),
    onBack: vi.fn(),
    onFinish: vi.fn(),
  };

  const defaultEnvelopes = [
    { id: "rent", name: "Rent", monthlyBudget: 100000, currentBalance: 50000, category: "housing" },
    {
      id: "groceries",
      name: "Groceries",
      monthlyBudget: 75000,
      currentBalance: 25000,
      category: "food",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Stable mock state for the store
    const mockState = {
      paycheckAmountCents: 250000,
      paycheckFrequency: "biweekly",
      setAllocations: vi.fn(),
      allocations: [],
    };

    vi.mocked(usePaycheckFlowStore).mockImplementation((selector: any) => {
      return selector ? selector(mockState) : mockState;
    });

    vi.mocked(useEnvelopes).mockReturnValue({
      envelopes: defaultEnvelopes,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(detectFrequencyFromAmount).mockResolvedValue({
      suggestedFrequency: "biweekly",
      confidence: 1.0,
      reasoning: "Consistent biweekly pattern",
    });

    vi.mocked(budgetDb.getPaycheckHistory).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render all components", () => {
      render(<AllocationStrategyStep {...mockProps} />);
      expect(screen.getByText("HOW DO YOU WANT TO ALLOCATE?")).not.toBeNull();
      expect(screen.getByText("Rent")).not.toBeNull();
      expect(screen.getByText("Groceries")).not.toBeNull();
      expect(screen.getByText("$2500.00")).not.toBeNull();
    });

    it("should disable continue button initially", () => {
      render(<AllocationStrategyStep {...mockProps} />);
      const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
      expect((continueButton as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("Manual Edits", () => {
    it("should update remaining amount and toggle colors", async () => {
      render(<AllocationStrategyStep {...mockProps} />);

      const inputs = await screen.findAllByRole("spinbutton");

      // Step 1: Type amount for first envelope
      fireEvent.change(inputs[0], { target: { value: "1000" } });

      await waitFor(() => {
        // formatCents(250000 - 100000) = $1500.00
        expect(screen.getByText("$1500.00")).not.toBeNull();
      });

      // Step 2: Over allocate
      fireEvent.change(inputs[0], { target: { value: "3000" } });

      await waitFor(() => {
        // formatCents(250000 - 300000) = $-500.00
        const remainingText = screen.getByText("$-500.00");
        expect(remainingText.classList.contains("text-red-600")).toBe(true);
      });

      // Step 3: Full allocate
      fireEvent.change(inputs[0], { target: { value: "1500" } });
      fireEvent.change(inputs[1], { target: { value: "1000" } });

      await waitFor(() => {
        const fullRemaining = screen.getByText("$0.00");
        expect(fullRemaining.classList.contains("text-green-600")).toBe(true);
        const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
        expect((continueButton as HTMLButtonElement).disabled).toBe(false);
      });
    });
  });

  describe("Strategies", () => {
    it("should handle even split successfully", async () => {
      const user = userEvent.setup();
      vi.mocked(allocateEvenSplit).mockResolvedValue({
        allocations: [
          { envelopeId: "rent", amountCents: 150000 },
          { envelopeId: "groceries", amountCents: 100000 },
        ],
        totalAllocatedCents: 250000,
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByText("SPLIT EVENLY"));

      await waitFor(() => {
        expect(screen.getByText("$0.00")).not.toBeNull();
        expect(allocateEvenSplit).toHaveBeenCalled();
      });
    });

    it("should handle last split successfully", async () => {
      const user = userEvent.setup();
      vi.mocked(budgetDb.getPaycheckHistory).mockResolvedValue([
        {
          id: "1",
          date: "2026-01-01",
          amount: 250000,
          allocations: { rent: 150000, groceries: 100000 },
        },
      ] as any);
      vi.mocked(allocateLastSplit).mockResolvedValue({
        allocations: [
          { envelopeId: "rent", amountCents: 150000 },
          { envelopeId: "groceries", amountCents: 100000 },
        ],
        totalAllocatedCents: 250000,
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByText("USE LAST SPLIT"));

      await waitFor(() => {
        expect(screen.getByText("$0.00")).not.toBeNull();
        expect(allocateLastSplit).toHaveBeenCalled();
      });
    });

    it("should handle smart split successfully", async () => {
      const user = userEvent.setup();
      vi.mocked(budgetDb.getPaycheckHistory).mockResolvedValue([
        { id: "1", date: "2026-01-01", amount: 250000, allocations: {} },
        { id: "2", date: "2025-12-15", amount: 250000, allocations: {} },
        { id: "3", date: "2025-12-01", amount: 250000, allocations: {} },
      ] as any);
      vi.mocked(getPredictionFromHistory).mockResolvedValue({
        suggestedAllocationsCents: [150000, 100000],
        confidence: 0.9,
        reasoning: { patternType: "Stable" },
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByText("SMART SPLIT"));

      await waitFor(() => {
        expect(screen.getByText("$0.00")).not.toBeNull();
        expect(getPredictionFromHistory).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases & UI Feedback", () => {
    it("should show error message on API failure", async () => {
      const user = userEvent.setup();
      // Throw correct error class for component instance check
      vi.mocked(allocateEvenSplit).mockRejectedValue(new AllocationServiceError("API Down", 500));

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByText("SPLIT EVENLY"));

      await waitFor(() => {
        expect(screen.getByText(/API Down/i)).not.toBeNull();
      });
    });

    it("should handle empty envelopes", async () => {
      vi.mocked(useEnvelopes).mockReturnValue({
        envelopes: [],
        isLoading: false,
        error: null,
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      expect(screen.getByText(/No envelopes found/i)).not.toBeNull();
    });

    it("should display allocation percentages", async () => {
      render(<AllocationStrategyStep {...mockProps} />);
      const inputs = await screen.findAllByRole("spinbutton");

      fireEvent.change(inputs[0], { target: { value: "1250" } }); // 50% of 2500

      await waitFor(() => {
        expect(screen.getByText("50.00% allocated")).not.toBeNull();
      });
    });
  });
});
