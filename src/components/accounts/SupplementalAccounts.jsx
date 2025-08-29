import React from "react";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import EditLockIndicator from "../ui/EditLockIndicator";
import useSupplementalAccounts from "../../hooks/accounts/useSupplementalAccounts";
import {
  ACCOUNT_TYPES,
  ACCOUNT_COLORS,
  calculateDaysUntilExpiration,
  getExpirationStatus,
} from "../../utils/accounts";

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
    totalValue,
    expiringAccounts,
    // Utilities
    getAccountTypeInfo,
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center text-gray-900">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-cyan-500 p-2 rounded-xl">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </div>
            Supplemental Accounts
          </h3>
          <p className="text-sm text-gray-700 mt-1 font-medium">
            Track FSA, HSA, and other non-budget accounts • Total: $
            {totalValue.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleBalanceVisibility}
            className="p-2 text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
            title={showBalances ? "Hide balances" : "Show balances"}
          >
            {showBalances ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={openAddForm}
            className="btn btn-primary text-sm flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Account
          </button>
        </div>
      </div>

      {/* Expiration Alerts */}
      {expiringAccounts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                {expiringAccounts.length} account
                {expiringAccounts.length === 1 ? "" : "s"} expiring soon
              </p>
              <div className="text-xs text-orange-700 mt-1">
                {expiringAccounts.map((account) => {
                  const days = calculateDaysUntilExpiration(
                    account.expirationDate,
                  );
                  return (
                    <span key={account.id} className="mr-3">
                      {account.name}: {days === 0 ? "Today" : `${days} days`}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      {supplementalAccounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white/60 rounded-lg border border-white/20">
          <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No supplemental accounts added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplementalAccounts.map((account) => {
            const typeInfo = getAccountTypeInfo(account.type);
            const daysUntilExpiration = calculateDaysUntilExpiration(
              account.expirationDate,
            );
            const expirationStatus = getExpirationStatus(daysUntilExpiration);

            return (
              <div
                key={account.id}
                className="bg-white/80 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/90 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: account.color }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {account.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {typeInfo.icon} {typeInfo.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {!account.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(account)}
                      className="p-1 text-gray-400 hover:text-cyan-600"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      Current Balance:
                    </span>
                    <span className="font-bold text-gray-900">
                      {showBalances
                        ? `$${account.currentBalance.toFixed(2)}`
                        : "••••"}
                    </span>
                  </div>

                  {account.annualContribution > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        Annual Contribution:
                      </span>
                      <span className="text-xs text-gray-700">
                        {showBalances
                          ? `$${account.annualContribution.toFixed(2)}`
                          : "••••"}
                      </span>
                    </div>
                  )}

                  {account.expirationDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Expires:</span>
                      <span
                        className={`text-xs font-medium ${expirationStatus.color}`}
                      >
                        {expirationStatus.text}
                      </span>
                    </div>
                  )}
                </div>

                {account.description && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    {account.description}
                  </p>
                )}

                {/* Transfer Button */}
                {account.currentBalance > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => startTransfer(account)}
                      className="w-full btn btn-sm btn-primary flex items-center justify-center"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Transfer to Budget
                    </button>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Last updated:{" "}
                  {new Date(account.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 flex-1">
                <h3 className="text-lg font-semibold">
                  {editingAccount ? "Edit Account" : "Add Supplemental Account"}
                </h3>
                {/* Edit Lock Status for existing accounts */}
                {editingAccount && lockLoading && (
                  <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-1" />
                    Acquiring...
                  </div>
                )}
                {editingAccount && isLocked && (
                  <div
                    className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isOwnLock
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {isOwnLock ? (
                      <>
                        <Unlock className="h-3 w-3 mr-1" />
                        Editing
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        {lock?.userName}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Lock break button for expired locks */}
                {editingAccount &&
                  isLocked &&
                  !isOwnLock &&
                  lock &&
                  new Date(lock.expiresAt) <= new Date() && (
                    <button
                      onClick={breakLock}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Break
                    </button>
                  )}
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Edit Lock Warning */}
            {editingAccount && (
              <EditLockIndicator
                isLocked={isLocked}
                isOwnLock={isOwnLock}
                lock={lock}
                onBreakLock={breakLock}
                className="mb-4"
              />
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, name: e.target.value })
                  }
                  disabled={editingAccount && !canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Health FSA 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <select
                  value={accountForm.type}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, type: e.target.value })
                  }
                  disabled={editingAccount && !canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.currentBalance}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        currentBalance: e.target.value,
                      })
                    }
                    disabled={editingAccount && !canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Contribution
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.annualContribution}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        annualContribution: e.target.value,
                      })
                    }
                    disabled={editingAccount && !canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={accountForm.expirationDate}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      expirationDate: e.target.value,
                    })
                  }
                  disabled={editingAccount && !canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {ACCOUNT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccountForm({ ...accountForm, color })}
                      className={`w-6 h-6 rounded-lg border-2 transition-all ${
                        accountForm.color === color
                          ? "border-gray-800 scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={accountForm.description}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  disabled={editingAccount && !canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Notes about this account..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={accountForm.isActive}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      isActive: e.target.checked,
                    })
                  }
                  disabled={editingAccount && !canEdit}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Account is active
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                disabled={editingAccount && !canEdit}
                className="flex-1 btn btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingAccount ? "Update Account" : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && transferringAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Transfer from {transferringAccount.name}
              </h3>
              <button
                onClick={handleCloseTransferModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Available Balance:</span>
                  <span className="font-bold text-green-600">
                    ${transferringAccount.currentBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to Envelope *
                </label>
                <select
                  value={transferForm.envelopeId}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      envelopeId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select an envelope...</option>
                  {envelopes.map((envelope) => (
                    <option key={envelope.id} value={envelope.id}>
                      {envelope.name} ($
                      {envelope.currentAmount?.toFixed(2) || "0.00"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={transferringAccount.currentBalance}
                  value={transferForm.amount}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={transferForm.description}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder={`Transfer from ${transferringAccount.name}`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseTransferModal}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="flex-1 btn btn-primary"
              >
                Transfer ${transferForm.amount || "0.00"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplementalAccounts;
