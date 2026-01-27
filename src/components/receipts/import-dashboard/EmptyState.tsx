import React from "react";
import { getIcon } from "@/utils/ui/icons";
import { Button } from "@/components/ui";
import type { ImportMode } from "@/types/import-dashboard.types";

const Cloud = getIcon("Cloud");
const Upload = getIcon("Upload");
const RefreshCw = getIcon("RefreshCw");

interface EmptyStateProps {
  mode: ImportMode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

/**
 * Get mode-specific empty state content
 */
function getEmptyStateContent(mode: ImportMode): {
  icon: React.ElementType;
  title: string;
  description: string;
  defaultActionLabel: string;
} {
  switch (mode) {
    case "digital":
      return {
        icon: Cloud,
        title: "No Digital Receipts",
        description:
          "No pending receipts from connected apps. New receipts will appear here automatically.",
        defaultActionLabel: "Refresh",
      };
    case "scan":
      return {
        icon: Upload,
        title: "No Scanned Receipts",
        description: "Upload a receipt image to get started. Drag and drop or use the camera.",
        defaultActionLabel: "Scan Receipt",
      };
  }
}

/**
 * EmptyState - Display when no receipts are available in the selected mode
 * Uses Hard Line v2.1 aesthetic with clear call-to-action
 */
const EmptyState: React.FC<EmptyStateProps> = ({ mode, onAction, actionLabel, className = "" }) => {
  const content = getEmptyStateContent(mode);
  const Icon = content.icon;
  const displayActionLabel = actionLabel || content.defaultActionLabel;

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-16 px-8
        ${className}
      `}
      data-testid="empty-state"
      data-mode={mode}
    >
      {/* Icon container with border */}
      <div
        className="
          p-6 mb-6
          border-4 border-black rounded-2xl
          bg-purple-100
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        "
      >
        <Icon className="h-16 w-16 text-purple-600" strokeWidth={2.5} aria-hidden="true" />
      </div>

      {/* Title */}
      <h3
        className="
          font-mono font-black uppercase tracking-tight text-black
          text-2xl mb-3
        "
      >
        {content.title}
      </h3>

      {/* Description */}
      <p
        className="
          font-mono text-sm text-gray-700 text-center
          max-w-md mb-6
        "
      >
        {content.description}
      </p>

      {/* Action button (if provided) */}
      {onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          color="purple"
          className="
            flex items-center gap-2
            px-6 py-3
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            hover:shadow-none hover:translate-x-1 hover:translate-y-1
          "
          data-testid="empty-state-action"
        >
          {mode === "digital" ? (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{displayActionLabel}</span>
        </Button>
      )}

      {/* Secondary hint */}
      <div
        className="
          mt-8 px-4 py-2
          border-2 border-black rounded
          bg-white
          font-mono text-xs text-gray-600
        "
      >
        <span className="font-black">TIP:</span> Switch modes using the sidebar to view other
        receipt sources
      </div>
    </div>
  );
};

export default EmptyState;
