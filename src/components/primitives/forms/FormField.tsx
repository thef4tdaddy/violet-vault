import React from "react";
import { getIcon } from "@/utils";

export interface FormFieldProps {
  /** Label text for the field */
  label: string;
  /** Error message to display */
  error?: string;
  /** Hint text to display below label */
  hint?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Form field input element */
  children: React.ReactNode;
  /** HTML for attribute to associate label with input */
  htmlFor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormField Component
 *
 * A form field wrapper that provides consistent layout with label, hint, error display.
 * Designed to work with Input, Select, and Textarea primitives.
 *
 * Features:
 * - Label with optional required indicator
 * - Hint text below label
 * - Error message with icon
 * - Consistent spacing and styling
 *
 * Layout:
 * ```
 * Label (required indicator)
 * Hint text (if provided)
 * {children} (input/select/textarea)
 * Error message (if provided)
 * ```
 *
 * Usage:
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   required
 *   hint="We'll never share your email"
 *   error={errors.email}
 * >
 *   <Input type="email" value={email} onChange={setEmail} />
 * </FormField>
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  children,
  htmlFor,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Label with required indicator */}
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hint text */}
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}

      {/* Form input element */}
      {children}

      {/* Error message with icon */}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          {React.createElement(getIcon("AlertCircle"), {
            className: "h-3 w-3",
          })}
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
