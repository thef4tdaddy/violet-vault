/**
 * Interactive Heatmap Calendar Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Calendar-style heatmap showing allocation intensity by date
 * Lazy-loaded only for Tier 2 (private-backend)
 */

import React, { useState, useMemo } from "react";
import { ResponsiveContainer } from "recharts";
import Button from "@/components/ui/buttons/Button";
import Select from "@/components/ui/forms/Select";
import type { HeatmapDataPoint } from "@/types/analyticsEnhanced";

export interface InteractiveHeatmapCalendarProps {
  data: HeatmapDataPoint[];
  onDateClick: (date: string) => void;
  className?: string;
}

/**
 * Generate calendar grid from heatmap data
 */
const generateCalendarGrid = (
  data: HeatmapDataPoint[],
  month: number,
  year: number
): Array<Array<HeatmapDataPoint | null>> => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Create data map for quick lookup
  const dataMap = new Map<string, HeatmapDataPoint>();
  data.forEach((point) => {
    dataMap.set(point.date, point);
  });

  // Generate grid (6 weeks x 7 days)
  const grid: Array<Array<HeatmapDataPoint | null>> = [];
  let currentDate = 1;
  let hasMoreDays = true;

  for (let week = 0; week < 6; week++) {
    const weekRow: Array<HeatmapDataPoint | null> = [];

    for (let day = 0; day < 7; day++) {
      if ((week === 0 && day < startDayOfWeek) || !hasMoreDays) {
        weekRow.push(null);
      } else if (currentDate <= daysInMonth) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(currentDate).padStart(2, "0")}`;
        weekRow.push(dataMap.get(dateStr) || { date: dateStr, intensity: 0, amount: 0, count: 0 });
        currentDate++;
      } else {
        hasMoreDays = false;
        weekRow.push(null);
      }
    }

    grid.push(weekRow);
  }

  return grid;
};

/**
 * Get color based on intensity
 */
const getIntensityColor = (intensity: number): string => {
  if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
  if (intensity < 25) return "bg-purple-200 dark:bg-purple-900";
  if (intensity < 50) return "bg-purple-400 dark:bg-purple-700";
  if (intensity < 75) return "bg-purple-600 dark:bg-purple-500";
  return "bg-purple-800 dark:bg-purple-300";
};

/**
 * InteractiveHeatmapCalendar Component
 *
 * Displays allocation data in a calendar heatmap format
 *
 * @example
 * ```tsx
 * <InteractiveHeatmapCalendar
 *   data={heatmapData}
 *   onDateClick={(date) => console.log('Clicked:', date)}
 * />
 * ```
 */
export const InteractiveHeatmapCalendar: React.FC<InteractiveHeatmapCalendarProps> = ({
  data,
  onDateClick,
  className = "",
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate calendar grid
  const calendarData = useMemo(() => {
    return generateCalendarGrid(data, selectedMonth, selectedYear);
  }, [data, selectedMonth, selectedYear]);

  // Month and year options
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Month/Year Selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Allocation Calendar</h3>
        <div className="flex gap-2">
          <Select
            value={selectedMonth}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedMonth(Number(e.target.value))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Select month"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </Select>
          <Select
            value={selectedYear}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedYear(Number(e.target.value))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Calendar Grid */}
      <ResponsiveContainer width="100%" height={400}>
        <div className="h-full flex flex-col justify-between">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayLabels.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="space-y-2 flex-1">
            {calendarData.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2">
                {week.map((cell, dayIndex) => {
                  if (!cell) {
                    return <div key={`empty-${dayIndex}`} className="aspect-square" />;
                  }

                  const day = new Date(cell.date).getDate();
                  const hasData = cell.count > 0;

                  return (
                    <Button
                      key={cell.date}
                      onClick={() => hasData && onDateClick(cell.date)}
                      className={`
                        aspect-square rounded-lg transition-all relative group
                        ${getIntensityColor(cell.intensity)}
                        ${hasData ? "hover:scale-110 hover:shadow-lg cursor-pointer" : "cursor-default"}
                        border border-gray-200 dark:border-gray-700
                      `}
                      title={
                        hasData
                          ? `${cell.date}: $${(cell.amount / 100).toFixed(2)} (${cell.count} allocation${cell.count > 1 ? "s" : ""})`
                          : cell.date
                      }
                    >
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {day}
                      </span>

                      {/* Tooltip on hover */}
                      {hasData && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                            <p className="font-bold">{cell.date}</p>
                            <p>${(cell.amount / 100).toFixed(2)}</p>
                            <p>
                              {cell.count} allocation{cell.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Less</span>
            {[0, 25, 50, 75, 100].map((intensity) => (
              <div
                key={intensity}
                className={`w-4 h-4 rounded ${getIntensityColor(intensity)}`}
                title={`${intensity}% intensity`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default InteractiveHeatmapCalendar;
