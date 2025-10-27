import React, { useId } from "react";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below radio */
  helperText?: string;
  /** Custom className */
  className?: string;
  /** Description text (for grid layout use) */
  description?: string;
}

/**
 * Radio Component
 * Standardized radio button with consistent styling
 *
 * Features:
 * - Label support
 * - Error states
 * - Helper text
 * - Description support for grouped layouts
 * - Custom styling
 *
 * Usage:
 * <Radio
 *   name="option"
 *   value="option1"
 *   label="Option 1"
 * />
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, helperText, description, className = "", id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || `radio-${generatedId}`;

    // If description is provided, use grid layout (for RadioGroup with descriptions)
    if (description) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              disabled={disabled}
              className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-0.5 justify-self-start ${className}`}
              {...props}
            />
            <div>
              {label && (
                <label
                  htmlFor={radioId}
                  className="text-sm font-medium text-gray-700 cursor-pointer block"
                >
                  {label}
                </label>
              )}
              {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-1 ml-7">{error}</p>}
          {helperText && !error && <p className="text-sm text-gray-500 mt-1 ml-7">{helperText}</p>}
        </div>
      );
    }

    // Standard inline layout
    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={radioId}
              className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
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

Radio.displayName = "Radio";

export default Radio;
