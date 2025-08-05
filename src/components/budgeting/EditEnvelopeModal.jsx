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
} from "lucide-react";
import {
  ENVELOPE_TYPES,
  ENVELOPE_TYPE_CONFIG,
} from "../../constants/categories";

const EditEnvelopeModal = ({
  isOpen = false,
  onClose,
  envelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
  existingEnvelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" }, // eslint-disable-line no-unused-vars
}) => {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Predefined categories for quick selection
  const categories = [
    "Bills & Utilities",
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Health & Medical",
    "Personal Care",
    "Education",
    "Travel",
    "Gifts & Donations",
    "Savings",
    "Emergency",
    "Other",
  ];

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

  // Frequency options
  const frequencies = [
    { value: "weekly", label: "Weekly", multiplier: 52 },
    { value: "biweekly", label: "Bi-weekly", multiplier: 26 },
    { value: "monthly", label: "Monthly", multiplier: 12 },
    { value: "quarterly", label: "Quarterly", multiplier: 4 },
    { value: "yearly", label: "Yearly", multiplier: 1 },
  ];

  const priorities = [
    { value: "high", label: "High Priority", color: "text-red-600" },
    { value: "medium", label: "Medium Priority", color: "text-amber-600" },
    { value: "low", label: "Low Priority", color: "text-blue-600" },
  ];

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
        envelopeType: envelope.envelopeType || ENVELOPE_TYPES.VARIABLE,
        monthlyBudget: envelope.monthlyBudget?.toString() || "",
        biweeklyAllocation: envelope.biweeklyAllocation?.toString() || "",
        targetAmount: envelope.targetAmount?.toString() || "",
      });
    }
  }, [envelope]);

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
    setShowDeleteConfirm(false);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Envelope name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Envelope type specific validation
    if (formData.envelopeType === ENVELOPE_TYPES.BILL) {
      if (
        !formData.biweeklyAllocation ||
        parseFloat(formData.biweeklyAllocation) <= 0
      ) {
        newErrors.biweeklyAllocation =
          "Biweekly allocation must be greater than 0";
      }
    } else if (formData.envelopeType === ENVELOPE_TYPES.VARIABLE) {
      if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
        newErrors.monthlyBudget = "Monthly budget must be greater than 0";
      }
    } else if (formData.envelopeType === ENVELOPE_TYPES.SAVINGS) {
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = "Target amount must be greater than 0";
      }
    }

    // Check for duplicate names (excluding current envelope)
    const duplicateName = existingEnvelopes.find(
      (env) =>
        env.id !== envelope?.id &&
        env.name.toLowerCase() === formData.name.trim().toLowerCase(),
    );
    if (duplicateName) {
      newErrors.name = "An envelope with this name already exists";
    }

    // Amount validation
    if (!formData.monthlyAmount || parseFloat(formData.monthlyAmount) <= 0) {
      newErrors.monthlyAmount = "Monthly amount must be greater than 0";
    } else if (parseFloat(formData.monthlyAmount) > 50000) {
      newErrors.monthlyAmount = "Monthly amount seems unusually high";
    }

    // Current balance validation (optional but if provided, must be valid)
    if (formData.currentBalance && parseFloat(formData.currentBalance) < 0) {
      newErrors.currentBalance = "Current balance cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBiweeklyAmount = () => {
    const monthlyAmount = parseFloat(formData.monthlyAmount) || 0;
    const frequency = frequencies.find((f) => f.value === formData.frequency);
    if (!frequency) return 0;

    const yearlyAmount = monthlyAmount * 12;
    return (yearlyAmount / 26).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const updatedEnvelope = {
        ...envelope,
        name: formData.name.trim(),
        monthlyAmount: parseFloat(formData.monthlyAmount),
        currentBalance:
          parseFloat(formData.currentBalance) || envelope.currentBalance || 0,
        category: formData.category || "Other",
        color: formData.color,
        frequency: formData.frequency,
        description: formData.description.trim(),
        priority: formData.priority,
        autoAllocate: formData.autoAllocate,
        biweeklyAllocation: parseFloat(calculateBiweeklyAmount()),
        lastUpdated: new Date().toISOString(),
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
      if (
        formData.envelopeType === ENVELOPE_TYPES.BILL &&
        formData.biweeklyAllocation
      ) {
        updatedEnvelope.biweeklyAllocation = parseFloat(
          formData.biweeklyAllocation,
        );
      }

      await onUpdateEnvelope(updatedEnvelope);

      // Reset and close
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error updating envelope:", error);
      setErrors({ submit: "Failed to update envelope. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onDeleteEnvelope(envelope.id);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error deleting envelope:", error);
      setErrors({ submit: "Failed to delete envelope. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !envelope) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Envelope</h2>
                <p className="text-blue-100 text-sm">
                  Modify envelope settings
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Envelope Type Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Envelope Type
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(ENVELOPE_TYPE_CONFIG).map(([type, config]) => {
                  const IconComponent =
                    type === ENVELOPE_TYPES.BILL
                      ? FileText
                      : type === ENVELOPE_TYPES.VARIABLE
                        ? TrendingUp
                        : Target;
                  return (
                    <label
                      key={type}
                      className={`glassmorphism border-2 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        formData.envelopeType === type
                          ? `${config.borderColor} ${config.bgColor} shadow-md`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="envelopeType"
                          value={type}
                          checked={formData.envelopeType === type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              envelopeType: e.target.value,
                            })
                          }
                          className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <IconComponent
                              className={`h-4 w-4 mr-2 ${config.textColor}`}
                            />
                            <span
                              className={`font-semibold ${config.textColor}`}
                            >
                              {config.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </label>
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type-Specific Budget Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                {formData.envelopeType === ENVELOPE_TYPES.BILL
                  ? "Bill Payment Settings"
                  : formData.envelopeType === ENVELOPE_TYPES.VARIABLE
                    ? "Variable Budget Settings"
                    : "Savings Goal Settings"}
              </h3>

              {/* Type-specific fields */}
              {formData.envelopeType === ENVELOPE_TYPES.BILL && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biweekly Payment Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.biweeklyAllocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          biweeklyAllocation: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.biweeklyAllocation
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.biweeklyAllocation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.biweeklyAllocation}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Amount needed every two weeks for this bill
                  </p>
                </div>
              )}

              {formData.envelopeType === ENVELOPE_TYPES.VARIABLE && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Budget *
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
                        errors.monthlyBudget
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
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
                  {formData.monthlyBudget && (
                    <p className="mt-1 text-xs text-gray-500">
                      Biweekly funding: $
                      {(parseFloat(formData.monthlyBudget) / 2).toFixed(2)}
                    </p>
                  )}
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
                        errors.targetAmount
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
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
                  <p className="mt-1 text-xs text-gray-500">
                    Total amount you want to save
                  </p>
                </div>
              )}
            </div>

            {/* Legacy Budget Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                Additional Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Budget Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyAmount: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.monthlyAmount
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.monthlyAmount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.monthlyAmount}
                    </p>
                  )}
                  {formData.monthlyAmount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Bi-weekly allocation: ${calculateBiweeklyAmount()}
                    </p>
                  )}
                </div>

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
                        errors.currentBalance
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
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
              </div>

              {/* Frequency and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoAllocate"
                  checked={formData.autoAllocate}
                  onChange={(e) =>
                    setFormData({ ...formData, autoAllocate: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoAllocate"
                  className="ml-3 text-sm text-gray-700"
                >
                  Auto-allocate funds from paychecks
                </label>
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
              onClick={handleDelete}
              className={`px-4 py-2 text-white rounded-xl transition-colors flex items-center ${
                showDeleteConfirm
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {showDeleteConfirm ? "Confirm Delete" : "Delete"}
            </button>
            {showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel Delete
              </button>
            )}
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
                isSubmitting ||
                !formData.name.trim() ||
                (formData.envelopeType === ENVELOPE_TYPES.BILL &&
                  !formData.biweeklyAllocation) ||
                (formData.envelopeType === ENVELOPE_TYPES.VARIABLE &&
                  !formData.monthlyBudget) ||
                (formData.envelopeType === ENVELOPE_TYPES.SAVINGS &&
                  !formData.targetAmount)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
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
    </div>
  );
};

export default EditEnvelopeModal;
