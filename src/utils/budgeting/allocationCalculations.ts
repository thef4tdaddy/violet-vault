import { Envelope } from "@/db/types";
import logger from "@/utils/common/logger";

const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
};

const BIWEEKLY_MULTIPLIER = 2.17;

const getBillFrequency = (bill: Record<string, unknown>): string => {
  const recurrenceRule = typeof bill.recurrenceRule === "string" ? bill.recurrenceRule : null;
  const rruleFrequency = recurrenceRule
    ? recurrenceRule.split(";")[0]?.replace("FREQ=", "").toLowerCase()
    : null;

  const legacyPaymentFrequency =
    typeof bill.paymentFrequency === "string" ? bill.paymentFrequency : null;
  const legacyFrequency = typeof bill.frequency === "string" ? bill.frequency : null;

  return rruleFrequency || legacyPaymentFrequency || legacyFrequency || "monthly";
};

const getBillAmount = (bill: Record<string, unknown>): number => {
  const legacyMinPayment = typeof bill.minimumPayment === "number" ? bill.minimumPayment : 0;
  const amount = typeof bill.amount === "number" ? bill.amount : 0;
  return amount || legacyMinPayment || 0;
};

const updateSingleEnvelopeAllocation = (envelope: Envelope, biweeklyAmount: number): Envelope => {
  return {
    ...envelope,
    biweeklyAllocation: biweeklyAmount,
    envelopeType: "bill",
  } as unknown as Envelope;
};

const hasExistingAllocation = (envelope: Envelope): boolean => {
  const candidate = envelope as { biweeklyAllocation?: unknown };
  return typeof candidate.biweeklyAllocation === "number" && candidate.biweeklyAllocation !== 0;
};

export const calculateBiweeklyAllocations = (
  envelopes: Envelope[],
  bills: unknown[],
  billsLoading: boolean
): { updatedEnvelopes: Envelope[]; envelopesUpdated: number } => {
  if (billsLoading || envelopes.length === 0 || bills.length === 0) {
    return { updatedEnvelopes: envelopes, envelopesUpdated: 0 };
  }

  const updatedEnvelopes = [...envelopes];
  let envelopesUpdated = 0;

  bills.forEach((bill) => {
    const billData = bill as Record<string, unknown>;
    const envelopeId = typeof billData.envelopeId === "string" ? billData.envelopeId : null;

    if (!envelopeId) return;

    const envelopeIndex = updatedEnvelopes.findIndex((env) => env.id === envelopeId);
    if (envelopeIndex === -1) {
      const name = typeof billData.name === "string" ? billData.name : "";
      const description = typeof billData.description === "string" ? billData.description : "";
      logger.warn("Bill references non-existent envelope", {
        billId: billData.id,
        billName: description || name || "Unknown",
        envelopeId,
      });
      return;
    }

    const envelope = updatedEnvelopes[envelopeIndex];
    if (hasExistingAllocation(envelope)) return;

    const frequency = getBillFrequency(billData);
    const amount = getBillAmount(billData);
    const multiplier = FREQUENCY_MULTIPLIERS[frequency] || 12;
    const biweeklyAmount = (amount * multiplier) / 12 / BIWEEKLY_MULTIPLIER;

    logger.debug("Updating envelope allocation", {
      billId: billData.id,
      envelopeId,
      amount,
      biweeklyAmount,
    });

    updatedEnvelopes[envelopeIndex] = updateSingleEnvelopeAllocation(envelope, biweeklyAmount);
    envelopesUpdated++;
  });

  return { updatedEnvelopes, envelopesUpdated };
};
