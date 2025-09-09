import React from "react";
import { getIcon } from "../../utils";
import EditLockIndicator from "../ui/EditLockIndicator";
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from "../../utils/accounts";

const AccountFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingAccount,
  accountForm,
  setAccountForm,
  // Edit Locking
  isLocked,
  isOwnLock,
  canEdit,
  lock,
  breakLock,
  lockLoading,
}) => {
  if (!isOpen) return null;

  return (
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
                    {React.createElement(getIcon("Unlock"), {
                      className: "h-3 w-3 mr-1",
                    })}
                    Editing
                  </>
                ) : (
                  <>
                    {React.createElement(getIcon("Lock"), {
                      className: "h-3 w-3 mr-1",
                    })}
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
                  {React.createElement(getIcon("Unlock"), {
                    className: "h-3 w-3 mr-1",
                  })}
                  Break
                </button>
              )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
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
            onClick={onClose}
            className="flex-1 btn btn-secondary border-2 border-black"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={editingAccount && !canEdit}
            className="flex-1 btn btn-primary border-2 border-black disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {editingAccount ? "Update Account" : "Add Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountFormModal;
