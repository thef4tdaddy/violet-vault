import React, { useId } from "react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Icon to display (left side) */
  icon?: React.ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * TextInput Component
 * Standardized text input with consistent styling
 *
 * Features:
 * - Label support
 * - Error states
 * - Helper text
 * - Optional icon
 * - Focus ring styling
 *
 * Usage:
 * <TextInput
 *   label="Email"
 *   placeholder="Enter email"
 *   error={emailError}
 *   helperText="We'll never share your email"
 * />
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, icon, className = "", id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
              icon ? "pl-10" : ""
            } ${
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
