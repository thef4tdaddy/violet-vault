/**
 * Date validation utilities
 */

/**
 * Check if a date is valid
 */
export const isValidDate = (dateString: unknown): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString as string);
  return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1900;
};
