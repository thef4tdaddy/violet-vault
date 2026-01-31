import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
import useToast from "@/hooks/platform/ux/useToast";
import { usePaycheckFrequencyDetection } from "@/hooks/budgeting/paycheck-flow/usePaycheckFrequencyDetection";
import { useAllocationStrategies } from "@/hooks/budgeting/paycheck-flow/useAllocationStrategies";
import { useBillForecasting } from "@/hooks/budgeting/paycheck-flow/useBillForecasting";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";

// Mock the stores and hooks first!
vi.mock("@/stores/ui/paycheckFlowStore", () => ({
  usePaycheckFlowStore: Object.assign(vi.fn(), {
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
    subscribe: vi.fn(),
  }),
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [
      {
        id: "rent",
        name: "Rent",
        monthlyBudget: 100000,
        currentBalance: 50000,
        category: "housing",
      },
      {
        id: "groceries",
        name: "Groceries",
        monthlyBudget: 75000,
        currentBalance: 25000,
        category: "food",
      },
    ],
    isLoading: false,
    error: null,
  })),
}));

vi.mock("@/services/api/allocationService", () => ({
  allocateEvenSplit: vi.fn(),
  allocateLastSplit: vi.fn(),
  AllocationServiceError: class extends Error {
    constructor(
      message: string,
      public statusCode?: number
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

vi.mock("@/hooks/platform/ux/useToast", () => ({
  default: vi.fn(() => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
  })),
}));

vi.mock("@/hooks/budgeting/paycheck-flow/usePaycheckFrequencyDetection", () => ({
  usePaycheckFrequencyDetection: vi.fn(() => ({
    paycheckFrequency: "biweekly",
    setPaycheckFrequency: vi.fn(),
    wasAutoDetected: false,
    detectionMessage: null,
    setWasAutoDetected: vi.fn(),
  })),
}));

vi.mock("@/hooks/budgeting/paycheck-flow/useAllocationStrategies", () => ({
  useAllocationStrategies: vi.fn(() => ({
    loading: false,
    error: null,
    handleEvenSplit: vi.fn(),
    handleLastSplit: vi.fn(),
    handleSmartSplit: vi.fn(),
  })),
}));

vi.mock("@/hooks/budgeting/paycheck-flow/useBillForecasting", () => ({
  useBillForecasting: vi.fn(() => ({
    upcomingBills: [],
    totalShortage: 0,
    criticalBills: [],
    criticalCount: 0,
    nextPayday: new Date(),
    daysUntilPayday: 14,
    isLoading: false,
  })),
}));

vi.mock("@/hooks/dashboard/usePaydayProgress", () => ({
  usePaydayProgress: vi.fn(() => ({
    daysUntilPayday: 14,
    formattedPayday: "Feb 14",
    isLoading: false,
  })),
}));

vi.mock("../forecasting/BillForecastingPanel", () => ({
  BillForecastingPanel: () => <div data-testid="bill-forecasting-panel">Bill Forecasting</div>,
}));

vi.mock("../SaveAsRulesModal", () => ({
  SaveAsRulesModal: () => <div data-testid="save-as-rules-modal">Save As Rules Modal</div>,
}));

import AllocationStrategyStep from "../AllocationStrategyStep";

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
      setSelectedStrategy: vi.fn(),
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

    vi.mocked(useToast).mockReturnValue({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    } as any);

    vi.mocked(usePaycheckFrequencyDetection).mockReturnValue({
      paycheckFrequency: "biweekly",
      setPaycheckFrequency: vi.fn(),
      wasAutoDetected: false,
      detectionMessage: null,
      setWasAutoDetected: vi.fn(),
    } as any);

    vi.mocked(useAllocationStrategies).mockReturnValue({
      loading: false,
      error: null,
      handleEvenSplit: vi.fn(),
      handleLastSplit: vi.fn(),
      handleSmartSplit: vi.fn(),
    } as any);

    vi.mocked(useBillForecasting).mockReturnValue({
      upcomingBills: [],
      totalShortage: 0,
      criticalBills: [],
      criticalCount: 0,
      nextPayday: new Date(),
      daysUntilPayday: 14,
      isLoading: false,
    } as any);

    vi.mocked(budgetDb.getPaycheckHistory).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render all components", () => {
      render(<AllocationStrategyStep {...mockProps} />);
      screen.debug();
      expect(screen.getByText(/How do you want to allocate/i)).not.toBeNull();
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
      const mockHandleEven = vi.fn();
      vi.mocked(useAllocationStrategies).mockReturnValue({
        loading: false,
        error: null,
        handleEvenSplit: mockHandleEven,
        handleLastSplit: vi.fn(),
        handleSmartSplit: vi.fn(),
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByRole("button", { name: /SPLIT EVENLY/i }));

      await waitFor(() => {
        expect(mockHandleEven).toHaveBeenCalled();
      });
    });

    it("should handle last split successfully", async () => {
      const user = userEvent.setup();
      const mockHandleLast = vi.fn();
      vi.mocked(useAllocationStrategies).mockReturnValue({
        loading: false,
        error: null,
        handleEvenSplit: vi.fn(),
        handleLastSplit: mockHandleLast,
        handleSmartSplit: vi.fn(),
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByRole("button", { name: /USE LAST SPLIT/i }));

      await waitFor(() => {
        expect(mockHandleLast).toHaveBeenCalled();
      });
    });

    it("should handle smart split successfully", async () => {
      const user = userEvent.setup();
      const mockHandleSmart = vi.fn();
      vi.mocked(useAllocationStrategies).mockReturnValue({
        loading: false,
        error: null,
        handleEvenSplit: vi.fn(),
        handleLastSplit: vi.fn(),
        handleSmartSplit: mockHandleSmart,
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);
      await user.click(screen.getByRole("button", { name: /SMART SPLIT/i }));

      await waitFor(() => {
        expect(mockHandleSmart).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases & UI Feedback", () => {
    it("should show error message on API failure", async () => {
      const user = userEvent.setup();

      // We need to mock the hook to return the error state
      vi.mocked(useAllocationStrategies).mockReturnValue({
        loading: false,
        error: "API Down",
        handleEvenSplit: vi.fn(),
        handleLastSplit: vi.fn(),
        handleSmartSplit: vi.fn(),
      } as any);

      render(<AllocationStrategyStep {...mockProps} />);

      // The error should be visible because we mocked the hook to return it
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
        expect(screen.getByText(/50.00% allocated/i)).not.toBeNull();
      });
    });
  });
});
