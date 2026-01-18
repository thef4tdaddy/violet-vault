/**
 * Utility functions for date range calculations in analytics
 */

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface CustomDateRange {
  start: string | Date;
  end: string | Date;
}

interface DateRangeOptions {
  period?: string;
  customDateRange?: CustomDateRange;
}

/**
 * Get date range based on period type
 */
export const getDateRange = (
  options: DateRangeOptions = {}
): { startDate: Date; endDate: Date } => {
  const { period = "thisMonth", customDateRange } = options;
  const today = new Date();
  let startDate: Date, endDate: Date;

  switch (period) {
    case "thisWeek":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisMonth":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "lastMonth":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisYear":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "allTime":
      startDate = new Date(2018, 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      if (customDateRange) {
        startDate = new Date(customDateRange.start);
        endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Default to this month if no custom range provided
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

/**
 * Check if a date falls within a date range
 */
export const isDateInRange = (date: Date | string, range: DateRange): boolean => {
  const checkDate = new Date(date);
  return checkDate >= range.startDate && checkDate <= range.endDate;
};

/**
 * Get number of days between two dates
 */
export const getDaysBetween = (start: Date, end: Date): number => {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};
