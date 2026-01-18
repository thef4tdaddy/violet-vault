import { screen, render } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import EnvelopeGrid from "../EnvelopeGrid";

// Import hooks for vi.mocked usage
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useTransactionQuery as useTransactions } from "@/hooks/budgeting/transactions/useTransactionQuery";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";

// --- Hoisted Mock Data ---

const {
  MOCK_CURRENT_USER,
  MOCK_UI_STORE,
  MOCK_ENVELOPES_DATA,
  MOCK_TRANSACTIONS_DATA,
  MOCK_BILLS_DATA,
  MOCK_METADATA_DATA,
} = vi.hoisted(() => ({
  MOCK_CURRENT_USER: { userName: "Test User", userColor: "#000" },
  MOCK_UI_STORE: {
    budget: {
      currentUser: { userName: "Test User", userColor: "#000" },
      envelopes: [],
      transactions: [],
      bills: [],
      updateBill: vi.fn(),
    },
    currentUser: { userName: "Test User", userColor: "#000" },
    envelopes: [],
    transactions: [],
    bills: [],
    updateBill: vi.fn(),
  },
  MOCK_ENVELOPES_DATA: {
    envelopes: [
      { id: "1", name: "Groceries", balance: 300, allocated: 400 },
      { id: "2", name: "Gas", balance: 100, allocated: 150 },
    ],
    isLoading: false,
    addEnvelope: vi.fn(() => Promise.resolve()),
    updateEnvelopeAsync: vi.fn(() => Promise.resolve()),
    deleteEnvelope: vi.fn(() => Promise.resolve()),
  },
  MOCK_TRANSACTIONS_DATA: {
    transactions: [{ id: "tx1", envelopeId: "1", amount: -50, date: "2025-01-01" }],
    isLoading: false,
  },
  MOCK_BILLS_DATA: {
    bills: [{ id: "b1", name: "Electric", amount: 100, envelopeId: "1" }],
    updateBill: vi.fn(() => Promise.resolve()),
    isLoading: false,
  },
  MOCK_METADATA_DATA: {
    unassignedCash: 500,
    isLoading: false,
  },
}));

// --- Mocks ---

// Stores
vi.mock("@/stores/ui/uiStore", () => ({
  default: vi.fn((selector) => selector(MOCK_UI_STORE)),
}));

// Hooks
vi.mock("@/hooks/budgeting/metadata/useBudgetMetadata", () => ({
  useUnassignedCash: vi.fn(() => MOCK_METADATA_DATA),
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => MOCK_ENVELOPES_DATA),
}));

vi.mock("@/hooks/budgeting/transactions/useTransactionQuery", () => ({
  useTransactionQuery: vi.fn(() => MOCK_TRANSACTIONS_DATA),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills", () => ({
  default: vi.fn(() => MOCK_BILLS_DATA),
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

// Utils
vi.mock("@/utils/domain/budgeting", () => ({
  calculateEnvelopeData: vi.fn((envelopes) =>
    (envelopes || []).map((e: any) => ({ ...e, spent: 0, remaining: e.allocated || 0 }))
  ),
  sortEnvelopes: vi.fn((envelopes) => envelopes),
  filterEnvelopes: vi.fn((envelopes) => envelopes),
  calculateEnvelopeTotals: vi.fn(() => ({
    totalBalance: 400,
    totalAllocated: 550,
  })),
}));

// View Components
vi.mock("../envelope/EnvelopeGridView", () => ({
  default: ({ sortedEnvelopes, handleEnvelopeEdit, setShowCreateModal, children }: any) => (
    <div data-testid="envelope-grid-view">
      {(sortedEnvelopes || []).map((env: any) => (
        <div key={env.id} data-testid={`envelope-${env.id}`}>
          <span data-testid={`envelope-name-${env.id}`}>{env.name}</span>
          <button onClick={() => handleEnvelopeEdit(env)}>Edit</button>
        </div>
      ))}
      <button onClick={() => setShowCreateModal(true)}>Create Envelope</button>
      {children}
    </div>
  ),
}));

// Mock Prop Validator
vi.mock("@/utils/core/validation/propValidator", () => ({
  validateComponentProps: vi.fn(),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("EnvelopeGrid (Surgical Reset)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock returns
    vi.mocked(useEnvelopes).mockReturnValue(MOCK_ENVELOPES_DATA);
    vi.mocked(useTransactions).mockReturnValue(MOCK_TRANSACTIONS_DATA);
    vi.mocked(useBills).mockReturnValue(MOCK_BILLS_DATA);
    vi.mocked(useUnassignedCash).mockReturnValue(MOCK_METADATA_DATA);
  });

  const renderEnvelopeGrid = (props = {}) => {
    return render(<EnvelopeGrid unassignedCash={500} {...props} />);
  };

  describe("Rendering", () => {
    it("should render envelope grid view", () => {
      renderEnvelopeGrid();
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should render list of envelopes", () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 300, allocated: 400 },
        { id: "2", name: "Gas", balance: 100, allocated: 150 },
      ];
      renderEnvelopeGrid({ envelopes: mockEnvelopes });
      expect(screen.getByTestId("envelope-name-1")).toHaveTextContent("Groceries");
      expect(screen.getByTestId("envelope-name-2")).toHaveTextContent("Gas");
    });
  });

  describe("Empty State", () => {
    it("should handle empty envelopes array", () => {
      vi.mocked(useEnvelopes).mockReturnValue({
        ...MOCK_ENVELOPES_DATA,
        envelopes: [],
      });

      renderEnvelopeGrid();
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
      expect(screen.queryByTestId("envelope-1")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle edit envelope click", async () => {
      renderEnvelopeGrid();
      const editButtons = screen.getAllByText("Edit");
      await userEvent.click(editButtons[0]);
      // Baseline: No crash
    });
  });

  describe("Data Loading States", () => {
    it("should show loading spinner when loading", () => {
      vi.mocked(useEnvelopes).mockReturnValue({
        ...MOCK_ENVELOPES_DATA,
        isLoading: true,
      });

      renderEnvelopeGrid();
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should load envelopes, transactions and bills", () => {
      renderEnvelopeGrid();
      expect(useEnvelopes).toHaveBeenCalled();
      expect(useTransactions).toHaveBeenCalled();
      expect(useBills).toHaveBeenCalled();
    });

    it("should handle create envelope button click", async () => {
      renderEnvelopeGrid();
      const createButton = screen.getByText("Create Envelope");
      await userEvent.click(createButton);
      // Baseline: No crash
    });

    it("should render with custom unassigned cash", () => {
      renderEnvelopeGrid({ unassignedCash: 1000 });
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should handle missing transactions", () => {
      vi.mocked(useTransactions).mockReturnValue({
        ...MOCK_TRANSACTIONS_DATA,
        transactions: [],
      });

      renderEnvelopeGrid();
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should handle missing bills", () => {
      vi.mocked(useBills).mockReturnValue({
        ...MOCK_BILLS_DATA,
        bills: [],
      });

      renderEnvelopeGrid();
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should handle multiple envelopes", () => {
      const manyEnvelopes = Array.from({ length: 10 }, (_, i) => ({
        id: `env-${i}`,
        name: `Envelope ${i}`,
        balance: 100 * i,
        allocated: 150 * i,
      }));

      vi.mocked(useEnvelopes).mockReturnValue({
        ...MOCK_ENVELOPES_DATA,
        envelopes: manyEnvelopes,
      });

      renderEnvelopeGrid();
      expect(screen.getAllByText(/Edit/)).toHaveLength(10);
    });

    it("should handle loading state for transactions", () => {
      vi.mocked(useTransactions).mockReturnValue({
        ...MOCK_TRANSACTIONS_DATA,
        isLoading: true,
      });

      renderEnvelopeGrid();
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should handle loading state for bills", () => {
      vi.mocked(useBills).mockReturnValue({
        ...MOCK_BILLS_DATA,
        isLoading: true,
      });

      renderEnvelopeGrid();
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should handle zero unassigned cash", () => {
      renderEnvelopeGrid({ unassignedCash: 0 });
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should handle negative unassigned cash", () => {
      renderEnvelopeGrid({ unassignedCash: -100 });
      expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
    });

    it("should render with envelopes prop override", () => {
      const customEnvelopes = [
        { id: "custom-1", name: "Custom Envelope", balance: 500, allocated: 600 },
      ];

      renderEnvelopeGrid({ envelopes: customEnvelopes });
      expect(screen.getByTestId("envelope-name-custom-1")).toHaveTextContent("Custom Envelope");
    });

    it("should handle all edit buttons for multiple envelopes", async () => {
      renderEnvelopeGrid();
      const editButtons = screen.getAllByText("Edit");

      for (const button of editButtons) {
        await userEvent.click(button);
      }
      // Baseline: No crash with multiple clicks
    });
  });
});
