import React, { useState } from "react";
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  Tag,
  Target,
  Palette,
  Save,
  AlertCircle,
  Zap,
} from "lucide-react";

const CreateEnvelopeModal = ({
  isOpen = false,
  onClose,
  onCreateEnvelope,
  existingEnvelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
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
    envelopeType: "bill", // Default to bill type
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Envelope type options
  const envelopeTypes = [
    {
      value: "bill",
      label: "Bill Envelope",
      description: "Fixed recurring amounts (rent, insurance, phone)",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      value: "variable",
      label: "Variable Expense",
      description: "Regular but flexible spending (gas, groceries, medical)",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      value: "savings",
      label: "Savings Goal",
      description: "Long-term savings targets",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

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
      envelopeType: "bill",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Envelope name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Check for duplicate names
    const duplicateName = existingEnvelopes.find(
      (envelope) =>
        envelope.name.toLowerCase() === formData.name.trim().toLowerCase(),
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
      const newEnvelope = {
        id: Date.now(),
        name: formData.name.trim(),
        monthlyAmount: parseFloat(formData.monthlyAmount),
        currentBalance: parseFloat(formData.currentBalance) || 0,
        category: formData.category || "Other",
        color: formData.color,
        frequency: formData.frequency,
        description: formData.description.trim(),
        priority: formData.priority,
        autoAllocate: formData.autoAllocate,
        biweeklyAllocation: parseFloat(calculateBiweeklyAmount()),
        envelopeType: formData.envelopeType,
        monthlyBudget:
          formData.envelopeType === "variable"
            ? parseFloat(formData.monthlyAmount)
            : null,
        createdBy: currentUser.userName,
        createdAt: new Date().toISOString(),
        spendingHistory: [],
        dueDate: null,
        lastUpdated: new Date().toISOString(),
      };

      await onCreateEnvelope(newEnvelope);

      // Reset and close
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating envelope:", error);
      setErrors({ submit: "Failed to create envelope. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Create New Envelope
                </h2>
                <p className="text-purple-100 text-sm">
                  Set up a new budget envelope
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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-purple-600" />
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Envelope Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Envelope Type *
                </label>
                <div className="space-y-3">
                  {envelopeTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        formData.envelopeType === type.value
                          ? `${type.borderColor} ${type.bgColor}`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="envelopeType"
                        value={type.value}
                        checked={formData.envelopeType === type.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            envelopeType: e.target.value,
                          })
                        }
                        className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className={`font-medium ${type.color}`}>
                          {type.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                Budget Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.envelopeType === "variable"
                      ? "Monthly Budget Amount *"
                      : formData.envelopeType === "savings"
                        ? "Target Savings Amount *"
                        : "Monthly Budget Amount *"}
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-500">
                        Bi-weekly allocation: ${calculateBiweeklyAmount()}
                      </p>
                      {formData.envelopeType === "variable" && (
                        <p className="text-xs text-blue-600">
                          Variable expense: Auto-funded from paychecks based on
                          monthly budget
                        </p>
                      )}
                      {formData.envelopeType === "savings" && (
                        <p className="text-xs text-green-600">
                          Savings goal: Funds allocated manually or from
                          leftover paycheck amounts
                        </p>
                      )}
                      {formData.envelopeType === "bill" && (
                        <p className="text-xs text-blue-600">
                          Fixed bill: Auto-funded from paychecks using biweekly
                          allocation
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Balance (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.currentBalance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentBalance: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <Palette className="h-4 w-4 mr-2 text-purple-600" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
          <div className="text-sm text-gray-600">
            {formData.name && (
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-lg mr-2"
                  style={{ backgroundColor: formData.color }}
                />
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                    formData.envelopeType === "variable"
                      ? "bg-amber-100 text-amber-800"
                      : formData.envelopeType === "savings"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {formData.envelopeType === "variable"
                    ? "Variable"
                    : formData.envelopeType === "savings"
                      ? "Savings"
                      : "Bill"}
                </span>
                Preview: {formData.name}
                {formData.monthlyAmount &&
                  ` • $${formData.monthlyAmount}/month`}
              </div>
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
                isSubmitting || !formData.name.trim() || !formData.monthlyAmount
              }
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Envelope
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEnvelopeModal;
