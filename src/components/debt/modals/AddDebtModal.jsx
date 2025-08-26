import React, { useState, useEffect } from "react";
import { X, CreditCard, Wallet, Receipt, Lock, Unlock, User, Clock } from "lucide-react";
import ConnectionDisplay, { ConnectionItem, ConnectionInfo } from "../../../components/ui/ConnectionDisplay";
import useEditLock from "../../../hooks/useEditLock";
import { initializeEditLocks } from "../../../services/editLockService";
import { useAuth } from "../../../stores/authStore";
import { DEBT_TYPES, DEBT_TYPE_CONFIG, PAYMENT_FREQUENCIES } from "../../../constants/debts";
import { useEnvelopes } from "../../../hooks/useEnvelopes";
import useBills from "../../../hooks/useBills";
import logger from "../../../utils/logger";

/**
 * Modal for adding new debts or editing existing ones
 * Pure UI component with form validation
 */
const AddDebtModal = ({ isOpen, onClose, onSubmit, debt = null }) => {
  const isEditMode = !!debt;

  // Get auth context for edit locking
  const { budgetId, currentUser } = useAuth();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Edit locking for the debt (only when editing existing debt)
  const {
    isLocked,
    isOwnLock,
    canEdit,
    lockedBy,
    timeRemaining,
    isExpired,
    releaseLock,
    breakLock,
    isLoading: lockLoading,
  } = useEditLock("debt", debt?.id, {
    autoAcquire: isOpen && debt?.id, // Only auto-acquire for edits
    autoRelease: true,
    showToasts: true,
  });

  // Get envelopes and bills for dropdown selection using TanStack Query
  const { envelopes = [] } = useEnvelopes();
  const { bills = [], isLoading: billsLoading } = useBills();
  const [formData, setFormData] = useState({
    name: debt?.name || "",
    creditor: debt?.creditor || "",
    type: debt?.type || DEBT_TYPES.PERSONAL,
    currentBalance: debt?.currentBalance?.toString() || "",
    originalBalance: debt?.originalBalance?.toString() || "",
    interestRate: debt?.interestRate?.toString() || "",
    minimumPayment: debt?.minimumPayment?.toString() || "",
    paymentFrequency: debt?.paymentFrequency || PAYMENT_FREQUENCIES.MONTHLY,
    paymentDueDate: debt?.paymentDueDate || "",
    notes: debt?.notes || "",
    // Connection fields
    paymentMethod: "create_new", // "create_new" or "connect_existing"
    createBill: !isEditMode, // Don't auto-create bill when editing
    envelopeId: debt?.envelopeId || "", // Envelope to fund payments from
    existingBillId: debt?.relatedBill?.id || "", // For connecting to existing bill
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find connected bill and envelope for this debt - MOVED BEFORE useEffect
  const connectedBill =
    isEditMode && debt?.id ? bills.find((bill) => bill.debtId === debt.id) : null;
  const connectedEnvelope = connectedBill
    ? envelopes.find((env) => env.id === connectedBill.envelopeId)
    : debt?.envelopeId
      ? envelopes.find((env) => env.id === debt.envelopeId)
      : null;

  // Update form data when debt prop changes
  React.useEffect(() => {
    if (debt) {
      // Determine payment method based on existing connections - SIMPLIFIED
      let paymentMethod = "create_new";
      if (connectedBill) {
        paymentMethod = "connect_existing_bill"; // Bill connection (uses bill's envelope)
      }

      setFormData({
        name: debt.name || "",
        creditor: debt.creditor || "",
        type: debt.type || DEBT_TYPES.PERSONAL,
        currentBalance: debt.currentBalance?.toString() || "",
        originalBalance: debt.originalBalance?.toString() || "",
        interestRate: debt.interestRate?.toString() || "",
        minimumPayment: debt.minimumPayment?.toString() || "",
        paymentFrequency: debt.paymentFrequency || PAYMENT_FREQUENCIES.MONTHLY,
        paymentDueDate: debt.paymentDueDate || "",
        notes: debt.notes || "",
        paymentMethod: paymentMethod,
        createBill: false, // Don't auto-create bill when editing
        envelopeId: debt.envelopeId || connectedEnvelope?.id || "",
        existingBillId: connectedBill?.id || "",
      });
    } else if (!debt && isOpen) {
      // Reset form for new debt
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
        paymentMethod: "create_new",
        createBill: true,
        envelopeId: "",
        existingBillId: "",
      });
    }
  }, [debt, isOpen, connectedBill, connectedEnvelope]);

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

    // Allow original balance to be less than current balance (e.g., for debt consolidation scenarios)
    // Remove this validation as it's too restrictive

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
        // Include connection data for the parent component to handle
        connectionData: {
          paymentMethod: formData.paymentMethod,
          createBill: formData.createBill,
          envelopeId: formData.envelopeId || "",
          existingBillId: formData.existingBillId || "",
          newEnvelopeName: formData.newEnvelopeName || "",
        },
      };

      if (isEditMode) {
        // For edit mode, pass debt ID and updates
        await onSubmit(debt.id, debtData);
      } else {
        // For add mode, just pass the debt data
        await onSubmit(debtData);
      }

      if (!isEditMode) {
        resetForm(); // Only reset form when adding new debt
      }
    } catch (error) {
      logger.error(`Error ${isEditMode ? "updating" : "creating"} debt:`, error);
      setErrors({
        submit: `Failed to ${isEditMode ? "update" : "create"} debt. Please try again.`,
      });
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
      paymentMethod: "create_new",
      createBill: true,
      envelopeId: "",
      existingBillId: "",
      newEnvelopeName: "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    // Release lock when closing
    if (isOwnLock) {
      releaseLock();
    }
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 flex-1">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-red-600" />
              {isEditMode ? "Edit Debt" : "Add New Debt"}
            </h3>
            {/* Edit Lock Status for existing debts */}
            {isEditMode && isLocked && (
              <div
                className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isOwnLock
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {isOwnLock ? (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    You're Editing
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    <User className="h-3 w-3 mr-1" />
                    {lockedBy}
                  </>
                )}
              </div>
            )}
            {isEditMode && lockLoading && (
              <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-1" />
                Acquiring Lock...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Lock Controls for expired locks */}
            {isEditMode && isLocked && !isOwnLock && isExpired && (
              <button
                onClick={breakLock}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
              >
                <Unlock className="h-3 w-3 mr-1" />
                Break Lock
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Lock Warning Banner for existing debts */}
        {isEditMode && isLocked && !canEdit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Currently Being Edited</h3>
                <p className="text-sm text-red-700 mt-1">
                  {lockedBy} is currently editing this debt.
                  {isExpired
                    ? "The lock has expired and can be broken."
                    : `Lock expires in ${Math.ceil(timeRemaining / 1000)} seconds.`}
                </p>
                {isExpired && (
                  <button
                    onClick={breakLock}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Break Lock & Take Control
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
                  Original Balance (Optional)
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
                  placeholder="Leave blank to auto-fill"
                />
                {errors.originalBalance && (
                  <p className="mt-1 text-sm text-red-600">{errors.originalBalance}</p>
                )}
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

          {/* Connected Status Display - Using Shared Component */}
          <ConnectionDisplay
            title="Connected to Payment System"
            icon={Receipt}
            isVisible={isEditMode && (connectedBill || connectedEnvelope)}
            onDisconnect={() => {
              // Clear connections and reset to disconnected state
              setFormData({
                ...formData,
                paymentMethod: "create_new",
                existingBillId: "",
                envelopeId: "",
              });
            }}
          >
            <div className="space-y-3">
              {connectedBill && (
                <ConnectionItem
                  icon={Receipt}
                  title="Connected Bill"
                  details={`${connectedBill.name} • $${connectedBill.amount?.toFixed(2) || "0.00"}${
                    connectedBill.dueDate 
                      ? ` • Due: ${new Date(connectedBill.dueDate).toLocaleDateString()}`
                      : ""
                  }`}
                  badge="Auto-synced"
                />
              )}

              {connectedEnvelope && (
                <ConnectionItem
                  icon={Wallet}
                  title="Connected Envelope"
                  details={`${connectedEnvelope.name} • $${connectedEnvelope.currentBalance?.toFixed(2) || "0.00"} available`}
                  badge="Funding source"
                />
              )}
            </div>

            <ConnectionInfo>
              📝 <strong>Connected!</strong> This debt is linked to your payment system. Changes to the
              bill's due date or amount will sync automatically. Use the disconnect button above to change connections.
            </ConnectionInfo>
          </ConnectionDisplay>

          {/* Envelope & Bill Integration - Hide when connected */}
          {!(isEditMode && (connectedBill || connectedEnvelope)) && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-purple-600" />
                Payment Setup
              </h4>

            {/* Payment Method Radio Buttons - SIMPLIFIED UX */}
            <div className="space-y-2">
              {/* Create New Option */}
              <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
                <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                  <input
                    type="radio"
                    id="create_new"
                    name="paymentMethod"
                    value="create_new"
                    checked={formData.paymentMethod === "create_new"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
                  />
                  <div>
                    <div className="flex items-center mb-1">
                      <Receipt className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium text-sm">Create new envelope and bill</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">
                      Automatically create a new envelope and bill for this debt payment
                    </p>
                  </div>
                </div>
              </div>

              {/* Connect Existing Bill Option - AUTO-USES BILL'S ENVELOPE */}
              <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
                <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                  <input
                    type="radio"
                    id="connect_existing_bill"
                    name="paymentMethod"
                    value="connect_existing_bill"
                    checked={formData.paymentMethod === "connect_existing_bill"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600 mt-0.5 justify-self-start"
                  />
                  <div>
                    <div className="flex items-center mb-1">
                      <Receipt className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium text-sm">Connect to existing bill</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">
                      Link to an existing bill and automatically use its envelope for funding
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Create New: Envelope Name Input */}
            {formData.paymentMethod === "create_new" && (
              <div className="space-y-4 pl-7 border-l-2 border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Envelope Name
                  </label>
                  <input
                    type="text"
                    value={formData.newEnvelopeName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newEnvelopeName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={formData.name ? `${formData.name} Payment` : "Debt Payment"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    A new envelope will be created to fund this debt's payments
                  </p>
                </div>
              </div>
            )}

            {/* Connect Existing Bill: Bill Selection - AUTO-USES BILL'S ENVELOPE */}
            {formData.paymentMethod === "connect_existing_bill" && (
              <div className="space-y-4 pl-7 border-l-2 border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Bill
                  </label>
                  <select
                    value={formData.existingBillId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        existingBillId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={billsLoading}
                  >
                    <option value="">
                      {billsLoading ? "Loading bills..." : "Select existing bill..."}
                    </option>
                    {!billsLoading &&
                      bills
                        .filter((bill) => !bill.debtId) // Only show bills not already linked to debts
                        .map((bill) => (
                          <option key={bill.id} value={bill.id}>
                            📋 {bill.name} (${bill.amount?.toFixed(2) || "0.00"}
                            {bill.dueDate &&
                              ` • Due: ${new Date(bill.dueDate).toLocaleDateString()}`}
                            )
                          </option>
                        ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose which existing bill to link to this debt. The bill's due date, amount,
                    and envelope will sync automatically.
                  </p>
                </div>
              </div>
            )}
            </div>
          )}

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
              disabled={isSubmitting || (isEditMode && !canEdit)}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isEditMode && !canEdit ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked by {lockedBy}
                </>
              ) : isSubmitting ? (
                isEditMode ? (
                  "Updating..."
                ) : (
                  "Adding..."
                )
              ) : isEditMode ? (
                "Update Debt"
              ) : (
                "Add Debt"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDebtModal;
