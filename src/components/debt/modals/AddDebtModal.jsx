import React from "react";
import { X, CreditCard, Receipt, Lock, Unlock, User, Clock } from "lucide-react";
import ConnectionDisplay, {
  ConnectionItem,
  ConnectionInfo,
} from "../../../components/ui/ConnectionDisplay";
import { DEBT_TYPE_CONFIG, PAYMENT_FREQUENCIES } from "../../../constants/debts";
import { useDebtModalLogic } from "../../../hooks/debts/useDebtModalLogic";

/**
 * Pure UI component for debt modal - ALL logic extracted to useDebtModalLogic hook
 */
const AddDebtModal = ({ isOpen, onClose, onSubmit, debt = null }) => {
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isEditMode,
    editLock,
    envelopes,
    bills,
    billsLoading,
    connectionData,
    shouldShowExistingConnections,
    debtMetrics,
    canEdit,
    handleFormSubmit,
    handleClose,
  } = useDebtModalLogic(debt, isOpen, onSubmit, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit Debt" : "Add New Debt"}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode ? "Update debt information" : "Track and manage a new debt"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Edit Lock Warning */}
        {editLock.shouldShowEditLockWarning && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Currently Being Edited</h3>
                <p className="text-sm text-red-700 mt-1">
                  {editLock.lockedBy} is currently editing this debt.
                  {editLock.isExpired
                    ? "The lock has expired and can be broken."
                    : `Lock expires in ${Math.ceil(editLock.timeRemaining / 1000)} seconds.`}
                </p>
                {editLock.isExpired && (
                  <button
                    onClick={editLock.breakLock}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Break Lock & Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Own Lock Indicator */}
        {editLock.shouldShowOwnLockIndicator && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Unlock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">You are editing this debt</span>
              <Clock className="h-4 w-4 text-green-600 ml-2" />
              <span className="text-xs text-green-600">
                Auto-save in {Math.ceil(editLock.timeRemaining / 1000)}s
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Debt Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Chase Credit Card"
                  disabled={!canEdit}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creditor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.creditor}
                  onChange={(e) => setFormData({ creditor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Chase Bank"
                  disabled={!canEdit}
                />
                {errors.creditor && <p className="mt-1 text-sm text-red-600">{errors.creditor}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Debt Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={!canEdit}
              >
                {Object.entries(DEBT_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Financial Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Balance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ currentBalance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!canEdit}
                />
                {errors.currentBalance && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentBalance}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalBalance}
                  onChange={(e) => setFormData({ originalBalance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00 (optional)"
                  disabled={!canEdit}
                />
                {errors.originalBalance && (
                  <p className="mt-1 text-sm text-red-600">{errors.originalBalance}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (APR) %
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ interestRate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!canEdit}
                />
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Payment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ minimumPayment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!canEdit}
                />
                {errors.minimumPayment && (
                  <p className="mt-1 text-sm text-red-600">{errors.minimumPayment}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Frequency
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData({ paymentFrequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={!canEdit}
                >
                  {Object.entries(PAYMENT_FREQUENCIES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={formData.paymentDueDate}
                  onChange={(e) => setFormData({ paymentDueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>
            </div>

            {/* Debt Metrics Display */}
            {debtMetrics && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payoff Projection</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Time to payoff:</span>
                    <p className="font-medium text-gray-900">{debtMetrics.payoffTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total interest:</span>
                    <p className="font-medium text-gray-900">{debtMetrics.totalInterest}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly interest cost:</span>
                    <p className="font-medium text-gray-900">{debtMetrics.monthlyInterest}</p>
                  </div>
                </div>
                {!debtMetrics.isPaymentSufficient && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    ⚠️ Minimum payment only covers interest - consider increasing payment amount
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Payment Setup</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to handle payments?
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="create_new"
                    checked={formData.paymentMethod === "create_new"}
                    onChange={(e) => setFormData({ paymentMethod: e.target.value })}
                    className="mt-1"
                    disabled={!canEdit}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Create new bill & envelope</div>
                    <div className="text-sm text-gray-600">
                      Automatically create a bill and connect to an envelope for payments
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="connect_existing"
                    checked={formData.paymentMethod === "connect_existing"}
                    onChange={(e) => setFormData({ paymentMethod: e.target.value })}
                    className="mt-1"
                    disabled={!canEdit}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Connect to existing bill</div>
                    <div className="text-sm text-gray-600">
                      Link this debt to an existing bill in your budget
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="manual_only"
                    checked={formData.paymentMethod === "manual_only"}
                    onChange={(e) => setFormData({ paymentMethod: e.target.value })}
                    className="mt-1"
                    disabled={!canEdit}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Manual tracking only</div>
                    <div className="text-sm text-gray-600">
                      Track debt without automatic bill creation
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Show envelope selection for new bill creation */}
            {formData.paymentMethod === "create_new" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Envelope for Payments <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.envelopeId}
                  onChange={(e) => setFormData({ envelopeId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={!canEdit}
                >
                  <option value="">Choose an envelope...</option>
                  {envelopes.map((envelope) => (
                    <option key={envelope.id} value={envelope.id}>
                      {envelope.name} (${envelope.currentBalance?.toFixed(2) || "0.00"})
                    </option>
                  ))}
                </select>
                {errors.envelopeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.envelopeId}</p>
                )}
              </div>
            )}

            {/* Show existing bill selection */}
            {formData.paymentMethod === "connect_existing" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Existing Bill <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.existingBillId}
                  onChange={(e) => setFormData({ existingBillId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={!canEdit || billsLoading}
                >
                  <option value="">Choose a bill...</option>
                  {bills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      {bill.name} - ${bill.amount?.toFixed(2)}
                    </option>
                  ))}
                </select>
                {errors.existingBillId && (
                  <p className="mt-1 text-sm text-red-600">{errors.existingBillId}</p>
                )}
              </div>
            )}

            {/* Show existing connections */}
            {shouldShowExistingConnections && connectionData && (
              <ConnectionDisplay>
                <ConnectionItem
                  icon={Receipt}
                  title="Payment Automation"
                  connections={connectionData.connections}
                />
                <ConnectionInfo>
                  <p>{connectionData.description}</p>
                </ConnectionInfo>
              </ConnectionDisplay>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Add any additional notes about this debt..."
              disabled={!canEdit}
            />
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canEdit || editLock.isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update Debt" : "Add Debt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDebtModal;
