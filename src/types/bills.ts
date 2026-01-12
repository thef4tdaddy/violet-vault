import React from "react";
import type { BillIconOption } from "@/utils/billIcons/iconOptions";
import type { Transaction } from "@/db/types";

/**
 * TypeScript type definitions for bill components
 * Phase 2 Migration: Bills are now Scheduled Transactions
 */

// Frequency types
export type BillFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" | "once";

// Convert BillFrequency to Frequency (excluding 'once' which isn't supported in calculations)
export type CalculationFrequency = Exclude<BillFrequency, "once">;

// Bill status types
export type BillStatus = "active" | "paid" | "overdue" | "upcoming";

// Phase 2 Migration: Bill is now a Transaction with scheduled properties
// Extended with computed fields for UI compatibility
export interface Bill extends Omit<Transaction, "createdAt" | "updatedAt" | "id"> {
  // Override id to always be string (Transaction allows string | number)
  id: string;
  
  // Computed backward-compatibility fields (derived from Transaction fields)
  // name is required for UI compatibility (maps to Transaction.description)
  name: string; // Computed getter: maps to Transaction.description (required)
  dueDate?: string | Date; // Computed getter: maps to Transaction.date
  isPaid?: boolean; // Computed: determined by existence of payment transaction
  paidDate?: string | Date; // From paired payment transaction
  paidAmount?: number; // From paired payment transaction
  paymentTransactionId?: string; // ID of paired payment transaction
  
  // Additional bill-specific fields (not in base Transaction)
  provider?: string; // Bill provider/vendor
  monthlyAmount?: number; // For recurring bills
  biweeklyAmount?: number; // For recurring bills
  frequency?: BillFrequency; // Bill frequency
  customFrequency?: number; // Custom frequency multiplier
  nextDue?: string; // Next due date for recurring bills
  color?: string; // UI color
  iconName?: string; // UI icon name
  icon?: string; // UI icon
  status?: BillStatus; // Bill status
  
  // Override Transaction timestamp types for flexibility
  createdAt?: number | string;
  updatedAt?: number | string;
  
  // All other Transaction fields inherited: date, description, amount,
  // envelopeId, category, type, isScheduled, recurrenceRule, lastModified, notes
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
