// src/components/budgeting/EnvelopeSystem.tsx - Refactored with separated logic
import { useEffect, useCallback, useRef } from "react";
import { useEnvelopes } from "../../hooks/budgeting/envelopes/useEnvelopes";
import useBills from "../../hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useUnassignedCash } from "../../hooks/budgeting/metadata/useUnassignedCash";
import { calculateBiweeklyNeeds } from "../../utils/budgeting";
import logger from "../../utils/common/logger";
import type { Bill } from "../../utils/budgeting/envelopeCalculations";
import type { Envelope } from "../../db/types";

// Define frequency multipliers with proper typing
const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
};

const BIWEEKLY_MULTIPLIER = 2.17;

// Define types for our functions
interface AddEnvelopeData {
  name: string;
  category?: string;
  targetAmount?: number;
  description?: string;
  envelopeType?: string;
  [key: string]: unknown;
}

// Interface for handling legacy bill properties during migration
interface LegacyBill extends Bill {
  paymentFrequency?: string;
  frequency?: string;
  amount?: number;
}

interface CreateEnvelopeResult {
  success: boolean;
  error?: string;
}

interface UpdateEnvelopeResult {
  success: boolean;
  error?: string;
}

interface DeleteEnvelopeResult {
  success: boolean;
  error?: string;
}

const useEnvelopeSystem = () => {
  // Enhanced TanStack Query integration
  const {
    envelopes = [],
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { bills = [], isLoading: billsLoading } = useBills();

  // Use proper hook for unassigned cash
  const { unassignedCash = 0, updateUnassignedCash: setUnassignedCashDb } = useUnassignedCash();

  const lastBillsRef = useRef<string | null>(null);
  const isCalculatingRef = useRef(false);

  // Calculate biweekly allocation needs from bills using utility function
  const updateBiweeklyAllocations = useCallback(() => {
    if (isCalculatingRef.current) {
      logger.debug("Skipping biweekly allocation update - calculation already in progress");
      return; // Prevent recursive calls
    }

    logger.debug("Starting biweekly allocation calculation", {
      billsCount: bills.length,
      bills: bills.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        frequency: b.frequency,
      })),
    });

    isCalculatingRef.current = true;

    // Use the utility function for calculation
    const totalBiweeklyNeed = calculateBiweeklyNeeds(bills as Bill[]);

    logger.info("Calculated total biweekly need", {
      totalBiweeklyNeed,
      billsProcessed: bills.length,
    });

    // Update envelopes with biweekly allocations
    const updatedEnvelopes = [...envelopes];
    let envelopesUpdated = 0;

    // Update each bill envelope's biweekly allocation
    bills.forEach((bill: Bill) => {
      if (bill.envelopeId) {
        const envelopeIndex = updatedEnvelopes.findIndex((env) => env.id === bill.envelopeId);
        if (envelopeIndex >= 0) {
          const envelope = updatedEnvelopes[envelopeIndex];
          if (!envelope.biweeklyAllocation || envelope.biweeklyAllocation === 0) {
            // Safe access for legacy/unified field mix
            const legacyBill = bill as LegacyBill;
            const frequency = (legacyBill.paymentFrequency ||
              legacyBill.frequency ||
              "monthly") as string;
            const amount = legacyBill.amount || bill.minimumPayment || 0;

            const multiplier = FREQUENCY_MULTIPLIERS[frequency] || 12;
            const annualAmount = amount * multiplier;
            const monthlyAmount = annualAmount / 12;
            const biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER;

            logger.debug("Updating envelope biweekly allocation", {
              billId: bill.id,
              billName: bill.name,
              envelopeId: bill.envelopeId,
              envelopeName: envelope.name,
              billAmount: bill.amount,
              frequency: bill.frequency,
              calculatedBiweekly: biweeklyAmount,
            });

            updatedEnvelopes[envelopeIndex] = {
              ...envelope,
              biweeklyAllocation: biweeklyAmount,
              envelopeType: "bill", // Ensure bill envelopes are typed correctly
            };
            envelopesUpdated++;
          }
        } else {
          logger.warn("Bill references non-existent envelope", {
            billId: bill.id,
            billName: bill.name,
            envelopeId: bill.envelopeId,
          });
        }
      }
    });

    logger.info("Envelope biweekly allocation update completed", {
      envelopesUpdated,
      totalEnvelopes: updatedEnvelopes.length,
    });

    isCalculatingRef.current = false;
  }, [bills, envelopes]);

  // Auto-update allocations when bills change
  useEffect(() => {
    if (bills.length > 0 && JSON.stringify(bills) !== lastBillsRef.current) {
      logger.debug("Bills changed, triggering biweekly allocation update", {
        previousBillsCount: lastBillsRef.current ? JSON.parse(lastBillsRef.current).length : 0,
        currentBillsCount: bills.length,
      });
      updateBiweeklyAllocations();
      lastBillsRef.current = JSON.stringify(bills);
    } else if (bills.length === 0 && lastBillsRef.current !== null) {
      logger.debug("All bills removed, clearing biweekly allocations");
      lastBillsRef.current = null;
    }
  }, [bills, updateBiweeklyAllocations]);

  // Envelope operations with TanStack integration
  const createEnvelope = useCallback(
    async (envelopeData: AddEnvelopeData): Promise<CreateEnvelopeResult> => {
      try {
        await addEnvelope(envelopeData);
        return { success: true };
      } catch (error) {
        logger.error("Failed to create envelope:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [addEnvelope]
  );

  const modifyEnvelope = useCallback(
    async (envelopeId: string, updates: Partial<Envelope>): Promise<UpdateEnvelopeResult> => {
      try {
        await updateEnvelope(envelopeId, updates);
        return { success: true };
      } catch (error) {
        logger.error("Failed to update envelope:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [updateEnvelope]
  );

  const removeEnvelope = useCallback(
    async (envelopeId: string, deleteBillsToo: boolean = false): Promise<DeleteEnvelopeResult> => {
      try {
        await deleteEnvelope({ envelopeId, deleteBillsToo });
        return { success: true };
      } catch (error) {
        logger.error("Failed to delete envelope:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [deleteEnvelope]
  );

  return {
    // Data
    envelopes,
    bills,
    unassignedCash,

    // Loading states
    isLoading: envelopesLoading || billsLoading,

    // Operations
    createEnvelope,
    updateEnvelope: modifyEnvelope,
    deleteEnvelope: removeEnvelope,
    updateBiweeklyAllocations,

    // Zustand operations (for legacy compatibility)
    setUnassignedCash: setUnassignedCashDb,
  };
};

export default useEnvelopeSystem;
