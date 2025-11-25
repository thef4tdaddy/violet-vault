import { useState, useEffect } from "react";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useConfirm } from "@/hooks/common/useConfirm";
import useEditLock from "@/hooks/common/useEditLock";
import { initializeEditLocks } from "@/services/editLockService";
import {
  validateAccountForm,
  validateTransferForm,
  calculateAccountTotals,
} from "@/utils/accounts/accountValidation";
import { getAccountTypeInfo } from "@/utils/accounts/accountHelpers";
import { globalToast } from "@/stores/ui/toastStore";
import {
  getEmptyAccountForm,
  getEmptyTransferForm,
  populateFormFromAccount,
  createTransferFormForAccount,
} from "./utils/accountFormUtils";
import { saveAccount, executeTransfer } from "./utils/accountOperationsUtils";
import {
  handleAccountSaveSuccess,
  handleModalCloseWithLock,
  handleAccountDelete,
  handleTransferSuccess,
  startAccountEdit,
  startAccountTransfer,
} from "./utils/accountHandlersUtils";

interface Account {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface TransferringAccount {
  id: string;
  name: string;
  currentBalance?: number;
  [key: string]: unknown;
}

// eslint-disable-next-line max-lines-per-function, max-statements -- Complex hook managing account CRUD, transfers, edit locking, and form state
const useSupplementalAccounts = ({
  supplementalAccounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransferToEnvelope,
  envelopes: _envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}: {
  supplementalAccounts?: unknown[];
  onAddAccount: (account: Account) => void;
  onUpdateAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onTransferToEnvelope: (transfer: {
    accountId: string;
    envelopeId: string;
    amount: number;
    description: string;
  }) => void;
  envelopes?: unknown[];
  currentUser?: { userName: string; userColor: string };
}) => {
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringAccount, setTransferringAccount] = useState<TransferringAccount | null>(null);

  // Form State
  const [accountForm, setAccountForm] = useState(getEmptyAccountForm());
  const [transferForm, setTransferForm] = useState(getEmptyTransferForm());

  // Auth and Locking
  const {
    securityContext: { budgetId },
    user: authCurrentUser,
  } = useAuthManager();
  const confirm = useConfirm();

  // Initialize edit lock service when component mounts
  useEffect(() => {
    if (budgetId && authCurrentUser) {
      initializeEditLocks(budgetId, authCurrentUser);
    }
  }, [budgetId, authCurrentUser]);

  // Edit locking for the account being edited
  const {
    isLocked,
    isOwnLock,
    canEdit,
    lock,
    releaseLock,
    breakLock,
    isLoading: lockLoading,
  } = useEditLock("supplemental_account", editingAccount?.id ?? undefined, {
    autoAcquire: !!editingAccount,
    autoRelease: true,
    showToasts: true,
  });

  // Form Management
  const resetForm = () => {
    setAccountForm(getEmptyAccountForm());
  };

  const getAccountForHelper = (account: Account) => {
    return account as unknown as {
      name: string;
      type: string;
      currentBalance: number;
      annualContribution?: number;
      expirationDate?: string | null;
      description?: string | null;
      color: string;
      isActive: boolean;
      id?: string | number;
      createdBy?: string;
      createdAt?: string;
      lastUpdated?: string;
      transactions?: unknown[];
    };
  };

  const populateFormForEdit = (account: Account) => {
    setAccountForm(populateFormFromAccount(getAccountForHelper(account)));
  };

  // CRUD Operations
  const handleAddAccount = () => {
    const validation = validateAccountForm(accountForm);
    if (!validation.isValid) {
      globalToast.showError(validation.message, "Validation Error", 8000);
      return;
    }

    // Check edit lock for updates
    if (editingAccount && !canEdit) {
      globalToast.showError(
        "Cannot save changes - account is locked by another user",
        "Account Locked"
      );
      return;
    }

    saveAccount({
      accountForm,
      editingAccount,
      isOwnLock,
      currentUser,
      onUpdateAccount: (_id: string, data: unknown) => {
        onUpdateAccount(data as Account);
      },
      onAddAccount: (data: unknown) => {
        onAddAccount(data as Account);
      },
      releaseLock,
    });

    handleAccountSaveSuccess(setShowAddModal, setEditingAccount, resetForm);
  };

  const startEdit = (account: Account) => {
    const accountForEdit = getAccountForHelper(account);
    const populateFn = populateFormForEdit as unknown as (account: {
      name: string;
      type: string;
      currentBalance: number;
      annualContribution?: number;
      expirationDate?: string | null;
      description?: string | null;
      color: string;
      isActive: boolean;
      id?: string | number;
      createdBy?: string;
      createdAt?: string;
      lastUpdated?: string;
      transactions?: unknown[];
    }) => void;
    const setEditingAccountFn = setEditingAccount as unknown as (account: {
      name: string;
      type: string;
      currentBalance: number;
      annualContribution?: number;
      expirationDate?: string | null;
      description?: string | null;
      color: string;
      isActive: boolean;
      id?: string | number;
      createdBy?: string;
      createdAt?: string;
      lastUpdated?: string;
      transactions?: unknown[];
    }) => void;
    startAccountEdit(accountForEdit, populateFn, setEditingAccountFn, setShowAddModal);
  };

  const handleCloseModal = () => {
    handleModalCloseWithLock(isOwnLock, releaseLock, setEditingAccount, setShowAddModal, resetForm);
  };

  const handleDelete = async (accountId: string) => {
    await handleAccountDelete(accountId, confirm, onDeleteAccount);
  };

  // Transfer Operations
  const startTransfer = (account: TransferringAccount) => {
    const accountForTransfer = account as unknown as {
      id: string;
      name: string;
      currentBalance?: number;
      [key: string]: unknown;
    };
    const accountForHelper = accountForTransfer as unknown as {
      name: string;
      type: string;
      currentBalance: number;
      annualContribution?: number;
      expirationDate?: string | null;
      description?: string | null;
      color: string;
      isActive: boolean;
      id?: string | number;
      createdBy?: string;
      createdAt?: string;
      lastUpdated?: string;
      transactions?: unknown[];
    };
    const setTransferringAccountFn = setTransferringAccount as unknown as (account: {
      name: string;
      type: string;
      currentBalance: number;
      annualContribution?: number;
      expirationDate?: string | null;
      description?: string | null;
      color: string;
      isActive: boolean;
      id?: string | number;
      createdBy?: string;
      createdAt?: string;
      lastUpdated?: string;
      transactions?: unknown[];
    }) => void;
    const createTransferFormFn = createTransferFormForAccount as unknown as (account: {
      name: string;
      type: string;
      currentBalance: number;
      annualContribution?: number;
      expirationDate?: string | null;
      description?: string | null;
      color: string;
      isActive: boolean;
      id?: string | number;
      createdBy?: string;
      createdAt?: string;
      lastUpdated?: string;
      transactions?: unknown[];
    }) => { envelopeId: string; amount: string; description: string };
    startAccountTransfer(
      accountForHelper,
      setTransferringAccountFn,
      setTransferForm,
      setShowTransferModal,
      createTransferFormFn
    );
  };

  const handleTransfer = () => {
    const validation = validateTransferForm(transferForm, transferringAccount);
    if (!validation.isValid) {
      globalToast.showError(validation.message, "Transfer Error", 8000);
      return;
    }

    const accountForTransfer = transferringAccount as unknown as {
      id: string;
      name: string;
      currentBalance: number;
      [key: string]: unknown;
    };
    executeTransfer(
      transferForm,
      accountForTransfer,
      (id: string, envelopeId: string, amount: number, desc: string) => {
        onTransferToEnvelope({ accountId: id, envelopeId, amount, description: desc });
      }
    );
    handleTransferSuccess(setShowTransferModal, setTransferringAccount, setTransferForm);
  };

  const handleCloseTransferModal = () => {
    handleTransferSuccess(setShowTransferModal, setTransferringAccount, setTransferForm);
  };

  // UI Actions
  const openAddForm = () => {
    resetForm();
    setEditingAccount(null);
    setShowAddModal(true);
  };

  const toggleBalanceVisibility = () => {
    setShowBalances(!showBalances);
  };

  // Computed Values
  const accountTotals = calculateAccountTotals(supplementalAccounts as never[]);

  const getReturnValue = () => ({
    // UI State
    showAddModal,
    editingAccount,
    showBalances,
    showTransferModal,
    transferringAccount,

    // Form State
    accountForm,
    transferForm,
    setAccountForm,
    setTransferForm,

    // Edit Locking
    isLocked,
    isOwnLock,
    canEdit,
    lock,
    releaseLock,
    breakLock,
    lockLoading,

    // Actions
    handleAddAccount,
    startEdit,
    handleCloseModal,
    handleDelete,
    startTransfer,
    handleTransfer,
    handleCloseTransferModal,
    openAddForm,
    toggleBalanceVisibility,

    // Computed Values
    totalValue: accountTotals.totalValue,
    expiringAccounts: accountTotals.expiringAccounts,

    // Utilities
    getAccountTypeInfo,
  });

  return getReturnValue();
};

export default useSupplementalAccounts;
