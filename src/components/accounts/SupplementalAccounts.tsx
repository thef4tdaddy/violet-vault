import React from "react";
import useSupplementalAccounts from "@/hooks/accounts/useSupplementalAccounts";
import AccountsHeader from "./AccountsHeader";
import AccountsSummaryCards from "./AccountsSummaryCards";
import ExpirationAlert from "./ExpirationAlert";
import AccountsGrid from "./AccountsGrid";
import AccountFormModal from "./AccountFormModal";
import TransferModal from "./TransferModal";
import { getIcon } from "@/utils";

interface Account {
  id: string | number;
  name: string;
  type: string;
  currentBalance: number;
  annualContribution: number;
  expirationDate: string | null;
  description: string | null;
  color: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  transactions: unknown[];
}

interface Envelope {
  id: string | number;
  name: string;
  currentAmount?: number;
}

interface SupplementalAccountsProps {
  supplementalAccounts?: unknown[];
  onAddAccount: unknown;
  onUpdateAccount: unknown;
  onDeleteAccount: unknown;
  onTransferToEnvelope: unknown;
  envelopes?: unknown[];
  currentUser?: unknown;
}

const SupplementalAccounts = ({
  supplementalAccounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransferToEnvelope,
  envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}: SupplementalAccountsProps) => {
  // Type assertions for internal use
  const typedAccounts = supplementalAccounts as Account[];
  const typedEnvelopes = envelopes as Envelope[];
  const {
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
    totalValue,
    expiringAccounts,
  } = useSupplementalAccounts({
    supplementalAccounts: supplementalAccounts as never[],
    onAddAccount,
    onUpdateAccount,
    onDeleteAccount,
    onTransferToEnvelope,
    envelopes: envelopes as never[],
    currentUser: currentUser as { userName: string; userColor: string } | undefined,
  });

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      <AccountsHeader
        totalValue={totalValue}
        showBalances={showBalances}
        onToggleBalances={toggleBalanceVisibility}
        onAddAccount={openAddForm}
      />

      <ExpirationAlert expiringAccounts={expiringAccounts} />

      {/* Summary Cards */}
      <AccountsSummaryCards accounts={typedAccounts as never} />

      {/* White block with black outline for accounts area */}
      <div className="bg-white rounded-xl p-6 border-2 border-black shadow-sm">
        {/* Sub-header for accounts section */}
        {typedAccounts.length > 0 && (
          <div className="mb-6">
            <h3 className="font-black text-black text-base tracking-wide flex items-center">
              {React.createElement(getIcon("CreditCard"), {
                className: "h-4 w-4 mr-2 text-cyan-600",
              })}
              <span className="text-lg">Y</span>OUR&nbsp;&nbsp;<span className="text-lg">A</span>CCOUNTS ({typedAccounts.length})
            </h3>
          </div>
        )}
        <AccountsGrid
          accounts={typedAccounts}
          showBalances={showBalances}
          onEdit={startEdit}
          onDelete={handleDelete}
          onStartTransfer={startTransfer}
        />
      </div>

      <AccountFormModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleAddAccount}
        editingAccount={editingAccount}
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        isLocked={isLocked}
        isOwnLock={isOwnLock}
        canEdit={canEdit}
        lock={lock}
        breakLock={breakLock}
        lockLoading={lockLoading}
      />

      <TransferModal
        isOpen={showTransferModal}
        onClose={handleCloseTransferModal}
        onTransfer={handleTransfer}
        transferringAccount={transferringAccount}
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        envelopes={typedEnvelopes}
      />
    </div>
  );
};

export default SupplementalAccounts;
