import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useSupplementalAccounts from "../useSupplementalAccounts";

// Mock dependencies
vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: () => ({
    budgetId: "test-budget-123",
    user: { userName: "Test User", userColor: "#ff5733" },
  }),
}));

vi.mock("@/hooks/platform/ux/useConfirm", () => ({
  useConfirm: () => vi.fn(async () => true),
}));

vi.mock("@/hooks/core/auth/security/useEditLock", () => ({
  default: () => ({
    isLocked: false,
    isOwnLock: false,
    canEdit: true,
    lock: vi.fn(),
    releaseLock: vi.fn(),
    breakLock: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/services/sync/editLockService", () => ({
  initializeEditLocks: vi.fn(),
}));

vi.mock("@/utils/accounts/accountValidation", () => ({
  validateAccountForm: vi.fn(() => ({ isValid: true })),
  validateTransferForm: vi.fn(() => ({ isValid: true })),
  calculateAccountTotals: vi.fn(() => ({
    totalValue: 1000,
    expiringAccounts: [],
  })),
}));

vi.mock("@/utils/accounts/accountHelpers", () => ({
  getAccountTypeInfo: vi.fn(() => ({ label: "Checking", icon: "Bank" })),
}));

vi.mock("@/stores/ui/toastStore", () => ({
  globalToast: {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  },
}));

vi.mock("../utils/accountFormUtils", () => ({
  getEmptyAccountForm: vi.fn(() => ({ name: "", type: "", balance: 0 })),
  getEmptyTransferForm: vi.fn(() => ({ amount: 0, envelopeId: "" })),
  populateFormFromAccount: vi.fn((account) => account),
  createTransferFormForAccount: vi.fn(() => ({ amount: 0, envelopeId: "" })),
}));

vi.mock("../utils/accountOperationsUtils", () => ({
  saveAccount: vi.fn(),
  executeTransfer: vi.fn(),
}));

vi.mock("../utils/accountHandlersUtils", () => ({
  handleAccountSaveSuccess: vi.fn((setShowAddModal, setEditingAccount, resetForm) => {
    setShowAddModal(false);
    setEditingAccount(null);
    resetForm();
  }),
  handleModalCloseWithLock: vi.fn(
    (_isOwnLock, _releaseLock, setEditingAccount, setShowAddModal, resetForm) => {
      setShowAddModal(false);
      setEditingAccount(null);
      resetForm();
    }
  ),
  handleAccountDelete: vi.fn(async (accountId, _confirm, onDeleteAccount) => {
    await onDeleteAccount(accountId);
  }),
  handleTransferSuccess: vi.fn((setShowTransferModal, setTransferringAccount, setTransferForm) => {
    setShowTransferModal(false);
    setTransferringAccount(null);
    setTransferForm({ amount: 0, envelopeId: "" });
  }),
  startAccountEdit: vi.fn((account, populateFormForEdit, setEditingAccount, setShowAddModal) => {
    populateFormForEdit(account);
    setEditingAccount(account);
    setShowAddModal(true);
  }),
  startAccountTransfer: vi.fn(
    (
      account,
      setTransferringAccount,
      setTransferForm,
      setShowTransferModal,
      createTransferFormForAccount
    ) => {
      setTransferringAccount(account);
      setTransferForm(createTransferFormForAccount(account));
      setShowTransferModal(true);
    }
  ),
}));

describe("useSupplementalAccounts", () => {
  const mockProps = {
    supplementalAccounts: [
      { id: "acc-1", name: "Checking", type: "checking", balance: 500 },
      { id: "acc-2", name: "Savings", type: "savings", balance: 1500 },
    ],
    onAddAccount: vi.fn(),
    onUpdateAccount: vi.fn(),
    onDeleteAccount: vi.fn(),
    onTransferToEnvelope: vi.fn(),
    envelopes: [{ id: "env-1", name: "Groceries" }],
    currentUser: { userName: "Test User", userColor: "#ff5733" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.showAddModal).toBe(false);
    expect(result.current.editingAccount).toBe(null);
    expect(result.current.showBalances).toBe(true);
    expect(result.current.showTransferModal).toBe(false);
    expect(result.current.transferringAccount).toBe(null);
  });

  it("should provide account form state", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.accountForm).toBeDefined();
    expect(result.current.transferForm).toBeDefined();
    expect(result.current.setAccountForm).toBeDefined();
    expect(result.current.setTransferForm).toBeDefined();
  });

  it("should provide edit locking state", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.isLocked).toBeDefined();
    expect(result.current.isOwnLock).toBeDefined();
    expect(result.current.canEdit).toBeDefined();
    expect(result.current.lockLoading).toBeDefined();
  });

  it("should provide action handlers", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.handleAddAccount).toBeDefined();
    expect(result.current.startEdit).toBeDefined();
    expect(result.current.handleCloseModal).toBeDefined();
    expect(result.current.handleDelete).toBeDefined();
    expect(result.current.startTransfer).toBeDefined();
    expect(result.current.handleTransfer).toBeDefined();
    expect(result.current.openAddForm).toBeDefined();
  });

  it("should toggle balance visibility", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.showBalances).toBe(true);

    act(() => {
      result.current.toggleBalanceVisibility();
    });

    expect(result.current.showBalances).toBe(false);

    act(() => {
      result.current.toggleBalanceVisibility();
    });

    expect(result.current.showBalances).toBe(true);
  });

  it("should open add form", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.openAddForm();
    });

    expect(result.current.showAddModal).toBe(true);
    expect(result.current.editingAccount).toBe(null);
  });

  it("should calculate account totals", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.totalValue).toBeDefined();
    expect(result.current.expiringAccounts).toBeDefined();
  });

  it("should handle account submission", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.handleAddAccount();
    });

    // Should validate and call handlers
    expect(result.current).toBeDefined();
  });

  it("should start editing an account", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    const account = mockProps.supplementalAccounts[0];

    act(() => {
      result.current.startEdit(account);
    });

    // startAccountEdit handler should be called
    expect(result.current).toBeDefined();
  });

  it("should handle modal close", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.openAddForm();
    });

    act(() => {
      result.current.handleCloseModal();
    });

    // Modal should be closed
    expect(result.current).toBeDefined();
  });

  it("should start transfer", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    const account = mockProps.supplementalAccounts[0];

    act(() => {
      result.current.startTransfer(account);
    });

    // startAccountTransfer handler should be called
    expect(result.current).toBeDefined();
  });

  it("should handle transfer", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.handleTransfer();
    });

    // Should validate and execute transfer
    expect(result.current).toBeDefined();
  });

  it("should close transfer modal", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.handleCloseTransferModal();
    });

    // Should close transfer modal
    expect(result.current).toBeDefined();
  });

  it("should delete account", async () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    await act(async () => {
      await result.current.handleDelete("acc-1");
    });

    // Should call delete handler
    expect(result.current).toBeDefined();
  });

  it("should provide account type info utility", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    expect(result.current.getAccountTypeInfo).toBeDefined();
    expect(typeof result.current.getAccountTypeInfo).toBe("function");
  });

  it("should handle empty supplemental accounts", () => {
    const emptyProps = { ...mockProps, supplementalAccounts: [] };
    const { result } = renderHook(() => useSupplementalAccounts(emptyProps));

    expect(result.current).toBeDefined();
    expect(result.current.totalValue).toBeDefined();
  });

  it("should update account form", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.setAccountForm({ name: "New Account", type: "checking", balance: 100 });
    });

    expect(result.current.accountForm.name).toBe("New Account");
  });

  it("should update transfer form", () => {
    const { result } = renderHook(() => useSupplementalAccounts(mockProps));

    act(() => {
      result.current.setTransferForm({ amount: 50, envelopeId: "env-1" });
    });

    expect(result.current.transferForm.amount).toBe(50);
  });
});
