/**
 * Utility functions for user color management
 * Extracted from JoinBudgetModal to reduce complexity
 */

const USER_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
];

export const generateRandomColor = (): string => {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};

export const getUserColors = (): string[] => USER_COLORS;
