/**
 * Utility functions for CRUD operations on supplemental accounts
 * Extracted from useSupplementalAccounts hook to reduce complexity
 */

import { formatAccountData, generateAccountId } from "@/utils/domain/accounts/accountHelpers";

interface AccountForm {
  name: string;
  type: string;
  currentBalance: string;
  annualContribution: string;
  expirationDate: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface CurrentUser {
  userName: string;
  userColor: string;
}

interface EditingAccount {
  id: string;
}

/**
 * Options for saving an account
 */
export interface SaveAccountOptions {
  accountForm: AccountForm;
  editingAccount: EditingAccount | null;
  isOwnLock: boolean;
  currentUser: CurrentUser;
  onUpdateAccount: (id: string, data: unknown) => void;
  onAddAccount: (data: unknown) => void;
  releaseLock: () => void;
}

/**
 * Save account (add or update) - validation should be done by caller
 */
export const saveAccount = (options: SaveAccountOptions): void => {
  const {
    accountForm,
    editingAccount,
    isOwnLock,
    currentUser,
    onUpdateAccount,
    onAddAccount,
    releaseLock,
  } = options;

  const accountData = formatAccountData(accountForm, currentUser);

  if (editingAccount) {
    onUpdateAccount(editingAccount.id, {
      ...accountData,
      id: editingAccount.id,
    });
    if (isOwnLock) {
      releaseLock();
    }
  } else {
    const newAccount = {
      ...accountData,
      id: generateAccountId(),
    };
    onAddAccount(newAccount);
  }
};

interface TransferForm {
  envelopeId: string;
  amount: string;
  description: string;
}

interface TransferringAccount {
  id: string;
  currentBalance: number;
}

/**
 * Execute transfer - validation should be done by caller
 */
export const executeTransfer = (
  transferForm: TransferForm,
  transferringAccount: TransferringAccount,
  onTransferToEnvelope: (id: string, envelopeId: string, amount: number, desc: string) => void
): void => {
  const amount = parseFloat(transferForm.amount);
  onTransferToEnvelope(
    transferringAccount.id,
    transferForm.envelopeId,
    amount,
    transferForm.description
  );
};
