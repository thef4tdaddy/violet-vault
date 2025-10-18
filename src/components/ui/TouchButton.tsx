import React from "react";
import { useTouchFeedback } from "../../utils/ui/touchFeedback";

/**
 * Enhanced button component wrapper with touch feedback
 * @param {Object} props - Props including onClick, children, hapticType, touchType, className
 * @returns {JSX.Element} Enhanced button with touch feedback
 */
export const TouchButton = ({
  children,
  onClick,
  hapticType = "tap",
  touchType = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
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

export default TouchButton;
