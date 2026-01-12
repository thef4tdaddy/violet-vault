import { z } from "zod";
import { TransactionSchema, type Transaction } from "./transaction";

/**
 * Phase 2 Migration: Bills are now Scheduled Transactions
 * A Bill is a Transaction with isScheduled=true and type='expense'
 */
export type Bill = Transaction;
export type BillPartial = Partial<Transaction>;

// Bill is validated as a Transaction with scheduled properties
export const BillSchema = TransactionSchema.refine(
  (data) => {
    // Handle both boolean and numeric (0/1) representations from Dexie
    const isScheduled = data.isScheduled === true || data.isScheduled === 1;
    const isExpense = data.type === "expense";
    return isScheduled && isExpense;
  },
  {
    message: "Bill must be a scheduled expense transaction",
  }
);

export const BillPartialSchema = TransactionSchema.partial();
export const BillFrequencyEnum = z.enum(["monthly", "quarterly", "annually"]);
export const BillFrequencySchema = BillFrequencyEnum.optional();

export const validateBill = (data: unknown) => BillSchema.parse(data);
export const validateBillSafe = (data: unknown) => BillSchema.safeParse(data);
export const validateBillPartial = (data: unknown) => BillPartialSchema.parse(data);
export const validateBillPartialSafe = (data: unknown) => BillPartialSchema.safeParse(data);
export const validateBillFormDataSafe = (data: unknown) => BillSchema.safeParse(data);
export const validateBillFormDataMinimal = (data: unknown) => BillFormDataMinimalSchema.parse(data);
export const validateBillFormDataMinimalSafe = (data: unknown) =>
  BillFormDataMinimalSchema.safeParse(data);

export type BillFormData = Transaction;

export const BillFormDataMinimalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().refine((val: string) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  dueDate: z.string().min(1, "Due date is required"),
});
