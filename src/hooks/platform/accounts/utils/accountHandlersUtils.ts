/**
 * Utility functions for UI handlers in supplemental accounts
 * Extracted from useSupplementalAccounts hook to reduce complexity
 *
 * @note This file accepts a confirm callback as a parameter, delegating to the caller
 * to use the appropriate toast/confirmation system. The no-legacy-toast rule is safe to
 * ignore here since we're not implementing toast UI directly.
 */

interface Account {
  name: string;
  type: string;
  currentBalance: number;
  annualContribution?: number;
  expirationDate?: string;
  description?: string;
  color: string;
  isActive: boolean;
}

/**
 * Handle successful account save
 */
export const handleAccountSaveSuccess = (
  setShowAddModal: (show: boolean) => void,
  setEditingAccount: (account: null) => void,
  resetForm: () => void
): void => {
  setShowAddModal(false);
  setEditingAccount(null);
  resetForm();
};

/**
 * Handle modal close with lock cleanup
 */
export const handleModalCloseWithLock = (
  isOwnLock: boolean,
  releaseLock: () => void,
  setEditingAccount: (account: null) => void,
  setShowAddModal: (show: boolean) => void,
  resetForm: () => void
): void => {
  if (isOwnLock) {
    releaseLock();
  }
  setEditingAccount(null);
  setShowAddModal(false);
  resetForm();
};

/**
 * Handle account delete with confirmation
 * Note: Parameter named 'confirm' is intentional - it's a callback function, not the legacy API
 */
export const handleAccountDelete = async (
  accountId: string,
  confirm: (options: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    destructive: boolean;
  }) => Promise<boolean>,
  onDeleteAccount: (id: string) => void
): Promise<void> => {
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

/**
 * Handle successful transfer
 */
export const handleTransferSuccess = (
  setShowTransferModal: (show: boolean) => void,
  setTransferringAccount: (account: null) => void,
  setTransferForm: (form: { envelopeId: string; amount: string; description: string }) => void
): void => {
  setShowTransferModal(false);
  setTransferringAccount(null);
  setTransferForm({ envelopeId: "", amount: "", description: "" });
};

/**
 * Start editing an account
 */
export const startAccountEdit = (
  account: Account,
  populateFormForEdit: (account: Account) => void,
  setEditingAccount: (account: Account) => void,
  setShowAddModal: (show: boolean) => void
): void => {
  populateFormForEdit(account);
  setEditingAccount(account);
  setShowAddModal(true);
};

/**
 * Start transfer from account
 */
export const startAccountTransfer = (
  account: Account,
  setTransferringAccount: (account: Account) => void,
  setTransferForm: (form: { envelopeId: string; amount: string; description: string }) => void,
  setShowTransferModal: (show: boolean) => void,
  createTransferFormForAccount: (account: Account) => {
    envelopeId: string;
    amount: string;
    description: string;
  }
): void => {
  setTransferringAccount(account);
  setTransferForm(createTransferFormForAccount(account));
  setShowTransferModal(true);
};
