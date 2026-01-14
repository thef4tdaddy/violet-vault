/**
 * Envelope form utilities for validation, calculations, and transformations
 * Handles form data processing for envelope creation and editing
 * Now using Zod schemas for core validation (Issue #412)
 */

import {
  ENVELOPE_TYPES,
  ENVELOPE_TYPE_CONFIG,
  getEnvelopeCategories,
} from "@/constants/categories";
import { toBiweekly, getFrequencyOptions } from "../common/frequencyCalculations";
import { z } from "zod";

/**
 * Form data interface
 */
interface EnvelopeFormData {
  name: string;
  monthlyAmount: string | number;
  currentBalance: string | number;
  category: string;
  color: string;
  frequency: string;
  description?: string;
  priority: string;
  autoAllocate: boolean;
  icon: string;
  envelopeType: string;
  monthlyBudget?: string | number;
  biweeklyAllocation?: string | number;
  targetAmount?: string | number;
  [key: string]: unknown;
}

/**
 * Envelope interface
 */
interface Envelope {
  id: string;
  name: string;
  monthlyAmount?: number;
  currentBalance?: number;
  category?: string;
  color?: string;
  frequency?: string;
  description?: string;
  priority?: string;
  autoAllocate?: boolean;
  icon?: string;
  envelopeType?: string;
  monthlyBudget?: number;
  biweeklyAllocation?: number;
  targetAmount?: number;
  createdAt?: string;
  createdBy?: string;
  lastUpdated?: string;
  updatedBy?: string;
  [key: string]: unknown;
}

/**
 * Transform options interface
 */
interface TransformOptions {
  editingId?: string;
  createdBy?: string;
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Zod result interface
 */
interface ZodResultErrorIssue {
  path: Array<string | number>;
  message: string;
}

interface ZodResult {
  success: boolean;
  data?: unknown;
  error?: {
    errors?: Array<ZodResultErrorIssue>;
    issues?: Array<ZodResultErrorIssue>;
  };
}

/**
 * Creates default envelope form data
 * @returns {Object} Default form data structure
 */
export const createDefaultEnvelopeForm = (): EnvelopeFormData => ({
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
 * Validates envelope form data using Zod schema + form-specific logic
 * @param {Object} formData - Form data to validate
 * @param {Array} existingEnvelopes - Existing envelopes for name uniqueness
 * @param {string} editingEnvelopeId - ID of envelope being edited (for name uniqueness)
 * @returns {Object} Validation result with errors object
 */
/**
 * Convert Zod errors to error object format
 */
const convertZodErrors = (zodResult: ZodResult): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!zodResult.success && zodResult.error) {
    // Zod uses 'issues' property, ensure we always have an array
    const issues = zodResult.error.issues ?? zodResult.error.errors ?? [];
    // Safety check: ensure issues is actually an array before forEach
    if (Array.isArray(issues)) {
      issues.forEach((err) => {
        const fieldName = err?.path?.[0];
        if (fieldName !== undefined && err?.message) {
          errors[String(fieldName)] = err.message;
        }
      });
    }
  }
  return errors;
};

const EnvelopeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Envelope name is required")
    .max(50, "Envelope name must be less than 50 characters"),
  category: z.string().min(1, "Category is required"),
  monthlyAmount: z.union([z.string(), z.number()]).optional(),
  currentBalance: z.union([z.string(), z.number()]).optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  priority: z.string().optional(),
  color: z.string().optional(),
  frequency: z.string().optional(),
  envelopeType: z.string(),
  targetAmount: z.union([z.string(), z.number()]).optional(),
  autoAllocate: z.boolean().optional(),
  icon: z.string().optional(),
});

/**
 * Check for duplicate envelope names
 */
const validateUniqueName = (
  formData: EnvelopeFormData,
  existingEnvelopes: Envelope[],
  editingEnvelopeId: string | number | null,
  errors: Record<string, string>
): void => {
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
const validateMonthlyAmount = (
  formData: EnvelopeFormData,
  errors: Record<string, string>
): void => {
  const typeConfig =
    ENVELOPE_TYPE_CONFIG[formData.envelopeType as keyof typeof ENVELOPE_TYPE_CONFIG];

  // Bill and variable envelopes require monthly amount (fundingMethod is 'biweekly' or 'monthly')
  const requiresMonthlyAmount =
    typeConfig?.fundingMethod === "biweekly" || typeConfig?.fundingMethod === "monthly";
  if (requiresMonthlyAmount && !formData.monthlyAmount) {
    errors.monthlyAmount = "Monthly amount is required for this envelope type";
    return;
  }

  if (!formData.monthlyAmount) return;

  const amount = parseFloat(String(formData.monthlyAmount));
  if (isNaN(amount) || amount < 0) {
    errors.monthlyAmount = "Monthly amount must be a positive number";
  } else if (amount > 100000) {
    errors.monthlyAmount = "Monthly amount cannot exceed $100,000";
  }
};

/**
 * Validate target amount for sinking funds
 */
const validateTargetAmount = (formData: EnvelopeFormData, errors: Record<string, string>): void => {
  if (formData.envelopeType !== ENVELOPE_TYPES.SINKING_FUND) return;

  if (!formData.targetAmount) {
    errors.targetAmount = "Target amount is required for sinking funds";
    return;
  }

  const amount = parseFloat(String(formData.targetAmount));
  if (isNaN(amount) || amount <= 0) {
    errors.targetAmount = "Target amount must be a positive number";
  } else if (amount > 1000000) {
    errors.targetAmount = "Target amount cannot exceed $1,000,000";
  }
};

/**
 * Validate category, priority, and frequency fields
 */
const validateAdditionalFields = (
  formData: EnvelopeFormData,
  errors: Record<string, string>
): void => {
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
  formData: EnvelopeFormData,
  existingEnvelopes: Envelope[] = [],
  editingEnvelopeId: string | number | null = null
): ValidationResult => {
  // Use Zod schema for base validation
  const zodResult = EnvelopeFormSchema.safeParse(formData);
  const errors = convertZodErrors(zodResult as unknown as ZodResult);

  // Additional form-specific validations beyond Zod schema
  validateUniqueName(formData, existingEnvelopes, editingEnvelopeId, errors);
  validateMonthlyAmount(formData, errors);
  validateTargetAmount(formData, errors);
  validateAdditionalFields(formData, errors);

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
export const calculateEnvelopeAmounts = (formData: EnvelopeFormData) => {
  const monthlyAmount = parseFloat(String(formData.monthlyAmount)) || 0;
  const targetAmount = parseFloat(String(formData.targetAmount)) || 0;
  const currentBalance = parseFloat(String(formData.currentBalance)) || 0;

  // Calculate biweekly allocation
  const biweeklyAllocation = monthlyAmount > 0 ? toBiweekly(monthlyAmount, "monthly") : 0;

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
export const transformFormToEnvelope = (
  formData: EnvelopeFormData,
  options: TransformOptions = {}
): Envelope => {
  const { editingId, createdBy = "Unknown User" } = options;
  const amounts = calculateEnvelopeAmounts(formData);

  const envelope: Envelope = {
    id: editingId || `envelope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  // Add creation info for new envelopes (ID already set above)
  if (!editingId) {
    envelope.createdAt = new Date().toISOString();
    envelope.createdBy = createdBy;
  }

  return envelope;
};

/**
 * Get field with default value
 */
// eslint-disable-next-line no-redeclare
function getFieldOrDefault(value: unknown, defaultValue: string): string;
// eslint-disable-next-line no-redeclare
function getFieldOrDefault(value: unknown, defaultValue: boolean): boolean;
// eslint-disable-next-line no-redeclare
function getFieldOrDefault(value: unknown, defaultValue: string | boolean): string | boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value as string | boolean;
}

/**
 * Convert number to string or return empty string
 */
const toStringOrEmpty = (value: number | undefined | null): string => {
  return value?.toString() || "";
};

/**
 * Transforms envelope object to form data
 * @param {Object} envelope - Envelope object
 * @returns {Object} Form data
 */
export const transformEnvelopeToForm = (envelope: Envelope | null): EnvelopeFormData => {
  if (!envelope) return createDefaultEnvelopeForm();

  return {
    name: getFieldOrDefault(envelope.name, ""),
    monthlyAmount: toStringOrEmpty(envelope.monthlyAmount),
    currentBalance: toStringOrEmpty(envelope.currentBalance),
    category: getFieldOrDefault(envelope.category, ""),
    color: getFieldOrDefault(envelope.color, "#a855f7"),
    frequency: getFieldOrDefault(envelope.frequency, "monthly"),
    description: getFieldOrDefault(envelope.description, ""),
    priority: getFieldOrDefault(envelope.priority, "medium"),
    autoAllocate: envelope.autoAllocate !== false, // Default to true
    icon: getFieldOrDefault(envelope.icon, "Target"),
    envelopeType: getFieldOrDefault(envelope.envelopeType, ENVELOPE_TYPES.VARIABLE),
    monthlyBudget: toStringOrEmpty(envelope.monthlyBudget),
    biweeklyAllocation: toStringOrEmpty(envelope.biweeklyAllocation),
    targetAmount: toStringOrEmpty(envelope.targetAmount),
  };
};

/**
 * Calculates envelope progress for sinking funds
 * @param {Object} envelope - Envelope object
 * @returns {Object} Progress information
 */
export const calculateEnvelopeProgress = (envelope: Envelope) => {
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
  let monthsRemaining: number | null = null;
  if (!isComplete && envelope.monthlyAmount && envelope.monthlyAmount > 0) {
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
export const validateEnvelopeTypeChange = (newType: string, envelope: Envelope | null) => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!envelope) return { isValid: true, warnings, errors };

  // Check if changing from sinking fund to another type
  if (
    envelope.envelopeType === ENVELOPE_TYPES.SINKING_FUND &&
    newType !== ENVELOPE_TYPES.SINKING_FUND
  ) {
    if (envelope.targetAmount && envelope.targetAmount > 0) {
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
