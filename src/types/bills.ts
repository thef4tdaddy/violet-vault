import React from "react";
import type { BillIconOption } from "@/utils/billIcons/iconOptions";

/**
 * TypeScript type definitions for bill components
 */

// Frequency types
export type BillFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" | "once";

// Convert BillFrequency to Frequency (excluding 'once' which isn't supported in calculations)
export type CalculationFrequency = Exclude<BillFrequency, "once">;

// Bill status types
export type BillStatus = "active" | "paid" | "overdue" | "upcoming";

// Base bill interface
export interface Bill {
  id: string;
  name: string;
  provider?: string;
  amount: number;
  monthlyAmount?: number;
  biweeklyAmount?: number;
  frequency: BillFrequency;
  customFrequency?: number;
  dueDate: string;
  nextDue?: string;
  category: string;
  color: string;
  notes?: string;
  iconName?: string;
  icon?: string;
  envelopeId?: string;
  isPaid?: boolean;
  paidDate?: string;
  status?: BillStatus;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Bill form data interface
export interface BillFormData {
  name: string;
  amount: string;
  frequency: BillFrequency;
  dueDate: string;
  category: string;
  color: string;
  notes: string;
  createEnvelope: boolean;
  selectedEnvelope: string;
  customFrequency: string;
  iconName: string;
}

// Envelope interface (simplified for bill forms)
export interface Envelope {
  id: string | number;
  name: string;
  category?: string;
  currentBalance?: number;
  targetAmount?: number;
  billId?: string;
  [key: string]: unknown;
}

// Bill form hook options interface
export interface BillFormOptions {
  editingBill?: Bill | null;
  availableEnvelopes?: Envelope[];
  onAddBill?: (bill: Bill) => Promise<void> | void;
  onUpdateBill?: (bill: Bill) => Promise<void> | void;
  onDeleteBill?: (billId: string, deleteEnvelope?: boolean) => Promise<void> | void;
  onClose?: () => void;
  onError?: (error: string) => void;
}

// Bill form hook return type
export interface BillFormHookReturn {
  // Form State
  formData: BillFormData;
  showDeleteConfirm: boolean;
  deleteEnvelopeToo: boolean;
  isSubmitting: boolean;

  // Computed Values
  suggestedIconName: string;
  iconSuggestions: BillIconOption[];
  categories: string[];

  // Validation
  validationErrors: string[];

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  updateField: (field: keyof BillFormData, value: string | boolean) => void;
  updateFormData: (updates: Partial<BillFormData>) => void;
  resetForm: () => void;

  // UI State Setters
  setShowDeleteConfirm: (show: boolean) => void;
  setDeleteEnvelopeToo: (deleteEnvelope: boolean) => void;

  // Utility Functions
  calculateBiweeklyAmount: (
    amount: string | number,
    frequency: BillFrequency,
    customFrequency?: number
  ) => number;
  calculateMonthlyAmount: (
    amount: string | number,
    frequency: BillFrequency,
    customFrequency?: number
  ) => number;
  getNextDueDate: (frequency: BillFrequency, dueDate: string) => string;
  normalizeDateFormat: (dateString: string) => string;
}

// Category interface
export interface BillCategory {
  name: string;
  color?: string;
  icon?: string;
}
