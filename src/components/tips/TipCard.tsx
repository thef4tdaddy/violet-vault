import React, { useCallback, useEffect } from "react";
import { getIcon } from "@/utils";
import type { TipConfig } from "@/domain/schemas/tip";
import useTipStore from "@/stores/ui/tipStore";

interface TipCardProps {
  tip: TipConfig;
  onDismiss?: () => void;
  onAction?: () => void;
  showDismissButton?: boolean;
  compact?: boolean;
}

/**
 * TipCard Component
 * Displays a single tip with optional dismiss and action buttons
 * Pure UI component that receives tip data as props
 */
const TipCard: React.FC<TipCardProps> = ({
  tip,
  onDismiss,
  onAction,
  showDismissButton = true,
  compact = false,
}) => {
  const { markTipViewed } = useTipStore();

  // Mark tip as viewed when mounted
  useEffect(() => {
    markTipViewed(tip.id);
  }, [tip.id, markTipViewed]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  const handleAction = useCallback(() => {
    if (onAction) {
      onAction();
    }
  }, [onAction]);

  const icon = tip.icon || "Info";
  const IconComponent = getIcon(icon);

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {React.createElement(IconComponent, {
            className: "h-4 w-4 text-blue-600",
          })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-900">{tip.content}</p>
        </div>
        {showDismissButton && tip.dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
            aria-label="Dismiss tip"
          >
            {React.createElement(getIcon("X"), {
              className: "h-4 w-4",
            })}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="bg-blue-100 rounded-lg p-2">
            {React.createElement(IconComponent, {
              className: "h-5 w-5 text-blue-600",
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {tip.title && <h4 className="text-sm font-semibold text-gray-900 mb-1">{tip.title}</h4>}
          <p className="text-sm text-gray-700 leading-relaxed">{tip.content}</p>
          {(tip.actionLabel || (showDismissButton && tip.dismissible)) && (
            <div className="flex items-center gap-2 mt-3">
              {tip.actionLabel && (
                <button
                  onClick={handleAction}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {tip.actionLabel} →
                </button>
              )}
              {showDismissButton && tip.dismissible && (
                <button
                  onClick={handleDismiss}
                  className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        {showDismissButton && tip.dismissible && !tip.actionLabel && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss tip"
          >
            {React.createElement(getIcon("X"), {
              className: "h-4 w-4",
            })}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(TipCard);
