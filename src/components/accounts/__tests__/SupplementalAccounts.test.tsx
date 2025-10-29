import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import SupplementalAccounts from "../SupplementalAccounts";
import userEvent from "@testing-library/user-event";
import useSupplementalAccountsOriginal from "@/hooks/accounts/useSupplementalAccounts";

// Mock the custom hook
vi.mock("@/hooks/accounts/useSupplementalAccounts", () => ({
  default: vi.fn(() => ({
    showAddModal: false,
    editingGoal: null,
    showBalances: true,
    showTransferModal: false,
    transferringAccount: null,
    accountForm: {},
    transferForm: {},
    setAccountForm: vi.fn(),
    setTransferForm: vi.fn(),
    isLocked: false,
    isOwnLock: false,
    canEdit: true,
    lock: vi.fn(),
    breakLock: vi.fn(),
    lockLoading: false,
    handleAddAccount: vi.fn(),
    startEdit: vi.fn(),
    handleCloseModal: vi.fn(),
    handleDelete: vi.fn(),
    startTransfer: vi.fn(),
    handleTransfer: vi.fn(),
    handleCloseTransferModal: vi.fn(),
    openAddForm: vi.fn(),
    toggleBalanceVisibility: vi.fn(),
    totalValue: 0,
    expiringAccounts: [],
  })),
}));

// Type cast the mocked hook
const useSupplementalAccounts = useSupplementalAccountsOriginal as unknown as Mock;

// Mock child components
vi.mock("../AccountsHeader", () => ({
  default: ({ totalValue, showBalances: _showBalances, onToggleBalances, onAddAccount }) => (
    <div data-testid="accounts-header">
      <span>Total: ${totalValue}</span>
      <button onClick={onToggleBalances}>Toggle Balances</button>
      <button onClick={onAddAccount}>Add Account</button>
    </div>
  ),
}));

vi.mock("../ExpirationAlert", () => ({
  default: ({ expiringAccounts }) =>
    expiringAccounts.length > 0 ? (
      <div data-testid="expiration-alert">Expiring: {expiringAccounts.length}</div>
    ) : null,
}));

vi.mock("../AccountsGrid", () => ({
  default: ({ accounts, showBalances, onEdit, onDelete, onStartTransfer }) => (
    <div data-testid="accounts-grid">
      {accounts.map((account) => (
        <div key={account.id} data-testid={`account-${account.id}`}>
          <span>{account.name}</span>
          {showBalances && <span>Balance: ${account.balance}</span>}
          <button onClick={() => onEdit(account)}>Edit</button>
          <button onClick={() => onDelete(account.id)}>Delete</button>
          <button onClick={() => onStartTransfer(account)}>Transfer</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../AccountFormModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="account-form-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../TransferModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="transfer-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe("SupplementalAccounts", () => {
  const mockOnAddAccount = vi.fn();
  const mockOnUpdateAccount = vi.fn();
  const mockOnDeleteAccount = vi.fn();
  const mockOnTransferToEnvelope = vi.fn();

  const defaultProps = {
    supplementalAccounts: [],
    onAddAccount: mockOnAddAccount,
    onUpdateAccount: mockOnUpdateAccount,
    onDeleteAccount: mockOnDeleteAccount,
    onTransferToEnvelope: mockOnTransferToEnvelope,
    envelopes: [],
    currentUser: { userName: "Test User", userColor: "#a855f7" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<SupplementalAccounts {...defaultProps} />);
      expect(screen.getByTestId("accounts-header")).toBeInTheDocument();
    });

    it("should render all main components", () => {
      render(<SupplementalAccounts {...defaultProps} />);
      expect(screen.getByTestId("accounts-header")).toBeInTheDocument();
      expect(screen.getByTestId("accounts-grid")).toBeInTheDocument();
    });

    it("should display accounts when they exist", () => {
      const accounts = [
        { id: "1", name: "Savings", balance: 1000 },
        { id: "2", name: "Investment", balance: 5000 },
      ];

      render(<SupplementalAccounts {...defaultProps} supplementalAccounts={accounts} />);

      expect(screen.getByTestId("account-1")).toBeInTheDocument();
      expect(screen.getByTestId("account-2")).toBeInTheDocument();
      expect(screen.getByText("Savings")).toBeInTheDocument();
      expect(screen.getByText("Investment")).toBeInTheDocument();
    });

    it("should show expiration alert when accounts are expiring", async () => {
      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        expiringAccounts: [{ id: "1", name: "Account 1" }],
      });

      render(<SupplementalAccounts {...defaultProps} />);

      expect(screen.getByTestId("expiration-alert")).toBeInTheDocument();
    });

    it("should not show expiration alert when no accounts are expiring", async () => {
      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        expiringAccounts: [],
      });

      render(<SupplementalAccounts {...defaultProps} />);

      expect(screen.queryByTestId("expiration-alert")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call openAddForm when Add Account button is clicked", async () => {
      const mockOpenAddForm = vi.fn();

      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        openAddForm: mockOpenAddForm,
      });

      render(<SupplementalAccounts {...defaultProps} />);

      const addButton = screen.getByText("Add Account");
      await userEvent.click(addButton);

      expect(mockOpenAddForm).toHaveBeenCalled();
    });

    it("should call toggleBalanceVisibility when Toggle Balances button is clicked", async () => {
      const mockToggleBalances = vi.fn();

      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        toggleBalanceVisibility: mockToggleBalances,
      });

      render(<SupplementalAccounts {...defaultProps} />);

      const toggleButton = screen.getByText("Toggle Balances");
      await userEvent.click(toggleButton);

      expect(mockToggleBalances).toHaveBeenCalled();
    });
  });

  describe("Modal States", () => {
    it("should show AccountFormModal when showAddModal is true", async () => {
      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        showAddModal: true,
      });

      render(<SupplementalAccounts {...defaultProps} />);

      expect(screen.getByTestId("account-form-modal")).toBeInTheDocument();
    });

    it("should show TransferModal when showTransferModal is true", async () => {
      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        showTransferModal: true,
      });

      render(<SupplementalAccounts {...defaultProps} />);

      expect(screen.getByTestId("transfer-modal")).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should handle missing supplementalAccounts prop", () => {
      render(<SupplementalAccounts {...defaultProps} supplementalAccounts={undefined} />);

      expect(screen.getByTestId("accounts-header")).toBeInTheDocument();
    });

    it("should handle missing envelopes prop", () => {
      render(<SupplementalAccounts {...defaultProps} envelopes={undefined} />);

      expect(screen.getByTestId("accounts-header")).toBeInTheDocument();
    });

    it("should handle missing currentUser prop", () => {
      render(<SupplementalAccounts {...defaultProps} currentUser={undefined} />);

      expect(screen.getByTestId("accounts-header")).toBeInTheDocument();
    });
  });

  describe("Balance Visibility", () => {
    it("should show balances when showBalances is true", async () => {
      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        showBalances: true,
      });

      const accounts = [{ id: "1", name: "Account 1", balance: 1000 }];

      render(<SupplementalAccounts {...defaultProps} supplementalAccounts={accounts} />);

      expect(screen.getByText("Balance: $1000")).toBeInTheDocument();
    });

    it("should hide balances when showBalances is false", async () => {
      useSupplementalAccounts.mockReturnValue({
        ...useSupplementalAccounts(),
        showBalances: false,
      });

      const accounts = [{ id: "1", name: "Account 1", balance: 1000 }];

      render(<SupplementalAccounts {...defaultProps} supplementalAccounts={accounts} />);

      expect(screen.queryByText("Balance: $1000")).not.toBeInTheDocument();
    });
  });
});
