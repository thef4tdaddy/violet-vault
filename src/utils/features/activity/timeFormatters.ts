/**
 * Time formatting utilities
 * Extracted from ActivityFeed.jsx for better maintainability and ESLint compliance
 */

/**
 * Format timestamp to relative time string
 */
export const formatTimestamp = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 1000 * 60) {
    return "Just now";
  } else if (diffMs < 1000 * 60 * 60) {
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `${minutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};
