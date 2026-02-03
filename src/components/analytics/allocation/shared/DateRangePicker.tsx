/**
 * Date Range Picker Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Simple date range selector for filtering analytics data
 */

import React from "react";

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  className?: string;
}

/**
 * DateRangePicker Component
 *
 * Provides date range selection for analytics filtering
 *
 * @example
 * ```tsx
 * const [startDate, setStartDate] = useState("2024-01-01");
 * const [endDate, setEndDate] = useState("2024-12-31");
 *
 * return (
 *   <DateRangePicker
 *     startDate={startDate}
 *     endDate={endDate}
 *     onChange={(start, end) => {
 *       setStartDate(start);
 *       setEndDate(end);
 *     }}
 *   />
 * );
 * ```
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        aria-label="Start date"
      />
      <span className="text-gray-500 dark:text-gray-400">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        aria-label="End date"
      />
    </div>
  );
};

export default DateRangePicker;
