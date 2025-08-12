import { useState, useCallback } from "react";
import logger from "../utils/logger";

/**
 * Custom hook for bill management operations
 * Handles bulk updates, payments, and bill modifications
 */
export const useBillOperations = ({
  bills = [],
  envelopes = [],
  updateBill,
  onUpdateBill,
  onError,
  budget,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle bulk bill updates (amounts, due dates, or both)
   */
  const handleBulkUpdate = useCallback(
    async (updatedBills) => {
      setIsProcessing(true);

      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const updatedBill of updatedBills) {
          try {
            logger.debug("Updating bill", {
              billId: updatedBill.id,
              provider: updatedBill.provider,
            });

            if (onUpdateBill) {
              await onUpdateBill(updatedBill);
            } else {
              // Use TanStack mutation with Zustand fallback
              try {
                await updateBill({
                  id: updatedBill.id,
                  updates: updatedBill,
                });
              } catch (error) {
                logger.warn("TanStack updateBill failed, using Zustand fallback", error);
                budget?.updateBill(updatedBill);
              }
            }
            successCount++;
          } catch (error) {
            errorCount++;
            const billName =
              updatedBill.provider || updatedBill.description || `Bill ${updatedBill.id}`;
            errors.push(`${billName}: ${error.message}`);
            logger.error("Failed to update bill", error, { billId: updatedBill.id });
          }
        }

        const result = {
          success: successCount > 0,
          successCount,
          errorCount,
          errors,
          message:
            errorCount > 0
              ? `${successCount} bills updated successfully, ${errorCount} failed:\n${errors.join("\n")}`
              : `Successfully updated ${successCount} bills`,
        };

        if (errorCount > 0) {
          onError?.(result.message);
        } else {
          logger.info(`Bulk update completed`, { successCount });
        }

        return result;
      } catch (error) {
        logger.error("Error in bulk update operation", error);
        const errorMessage = error.message || "Failed to update bills";
        onError?.(errorMessage);

        return {
          success: false,
          successCount: 0,
          errorCount: updatedBills.length,
          errors: [errorMessage],
          message: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [updateBill, onUpdateBill, onError, budget]
  );

  /**
   * Handle individual bill payment with envelope balance checking
   */
  const handlePayBill = useCallback(
    async (billId) => {
      setIsProcessing(true);

      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) {
          throw new Error("Bill not found");
        }

        if (bill.isPaid) {
          throw new Error("Bill is already paid");
        }

        // Validate envelope balance if bill is assigned to an envelope
        if (bill.envelopeId) {
          const envelope = envelopes.find((env) => env.id === bill.envelopeId);
          if (!envelope) {
            throw new Error("Assigned envelope not found");
          }

          const availableBalance = envelope.currentBalance || 0;
          const billAmount = Math.abs(bill.amount);

          if (availableBalance < billAmount) {
            throw new Error(
              `Insufficient funds in envelope "${envelope.name}". Available: $${availableBalance.toFixed(2)}, Required: $${billAmount.toFixed(2)}`
            );
          }
        } else {
          const unassignedCash = budget?.unassignedCash || 0;
          const billAmount = Math.abs(bill.amount);

          if (unassignedCash < billAmount) {
            throw new Error(
              `Insufficient unassigned cash. Available: $${unassignedCash.toFixed(2)}, Required: $${billAmount.toFixed(2)}`
            );
          }
        }

        const updatedBill = {
          ...bill,
          isPaid: true,
          paidDate: new Date().toISOString().split("T")[0],
          lastModified: new Date().toISOString(),
          modificationHistory: [
            ...(bill.modificationHistory || []),
            {
              timestamp: new Date().toISOString(),
              type: "payment",
              changes: {
                isPaid: { from: false, to: true },
                paidDate: { from: null, to: new Date().toISOString().split("T")[0] },
              },
            },
          ],
        };

        // Update the bill
        if (onUpdateBill) {
          await onUpdateBill(updatedBill);
        } else {
          try {
            await updateBill({
              id: updatedBill.id,
              updates: updatedBill,
            });
          } catch (error) {
            logger.warn("TanStack updateBill failed, using Zustand fallback", error);
            budget?.updateBill(updatedBill);
          }
        }

        logger.info("Bill payment completed", {
          billId: bill.id,
          amount: bill.amount,
          envelopeId: bill.envelopeId,
        });

        return { success: true, updatedBill };
      } catch (error) {
        logger.error("Error paying bill", error, { billId });
        const errorMessage = error.message || "Failed to pay bill";
        onError?.(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [bills, envelopes, budget, updateBill, onUpdateBill, onError]
  );

  /**
   * Handle bulk bill payments
   */
  const handleBulkPayment = useCallback(
    async (billIds) => {
      setIsProcessing(true);

      try {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const billId of billIds) {
          try {
            const result = await handlePayBill(billId);
            if (result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`Bill ${billId}: ${result.error}`);
            }
          } catch (error) {
            errorCount++;
            errors.push(`Bill ${billId}: ${error.message}`);
          }
        }

        const result = {
          success: successCount > 0,
          successCount,
          errorCount,
          errors,
          message:
            errorCount > 0
              ? `${successCount} bills paid successfully, ${errorCount} failed:\n${errors.join("\n")}`
              : `Successfully paid ${successCount} bills`,
        };

        if (errorCount > 0) {
          onError?.(result.message);
        } else {
          logger.info(`Bulk payment completed`, { successCount });
        }

        return result;
      } catch (error) {
        logger.error("Error in bulk payment operation", error);
        const errorMessage = error.message || "Failed to pay selected bills";
        onError?.(errorMessage);

        return {
          success: false,
          successCount: 0,
          errorCount: billIds.length,
          errors: [errorMessage],
          message: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [handlePayBill, onError]
  );

  /**
   * Validate bill data before operations
   */
  const validateBillData = useCallback(
    (bill) => {
      const errors = [];

      if (!bill.id) {
        errors.push("Bill ID is required");
      }

      if (!bill.amount || bill.amount <= 0) {
        errors.push("Bill amount must be greater than 0");
      }

      if (bill.dueDate && isNaN(new Date(bill.dueDate).getTime())) {
        errors.push("Invalid due date format");
      }

      if (bill.envelopeId && !envelopes.find((env) => env.id === bill.envelopeId)) {
        errors.push("Assigned envelope does not exist");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [envelopes]
  );

  /**
   * Generate bill modification history entry
   */
  const createModificationHistory = useCallback(
    (type, changes) => ({
      timestamp: new Date().toISOString(),
      type,
      changes,
    }),
    []
  );

  return {
    // Operations
    handleBulkUpdate,
    handlePayBill,
    handleBulkPayment,

    // Validation
    validateBillData,
    createModificationHistory,

    // State
    isProcessing,
  };
};

export default useBillOperations;
