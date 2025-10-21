import React from "react";
import useSupplementalAccounts from "../../hooks/accounts/useSupplementalAccounts";
import AccountsHeader from "./AccountsHeader";
import ExpirationAlert from "./ExpirationAlert";
import AccountsGrid from "./AccountsGrid";
import AccountFormModal from "./AccountFormModal";
import TransferModal from "./TransferModal";

const SupplementalAccounts = ({
  supplementalAccounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransferToEnvelope,
  envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
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
    _releaseLock,
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
    supplementalAccounts,
    onAddAccount,
    onUpdateAccount,
    onDeleteAccount,
    onTransferToEnvelope,
    envelopes,
    currentUser,
  });

  return (
    <div className="space-y-4">
      <AccountsHeader
        totalValue={totalValue}
        showBalances={showBalances}
        onToggleBalances={toggleBalanceVisibility}
        onAddAccount={openAddForm}
      />

      <ExpirationAlert expiringAccounts={expiringAccounts} />

      <AccountsGrid
        accounts={supplementalAccounts}
        showBalances={showBalances}
        onEdit={startEdit}
        onDelete={handleDelete}
        onStartTransfer={startTransfer}
      />

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
        envelopes={envelopes}
      />
    </div>
  );
};

export default SupplementalAccounts;
