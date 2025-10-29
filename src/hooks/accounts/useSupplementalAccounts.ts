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

const useSupplementalAccounts = ({
  supplementalAccounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransferToEnvelope,
  envelopes: _envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showBalances, setShowBalances] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringAccount, setTransferringAccount] = useState(null);

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
  } = useEditLock("supplemental_account", editingAccount?.id, {
    autoAcquire: !!editingAccount,
    autoRelease: true,
    showToasts: true,
  });

  // Form Management
  const resetForm = () => {
    setAccountForm(getEmptyAccountForm());
  };

  const populateFormForEdit = (account) => {
    setAccountForm(populateFormFromAccount(account));
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
      onUpdateAccount,
      onAddAccount,
      releaseLock,
    });

    handleAccountSaveSuccess(setShowAddModal, setEditingAccount, resetForm);
  };

  const startEdit = (account) => {
    startAccountEdit(account, populateFormForEdit, setEditingAccount, setShowAddModal);
  };

  const handleCloseModal = () => {
    handleModalCloseWithLock(isOwnLock, releaseLock, setEditingAccount, setShowAddModal, resetForm);
  };

  const handleDelete = async (accountId) => {
    await handleAccountDelete(accountId, confirm, onDeleteAccount);
  };

  // Transfer Operations
  const startTransfer = (account) => {
    startAccountTransfer(
      account,
      setTransferringAccount,
      setTransferForm,
      setShowTransferModal,
      createTransferFormForAccount
    );
  };

  const handleTransfer = () => {
    const validation = validateTransferForm(transferForm, transferringAccount);
    if (!validation.isValid) {
      globalToast.showError(validation.message, "Transfer Error", 8000);
      return;
    }

    executeTransfer(transferForm, transferringAccount, onTransferToEnvelope);
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
  const accountTotals = calculateAccountTotals(supplementalAccounts);

  return {
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
  };
};

export default useSupplementalAccounts;
