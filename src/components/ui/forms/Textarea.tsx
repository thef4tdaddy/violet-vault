import React, { useId } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below textarea */
  helperText?: string;
  /** Custom className */
  className?: string;
}

/**
 * Textarea Component
 * Standardized textarea with consistent styling
 *
 * Features:
 * - Label support
 * - Error states
 * - Helper text
 * - Configurable rows
 * - Non-resizable by default
 *
 * Usage:
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={4}
 * />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
