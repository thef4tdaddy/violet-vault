import React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below checkbox */
  helperText?: string;
  /** Custom className */
  className?: string;
}

/**
 * Checkbox Component
 * Standardized checkbox with consistent styling
 *
 * Features:
 * - Label support
 * - Error states
 * - Helper text
 * - Custom styling
 *
 * Usage:
 * <Checkbox
 *   label="I agree to the terms"
 * />
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, helperText, className = "", id, disabled, ...props },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className={`w-4 h-4 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-1 ml-6">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1 ml-6">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
