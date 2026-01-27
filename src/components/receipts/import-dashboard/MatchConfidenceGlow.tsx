import React from "react";

export type ConfidenceLevel = "high" | "medium" | "low" | "none";

interface MatchConfidenceGlowProps {
  /**
   * Confidence score (0-1 scale)
   */
  confidence?: number;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";

  /**
   * Display as a badge with text
   */
  showBadge?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Convert numeric confidence to level
 */
export function getConfidenceLevel(confidence?: number): ConfidenceLevel {
  if (!confidence || confidence < 0.6) return "none";
  if (confidence < 0.8) return "medium";
  return "high";
}

/**
 * Get confidence color classes
 */
function getConfidenceStyles(level: ConfidenceLevel): {
  border: string;
  bg: string;
  text: string;
  glow: string;
  label: string;
} {
  switch (level) {
    case "high":
      return {
        border: "border-green-500",
        bg: "bg-green-100",
        text: "text-green-700",
        glow: "shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        label: "HIGH",
      };
    case "medium":
      return {
        border: "border-yellow-500",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        glow: "shadow-[0_0_8px_rgba(234,179,8,0.5)]",
        label: "MEDIUM",
      };
    case "low":
    case "none":
      return {
        border: "border-gray-300",
        bg: "bg-gray-100",
        text: "text-gray-700",
        glow: "",
        label: "LOW",
      };
  }
}

/**
 * Get size classes
 */
function getSizeClasses(size: "sm" | "md" | "lg"): {
  container: string;
  text: string;
} {
  switch (size) {
    case "sm":
      return {
        container: "w-3 h-3",
        text: "text-xs px-2 py-0.5",
      };
    case "md":
      return {
        container: "w-4 h-4",
        text: "text-sm px-2 py-1",
      };
    case "lg":
      return {
        container: "w-6 h-6",
        text: "text-base px-3 py-1.5",
      };
  }
}

/**
 * MatchConfidenceGlow - Visual indicator for match confidence levels
 * Can be displayed as a glowing dot or a badge with text
 */
const MatchConfidenceGlow: React.FC<MatchConfidenceGlowProps> = ({
  confidence,
  size = "md",
  showBadge = false,
  className = "",
}) => {
  const level = getConfidenceLevel(confidence);
  const styles = getConfidenceStyles(level);
  const sizeClasses = getSizeClasses(size);

  // Don't render anything for "none" level unless it's a badge
  if (level === "none" && !showBadge) {
    return null;
  }

  const percentage = confidence ? Math.round(confidence * 100) : 0;

  if (showBadge) {
    return (
      <span
        className={`
          inline-flex items-center gap-2
          border ${styles.border} ${styles.bg} ${styles.text}
          rounded font-mono font-black uppercase tracking-wide
          ${sizeClasses.text}
          ${styles.glow}
          ${className}
        `}
        data-testid="confidence-badge"
        data-confidence-level={level}
        aria-label={`Match confidence: ${percentage}% (${level})`}
      >
        <span
          className={`
            ${sizeClasses.container} rounded-full
            ${styles.bg} ${styles.border}
            ${styles.glow}
          `}
          aria-hidden="true"
        />
        <span>{percentage}%</span>
      </span>
    );
  }

  // Just the glowing indicator dot
  return (
    <span
      className={`
        inline-block rounded-full
        ${sizeClasses.container}
        ${styles.border} ${styles.bg}
        ${styles.glow}
        ${className}
      `}
      data-testid="confidence-indicator"
      data-confidence-level={level}
      aria-label={`Match confidence: ${percentage}% (${level})`}
      role="status"
    />
  );
};

export default MatchConfidenceGlow;
