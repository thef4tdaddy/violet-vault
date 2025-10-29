import { z } from "zod";
import logger from "../common/logger";

/**
 * Constants for balance validation
 */
const MAX_BALANCE = 1000000;
const MIN_BALANCE = -100000;

/**
 * Zod schema for balance validation
 */
export const BalanceSchema = z
  .number({
    invalid_type_error: "Balance must be a number",
    required_error: "Balance is required",
  })
  .finite("Balance must be a finite number")
  .min(MIN_BALANCE, `Balance cannot be less than ${MIN_BALANCE}`)
  .max(MAX_BALANCE, `Balance cannot exceed ${MAX_BALANCE}`);

/**
 * Zod schema for balance input string validation
 */
export const BalanceInputSchema = z
  .string()
  .regex(/^-?\d*\.?\d*$/, "Invalid number format")
  .transform((val) => {
    if (val === "" || val === "-" || val === ".") {
      return 0;
    }
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  });

/**
 * Validates balance value against type and limits
 */
export const validateBalance = (balance: unknown): boolean => {
  const result = BalanceSchema.safeParse(balance);

  if (!result.success) {
    logger.warn("Invalid balance value provided:", {
      value: balance,
      errors: result.error.errors,
    });
    return false;
  }

  return true;
};

/**
 * Validates balance input from user (string format)
 */
export const validateBalanceInput = (
  inputValue: string
): { isValid: boolean; error?: string; parsedValue?: number } => {
  // Handle empty values first
  if (inputValue === "" || inputValue === "-" || inputValue === ".") {
    return { isValid: true, parsedValue: 0 };
  }

  const result = BalanceInputSchema.safeParse(inputValue);

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || "Invalid number format",
    };
  }

  return { isValid: true, parsedValue: result.data };
};
