import React from "react";

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional count badge */
  count?: number;
  /** Action buttons or controls */
  actions?: React.ReactNode;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * SectionHeader - Reusable section-level header component
 *
 * Features:
 * - Title + optional count badge on left
 * - Actions on right
 * - Bottom border divider
 * - Compact, consistent styling
 *
 * Usage:
 * ```tsx
 * <SectionHeader
 *   title="Upcoming Bills"
 *   count={5}
 *   actions={<Button size="sm" variant="ghost">View All</Button>}
 * />
 * ```
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, actions, className = "" }) => {
  return (
    <div
      className={`flex items-center justify-between border-b-2 border-slate-100 pb-3 mb-4 ${className}`}
    >
      {/* Left side: Title + Count */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {count !== undefined && count !== null && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
            {count}
          </span>
        )}
      </div>

      {/* Right side: Actions */}
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
