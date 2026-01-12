import React from "react";
import { getIcon } from "@/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input has an error state */
  error?: boolean;
  /** Left icon name from lucide-react */
  leftIcon?: string;
  /** Right icon name from lucide-react */
  rightIcon?: string;
  /** Callback when right icon is clicked */
  onRightIconClick?: () => void;
}

/**
 * Input Component
 *
 * A styled input primitive with icon support and error states.
 * Designed to match the custom form CSS from styles.css.
 *
 * Features:
 * - Rounded corners with backdrop blur effect
 * - Purple focus ring
 * - Optional left and right icons
 * - Error state styling
 * - Disabled state
 *
 * Design Specs:
 * - Base: rounded-2xl, backdrop-blur, purple-500 focus
 * - Padding: px-4 py-3
 * - With icons: additional padding on respective sides
 * - Icons: 20px (h-5 w-5), clickable right icon
 *
 * Usage:
 * ```tsx
 * <Input
 *   type="password"
 *   leftIcon="Lock"
 *   rightIcon="Eye"
 *   onRightIconClick={togglePasswordVisibility}
 *   error={!!errors.password}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error = false,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Get icon components
    const LeftIconComponent = leftIcon ? getIcon(leftIcon) : null;
    const RightIconComponent = rightIcon ? getIcon(rightIcon) : null;

    // Determine padding based on icons
    const paddingLeft = leftIcon ? "pl-11" : "pl-4";
    const paddingRight = rightIcon ? "pr-11" : "pr-4";

    // Base styles matching custom CSS
    const baseStyles = `
      w-full ${paddingLeft} ${paddingRight} py-3 rounded-2xl
      bg-white/90 backdrop-blur-sm
      border border-slate-200
      text-base text-slate-900
      transition-all duration-200
      focus:outline-none
      disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
    `;

    // Focus and error state styles
    const focusStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-200"
      : "focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

    return (
      <div className="relative w-full">
        {/* Left Icon */}
        {LeftIconComponent && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {React.createElement(LeftIconComponent, {
              className: "h-5 w-5 text-slate-400",
            })}
          </div>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          disabled={disabled}
          className={`${baseStyles} ${focusStyles} ${className}`.trim()}
          {...props}
        />

        {/* Right Icon */}
        {RightIconComponent && (
          <div
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
              onRightIconClick ? "cursor-pointer hover:text-purple-600" : "pointer-events-none"
            }`}
            onClick={onRightIconClick}
            role={onRightIconClick ? "button" : undefined}
            tabIndex={onRightIconClick ? 0 : undefined}
            onKeyDown={
              onRightIconClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRightIconClick();
                    }
                  }
                : undefined
            }
          >
            {React.createElement(RightIconComponent, {
              className: "h-5 w-5 text-slate-400",
            })}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
