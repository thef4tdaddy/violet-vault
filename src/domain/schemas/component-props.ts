/**
 * Component Props Schema
 * Runtime validation for React component props
 * Part of Issue #987: Comprehensive Zod Schema Implementation (Phase 3)
 */

import { z } from "zod";
import { EnvelopeSchema } from "./envelope";
import { TransactionSchema } from "./transaction";
import { BillSchema } from "./bill";

/**
 * EnvelopeGrid component props schema
 * Used for the main envelope grid component
 */
export const EnvelopeGridPropsSchema = z.object({
  envelopes: z.array(EnvelopeSchema).optional().default([]),
  transactions: z.array(TransactionSchema).optional().default([]),
  unassignedCash: z.number().nonnegative().optional(),
  className: z.string().optional().default(""),
});

export type EnvelopeGridProps = z.infer<typeof EnvelopeGridPropsSchema>;

/**
 * TransactionTable component props schema
 * Includes callback functions for table actions
 */
export const TransactionTablePropsSchema = z.object({
  transactions: z.array(TransactionSchema).optional().default([]),
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
  filteredBills: z.array(BillSchema),
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
