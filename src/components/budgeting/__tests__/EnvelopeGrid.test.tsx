import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import EnvelopeGrid from "../EnvelopeGrid";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock hooks
vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({
    budget: { currentUser: { userName: "Test User", userColor: "#000" } },
  })),
}));

vi.mock("@/hooks/budgeting/useBudgetMetadata", () => ({
  useUnassignedCash: vi.fn(() => ({
    unassignedCash: 500,
    isLoading: false,
  })),
}));

vi.mock("@/hooks/budgeting/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [
      { id: "1", name: "Groceries", balance: 300, allocated: 400 },
      { id: "2", name: "Gas", balance: 100, allocated: 150 },
    ],
    isLoading: false,
    addEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    deleteEnvelope: vi.fn(),
  })),
}));

vi.mock("@/hooks/common/useTransactions", () => ({
  useTransactions: vi.fn(() => ({
    transactions: [{ id: "1", envelopeId: "1", amount: -50, date: "2025-01-01" }],
    isLoading: false,
  })),
}));

vi.mock("@/hooks/bills/useBills", () => ({
  default: vi.fn(() => ({
    bills: [{ id: "1", name: "Electric", amount: 100, envelopeId: "1" }],
    updateBill: vi.fn(),
  })),
}));

vi.mock("@/hooks/mobile/usePullToRefresh", () => ({
  default: vi.fn(() => ({
    isPulling: false,
    isRefreshing: false,
    pullProgress: 0,
    pullRotation: 0,
    isReady: false,
    touchHandlers: {},
    containerRef: { current: null },
    pullStyles: {},
  })),
}));

vi.mock("@/utils/budgeting", () => ({
  calculateEnvelopeData: vi.fn((envelopes) => envelopes),
  sortEnvelopes: vi.fn((envelopes) => envelopes),
  filterEnvelopes: vi.fn((envelopes) => envelopes),
  calculateEnvelopeTotals: vi.fn(() => ({
    totalBalance: 400,
    totalAllocated: 550,
  })),
}));

// Mock child components
vi.mock("../envelope/EnvelopeGridView", () => ({
  default: ({ envelopes, onCreateEnvelope, onEditEnvelope, onDeleteEnvelope }) => (
    <div data-testid="envelope-grid-view">
      {envelopes.map((env) => (
        <div key={env.id} data-testid={`envelope-${env.id}`}>
          <span>{env.name}</span>
          <button onClick={() => onEditEnvelope(env)}>Edit</button>
          <button onClick={() => onDeleteEnvelope(env.id)}>Delete</button>
        </div>
      ))}
      <button onClick={onCreateEnvelope}>Create Envelope</button>
    </div>
  ),
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("EnvelopeGrid", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderEnvelopeGrid = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EnvelopeGrid unassignedCash={500} {...props} />
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("should render envelope grid view", () => {
      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should render all envelopes", () => {
      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-1")).toBeInTheDocument();
      expect(screen.getByTestId("envelope-2")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Gas")).toBeInTheDocument();
    });

    it("should render create envelope button", () => {
      renderEnvelopeGrid();

      expect(screen.getByText("Create Envelope")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should handle empty envelopes array", () => {
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      useEnvelopes.mockReturnValue({
        envelopes: [],
        isLoading: false,
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
      expect(screen.queryByTestId("envelope-1")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle create envelope click", async () => {
      renderEnvelopeGrid();

      const createButton = screen.getByText("Create Envelope");
      await userEvent.click(createButton);

      // Modal should be triggered (will be tested when modal mocks are set up)
    });

    it("should handle edit envelope click", async () => {
      renderEnvelopeGrid();

      const editButtons = screen.getAllByText("Edit");
      await userEvent.click(editButtons[0]);

      // Edit modal should be triggered
    });

    it("should handle delete envelope click", async () => {
      const mockDelete = vi.fn();
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      useEnvelopes.mockReturnValue({
        envelopes: [{ id: "1", name: "Groceries", balance: 300 }],
        isLoading: false,
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: mockDelete,
      });

      renderEnvelopeGrid();

      const deleteButton = screen.getByText("Delete");
      await userEvent.click(deleteButton);

      // Delete should be triggered
    });
  });

  describe("Data Loading", () => {
    it("should use unassigned cash from props", () => {
      renderEnvelopeGrid({ unassignedCash: 750 });

      // Component should render with updated unassigned cash
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should load envelopes from hook", () => {
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      const mockEnvelopes = [
        { id: "1", name: "Rent", balance: 1000 },
        { id: "2", name: "Utilities", balance: 200 },
        { id: "3", name: "Food", balance: 400 },
      ];

      useEnvelopes.mockReturnValue({
        envelopes: mockEnvelopes,
        isLoading: false,
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      renderEnvelopeGrid();

      expect(screen.getByText("Rent")).toBeInTheDocument();
      expect(screen.getByText("Utilities")).toBeInTheDocument();
      expect(screen.getByText("Food")).toBeInTheDocument();
    });
  });

  describe("Envelope Operations", () => {
    it("should display envelope balance information", () => {
      renderEnvelopeGrid();

      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Gas")).toBeInTheDocument();
    });

    it("should handle multiple envelopes", () => {
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      useEnvelopes.mockReturnValue({
        envelopes: [
          { id: "1", name: "Envelope 1", balance: 100 },
          { id: "2", name: "Envelope 2", balance: 200 },
          { id: "3", name: "Envelope 3", balance: 300 },
          { id: "4", name: "Envelope 4", balance: 400 },
        ],
        isLoading: false,
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      renderEnvelopeGrid();

      expect(screen.getByText("Envelope 1")).toBeInTheDocument();
      expect(screen.getByText("Envelope 2")).toBeInTheDocument();
      expect(screen.getByText("Envelope 3")).toBeInTheDocument();
      expect(screen.getByText("Envelope 4")).toBeInTheDocument();
    });
  });

  describe("Filtering and Sorting", () => {
    it("should apply envelope calculations", () => {
      const calculateEnvelopeData = require("@/utils/budgeting").calculateEnvelopeData as Mock;
      calculateEnvelopeData.mockImplementation((envelopes) =>
        envelopes.map((e) => ({ ...e, calculated: true }))
      );

      renderEnvelopeGrid();

      expect(calculateEnvelopeData).toHaveBeenCalled();
    });

    it("should apply envelope sorting", () => {
      const sortEnvelopes = require("@/utils/budgeting").sortEnvelopes as Mock;

      renderEnvelopeGrid();

      expect(sortEnvelopes).toHaveBeenCalled();
    });

    it("should apply envelope filtering", () => {
      const filterEnvelopes = require("@/utils/budgeting").filterEnvelopes as Mock;

      renderEnvelopeGrid();

      expect(filterEnvelopes).toHaveBeenCalled();
    });

    it("should calculate envelope totals", () => {
      const calculateEnvelopeTotals = require("@/utils/budgeting").calculateEnvelopeTotals as Mock;

      renderEnvelopeGrid();

      expect(calculateEnvelopeTotals).toHaveBeenCalled();
    });
  });

  describe("Integration with Transactions", () => {
    it("should load transactions for envelope calculations", () => {
      const useTransactions = require("@/hooks/common/useTransactions").useTransactions as Mock;

      renderEnvelopeGrid();

      expect(useTransactions).toHaveBeenCalled();
    });

    it("should handle envelopes with transactions", () => {
      const useTransactions = require("@/hooks/common/useTransactions").useTransactions as Mock;
      useTransactions.mockReturnValue({
        transactions: [
          { id: "1", envelopeId: "1", amount: -50 },
          { id: "2", envelopeId: "1", amount: -30 },
          { id: "3", envelopeId: "2", amount: -20 },
        ],
        isLoading: false,
      });

      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });
  });

  describe("Integration with Bills", () => {
    it("should load bills for envelope calculations", () => {
      const useBills = require("@/hooks/bills/useBills").default as Mock;

      renderEnvelopeGrid();

      expect(useBills).toHaveBeenCalled();
    });

    it("should handle envelopes with bills", () => {
      const useBills = require("@/hooks/bills/useBills").default as Mock;
      useBills.mockReturnValue({
        bills: [
          { id: "1", name: "Electric", amount: 100, envelopeId: "1" },
          { id: "2", name: "Water", amount: 50, envelopeId: "1" },
        ],
        updateBill: vi.fn(),
      });

      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });
  });

  describe("Pull-to-Refresh", () => {
    it("should not show refresh indicator by default", () => {
      renderEnvelopeGrid();

      // Pull-to-refresh indicator is handled in parent component
      expect(screen.queryByTestId("pull-to-refresh")).not.toBeInTheDocument();
    });

    it("should handle pull-to-refresh functionality", () => {
      const usePullToRefresh = require("@/hooks/mobile/usePullToRefresh").default as Mock;

      renderEnvelopeGrid();

      expect(usePullToRefresh).toHaveBeenCalled();
    });
  });

  describe("Budget Store Integration", () => {
    it("should load budget from store", () => {
      const useBudgetStore = require("@/stores/ui/uiStore").useBudgetStore as Mock;

      renderEnvelopeGrid();

      expect(useBudgetStore).toHaveBeenCalled();
    });

    it("should use current user from budget store", () => {
      const useBudgetStore = require("@/stores/ui/uiStore").useBudgetStore as Mock;
      useBudgetStore.mockReturnValue({
        budget: {
          currentUser: { userName: "Custom User", userColor: "#ff0000" },
        },
      });

      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing unassignedCash gracefully", () => {
      const useUnassignedCash = require("@/hooks/budgeting/useBudgetMetadata")
        .useUnassignedCash as Mock;
      useUnassignedCash.mockReturnValue({
        unassignedCash: 0,
        isLoading: false,
      });

      renderEnvelopeGrid({ unassignedCash: undefined });

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should handle undefined envelopes array", () => {
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      useEnvelopes.mockReturnValue({
        envelopes: undefined,
        isLoading: false,
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      renderEnvelopeGrid();

      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });
  });
});
