import React, { useState } from "react";
import { X, CreditCard, Wallet, Receipt } from "lucide-react";
import { DEBT_TYPES, DEBT_TYPE_CONFIG, PAYMENT_FREQUENCIES } from "../../../constants/debts";
import { useBudgetStore } from "../../../stores/budgetStore";

/**
 * Modal for adding new debts
 * Pure UI component with form validation
 */
const AddDebtModal = ({ isOpen, onClose, onSubmit }) => {
  // Get envelopes for dropdown selection
  const { envelopes = [] } = useBudgetStore();
  const [formData, setFormData] = useState({
    name: "",
    creditor: "",
    type: DEBT_TYPES.PERSONAL,
    currentBalance: "",
    originalBalance: "",
    interestRate: "",
    minimumPayment: "",
    paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    paymentDueDate: "",
    notes: "",
    // Connection fields
    createBill: true, // Automatically create a bill for payments
    envelopeId: "", // Envelope to fund payments from
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Debt name is required";
    }

    if (!formData.creditor.trim()) {
      newErrors.creditor = "Creditor name is required";
    }

    if (!formData.currentBalance || parseFloat(formData.currentBalance) < 0) {
      newErrors.currentBalance = "Valid current balance is required";
    }

    if (formData.originalBalance && parseFloat(formData.originalBalance) < 0) {
      newErrors.originalBalance = "Original balance must be positive";
    }

    // Validate that original balance is not less than current balance if both provided
    if (
      formData.originalBalance &&
      formData.currentBalance &&
      parseFloat(formData.originalBalance) < parseFloat(formData.currentBalance)
    ) {
      newErrors.originalBalance = "Original balance cannot be less than current balance";
    }

    if (
      formData.interestRate &&
      (parseFloat(formData.interestRate) < 0 || parseFloat(formData.interestRate) > 100)
    ) {
      newErrors.interestRate = "Interest rate must be between 0 and 100";
    }

    if (!formData.minimumPayment || parseFloat(formData.minimumPayment) < 0) {
      newErrors.minimumPayment = "Valid minimum payment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const debtData = {
        ...formData,
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate) || 0,
        minimumPayment: parseFloat(formData.minimumPayment),
        originalBalance: formData.originalBalance
          ? parseFloat(formData.originalBalance)
          : parseFloat(formData.currentBalance), // Default to current balance if not specified
      };

      await onSubmit(debtData);
      resetForm();
    } catch (error) {
      console.error("Error creating debt:", error);
      setErrors({ submit: "Failed to create debt. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      creditor: "",
      type: DEBT_TYPES.PERSONAL,
      currentBalance: "",
      originalBalance: "",
      interestRate: "",
      minimumPayment: "",
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      paymentDueDate: "",
      notes: "",
      createBill: true,
      envelopeId: "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-red-600" />
            Add New Debt
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Basic Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Debt Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Car Loan, Credit Card"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creditor *</label>
                <input
                  type="text"
                  value={formData.creditor}
                  onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Chase Bank, Capital One"
                />
                {errors.creditor && <p className="mt-1 text-sm text-red-600">{errors.creditor}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Debt Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.values(DEBT_TYPES).map((type) => {
                  const config = DEBT_TYPE_CONFIG[type];
                  return (
                    <option key={type} value={type}>
                      {config?.name || type}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Financial Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Balance *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalBalance: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Leave blank to use current balance"
                />
                {errors.originalBalance && (
                  <p className="mt-1 text-sm text-red-600">{errors.originalBalance}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional: The original debt amount when you first took it out
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Payment *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.minimumPayment && (
                  <p className="mt-1 text-sm text-red-600">{errors.minimumPayment}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (APR %)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Frequency
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentFrequency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {Object.values(PAYMENT_FREQUENCIES).map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Payment Due Date
              </label>
              <input
                type="date"
                value={formData.paymentDueDate}
                onChange={(e) => setFormData({ ...formData, paymentDueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Envelope & Bill Integration */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Wallet className="h-4 w-4 mr-2 text-purple-600" />
              Payment Integration
            </h4>

            {/* Create Bill Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="createBill"
                checked={formData.createBill}
                onChange={(e) => setFormData({ ...formData, createBill: e.target.checked })}
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label
                htmlFor="createBill"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Receipt className="h-4 w-4 mr-2 text-blue-600" />
                Create recurring bill for payments
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Automatically create a bill entry to track when payments are due
            </p>

            {/* Envelope Selection */}
            {formData.createBill && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Envelope (Optional)
                </label>
                <select
                  value={formData.envelopeId}
                  onChange={(e) => setFormData({ ...formData, envelopeId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select envelope for payments...</option>
                  {envelopes
                    .filter((env) => !env.archived)
                    .map((envelope) => (
                      <option key={envelope.id} value={envelope.id}>
                        📁 {envelope.name} ($
                        {envelope.currentBalance?.toFixed(2) || "0.00"})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose which envelope will fund the debt payments
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Additional notes about this debt..."
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Debt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDebtModal;
