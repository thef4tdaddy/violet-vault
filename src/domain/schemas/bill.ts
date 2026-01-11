import { z } from "zod";
import { LiabilityEnvelopeSchema, type LiabilityEnvelope, type EnvelopePartial } from "./envelope";

export type Bill = LiabilityEnvelope;
export type BillPartial = EnvelopePartial;

export const BillSchema = LiabilityEnvelopeSchema;
export const BillPartialSchema = LiabilityEnvelopeSchema.partial();
export const BillFrequencyEnum = z.enum(["monthly", "quarterly", "annually"]);
export const BillFrequencySchema = BillFrequencyEnum.optional();

export const validateBill = (data: unknown) => LiabilityEnvelopeSchema.parse(data);
export const validateBillSafe = (data: unknown) => LiabilityEnvelopeSchema.safeParse(data);
export const validateBillPartial = (data: unknown) => LiabilityEnvelopeSchema.partial().parse(data);
export const validateBillPartialSafe = (data: unknown) =>
  LiabilityEnvelopeSchema.partial().safeParse(data);
export const validateBillFormDataSafe = (data: unknown) => LiabilityEnvelopeSchema.safeParse(data);
export const validateBillFormDataMinimal = (data: unknown) => BillFormDataMinimalSchema.parse(data);
export const validateBillFormDataMinimalSafe = (data: unknown) =>
  BillFormDataMinimalSchema.safeParse(data);

export type BillFormData = LiabilityEnvelope;

export const BillFormDataMinimalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().refine((val: string) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  dueDate: z.string().min(1, "Due date is required"),
});
