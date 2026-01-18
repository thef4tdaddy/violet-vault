import React, { useId } from "react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below checkbox */
  helperText?: string;
  /** Custom className */
  className?: string;
  /** onChange handler (standard HTML input event) */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** onCheckedChange handler (boolean value) */
  onCheckedChange?: (checked: boolean) => void;
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
    { label, error, helperText, className = "", id, disabled, onChange, onCheckedChange, ...props },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Call standard onChange if provided
      if (onChange) {
        onChange(event);
      }
      // Call onCheckedChange with boolean value if provided
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <div className="w-full">
        <div className="flex items-start">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            onChange={handleChange}
            className={`h-4 w-4 rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-400 focus:ring focus:ring-offset-0 focus:ring-purple-500 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-3 text-sm font-medium text-gray-700 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-1 ml-6">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500 mt-1 ml-6">{helperText}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
