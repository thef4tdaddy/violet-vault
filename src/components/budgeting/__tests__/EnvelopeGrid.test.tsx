import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import EnvelopeGrid from "../EnvelopeGrid";
import userEvent from "@testing-library/user-event";
import { useBudgetStoreOriginal } from "@/stores/ui/uiStore";
import { useUnassignedCashOriginal } from "@/hooks/budgeting/useBudgetMetadata";
import { useEnvelopesOriginal } from "@/hooks/budgeting/useEnvelopes";
import { useTransactionsOriginal } from "@/hooks/common/useTransactions";
import useBillsOriginal from "@/hooks/bills/useBills";

// Mock all hooks and stores
vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({
    budget: {
      currentUser: { userName: "Test User", userColor: "#000000" },
      updateBill: vi.fn(),
    },
    sortOption: "name",
    filterOption: "all",
    showFunded: true,
    showUnderfunded: true,
    showOverfunded: true,
  })),
}));

vi.mock("@/hooks/budgeting/useBudgetMetadata", () => ({
  useUnassignedCash: vi.fn(() => 100),
}));

vi.mock("@/hooks/budgeting/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [],
    createEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    deleteEnvelope: vi.fn(),
  })),
}));

vi.mock("@/hooks/common/useTransactions", () => ({
  useTransactions: vi.fn(() => ({
    transactions: [],
  })),
}));

vi.mock("@/hooks/bills/useBills", () => ({
  default: vi.fn(() => ({
    bills: [],
    addBill: vi.fn(),
    updateBill: vi.fn(),
  })),
}));

vi.mock("@/hooks/mobile/usePullToRefresh", () => ({
  default: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock utility functions
vi.mock("@/utils/budgeting", () => ({
  calculateEnvelopeData: vi.fn((envelope) => ({
    ...envelope,
    balance: envelope.allocated || 0,
    spent: 0,
    remaining: envelope.allocated || 0,
  })),
  sortEnvelopes: vi.fn((envelopes) => envelopes),
  filterEnvelopes: vi.fn((envelopes) => envelopes),
  calculateEnvelopeTotals: vi.fn(() => ({
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
  })),
}));

vi.mock("../../utils/common/logger", () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock child components
vi.mock("./envelope/EnvelopeGridView", () => ({
  default: ({ envelopes, onCreateEnvelope, onEditEnvelope, onDeleteEnvelope }) => (
    <div data-testid="envelope-grid-view">
      <button onClick={() => onCreateEnvelope()}>Create Envelope</button>
      {envelopes.map((env) => (
        <div key={env.id} data-testid={`envelope-${env.id}`}>
          <span>{env.name}</span>
          <button onClick={() => onEditEnvelope(env)}>Edit</button>
          <button onClick={() => onDeleteEnvelope(env.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

// Mock lazy-loaded modals
vi.mock("./CreateEnvelopeModal", () => ({
  default: ({ isOpen, onClose, onCreateEnvelope }) =>
    isOpen ? (
      <div data-testid="create-envelope-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onCreateEnvelope({ name: "New Envelope" })}>
          Create
        </button>
      </div>
    ) : null,
}));

vi.mock("./EditEnvelopeModal", () => ({
  default: ({ isOpen, onClose, envelope }) =>
    isOpen && envelope ? (
      <div data-testid="edit-envelope-modal">
        <span>Editing: {envelope.name}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("./envelope/EnvelopeHistoryModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="envelope-history-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../modals/QuickFundModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="quick-fund-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const useBudgetStore = useBudgetStoreOriginal as unknown as Mock;
const useUnassignedCash = useUnassignedCashOriginal as unknown as Mock;
const useEnvelopes = useEnvelopesOriginal as unknown as Mock;
const useTransactions = useTransactionsOriginal as unknown as Mock;
const useBills = useBillsOriginal as unknown as Mock;

describe("EnvelopeGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", async () => {
      render(<EnvelopeGrid />);
      await waitFor(() => {
        expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
      });
    });

    it("should display empty state when no envelopes", async () => {
      useEnvelopes.mockReturnValue({
        envelopes: [],
        createEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        expect(screen.getByTestId("envelope-grid-view")).toBeInTheDocument();
      });
    });

    it("should render envelopes when they exist", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", allocated: 500 },
        { id: "2", name: "Gas", allocated: 200 },
      ];

      useEnvelopes.mockReturnValue({
        envelopes: mockEnvelopes,
        createEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        expect(screen.getByTestId("envelope-1")).toBeInTheDocument();
        expect(screen.getByTestId("envelope-2")).toBeInTheDocument();
        expect(screen.getByText("Groceries")).toBeInTheDocument();
        expect(screen.getByText("Gas")).toBeInTheDocument();
      });
    });

    it("should display create envelope button", async () => {
      render(<EnvelopeGrid />);

      await waitFor(() => {
        expect(screen.getByText("Create Envelope")).toBeInTheDocument();
      });
    });
  });

  describe("Envelope Creation", () => {
    it("should open create modal when create button is clicked", async () => {
      render(<EnvelopeGrid />);

      await waitFor(() => {
        const createButton = screen.getByText("Create Envelope");
        userEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId("create-envelope-modal")).toBeInTheDocument();
      });
    });

    it("should call createEnvelope when creating new envelope", async () => {
      const mockCreateEnvelope = vi.fn();

      useEnvelopes.mockReturnValue({
        envelopes: [],
        createEnvelope: mockCreateEnvelope,
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        const createButton = screen.getByText("Create Envelope");
        userEvent.click(createButton);
      });

      await waitFor(() => {
        const modalCreateButton = screen.getByText("Create");
        userEvent.click(modalCreateButton);
      });

      await waitFor(() => {
        expect(mockCreateEnvelope).toHaveBeenCalled();
      });
    });

    it("should close create modal when close button is clicked", async () => {
      render(<EnvelopeGrid />);

      await waitFor(() => {
        const createButton = screen.getByText("Create Envelope");
        userEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId("create-envelope-modal")).toBeInTheDocument();
      });

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("create-envelope-modal")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Envelope Editing", () => {
    it("should open edit modal when edit button is clicked", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", allocated: 500 },
      ];

      useEnvelopes.mockReturnValue({
        envelopes: mockEnvelopes,
        createEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        const editButton = screen.getByText("Edit");
        userEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId("edit-envelope-modal")).toBeInTheDocument();
        expect(screen.getByText("Editing: Groceries")).toBeInTheDocument();
      });
    });

    it("should close edit modal when close button is clicked", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", allocated: 500 },
      ];

      useEnvelopes.mockReturnValue({
        envelopes: mockEnvelopes,
        createEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        const editButton = screen.getByText("Edit");
        userEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId("edit-envelope-modal")).toBeInTheDocument();
      });

      const closeButton = screen.getAllByText("Close")[0];
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("edit-envelope-modal")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Envelope Deletion", () => {
    it("should call deleteEnvelope when delete button is clicked", async () => {
      const mockDeleteEnvelope = vi.fn();
      const mockEnvelopes = [
        { id: "1", name: "Groceries", allocated: 500 },
      ];

      useEnvelopes.mockReturnValue({
        envelopes: mockEnvelopes,
        createEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: mockDeleteEnvelope,
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete");
        userEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockDeleteEnvelope).toHaveBeenCalledWith("1");
      });
    });
  });

  describe("Data Integration", () => {
    it("should use unassigned cash from hook", async () => {
      useUnassignedCash.mockReturnValue(250);

      render(<EnvelopeGrid />);

      await waitFor(() => {
        expect(useUnassignedCash).toHaveBeenCalled();
      });
    });

    it("should use transactions from hook", async () => {
      const mockTransactions = [
        { id: "1", amount: 50, envelopeId: "env-1" },
      ];

      useTransactions.mockReturnValue({
        transactions: mockTransactions,
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        expect(useTransactions).toHaveBeenCalled();
      });
    });

    it("should use bills from hook", async () => {
      const mockBills = [
        { id: "1", name: "Electric", amount: 100 },
      ];

      useBills.mockReturnValue({
        bills: mockBills,
        addBill: vi.fn(),
        updateBill: vi.fn(),
      });

      render(<EnvelopeGrid />);

      await waitFor(() => {
        expect(useBills).toHaveBeenCalled();
      });
    });
  });
});
