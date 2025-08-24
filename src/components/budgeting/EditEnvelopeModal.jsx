import React, { useState, useEffect } from "react";
import {
  X,
  Edit,
  DollarSign,
  Calendar,
  Tag,
  Target,
  Palette,
  Save,
  AlertCircle,
  Trash2,
  Settings,
  Sparkles,
  FileText,
  TrendingUp,
  CheckCircle,
  Lock,
  Unlock,
  User,
  Clock,
} from "lucide-react";
import useEditLock from "../../hooks/useEditLock";
import { initializeEditLocks } from "../../services/editLockService";
import { useAuth } from "../../stores/authStore";
import DeleteEnvelopeModal from "./DeleteEnvelopeModal";
import {
  ENVELOPE_TYPES,
  ENVELOPE_TYPE_CONFIG,
  getEnvelopeCategories,
} from "../../constants/categories";
import { toMonthly, toBiweekly, getFrequencyOptions } from "../../utils/frequencyCalculations";
import logger from "../../utils/logger";

const EditEnvelopeModal = ({
  isOpen = false,
  onClose,
  envelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
  onUpdateBill, // Add bill update function
  existingEnvelopes = [],
  allBills = [], // Add bills prop to show linked bills
  currentUser = { userName: "User", userColor: "#a855f7" }, // eslint-disable-line no-unused-vars
}) => {
  // Get auth context for edit locking
  const { budgetId, currentUser: authCurrentUser } = useAuth();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && authCurrentUser) {
      initializeEditLocks(budgetId, authCurrentUser);
    }
  }, [isOpen, budgetId, authCurrentUser]);

  // Edit locking for the envelope
  const {
    isLocked,
    isOwnLock,
    canEdit,
    lockedBy,
    expiresAt,
    timeRemaining,
    isExpired,
    releaseLock,
    breakLock,
    isLoading: lockLoading,
  } = useEditLock("envelope", envelope?.id, {
    autoAcquire: isOpen && envelope?.id, // Auto-acquire when modal opens
    autoRelease: true, // Auto-release when modal closes
    showToasts: true, // Show toast notifications
  });
  const [formData, setFormData] = useState({
    name: "",
    monthlyAmount: "",
    currentBalance: "",
    category: "",
    color: "#a855f7",
    frequency: "monthly",
    description: "",
    priority: "medium",
    autoAllocate: true,
    icon: Target,
    envelopeType: ENVELOPE_TYPES.VARIABLE,
    monthlyBudget: "",
    biweeklyAllocation: "",
    targetAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState("");
  const [initialBillId, setInitialBillId] = useState("");

  // Predefined categories for quick selection using standardized categories
  const categories = getEnvelopeCategories();

  // Color palette for envelope customization
  const colors = [
    "#a855f7", // Purple (default)
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#84cc16", // Lime
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#64748b", // Slate
  ];

  // Frequency options using standardized calculations
  const frequencies = getFrequencyOptions();

  const priorities = [
    { value: "high", label: "High Priority", color: "text-red-600" },
    { value: "medium", label: "Medium Priority", color: "text-amber-600" },
    { value: "low", label: "Low Priority", color: "text-blue-600" },
  ];

  // Debug logging for bills
  useEffect(() => {
    logger.debug("🔍 EditEnvelopeModal - allBills received:", {
      allBills,
      length: allBills?.length,
      bills: allBills?.map((bill) => ({
        id: bill.id,
        name: bill.name,
        provider: bill.provider,
        amount: bill.amount,
        envelopeId: bill.envelopeId,
      })),
    });
  }, [allBills]);

  // Populate form when envelope changes
  useEffect(() => {
    if (envelope) {
      setFormData({
        name: envelope.name || "",
        monthlyAmount: envelope.monthlyAmount?.toString() || "",
        currentBalance: envelope.currentBalance?.toString() || "",
        category: envelope.category || "",
        color: envelope.color || "#a855f7",
        frequency: envelope.frequency || "monthly",
        description: envelope.description || "",
        priority: envelope.priority || "medium",
        autoAllocate: envelope.autoAllocate ?? true,
        icon: envelope.icon || Tag,
        envelopeType:
          envelope.envelopeType === ENVELOPE_TYPES.SAVINGS
            ? ENVELOPE_TYPES.VARIABLE
            : envelope.envelopeType || ENVELOPE_TYPES.VARIABLE,
        monthlyBudget: envelope.monthlyBudget?.toString() || "",
        biweeklyAllocation: envelope.biweeklyAllocation?.toString() || "",
        targetAmount: envelope.targetAmount?.toString() || "",
      });

      const linkedBill = allBills.find((bill) => bill.envelopeId === envelope.id);
      setSelectedBillId(linkedBill?.id || "");
      setInitialBillId(linkedBill?.id || "");
    }
  }, [envelope, allBills]);

  // Get smart icon suggestions based on current form data
  // Simple icon suggestions for envelopes - to be enhanced later
  const iconSuggestions = [Target, DollarSign, Save, Tag, Settings]; // eslint-disable-line no-unused-vars

  const resetForm = () => {
    setFormData({
      name: "",
      monthlyAmount: "",
      currentBalance: "",
      category: "",
      color: "#a855f7",
      frequency: "monthly",
      description: "",
      priority: "medium",
      autoAllocate: true,
      icon: Target,
    });
    setErrors({});
    setIsSubmitting(false);
    setShowDeleteModal(false);
    setSelectedBillId("");
    setInitialBillId("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Envelope name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Check for duplicate names (excluding current envelope)
    const duplicateName = existingEnvelopes.find(
      (env) =>
        env.id !== envelope?.id && env.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (duplicateName) {
      newErrors.name = "An envelope with this name already exists";
    }

    // Envelope type specific validation (replaces generic monthlyAmount validation)
    if (formData.envelopeType === ENVELOPE_TYPES.BILL) {
      if (!formData.biweeklyAllocation || parseFloat(formData.biweeklyAllocation) <= 0) {
        newErrors.biweeklyAllocation = "Biweekly allocation must be greater than 0";
      } else if (parseFloat(formData.biweeklyAllocation) > 25000) {
        newErrors.biweeklyAllocation = "Biweekly allocation seems unusually high";
      }
    } else if (formData.envelopeType === ENVELOPE_TYPES.VARIABLE) {
      if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
        newErrors.monthlyBudget = "Monthly budget must be greater than 0";
      } else if (parseFloat(formData.monthlyBudget) > 50000) {
        newErrors.monthlyBudget = "Monthly budget seems unusually high";
      }
    }
    // Remove savings validation since savings envelopes are managed separately

    // Legacy monthlyAmount validation (only if still present and no type-specific amount is set)
    if (formData.monthlyAmount && parseFloat(formData.monthlyAmount) > 50000) {
      newErrors.monthlyAmount = "Monthly amount seems unusually high";
    }

    // Current balance validation (optional but if provided, must be valid)
    // Allow negative values for unassigned cash
    if (formData.currentBalance && !isUnassignedCash && parseFloat(formData.currentBalance) < 0) {
      newErrors.currentBalance = "Current balance cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBiweeklyAmount = () => {
    const monthlyAmount = parseFloat(formData.monthlyAmount) || 0;
    if (!monthlyAmount) return 0;

    return toBiweekly(monthlyAmount, "monthly").toFixed(2);
  };

  // Handle bill selection and auto-populate envelope data
  const handleBillSelection = (billId) => {
    setSelectedBillId(billId);

    if (!billId) return;

    const selectedBill = allBills.find((bill) => bill.id === billId);
    if (!selectedBill) return;

    // Auto-populate envelope fields from the selected bill
    setFormData((prevData) => ({
      ...prevData,
      name: selectedBill.name || selectedBill.provider || prevData.name,
      category: selectedBill.category || prevData.category,
      color: selectedBill.color || prevData.color,
      frequency: selectedBill.frequency || prevData.frequency,
      description:
        selectedBill.description ||
        selectedBill.notes ||
        `Auto-created for ${selectedBill.name} bill`,
      biweeklyAllocation:
        selectedBill.biweeklyAmount?.toString() ||
        (selectedBill.amount
          ? toBiweekly(selectedBill.amount, selectedBill.frequency || "monthly").toFixed(2)
          : ""),
      monthlyAmount:
        selectedBill.monthlyAmount?.toString() ||
        (selectedBill.amount
          ? toMonthly(selectedBill.amount, selectedBill.frequency || "monthly").toFixed(2)
          : ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Handle unassigned cash specially
      if (isUnassignedCash) {
        // Update unassigned cash amount directly
        const newUnassignedCashAmount = parseFloat(formData.currentBalance) || 0;

        await onUpdateEnvelope({
          ...envelope,
          currentBalance: newUnassignedCashAmount,
          description: formData.description.trim(),
          lastUpdated: new Date().toISOString(),
        });
      } else {
        const updatedEnvelope = {
          ...envelope,
          name: formData.name.trim(),
          monthlyAmount: parseFloat(formData.monthlyAmount),
          currentBalance:
            formData.currentBalance !== ""
              ? parseFloat(formData.currentBalance)
              : envelope.currentBalance || 0,
          category: formData.category || "Other",
          color: formData.color,
          frequency: formData.frequency,
          description: formData.description.trim(),
          priority: formData.priority,
          autoAllocate: formData.autoAllocate,
          biweeklyAllocation: parseFloat(calculateBiweeklyAmount()),
          lastUpdated: new Date().toISOString(),
          // Link bill connection
          billId: selectedBillId || null,
          // Envelope type specific fields
          envelopeType: formData.envelopeType,
          monthlyBudget:
            formData.envelopeType === ENVELOPE_TYPES.VARIABLE
              ? parseFloat(formData.monthlyBudget) || null
              : null,
          targetAmount:
            formData.envelopeType === ENVELOPE_TYPES.SAVINGS
              ? parseFloat(formData.targetAmount) || null
              : null,
        };

        // Override biweeklyAllocation for bill envelopes
        if (formData.envelopeType === ENVELOPE_TYPES.BILL && formData.biweeklyAllocation) {
          updatedEnvelope.biweeklyAllocation = parseFloat(formData.biweeklyAllocation);
        }

        await onUpdateEnvelope(updatedEnvelope);

        // If a bill was selected, establish the bidirectional relationship
        if (selectedBillId && onUpdateBill) {
          const selectedBill = allBills.find((bill) => bill.id === selectedBillId);
          if (selectedBill) {
            await onUpdateBill({
              ...selectedBill,
              envelopeId: envelope.id,
              lastUpdated: new Date().toISOString(),
            });
          }
        }

        // If the envelope was previously linked to a different bill, detach it
        if (initialBillId && initialBillId !== selectedBillId && onUpdateBill) {
          const previousBill = allBills.find((bill) => bill.id === initialBillId);
          if (previousBill) {
            await onUpdateBill({
              ...previousBill,
              envelopeId: null,
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      }

      // Reset and close
      resetForm();
      onClose();
    } catch (error) {
      logger.error("Error updating envelope:", error);
      setErrors({ submit: "Failed to update envelope. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (envelopeId, deleteBillsToo = false) => {
    setIsSubmitting(true);
    try {
      await onDeleteEnvelope(envelopeId, deleteBillsToo);
      resetForm();
      onClose();
    } catch (error) {
      logger.error("Error deleting envelope:", error);
      setErrors({ submit: "Failed to delete envelope. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Release lock when closing
    if (isOwnLock) {
      releaseLock();
    }
    resetForm();
    onClose();
  };

  if (!isOpen || !envelope) return null;

  const isUnassignedCash = envelope.id === "unassigned";

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Edit Envelope</h2>
                  {/* Edit Lock Status */}
                  {isLocked && (
                    <div
                      className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isOwnLock
                          ? "bg-green-500/20 text-green-100 border border-green-400/30"
                          : "bg-red-500/20 text-red-100 border border-red-400/30"
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
                  {lockLoading && (
                    <div className="bg-yellow-500/20 text-yellow-100 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border border-yellow-300 border-t-transparent mr-1" />
                      Acquiring Lock...
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-blue-100 text-sm">Modify envelope settings</p>
                  {isLocked && !isOwnLock && expiresAt && (
                    <div className="flex items-center text-red-200 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {isExpired ? "Expired" : `${Math.ceil(timeRemaining / 1000)}s remaining`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Lock Controls */}
              {isLocked && !isOwnLock && isExpired && (
                <button
                  onClick={breakLock}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
                >
                  <Unlock className="h-3 w-3 mr-1" />
                  Break Lock
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Lock Warning Banner */}
        {isLocked && !canEdit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Currently Being Edited</h3>
                <p className="text-sm text-red-700 mt-1">
                  {lockedBy} is currently editing this envelope.
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

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Envelope Type Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Envelope Type
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(ENVELOPE_TYPE_CONFIG)
                  .filter(([type]) => type !== ENVELOPE_TYPES.SAVINGS) // Remove savings from envelope manager
                  .map(([type, config]) => {
                    const IconComponent =
                      type === ENVELOPE_TYPES.BILL
                        ? FileText
                        : type === ENVELOPE_TYPES.VARIABLE
                          ? TrendingUp
                          : Target;
                    const isSelected = formData.envelopeType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            envelopeType: type,
                          })
                        }
                        className={`border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg ${
                          isSelected
                            ? `${config.borderColor} ${config.bgColor} shadow-lg ring-2 ring-blue-200`
                            : "border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? `${config.borderColor.replace("border-", "border-")} ${config.bgColor.replace("bg-", "bg-")}`
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <div
                                className={`w-3 h-3 rounded-full ${config.bgColor.replace("bg-", "bg-").replace("-50", "-600")}`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <IconComponent
                                className={`h-5 w-5 mr-3 ${isSelected ? config.textColor : "text-gray-500"}`}
                              />
                              <span
                                className={`text-lg font-bold ${isSelected ? config.textColor : "text-gray-800"}`}
                              >
                                {config.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {config.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-blue-600" />
                Basic Information
              </h3>

              {/* Envelope Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Envelope Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!canEdit}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  } ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="e.g., Groceries, Gas, Entertainment"
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={!canEdit}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill Connection - ALWAYS VISIBLE */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 mb-4">
                <label className="block text-lg font-bold text-purple-800 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3" />
                  🔗 Connect to Existing Bill
                </label>

                <select
                  value={selectedBillId}
                  onChange={(e) => handleBillSelection(e.target.value)}
                  disabled={!canEdit}
                  className={`w-full px-4 py-4 border-2 border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-md text-base ${
                    !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">
                    {allBills && allBills.length > 0
                      ? "Choose a bill to auto-populate settings..."
                      : `No bills available (${allBills ? allBills.length : "undefined"} found)`}
                  </option>
                  {allBills &&
                    allBills
                      .filter((bill) => !bill.envelopeId || bill.envelopeId === envelope?.id) // Only show unassigned bills or bills assigned to this envelope
                      .map((bill) => (
                        <option key={bill.id} value={bill.id}>
                          {bill.name || bill.provider} - ${parseFloat(bill.amount || 0).toFixed(2)}{" "}
                          ({bill.frequency || "monthly"})
                        </option>
                      ))}
                </select>

                {selectedBillId && (
                  <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <strong>Connected!</strong> Envelope settings have been populated from the
                      selected bill.
                    </p>
                  </div>
                )}

                <p className="text-sm text-purple-700 mt-3 font-medium">
                  📝 <strong>Tip:</strong> Connect a bill to automatically fill envelope details
                  like name, amount, and category. Works for all envelope types.
                </p>

                {(!allBills || allBills.length === 0) && (
                  <p className="text-sm text-red-600 mt-3 font-medium">
                    ⚠️ No bills found. Create bills first to connect them to envelopes.
                  </p>
                )}
              </div>
            </div>

            {/* Type-Specific Budget Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                {formData.envelopeType === ENVELOPE_TYPES.BILL
                  ? selectedBillId
                    ? "Connected Bill Settings"
                    : "Bill Payment Settings"
                  : "Variable Budget Settings"}
              </h3>

              {/* Connected Bill Display */}
              {formData.envelopeType === ENVELOPE_TYPES.BILL && selectedBillId && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Bill Connected</span>
                  </div>
                  {(() => {
                    const connectedBill = allBills.find((bill) => bill.id === selectedBillId);
                    return connectedBill ? (
                      <div className="text-sm text-green-700">
                        <p>
                          <strong>{connectedBill.name || connectedBill.provider}</strong>
                        </p>
                        <p>
                          Amount: ${connectedBill.amount || "N/A"} (
                          {connectedBill.frequency || "monthly"})
                        </p>
                        <p className="text-xs mt-1">
                          Bill settings will override manual envelope settings.
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Type-specific fields */}
              {formData.envelopeType === ENVELOPE_TYPES.BILL && !selectedBillId && (
                <div className="space-y-4">
                  {/* Payment Frequency Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          frequency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {frequencies.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bill Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.frequency === "yearly"
                        ? "Yearly Bill Amount *"
                        : formData.frequency === "quarterly"
                          ? "Quarterly Bill Amount *"
                          : formData.frequency === "monthly"
                            ? "Monthly Bill Amount *"
                            : formData.frequency === "biweekly"
                              ? "Biweekly Bill Amount *"
                              : formData.frequency === "weekly"
                                ? "Weekly Bill Amount *"
                                : "Bill Amount *"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monthlyBudget}
                        onChange={(e) => {
                          const billAmount = e.target.value;
                          // Auto-calculate biweekly allocation based on frequency
                          const biweeklyAmount = billAmount
                            ? toBiweekly(parseFloat(billAmount), formData.frequency).toFixed(2)
                            : "";
                          setFormData({
                            ...formData,
                            monthlyBudget: billAmount,
                            biweeklyAllocation: biweeklyAmount,
                          });
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.monthlyBudget ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Enter bill amount"
                      />
                    </div>
                    {errors.monthlyBudget && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.monthlyBudget}
                      </p>
                    )}

                    {/* Auto-calculated biweekly allocation display */}
                    {formData.monthlyBudget && (
                      <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-800 mb-2">
                          ✅ Auto-calculated biweekly allocation:
                        </p>
                        <div className="text-lg font-bold text-green-700">
                          ${formData.biweeklyAllocation}/biweekly
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          This amount will be automatically allocated every payday to cover your{" "}
                          {formData.frequency} bill.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.envelopeType === ENVELOPE_TYPES.VARIABLE && (
                <div className="space-y-4">
                  {/* Budget Frequency Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {frequencies.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.frequency === "yearly"
                        ? "Yearly Budget *"
                        : formData.frequency === "quarterly"
                          ? "Quarterly Budget *"
                          : formData.frequency === "monthly"
                            ? "Monthly Budget *"
                            : formData.frequency === "biweekly"
                              ? "Biweekly Budget *"
                              : formData.frequency === "weekly"
                                ? "Weekly Budget *"
                                : "Budget Amount *"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monthlyBudget}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyBudget: e.target.value,
                          })
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.monthlyBudget ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.monthlyBudget && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.monthlyBudget}
                      </p>
                    )}

                    {/* Calculated amounts display */}
                    {formData.monthlyBudget && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Calculated amounts:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            Monthly: $
                            {toMonthly(
                              parseFloat(formData.monthlyBudget),
                              formData.frequency
                            ).toFixed(2)}
                          </div>
                          <div>
                            Biweekly: $
                            {toBiweekly(
                              parseFloat(formData.monthlyBudget),
                              formData.frequency
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.envelopeType === ENVELOPE_TYPES.SAVINGS && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Target className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAmount: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.targetAmount ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.targetAmount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.targetAmount}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Total amount you want to save</p>
                </div>
              )}
            </div>

            {/* Current Balance and Priority */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                Additional Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentBalance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentBalance: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.currentBalance ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.currentBalance && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.currentBalance}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customization */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Palette className="h-4 w-4 mr-2 text-blue-600" />
                Customization
              </h3>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Envelope Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-110 ${
                        formData.color === color
                          ? "border-gray-800 shadow-lg"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Notes about this envelope..."
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {/* Auto-allocate option */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Paycheck Allocation
                </label>

                <div className="space-y-2">
                  {/* Auto-allocate option */}
                  <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
                    <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                      <input
                        type="radio"
                        id="autoAllocateTrue"
                        name="autoAllocate"
                        value="true"
                        checked={formData.autoAllocate === true}
                        onChange={() => setFormData({ ...formData, autoAllocate: true })}
                        className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
                      />
                      <div>
                        <div className="flex items-center mb-1">
                          <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="font-medium text-sm">Auto-allocate</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-tight">
                          Automatically allocate funds from paychecks based on envelope priority
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manual allocation option */}
                  <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
                    <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                      <input
                        type="radio"
                        id="autoAllocateFalse"
                        name="autoAllocate"
                        value="false"
                        checked={formData.autoAllocate === false}
                        onChange={() => setFormData({ ...formData, autoAllocate: false })}
                        className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
                      />
                      <div>
                        <div className="flex items-center mb-1">
                          <Settings className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="font-medium text-sm">Manual allocation</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-tight">
                          Manually allocate funds to this envelope as needed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Errors */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center"
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !canEdit ||
                isSubmitting ||
                !formData.name.trim() ||
                (formData.envelopeType === ENVELOPE_TYPES.BILL && !formData.biweeklyAllocation) ||
                (formData.envelopeType === ENVELOPE_TYPES.VARIABLE && !formData.monthlyBudget) ||
                (formData.envelopeType === ENVELOPE_TYPES.SAVINGS && !formData.targetAmount)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {!canEdit ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked by {lockedBy}
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteEnvelopeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        envelope={envelope}
        connectedBills={allBills?.filter(bill => bill.envelopeId === envelope?.id) || []}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default EditEnvelopeModal;
