/**
 * Date formatting utilities
 */

/**
 * Safely formats a date (Date object or string) to locale date string
 */
export const formatDate = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
};

/**
 * Formats a date with custom options
 */
export const formatDateWithOptions = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Formats a date to ISO date string (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split("T")[0];
};
