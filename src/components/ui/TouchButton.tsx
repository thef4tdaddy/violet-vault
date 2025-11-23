import React from "react";
import {
  useTouchFeedback,
  type HapticFeedbackType,
  type TouchFeedbackType,
} from "@/utils/ui/touchFeedback";

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  hapticType?: HapticFeedbackType;
  touchType?: TouchFeedbackType;
}

/**
 * Enhanced button component wrapper with touch feedback
 */
export const TouchButton = ({
  children,
  onClick,
  hapticType = "tap",
  touchType = "primary",
  className = "",
  disabled = false,
  ...props
}: TouchButtonProps) => {
  const {
    onTouchStart,
    onClick: enhancedOnClick,
    className: touchClasses,
  } = useTouchFeedback(hapticType, touchType);

  const handleClick = enhancedOnClick(onClick);

  return (
    <button
      {...props}
      className={`${touchClasses} ${className}`.trim()}
      onClick={disabled ? undefined : handleClick}
      onTouchStart={disabled ? undefined : onTouchStart}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
