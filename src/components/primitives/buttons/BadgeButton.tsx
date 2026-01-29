import React from "react";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";

export interface BadgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The number or text to display inside the badge */
  count: number | string;
  /** Custom positioning classes (e.g., "-top-2 -right-2") */
  positionClass?: string;
  /** Whether to trigger haptic feedback on click */
  enableHaptics?: boolean;
}

/**
 * Standardized Badge Button primitive for the Hard Line v2.1 design system.
 * Used for notification counts, pending receipt markers, etc.
 */
export const BadgeButton = React.forwardRef<HTMLButtonElement, BadgeButtonProps>(
  (
    {
      count,
      positionClass = "-top-2 -right-2",
      enableHaptics = true,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableHaptics) {
        hapticFeedback(15, "medium");
      }
      if (onClick) {
        onClick(e);
      }
    };

    const displayCount = typeof count === "number" && count > 99 ? "99+" : count;

    if (!count || (typeof count === "number" && count <= 0)) {
      return null;
    }

    return (
      // eslint-disable-next-line enforce-ui-library/enforce-ui-library -- This is a primitive BadgeButton component
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={`
          absolute ${positionClass}
          flex items-center justify-center
          min-w-[18px] h-[18px] px-1
          bg-red-500 hover:bg-red-600
          text-white text-[10px] font-black
          rounded-full border-2 border-black
          shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
          cursor-pointer transition-all duration-200
          hover:scale-110 active:scale-95
          z-10 animate-in zoom-in-50
          ${className}
        `}
        {...props}
      >
        {displayCount}
      </button>
    );
  }
);

BadgeButton.displayName = "BadgeButton";
