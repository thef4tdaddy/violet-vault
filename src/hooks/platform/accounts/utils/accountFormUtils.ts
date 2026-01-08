/**
 * Utility functions for supplemental accounts management
 * Extracted from useSupplementalAccounts hook to reduce complexity
 */

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

interface TransferForm {
  envelopeId: string;
  amount: string;
  description: string;
}

/**
 * Get initial/empty account form
 */
export const getEmptyAccountForm = (): AccountForm => ({
  name: "",
  type: "FSA",
  currentBalance: "",
  annualContribution: "",
  expirationDate: "",
  description: "",
  color: "#06b6d4",
  isActive: true,
});

/**
 * Get initial/empty transfer form
 */
export const getEmptyTransferForm = (): TransferForm => ({
  envelopeId: "",
  amount: "",
  description: "",
});

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
 * Populate form from account for editing
 */
export const populateFormFromAccount = (account: Account): AccountForm => ({
  name: account.name,
  type: account.type,
  currentBalance: account.currentBalance.toString(),
  annualContribution: account.annualContribution?.toString() || "",
  expirationDate: account.expirationDate || "",
  description: account.description || "",
  color: account.color,
  isActive: account.isActive,
});

/**
 * Create initial transfer form for account
 */
export const createTransferFormForAccount = (account: Account): TransferForm => ({
  envelopeId: "",
  amount: "",
  description: `Transfer from ${account.name}`,
});
