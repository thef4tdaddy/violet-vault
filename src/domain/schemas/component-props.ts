/**
 * Component Props Schema
 * Runtime validation for React component props
 * Part of Issue #987: Comprehensive Zod Schema Implementation (Phase 3)
 */

import { z } from "zod";
import { EnvelopeSchema } from "./envelope";
import { TransactionSchema } from "./transaction";
import { BillSchema } from "./bill";
import { SavingsGoalSchema } from "./savings-goal";
import { DebtSchema } from "./debt";
import { PaycheckHistorySchema } from "./paycheck-history";

/**
 * EnvelopeGrid component props schema
 * Used for the main envelope grid component
 */
export const EnvelopeGridPropsSchema = z.object({
  envelopes: z.array(EnvelopeSchema).optional().default([]),
  transactions: z.array(TransactionSchema).optional().default([]),
  unassignedCash: z.number().optional(), // Can be negative when overallocated
  className: z.string().optional().default(""),
});

export type EnvelopeGridProps = z.infer<typeof EnvelopeGridPropsSchema>;

/**
 * TransactionTable component props schema
 * Includes callback functions for table actions
 */
const TransactionTableItemSchema = TransactionSchema.extend({
  type: z.string().optional(),
}).passthrough();

const BillTableItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string().min(1),
    amount: z.number(),
    dueDate: z.union([z.date(), z.string(), z.null()]).optional(),
    category: z.string().optional(),
    isPaid: z.boolean().optional(),
    isRecurring: z.boolean().optional(),
  })
  .passthrough();

export const TransactionTablePropsSchema = z.object({
  transactions: z.array(TransactionTableItemSchema).optional().default([]),
  envelopes: z.array(EnvelopeSchema).optional().default([]),
  onEdit: z.function(),
  onDelete: z.function(),
  onSplit: z.function(),
});

export type TransactionTableProps = z.infer<typeof TransactionTablePropsSchema>;

/**
 * BillTable component props schema
 * Complex component with multiple state management callbacks
 */
export const BillTablePropsSchema = z.object({
  filteredBills: z.array(BillTableItemSchema),
  selectionState: z.object({
    selectedBillIds: z.array(z.string()),
    isAllSelected: z.boolean(),
  }),
  clearSelection: z.function(),
  selectAllBills: z.function(),
  toggleBillSelection: z.function(),
  setShowBulkUpdateModal: z.function(),
  setShowBillDetail: z.function(),
  getBillDisplayData: z.function(),
  billOperations: z.object({
    handlePayBill: z.function(),
  }),
  categorizedBills: z.unknown(),
  viewMode: z.string(),
});

export type BillTableProps = z.infer<typeof BillTablePropsSchema>;

/**
 * MainDashboard component props schema
 * Page-level component with minimal props
 */
export const MainDashboardPropsSchema = z.object({
  setActiveView: z.function(),
});

export type MainDashboardProps = z.infer<typeof MainDashboardPropsSchema>;

/**
 * EnvelopeItem component props schema (Medium Priority)
 */
export const EnvelopeItemPropsSchema = z.object({
  envelope: EnvelopeSchema,
  onClick: z.function().optional(),
  onEdit: z.function().optional(),
  onDelete: z.function().optional(),
  isSelected: z.boolean().optional().default(false),
});

export type EnvelopeItemProps = z.infer<typeof EnvelopeItemPropsSchema>;

/**
 * TransactionRow component props schema (Medium Priority)
 */
export const TransactionRowPropsSchema = z.object({
  transaction: TransactionSchema,
  envelopes: z.array(EnvelopeSchema),
  virtualRow: z.object({
    index: z.number(),
    start: z.number(),
    size: z.number(),
  }),
  onEdit: z.function(),
  onSplit: z.function(),
  onDeleteClick: z.function(),
  onHistoryClick: z.function(),
});

export type TransactionRowProps = z.infer<typeof TransactionRowPropsSchema>;

/**
 * BillItem component props schema (Medium Priority)
 */
export const BillItemPropsSchema = z.object({
  bill: BillSchema,
  onClick: z.function().optional(),
  onPay: z.function().optional(),
  isSelected: z.boolean().optional().default(false),
});

export type BillItemProps = z.infer<typeof BillItemPropsSchema>;

/**
 * AnalyticsDashboard component props schema (Medium Priority)
 */
export const AnalyticsDashboardPropsSchema = z.object({
  data: z.array(z.unknown()).optional().default([]),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  onDateRangeChange: z.function().optional(),
});

export type AnalyticsDashboardProps = z.infer<typeof AnalyticsDashboardPropsSchema>;

/**
 * SavingsGoals component props schema (High Priority)
 */
export const SavingsGoalsPropsSchema = z.object({
  goals: z.array(SavingsGoalSchema).optional().default([]),
  onAddGoal: z.function(),
  onUpdateGoal: z.function(),
  onDeleteGoal: z.function(),
  onDistributeToGoals: z.function().optional(),
  isLoading: z.boolean().optional().default(false),
});

export type SavingsGoalsProps = z.infer<typeof SavingsGoalsPropsSchema>;

/**
 * SavingsGoalItem component props schema (High Priority)
 */
export const SavingsGoalItemPropsSchema = z.object({
  goal: SavingsGoalSchema,
  onClick: z.function().optional(),
  onEdit: z.function().optional(),
  onDelete: z.function().optional(),
  onTogglePause: z.function().optional(),
  isSelected: z.boolean().optional().default(false),
});

export type SavingsGoalItemProps = z.infer<typeof SavingsGoalItemPropsSchema>;

/**
 * PaycheckHistory component props schema (High Priority)
 */
export const PaycheckHistoryPropsSchema = z.object({
  paychecks: z.array(PaycheckHistorySchema).optional().default([]),
  onAddPaycheck: z.function(),
  onEditPaycheck: z.function().optional(),
  onDeletePaycheck: z.function().optional(),
  isLoading: z.boolean().optional().default(false),
});

export type PaycheckHistoryProps = z.infer<typeof PaycheckHistoryPropsSchema>;

/**
 * PaycheckItem component props schema (High Priority)
 */
export const PaycheckItemPropsSchema = z.object({
  paycheck: PaycheckHistorySchema,
  onClick: z.function().optional(),
  onEdit: z.function().optional(),
  onDelete: z.function().optional(),
});

export type PaycheckItemProps = z.infer<typeof PaycheckItemPropsSchema>;

/**
 * DebtSummary component props schema (High Priority)
 */
export const DebtSummaryPropsSchema = z.object({
  debts: z.array(DebtSchema).optional().default([]),
  totalDebt: z.number().optional().default(0),
  monthlyPayment: z.number().optional().default(0),
  onViewDetails: z.function().optional(),
});

export type DebtSummaryProps = z.infer<typeof DebtSummaryPropsSchema>;

/**
 * DebtItem component props schema (High Priority)
 */
export const DebtItemPropsSchema = z.object({
  debt: DebtSchema,
  onClick: z.function().optional(),
  onEdit: z.function().optional(),
  onDelete: z.function().optional(),
  onPayment: z.function().optional(),
});

export type DebtItemProps = z.infer<typeof DebtItemPropsSchema>;

/**
 * BudgetSummary component props schema (High Priority)
 */
export const BudgetSummaryPropsSchema = z.object({
  totalIncome: z.number().optional().default(0),
  totalExpenses: z.number().optional().default(0),
  remainingBudget: z.number().optional().default(0),
  envelopeCount: z.number().optional().default(0),
  period: z.string().optional().default("monthly"),
});

export type BudgetSummaryProps = z.infer<typeof BudgetSummaryPropsSchema>;

/**
 * Settings component props schema (High Priority)
 */
export const SettingsPropsSchema = z.object({
  onSave: z.function(),
  onCancel: z.function().optional(),
  isLoading: z.boolean().optional().default(false),
});

export type SettingsProps = z.infer<typeof SettingsPropsSchema>;

/**
 * CreateEnvelopeModal component props schema (Modal)
 */
export const CreateEnvelopeModalPropsSchema = z.object({
  isOpen: z.boolean(),
  onClose: z.function(),
  onSubmit: z.function(),
  categories: z.array(z.string()).optional().default([]),
});

export type CreateEnvelopeModalProps = z.infer<typeof CreateEnvelopeModalPropsSchema>;

/**
 * EditEnvelopeModal component props schema (Modal)
 */
export const EditEnvelopeModalPropsSchema = z.object({
  isOpen: z.boolean(),
  onClose: z.function(),
  onSubmit: z.function(),
  envelope: EnvelopeSchema.optional().nullable(),
  categories: z.array(z.string()).optional().default([]),
});

export type EditEnvelopeModalProps = z.infer<typeof EditEnvelopeModalPropsSchema>;

/**
 * DatePicker component props schema (UI Component)
 */
export const DatePickerPropsSchema = z.object({
  value: z.union([z.string(), z.date()]).optional().nullable(),
  onChange: z.function(),
  label: z.string().optional(),
  error: z.string().optional(),
  disabled: z.boolean().optional().default(false),
  minDate: z.union([z.string(), z.date()]).optional(),
  maxDate: z.union([z.string(), z.date()]).optional(),
});

export type DatePickerProps = z.infer<typeof DatePickerPropsSchema>;

/**
 * Select component props schema (UI Component)
 */
export const SelectPropsSchema = z.object({
  value: z.union([z.string(), z.number()]).optional(),
  onChange: z.function(),
  options: z.array(
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
  ),
  label: z.string().optional(),
  error: z.string().optional(),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

export type SelectProps = z.infer<typeof SelectPropsSchema>;

/**
 * InputField component props schema (UI Component)
 */
export const InputFieldPropsSchema = z.object({
  value: z.union([z.string(), z.number()]).optional(),
  onChange: z.function(),
  type: z.enum(["text", "number", "email", "password", "tel"]).optional().default("text"),
  label: z.string().optional(),
  error: z.string().optional(),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export type InputFieldProps = z.infer<typeof InputFieldPropsSchema>;
