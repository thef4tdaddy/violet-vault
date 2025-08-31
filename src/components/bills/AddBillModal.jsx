/**
 * AddBillModal Component - Refactored for Issue #152
 *
 * UI-only component using useBillForm hook for all business logic
 * Reduced from 923 LOC to ~350 LOC by extracting form logic
 */
import React, { useEffect } from "react";
import {
  X as CloseIcon,
  Save,
  Sparkles,
  Trash2,
  Lock,
  Unlock,
  User,
  Clock,
  Wallet,
} from "lucide-react";
import { useBillForm } from "../../hooks/bills/useBillForm";
import useEditLock from "../../hooks/common/useEditLock";
import { initializeEditLocks } from "../../services/editLockService";
import { useAuth } from "../../stores/auth/authStore";
import { getIconByName } from "../../utils/common/billIcons";
import { getFrequencyOptions } from "../../utils/common/frequencyCalculations";
import ConnectionDisplay, {
  ConnectionItem,
  ConnectionInfo,
  UniversalConnectionManager,
} from "../ui/ConnectionDisplay";

const AddBillModal = ({
  isOpen,
  onClose,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onError,
  editingBill = null,
  availableEnvelopes = [],
}) => {
  // Use the extracted form logic hook
  const {
    // Form State
    formData,
    showDeleteConfirm,
    deleteEnvelopeToo,
    isSubmitting,

    // Computed Values
    suggestedIconName,
    iconSuggestions,
    categories,

    // Actions
    handleSubmit,
    handleDelete,
    updateField,
    resetForm,

    // UI State Setters
    setShowDeleteConfirm,
    setDeleteEnvelopeToo,

    // Utility Functions
    calculateBiweeklyAmount,
    calculateMonthlyAmount,
    getNextDueDate,
  } = useBillForm({
    editingBill,
    availableEnvelopes,
    onAddBill,
    onUpdateBill,
    onDeleteBill,
    onClose,
    onError,
  });

  // Get auth context for edit locking
  const { budgetId, currentUser } = useAuth();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Edit locking for the bill (only when editing existing bill)
  const { isLocked, isOwnLock, canEdit, lockedBy, acquireLock, releaseLock } = useEditLock(
    editingBill ? `bill-${editingBill.id}` : null,
    currentUser?.userName || "User",
    editingBill ? 300000 : 0 // 5 minutes for editing existing bills
  );

  // Auto-acquire lock when editing existing bill
  useEffect(() => {
    if (editingBill && isOpen && !isLocked && !isOwnLock) {
      acquireLock();
    }
  }, [editingBill, isOpen, isLocked, isOwnLock, acquireLock]);

  // Release lock when closing modal
  useEffect(() => {
    return () => {
      if (isOwnLock) {
        releaseLock();
      }
    };
  }, [isOwnLock, releaseLock]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Frequency options
  const frequencyOptions = getFrequencyOptions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {React.createElement(getIconByName(formData.iconName) || Wallet, {
                className: "h-5 w-5 text-blue-600",
              })}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBill ? "Edit Bill" : "Add New Bill"}
              </h2>
              <p className="text-sm text-gray-600">
                {editingBill
                  ? `Modify details for ${editingBill.name}`
                  : "Set up a new recurring bill"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Edit Lock Indicator */}
        {editingBill && (isLocked || isOwnLock) && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center">
              {isOwnLock ? (
                <>
                  <Unlock className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-800">
                    You are currently editing this bill
                  </span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-800">
                    This bill is being edited by {lockedBy}
                  </span>
                </>
              )}
              <Clock className="h-4 w-4 text-amber-600 ml-4 mr-1" />
              <span className="text-xs text-amber-600">5 min timeout</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bill Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bill Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={editingBill && !canEdit}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="e.g., Electric Bill, Internet, Rent"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  disabled={editingBill && !canEdit}
                  className={`w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
                disabled={editingBill && !canEdit}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => updateField("frequency", e.target.value)}
                disabled={editingBill && !canEdit}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                disabled={editingBill && !canEdit}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
              {suggestedIconName !== formData.iconName && (
                <button
                  type="button"
                  onClick={() => updateField("iconName", suggestedIconName)}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                  disabled={editingBill && !canEdit}
                >
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Use suggested
                </button>
              )}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {iconSuggestions.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => updateField("iconName", name)}
                  disabled={editingBill && !canEdit}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    formData.iconName === name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${editingBill && !canEdit ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {React.createElement(Icon, {
                    className: "h-5 w-5 text-gray-600",
                  })}
                </button>
              ))}
            </div>
          </div>

          {/* Envelope Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Envelope
            </label>
            <select
              value={formData.selectedEnvelope}
              onChange={(e) => updateField("selectedEnvelope", e.target.value)}
              disabled={editingBill && !canEdit}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select an envelope (optional)</option>
              {availableEnvelopes.map((envelope) => (
                <option key={envelope.id} value={envelope.id}>
                  {envelope.name} ($
                  {envelope.currentBalance?.toFixed(2) || "0.00"})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              disabled={editingBill && !canEdit}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                editingBill && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Additional notes about this bill..."
            />
          </div>

          {/* Calculation Preview */}
          {formData.amount && formData.frequency && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Calculation Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly equivalent:</span>
                  <span className="font-medium ml-2">
                    $
                    {calculateMonthlyAmount(
                      formData.amount,
                      formData.frequency,
                      formData.customFrequency
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Biweekly equivalent:</span>
                  <span className="font-medium ml-2">
                    $
                    {calculateBiweeklyAmount(
                      formData.amount,
                      formData.frequency,
                      formData.customFrequency
                    ).toFixed(2)}
                  </span>
                </div>
                {formData.dueDate && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Next due date:</span>
                    <span className="font-medium ml-2">
                      {getNextDueDate(formData.frequency, formData.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4 pt-6 border-t border-gray-200">
            {/* Delete Button (only for existing bills) */}
            {editingBill && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!canEdit || isSubmitting}
                className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bill
              </button>
            )}

            {/* Save/Cancel Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (editingBill && !canEdit)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {editingBill ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingBill ? "Update Bill" : "Create Bill"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Bill</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                Are you sure you want to delete "{editingBill?.name}"?
              </p>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="deleteEnvelope"
                  checked={deleteEnvelopeToo}
                  onChange={(e) => setDeleteEnvelopeToo(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="deleteEnvelope" className="ml-2 text-sm text-gray-700">
                  Also delete associated envelope
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Bill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBillModal;
