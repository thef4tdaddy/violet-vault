// Extracted from old BillManager - proper bill creation modal
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Sparkles,
  Trash2,
  Lock,
  Unlock,
  User,
  Clock,
} from "lucide-react";
import useEditLock from "../../hooks/useEditLock";
import { initializeEditLocks } from "../../services/editLockService";
import { useAuth } from "../../stores/authStore";
import {
  getBillIcon,
  getBillIconOptions,
  getIconName,
  getIconByName,
  getIconNameForStorage,
} from "../../utils/billIcons";
import {
  toMonthly,
  getFrequencyOptions,
} from "../../utils/frequencyCalculations";
import {
  BIWEEKLY_MULTIPLIER,
  convertToBiweekly,
} from "../../constants/frequency";
import { getBillCategories } from "../../constants/categories";
import logger from "../../utils/logger";

const getInitialFormData = (bill = null) => {
  if (bill) {
    return {
      name: bill.name || bill.provider || "",
      amount: bill.amount || "",
      frequency: bill.frequency || "monthly",
      dueDate: bill.dueDate || "",
      category: bill.category || "Bills",
      color: bill.color || "#3B82F6",
      notes: bill.notes || "",
      createEnvelope: false,
      selectedEnvelope: bill.envelopeId || "",
      customFrequency: bill.customFrequency || "",
      iconName:
        bill.iconName ||
        getIconNameForStorage(
          bill.icon ||
            getBillIcon(
              bill.name || bill.provider || "",
              bill.notes || "",
              bill.category || "",
            ),
        ),
    };
  }
  return {
    name: "",
    amount: "",
    frequency: "monthly",
    dueDate: "",
    category: "Bills",
    color: "#3B82F6",
    notes: "",
    createEnvelope: true,
    selectedEnvelope: "",
    customFrequency: "",
    iconName: getIconNameForStorage(getBillIcon("", "", "Bills")),
  };
};

const AddBillModal = ({
  isOpen,
  onClose,
  onAddBill,
  onAddEnvelope,
  editingBill = null,
  onUpdateBill,
  onDeleteBill,
  availableEnvelopes = [],
}) => {
  const [formData, setFormData] = useState(getInitialFormData(editingBill));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get auth context for edit locking
  const { budgetId, currentUser } = useAuth();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Edit locking for the bill (only when editing existing bill)
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
  } = useEditLock("bill", editingBill?.id, {
    autoAcquire: isOpen && editingBill?.id, // Only auto-acquire for edits
    autoRelease: true,
    showToasts: true,
  });

  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData(editingBill);
      const billEnvelopes = availableEnvelopes.filter((env) => {
        // Check if envelope is suitable for bills - allow "bill" and "variable" types
        // Also allow legacy envelopes with no type set for backwards compatibility
        const isBillEnvelope = env.envelopeType === "bill";
        const isVariableEnvelope = env.envelopeType === "variable";
        const isLegacyEnvelope = !env.envelopeType;
        return isBillEnvelope || isVariableEnvelope || isLegacyEnvelope;
      });

      logger.debug("Initializing bill modal form data", {
        editingBill: editingBill?.id,
        envelopeId: editingBill?.envelopeId,
        selectedEnvelope: initialData.selectedEnvelope,
        availableEnvelopes: availableEnvelopes.length,
        billEnvelopes: billEnvelopes.length,
        envelopeTypes: availableEnvelopes.map((e) => ({
          id: e.id,
          name: e.name,
          type: e.envelopeType,
        })),
        // Debug envelope filtering
        allEnvelopeDetails: availableEnvelopes.map((e) => ({
          id: e.id,
          name: e.name,
          envelopeType: e.envelopeType,
          passesFilter: e.envelopeType === "bill" || !e.envelopeType,
        })),
        filterCriteria: "envelopeType === 'bill' || !envelopeType",
      });
      setFormData(initialData);
    }
  }, [isOpen, editingBill, availableEnvelopes]);

  useEffect(() => {
    if (!formData.name && !formData.category) return;
    const suggestedIcon = getBillIcon(
      formData.name || "",
      formData.notes || "",
      formData.category || "Bills",
    );
    setFormData((prev) => ({
      ...prev,
      iconName: getIconNameForStorage(suggestedIcon),
    }));
  }, [formData.name, formData.category, formData.notes]);

  // Debug formData changes (removed to reduce noise)

  const iconSuggestions = getBillIconOptions(formData.category);
  const frequencies = [
    ...getFrequencyOptions(),
    { value: "semiannual", label: "Semi-annual", multiplier: 2 },
    { value: "custom", label: "Custom", multiplier: 1 },
  ];
  const categories = getBillCategories();
  const colors = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#EF4444",
    "#14B8A6",
    "#6366F1",
    "#84CC16",
    "#F97316",
    "#06B6D4",
    "#8B5A2B",
  ];

  if (!isOpen) return null;

  const calculateBiweeklyAmount = (amount, frequency, customFrequency = 1) => {
    // First convert to monthly equivalent, then use unified biweekly logic
    const monthlyAmount = calculateMonthlyAmount(
      amount,
      frequency,
      customFrequency,
    );

    // Use unified constant for consistent biweekly calculation across app
    return convertToBiweekly(monthlyAmount);
  };

  const calculateMonthlyAmount = (amount, frequency, customFrequency = 1) => {
    if (frequency === "custom")
      return toMonthly(amount, "yearly") * customFrequency;
    return toMonthly(amount, frequency);
  };

  const getNextDueDate = (frequency, dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    if (date > now) return dueDate;
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "biweekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "semiannual":
        date.setMonth(date.getMonth() + 6);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return dueDate;
    }
    return date.toISOString().split("T")[0];
  };

  const normalizeDateFormat = (dateString) => {
    if (!dateString || /^\d{4}-\d{2}-\d{2}$/.test(dateString))
      return dateString;
    if (typeof dateString === "string") {
      const dateMatch = dateString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
      if (dateMatch) {
        const [, month, day, year] = dateMatch;
        let fullYear =
          year.length === 2
            ? parseInt(year) <= 30
              ? `20${year}`
              : `19${year}`
            : year;
        return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    return dateString;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logger.debug("Form submission started", {
      name: formData.name.trim(),
      amount: formData.amount,
      selectedEnvelope: formData.selectedEnvelope,
    });

    if (!formData.name.trim() || !formData.amount) {
      logger.warn("Form validation failed", {
        nameValid: !!formData.name.trim(),
        amountValid: !!formData.amount,
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const normalizedDueDate = normalizeDateFormat(formData.dueDate);

    const billData = {
      id: editingBill ? editingBill.id : `bill_${Date.now()}`,
      name: formData.name.trim(),
      amount,
      frequency: formData.frequency,
      category: formData.category,
      color: formData.color,
      notes: formData.notes,
      dueDate: normalizedDueDate,
      customFrequency:
        formData.frequency === "custom"
          ? parseFloat(formData.customFrequency) || 1
          : undefined,
      biweeklyAmount: calculateBiweeklyAmount(
        amount,
        formData.frequency,
        formData.customFrequency,
      ),
      monthlyAmount: calculateMonthlyAmount(
        amount,
        formData.frequency,
        formData.customFrequency,
      ),
      nextDueDate: getNextDueDate(formData.frequency, normalizedDueDate),
      // Don't store the React component - only store the iconName string
      // The icon component will be resolved when displaying the bill
      iconName: formData.iconName,
      type: editingBill ? editingBill.type : "recurring_bill",
      isPaid: editingBill ? editingBill.isPaid : false,
      source: editingBill ? editingBill.source : "manual",
      provider: formData.name.trim(),
      description: formData.name.trim(),
      createdAt: editingBill ? editingBill.createdAt : new Date().toISOString(),
      date: normalizedDueDate || new Date().toISOString().split("T")[0],
      envelopeId: formData.selectedEnvelope || null,
      ...(editingBill && { lastUpdated: new Date().toISOString() }),
    };

    logger.debug("Bill data being saved", {
      billId: billData.id,
      envelopeId: billData.envelopeId,
      selectedEnvelope: formData.selectedEnvelope,
      availableEnvelopes: availableEnvelopes.length,
      isEditing: !!editingBill,
      hasOnUpdateBill: !!onUpdateBill,
      hasOnAddBill: !!onAddBill,
      fullBillData: billData,
    });

    // Additional logging for envelope assignment debugging
    logger.debug("Envelope assignment details", {
      formDataSelectedEnvelope: formData.selectedEnvelope,
      billDataEnvelopeId: billData.envelopeId,
      availableEnvelopesIds: availableEnvelopes.map((e) => e.id),
      envelopeFound: availableEnvelopes.find(
        (e) => e.id === formData.selectedEnvelope,
      ),
    });

    if (editingBill) {
      logger.debug("Updating existing bill", {
        billId: billData.id,
        envelopeId: billData.envelopeId,
        originalEnvelopeId: editingBill.envelopeId,
        envelopeChanged: editingBill.envelopeId !== billData.envelopeId,
      });

      try {
        onUpdateBill?.(billData);
        logger.debug("Bill update completed successfully", {
          billId: billData.id,
        });
      } catch (error) {
        logger.error("Error during bill update", error, {
          billId: billData.id,
        });
        throw error;
      }
    } else {
      logger.debug("Adding new bill", {
        billId: billData.id,
        envelopeId: billData.envelopeId,
      });
      onAddBill?.(billData);
      if (formData.createEnvelope && onAddEnvelope) {
        const envelopeData = {
          id: `envelope_${Date.now()}`,
          name: formData.name.trim(),
          budget: calculateMonthlyAmount(
            amount,
            formData.frequency,
            formData.customFrequency,
          ),
          currentBalance: 0,
          color: formData.color,
          category: formData.category,
          notes: `Auto-created for ${formData.name} bill`,
        };
        onAddEnvelope(envelopeData);
      }
    }

    logger.debug("Closing modal after bill save");
    onClose();
  };

  const handleEnvelopeChange = (e) => {
    const newEnvelopeId = e.target.value;

    logger.debug("Envelope selection changed", {
      newEnvelopeId,
      availableEnvelopes: availableEnvelopes.length,
      selectedEnvelope: formData.selectedEnvelope,
    });

    // When an envelope is selected, disable create envelope to prevent duplicates
    setFormData({
      ...formData,
      selectedEnvelope: newEnvelopeId,
      createEnvelope: newEnvelopeId ? false : formData.createEnvelope,
    });
  };

  const cancelEdit = () => {
    // Release lock when closing
    if (isOwnLock) {
      releaseLock();
    }
    setShowDeleteConfirm(false);
    setFormData(getInitialFormData(null)); // Reset form data
    onClose();
  };

  const handleDelete = () => {
    if (editingBill && onDeleteBill) {
      onDeleteBill(editingBill.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 flex-1">
            <h3 className="text-xl font-semibold">
              {editingBill ? "Edit Bill" : "Add New Bill"}
            </h3>
            {/* Edit Lock Status for existing bills */}
            {editingBill && isLocked && (
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
            {editingBill && lockLoading && (
              <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-1" />
                Acquiring Lock...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Lock Controls for expired locks */}
            {editingBill && isLocked && !isOwnLock && isExpired && (
              <button
                onClick={breakLock}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
              >
                <Unlock className="h-3 w-3 mr-1" />
                Break Lock
              </button>
            )}
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Lock Warning Banner for existing bills */}
        {editingBill && isLocked && !canEdit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Currently Being Edited
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {lockedBy} is currently editing this bill.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={editingBill && !canEdit}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  editingBill && !canEdit
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                placeholder="e.g., Car Insurance, Netflix, Property Tax"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.frequency === "custom" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Times per Year
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.customFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customFrequency: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3 for every 4 months"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? "border-gray-800 scale-110"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  Icon
                  <Sparkles className="h-4 w-4 ml-2 text-purple-500" />
                  <span className="text-xs text-purple-600 ml-1">
                    Smart suggestions
                  </span>
                </div>
              </label>
              <div className="flex gap-2 flex-wrap">
                {iconSuggestions.map((IconComponent, index) => {
                  const isSelected =
                    formData.iconName === IconComponent.displayName;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          iconName: IconComponent.displayName,
                        })
                      }
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-300 text-gray-600"
                      }`}
                      title={getIconName(IconComponent)}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Icons are automatically suggested based on your bill name and
                category
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about this bill..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Envelope Assignment
              </label>
              <select
                value={formData.selectedEnvelope}
                onChange={handleEnvelopeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No envelope (use unassigned cash)</option>
                {availableEnvelopes
                  .filter((env) => {
                    // Check if envelope is suitable for bills - allow "bill" and "variable" types
                    // Also allow legacy envelopes with no type set for backwards compatibility
                    const isBillEnvelope = env.envelopeType === "bill";
                    const isVariableEnvelope = env.envelopeType === "variable";
                    const isLegacyEnvelope = !env.envelopeType;
                    const isAllowed =
                      isBillEnvelope || isVariableEnvelope || isLegacyEnvelope;

                    logger.debug(`Envelope ${env.name}:`, {
                      envelopeType: env.envelopeType,
                      isBillEnvelope,
                      isVariableEnvelope,
                      isLegacyEnvelope,
                      isAllowed,
                    });

                    return isAllowed;
                  })
                  .map((envelope) => (
                    <option key={envelope.id} value={envelope.id}>
                      {envelope.name} ($
                      {(envelope.currentBalance || 0).toFixed(2)} available)
                    </option>
                  ))}
              </select>
              {formData.selectedEnvelope && (
                <p className="text-xs text-green-600 mt-1">
                  Selected:{" "}
                  {availableEnvelopes.find(
                    (e) => e.id === formData.selectedEnvelope,
                  )?.name || "Unknown"}
                </p>
              )}
              <p className="text-xs text-blue-600 mt-1">
                Bill and variable envelopes are available for assignment. Choose
                which envelope will be used to pay this bill.
              </p>
            </div>

            {!editingBill && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Envelope Options
                </label>

                <div className="space-y-2">
                  {/* Use existing envelope option */}
                  <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
                    <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                      <input
                        type="radio"
                        id="useExistingEnvelope"
                        name="envelopeOption"
                        value="existing"
                        checked={!formData.createEnvelope}
                        onChange={() =>
                          setFormData({ ...formData, createEnvelope: false })
                        }
                        disabled={!formData.selectedEnvelope}
                        className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
                      />
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-sm">
                            {formData.selectedEnvelope
                              ? "Use selected envelope"
                              : "Use existing envelope (select one above)"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-tight">
                          {formData.selectedEnvelope
                            ? `Bill will be paid from: ${availableEnvelopes.find((e) => e.id === formData.selectedEnvelope)?.name || "Selected envelope"}`
                            : "Select an envelope above to pay this bill from existing funds"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Create new envelope option */}
                  <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
                    <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                      <input
                        type="radio"
                        id="createNewEnvelope"
                        name="envelopeOption"
                        value="create"
                        checked={formData.createEnvelope}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            createEnvelope: true,
                            selectedEnvelope: "",
                          })
                        }
                        className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
                      />
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-sm">
                            Create associated envelope
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-tight">
                          Create a new envelope specifically for budgeting this
                          bill
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {formData.amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Bill Preview:</h4>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.color }}
                  >
                    {React.createElement(getIconByName(formData.iconName), {
                      className: "h-4 w-4 text-white",
                    })}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.name || "New Bill"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly equivalent:</span>
                  <span className="font-medium ml-2">
                    $
                    {calculateMonthlyAmount(
                      parseFloat(formData.amount) || 0,
                      formData.frequency,
                      formData.customFrequency,
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Biweekly needed:</span>
                  <span className="font-medium ml-2">
                    $
                    {calculateBiweeklyAmount(
                      parseFloat(formData.amount) || 0,
                      formData.frequency,
                      formData.customFrequency,
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            {editingBill && onDeleteBill && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={editingBill && !canEdit}
              className={`flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-black/20 w-auto ${
                editingBill && !canEdit ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
            >
              {editingBill && !canEdit ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked by {lockedBy}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingBill ? "Update Bill" : "Add Bill"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Bill
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "
              {editingBill?.name || editingBill?.provider}"? This will
              permanently remove the bill from your tracker.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBillModal;
