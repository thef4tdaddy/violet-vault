/**
 * Bill update utility functions
 * Extracted from useBillOperations.js to reduce complexity
 */
import logger from "../common/logger";

/**
 * Execute bill update with fallback to Zustand store
 */
export const executeBillUpdate = async (bill, updateFunctions) => {
  const { updateBill, onUpdateBill, budget } = updateFunctions;

  if (onUpdateBill) {
    await onUpdateBill(bill);
    return;
  }

  // Use TanStack mutation with Zustand fallback
  try {
    await updateBill({
      id: bill.id,
      updates: bill,
    });
  } catch (error) {
    logger.warn("TanStack updateBill failed, using Zustand fallback", error);
    budget?.updateBill(bill);
  }
};

/**
 * Process bulk operation with error tracking
 */
export const processBulkOperation = async (
  items,
  operationName,
  operationFn,
) => {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const item of items) {
    try {
      await operationFn(item);
      successCount++;
    } catch (error) {
      errorCount++;
      const itemName = item.provider || item.description || `Item ${item.id}`;
      errors.push(`${itemName}: ${error.message}`);
      logger.error(`Failed ${operationName}`, error, {
        itemId: item.id,
      });
    }
  }

  return {
    success: successCount > 0,
    successCount,
    errorCount,
    errors,
    message:
      errorCount > 0
        ? `${successCount} items processed successfully, ${errorCount} failed:\n${errors.join("\n")}`
        : `Successfully processed ${successCount} items`,
  };
};
