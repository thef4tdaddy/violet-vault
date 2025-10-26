/**
 * Envelope form utilities for validation, calculations, and transformations
 * Handles form data processing for envelope creation and editing
 * Now using Zod schemas for core validation (Issue #412)
 */

import {
  ENVELOPE_TYPES,
  ENVELOPE_TYPE_CONFIG,
  getEnvelopeCategories,
} from "../../constants/categories";
import { toBiweekly, getFrequencyOptions } from "../common/frequencyCalculations";
import { validateEnvelopeSafe } from "../../domain/schemas/envelope.ts";

/**
 * Creates default envelope form data
 * @returns {Object} Default form data structure
 */
export const createDefaultEnvelopeForm = () => ({
  name: "",
  monthlyAmount: "",
  currentBalance: "",
  category: "",
  color: "#a855f7",
  frequency: "monthly",
  description: "",
  priority: "medium",
  autoAllocate: true,
  icon: "Target",
  envelopeType: ENVELOPE_TYPES.VARIABLE,
  monthlyBudget: "",
  biweeklyAllocation: "",
  targetAmount: "",
});

/**
 * Convert Zod errors to error object format
 */
const convertZodErrors = (zodResult) => {
  const errors = {};
  if (!zodResult.success) {
    zodResult.error.errors.forEach((err) => {
      const fieldName = err.path[0];
      if (fieldName) {
        errors[fieldName] = err.message;
      }
    });
  }
  return errors;
};

/**
 * Validate envelope name uniqueness
 */
const validateNameUniqueness = (formData, existingEnvelopes, editingEnvelopeId, errors) => {
  if (!errors.name && formData.name) {
    const nameExists = existingEnvelopes.some(
      (envelope) =>
        envelope.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        envelope.id !== editingEnvelopeId
    );
    if (nameExists) {
      errors.name = "An envelope with this name already exists";
    }
  }
};

/**
 * Validate monthly amount field
 */
const validateMonthlyAmount = (formData, errors) => {
  const typeConfig = ENVELOPE_TYPE_CONFIG[formData.envelopeType];

  if (typeConfig?.requiresMonthlyAmount && !formData.monthlyAmount) {
    errors.monthlyAmount = "Monthly amount is required for this envelope type";
  }

  if (formData.monthlyAmount) {
    const amount = parseFloat(formData.monthlyAmount);
    if (isNaN(amount) || amount < 0) {
      errors.monthlyAmount = "Monthly amount must be a positive number";
    } else if (amount > 100000) {
      errors.monthlyAmount = "Monthly amount cannot exceed $100,000";
    }
  }
};

/**
 * Validate target amount for sinking funds
 */
const validateTargetAmount = (formData, errors) => {
  if (formData.envelopeType === ENVELOPE_TYPES.SINKING_FUND) {
    if (!formData.targetAmount) {
      errors.targetAmount = "Target amount is required for sinking funds";
    } else {
      const amount = parseFloat(formData.targetAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.targetAmount = "Target amount must be a positive number";
      } else if (amount > 1000000) {
        errors.targetAmount = "Target amount cannot exceed $1,000,000";
      }
    }
  }
};

/**
 * Validate category, priority, and frequency
 */
const validateSelectFields = (formData, errors) => {
  // Category validation
  if (!errors.category && formData.category) {
    const availableCategories = getEnvelopeCategories();
    if (!availableCategories.includes(formData.category)) {
      errors.category = "Invalid category selected";
    }
  }

  // Priority validation
  if (formData.priority && !["low", "medium", "high", "critical"].includes(formData.priority)) {
    errors.priority = "Invalid priority selected";
  }

  // Frequency validation
  if (formData.frequency) {
    const frequencyOptions = getFrequencyOptions();
    if (!frequencyOptions.find((opt) => opt.value === formData.frequency)) {
      errors.frequency = "Invalid frequency selected";
    }
  }
};

/**
 * Validates envelope form data using Zod schema + form-specific logic
 * @param {Object} formData - Form data to validate
 * @param {Array} existingEnvelopes - Existing envelopes for name uniqueness
 * @param {string} editingEnvelopeId - ID of envelope being edited (for name uniqueness)
 * @returns {Object} Validation result with errors object
 */
export const validateEnvelopeForm = (
  formData,
  existingEnvelopes = [],
  editingEnvelopeId = null
) => {
  const zodResult = validateEnvelopeSafe(formData);
  const errors = convertZodErrors(zodResult);

  validateNameUniqueness(formData, existingEnvelopes, editingEnvelopeId, errors);
  validateMonthlyAmount(formData, errors);
  validateTargetAmount(formData, errors);
  validateSelectFields(formData, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Calculates derived amounts based on form data
 * @param {Object} formData - Form data
 * @returns {Object} Calculated amounts
 */
export const calculateEnvelopeAmounts = (formData) => {
  const monthlyAmount = parseFloat(formData.monthlyAmount) || 0;
  const targetAmount = parseFloat(formData.targetAmount) || 0;
  const currentBalance = parseFloat(formData.currentBalance) || 0;

  // Calculate biweekly allocation
  const biweeklyAllocation = monthlyAmount > 0 ? toBiweekly(monthlyAmount) : 0;

  // Calculate monthly budget (may differ from monthlyAmount based on type)
  let monthlyBudget = monthlyAmount;

  // For sinking funds, calculate monthly amount needed to reach target
  if (formData.envelopeType === ENVELOPE_TYPES.SINKING_FUND && targetAmount > 0) {
    // If target date is provided, calculate based on time remaining
    // Otherwise, use the monthly amount as-is
    monthlyBudget = monthlyAmount;
  }

  // Calculate frequency-adjusted amounts
  const frequencyMultiplier =
    {
      weekly: 52,
      biweekly: 26,
      monthly: 12,
      quarterly: 4,
      annually: 1,
    }[formData.frequency] || 12;

  const annualAmount = monthlyAmount * 12;
  const weeklyAmount = monthlyAmount / (52 / 12);

  return {
    monthlyAmount,
    biweeklyAllocation,
    monthlyBudget,
    targetAmount,
    currentBalance,
    annualAmount,
    weeklyAmount,
    frequencyMultiplier,
  };
};

/**
 * Transforms form data into envelope object
 * @param {Object} formData - Form data
 * @param {Object} options - Additional options (editingId, createdBy, etc.)
 * @returns {Object} Envelope object ready for save
 */
export const transformFormToEnvelope = (formData, options = {}) => {
  const { editingId, createdBy = "Unknown User" } = options;
  const amounts = calculateEnvelopeAmounts(formData);

  const envelope = {
    name: formData.name.trim(),
    monthlyAmount: amounts.monthlyAmount,
    currentBalance: amounts.currentBalance,
    category: formData.category,
    color: formData.color,
    frequency: formData.frequency,
    description: formData.description?.trim() || "",
    priority: formData.priority,
    autoAllocate: Boolean(formData.autoAllocate),
    icon: formData.icon,
    envelopeType: formData.envelopeType,
    targetAmount: amounts.targetAmount,

    // Calculated fields
    biweeklyAllocation: amounts.biweeklyAllocation,
    monthlyBudget: amounts.monthlyBudget,
    annualAmount: amounts.annualAmount,

    // Metadata
    lastUpdated: new Date().toISOString(),
    updatedBy: createdBy,
  };

  // Add ID and creation info for new envelopes
  if (!editingId) {
    envelope.id = Date.now();
    envelope.createdAt = new Date().toISOString();
    envelope.createdBy = createdBy;
  } else {
    envelope.id = editingId;
  }

  return envelope;
};

/**
 * Get default value with fallback
 */
const getDefaultValue = (value, defaultValue) => value || defaultValue;

/**
 * Convert number to string or empty string
 */
const numberToString = (value) => value?.toString() || "";

/**
 * Transforms envelope object to form data
 * @param {Object} envelope - Envelope object
 * @returns {Object} Form data
 */
export const transformEnvelopeToForm = (envelope) => {
  if (!envelope) return createDefaultEnvelopeForm();

  return {
    name: getDefaultValue(envelope.name, ""),
    monthlyAmount: numberToString(envelope.monthlyAmount),
    currentBalance: numberToString(envelope.currentBalance),
    category: getDefaultValue(envelope.category, ""),
    color: getDefaultValue(envelope.color, "#a855f7"),
    frequency: getDefaultValue(envelope.frequency, "monthly"),
    description: getDefaultValue(envelope.description, ""),
    priority: getDefaultValue(envelope.priority, "medium"),
    autoAllocate: envelope.autoAllocate !== false,
    icon: getDefaultValue(envelope.icon, "Target"),
    envelopeType: getDefaultValue(envelope.envelopeType, ENVELOPE_TYPES.VARIABLE),
    monthlyBudget: numberToString(envelope.monthlyBudget),
    biweeklyAllocation: numberToString(envelope.biweeklyAllocation),
    targetAmount: numberToString(envelope.targetAmount),
  };
};

/**
 * Calculates envelope progress for sinking funds
 * @param {Object} envelope - Envelope object
 * @returns {Object} Progress information
 */
export const calculateEnvelopeProgress = (envelope) => {
  if (envelope.envelopeType !== ENVELOPE_TYPES.SINKING_FUND) {
    return null;
  }

  const currentBalance = envelope.currentBalance || 0;
  const targetAmount = envelope.targetAmount || 0;

  if (targetAmount <= 0) return null;

  const progressPercentage = Math.min((currentBalance / targetAmount) * 100, 100);
  const remainingAmount = Math.max(targetAmount - currentBalance, 0);
  const isComplete = currentBalance >= targetAmount;

  // Estimate completion time based on monthly allocation
  let monthsRemaining = null;
  if (!isComplete && envelope.monthlyAmount > 0) {
    monthsRemaining = Math.ceil(remainingAmount / envelope.monthlyAmount);
  }

  return {
    progressPercentage,
    remainingAmount,
    isComplete,
    monthsRemaining,
    currentBalance,
    targetAmount,
  };
};

/**
 * Gets available priority options
 * @returns {Array} Priority options
 */
export const getPriorityOptions = () => [
  { value: "low", label: "Low Priority", color: "text-gray-600" },
  { value: "medium", label: "Medium Priority", color: "text-blue-600" },
  { value: "high", label: "High Priority", color: "text-orange-600" },
  { value: "critical", label: "Critical", color: "text-red-600" },
];

/**
 * Gets available color options
 * @returns {Array} Color options
 */
export const getColorOptions = () => [
  "#a855f7", // Purple
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#ec4899", // Pink
];

/**
 * Validates envelope type compatibility with existing data
 * @param {string} newType - New envelope type
 * @param {Object} envelope - Existing envelope data
 * @returns {Object} Compatibility result
 */
export const validateEnvelopeTypeChange = (newType, envelope) => {
  const warnings = [];
  const errors = [];

  if (!envelope) return { isValid: true, warnings, errors };

  // Check if changing from sinking fund to another type
  if (
    envelope.envelopeType === ENVELOPE_TYPES.SINKING_FUND &&
    newType !== ENVELOPE_TYPES.SINKING_FUND
  ) {
    if (envelope.targetAmount > 0) {
      warnings.push("Changing from sinking fund will remove target amount tracking");
    }
  }

  // Check if changing to sinking fund requires target amount
  if (newType === ENVELOPE_TYPES.SINKING_FUND && !envelope.targetAmount) {
    errors.push("Sinking funds require a target amount");
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};
