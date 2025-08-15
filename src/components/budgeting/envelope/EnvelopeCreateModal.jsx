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
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  ENVELOPE_TYPES,
  ENVELOPE_TYPE_CONFIG,
  getEnvelopeCategories,
} from "../../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../../constants/frequency";

const EnvelopeCreateModal = ({
  isOpen = false,
  onClose,
  onCreateEnvelope,
  existingEnvelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  _unassignedCash = 0,
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
    envelopeType: ENVELOPE_TYPES.VARIABLE, // Default to variable
    monthlyBudget: "", // For variable expense envelopes
    biweeklyAllocation: "", // For bill envelopes
    targetAmount: "", // For savings envelopes
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use standardized categories for quick selection
  const categories = getEnvelopeCategories();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Envelope name is required";
    } else if (
      existingEnvelopes.some(
        (env) => env.name.toLowerCase() === formData.name.toLowerCase(),
      )
    ) {
      newErrors.name = "An envelope with this name already exists";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Type-specific validation
    if (formData.envelopeType === ENVELOPE_TYPES.BILL) {
      if (
        !formData.biweeklyAllocation ||
        parseFloat(formData.biweeklyAllocation) <= 0
      ) {
        newErrors.biweeklyAllocation =
          "Biweekly allocation must be greater than 0";
      }
    } else if (formData.envelopeType === ENVELOPE_TYPES.SAVINGS) {
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = "Target amount must be greater than 0";
      }
    } else if (formData.envelopeType === ENVELOPE_TYPES.VARIABLE) {
      if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
        newErrors.monthlyBudget = "Monthly budget must be greater than 0";
      }
    }

    if (formData.currentBalance && parseFloat(formData.currentBalance) < 0) {
      newErrors.currentBalance = "Initial balance cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const envelopeData = {
        name: formData.name.trim(),
        category: formData.category,
        color: formData.color,
        description: formData.description,
        priority: formData.priority,
        autoAllocate: formData.autoAllocate,
        envelopeType: formData.envelopeType,
        currentBalance: parseFloat(formData.currentBalance) || 0,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.userName,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.userName,
      };

      // Add type-specific fields
      if (formData.envelopeType === ENVELOPE_TYPES.BILL) {
        envelopeData.biweeklyAllocation = parseFloat(
          formData.biweeklyAllocation,
        );
        envelopeData.monthlyAmount =
          parseFloat(formData.biweeklyAllocation) * BIWEEKLY_MULTIPLIER;
      } else if (formData.envelopeType === ENVELOPE_TYPES.SAVINGS) {
        envelopeData.targetAmount = parseFloat(formData.targetAmount);
        envelopeData.monthlyAmount = parseFloat(formData.monthlyAmount) || 0;
      } else if (formData.envelopeType === ENVELOPE_TYPES.VARIABLE) {
        envelopeData.monthlyBudget = parseFloat(formData.monthlyBudget);
        envelopeData.monthlyAmount = parseFloat(formData.monthlyBudget);
      }

      await onCreateEnvelope(envelopeData);
      onClose();

      // Reset form
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
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        monthlyBudget: "",
        biweeklyAllocation: "",
        targetAmount: "",
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || "Failed to create envelope" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const getTypeConfig = (type) =>
    ENVELOPE_TYPE_CONFIG[type] || ENVELOPE_TYPE_CONFIG[ENVELOPE_TYPES.VARIABLE];

  if (!isOpen) return null;

  const _currentTypeConfig = getTypeConfig(formData.envelopeType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-purple-600" />
            Create New Envelope
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Envelope Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Envelope Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(ENVELOPE_TYPE_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange("envelopeType", type)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    formData.envelopeType === type
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <config.icon className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{config.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="h-4 w-4 inline mr-1" />
                Envelope Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Groceries, Electric Bill"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Type-specific fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.envelopeType === ENVELOPE_TYPES.BILL && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Biweekly Allocation *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.biweeklyAllocation}
                  onChange={(e) =>
                    handleInputChange("biweeklyAllocation", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${
                    errors.biweeklyAllocation
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.biweeklyAllocation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.biweeklyAllocation}
                  </p>
                )}
              </div>
            )}

            {formData.envelopeType === ENVELOPE_TYPES.SAVINGS && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Target className="h-4 w-4 inline mr-1" />
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      handleInputChange("targetAmount", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${
                      errors.targetAmount ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.targetAmount && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.targetAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Monthly Contribution
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyAmount}
                    onChange={(e) =>
                      handleInputChange("monthlyAmount", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </>
            )}

            {formData.envelopeType === ENVELOPE_TYPES.VARIABLE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Monthly Budget *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    handleInputChange("monthlyBudget", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${
                    errors.monthlyBudget ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.monthlyBudget && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.monthlyBudget}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Initial Balance
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.currentBalance}
                onChange={(e) =>
                  handleInputChange("currentBalance", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 ${
                  errors.currentBalance ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.currentBalance && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentBalance}
                </p>
              )}
            </div>
          </div>

          {/* Color and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Palette className="h-4 w-4 inline mr-1" />
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Zap className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              placeholder="Optional description or notes"
            />
          </div>

          {/* Auto-allocate toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoAllocate"
              checked={formData.autoAllocate}
              onChange={(e) =>
                handleInputChange("autoAllocate", e.target.checked)
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoAllocate"
              className="ml-2 text-sm text-gray-700"
            >
              Enable automatic allocation
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </form>
      </div>
    </div>
  );
};

export default EnvelopeCreateModal;
