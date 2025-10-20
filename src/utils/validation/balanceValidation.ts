import logger from "../common/logger";

/**
 * Validates balance value against type and limits
 */
export const validateBalance = (balance: unknown): boolean => {
  if (typeof balance !== "number" || isNaN(balance)) {
    logger.warn("Invalid balance value provided:", { value: balance });
    return false;
  }

  const MAX_BALANCE = 1000000;
  const MIN_BALANCE = -100000;

  if (balance > MAX_BALANCE || balance < MIN_BALANCE) {
    logger.warn("Balance outside reasonable limits:", {
      value: balance,
      limits: { max: MAX_BALANCE, min: MIN_BALANCE },
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
  // Allow empty string, numbers, decimal point, and negative sign
  const isValidFormat = inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue);

  if (!isValidFormat) {
    return { isValid: false, error: "Invalid number format" };
  }

  if (inputValue === "" || inputValue === "-" || inputValue === ".") {
    return { isValid: true, parsedValue: 0 };
  }

  const parsedValue = parseFloat(inputValue);

  if (isNaN(parsedValue)) {
    return { isValid: false, error: "Not a valid number" };
  }

  return { isValid: true, parsedValue };
};
