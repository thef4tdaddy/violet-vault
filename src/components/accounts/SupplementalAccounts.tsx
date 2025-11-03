import useSupplementalAccounts from "@/hooks/accounts/useSupplementalAccounts";
import AccountsHeader from "./AccountsHeader";
import ExpirationAlert from "./ExpirationAlert";
import AccountsGrid from "./AccountsGrid";
import AccountFormModal from "./AccountFormModal";
import TransferModal from "./TransferModal";

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

      {/* White block with black outline for accounts area */}
      <div className="bg-white rounded-xl p-6 border-2 border-black shadow-sm">
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
