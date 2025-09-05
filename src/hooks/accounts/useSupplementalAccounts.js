import { useState, useEffect } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { useAuth } from "../../stores/auth/authStore";
import { useConfirm } from "../common/useConfirm";
import useEditLock from "../common/useEditLock";
import { initializeEditLocks } from "../../services/editLockService";
import {
  validateAccountForm,
  validateTransferForm,
  calculateAccountTotals,
} from "../../utils/accounts/accountValidation";
import {
  getAccountTypeInfo,
  formatAccountData,
  generateAccountId,
} from "../../utils/accounts/accountHelpers";

const useSupplementalAccounts = ({
  supplementalAccounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransferToEnvelope,
  envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showBalances, setShowBalances] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringAccount, setTransferringAccount] = useState(null);

  // Form State
  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "FSA",
    currentBalance: "",
    annualContribution: "",
    expirationDate: "",
    description: "",
    color: "#06b6d4",
    isActive: true,
  });

  const [transferForm, setTransferForm] = useState({
    envelopeId: "",
    amount: "",
    description: "",
  });

  // Auth and Locking
  const { budgetId, currentUser: authCurrentUser } = useAuth();
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
    setAccountForm({
      name: "",
      type: "FSA",
      currentBalance: "",
      annualContribution: "",
      expirationDate: "",
      description: "",
      color: "#06b6d4",
      isActive: true,
    });
  };

  const populateFormForEdit = (account) => {
    setAccountForm({
      name: account.name,
      type: account.type,
      currentBalance: account.currentBalance.toString(),
      annualContribution: account.annualContribution?.toString() || "",
      expirationDate: account.expirationDate || "",
      description: account.description || "",
      color: account.color,
      isActive: account.isActive,
    });
  };

  // CRUD Operations
  const handleAddAccount = () => {
    const validation = validateAccountForm(accountForm);
    if (!validation.isValid) {
      globalToast.showError(validation.message, "Validation Error");
      return;
    }

    // Check edit lock for updates
    if (editingAccount && !canEdit) {
      globalToast.showError(
        "Cannot save changes - account is locked by another user",
        "Account Locked",
      );
      return;
    }

    const accountData = formatAccountData(accountForm, currentUser);

    if (editingAccount) {
      onUpdateAccount(editingAccount.id, {
        ...accountData,
        id: editingAccount.id,
      });
      if (isOwnLock) {
        releaseLock();
      }
      setEditingAccount(null);
    } else {
      const newAccount = {
        ...accountData,
        id: generateAccountId(),
      };
      onAddAccount(newAccount);
    }

    setShowAddModal(false);
    resetForm();
  };

  const startEdit = (account) => {
    populateFormForEdit(account);
    setEditingAccount(account);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    if (isOwnLock) {
      releaseLock();
    }
    setEditingAccount(null);
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = async (accountId) => {
    const confirmed = await confirm({
      title: "Delete Account",
      message: "Are you sure you want to delete this account?",
      confirmLabel: "Delete Account",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (confirmed) {
      onDeleteAccount(accountId);
    }
  };

  // Transfer Operations
  const startTransfer = (account) => {
    setTransferringAccount(account);
    setTransferForm({
      envelopeId: "",
      amount: "",
      description: `Transfer from ${account.name}`,
    });
    setShowTransferModal(true);
  };

  const handleTransfer = () => {
    const validation = validateTransferForm(transferForm, transferringAccount);
    if (!validation.isValid) {
      globalToast.showError(validation.message, "Transfer Error");
      return;
    }

    const amount = parseFloat(transferForm.amount);
    onTransferToEnvelope(
      transferringAccount.id,
      transferForm.envelopeId,
      amount,
      transferForm.description,
    );

    setShowTransferModal(false);
    setTransferringAccount(null);
    setTransferForm({ envelopeId: "", amount: "", description: "" });
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setTransferringAccount(null);
    setTransferForm({ envelopeId: "", amount: "", description: "" });
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
