import React from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below select */
  helperText?: string;
  /** Select options */
  options?: SelectOption[];
  /** Placeholder option text */
  placeholder?: string;
  /** Custom className */
  className?: string;
}

/**
 * Select Component
 * Standardized select dropdown with consistent styling
 *
 * Features:
 * - Label support
 * - Error states
 * - Helper text
 * - Options array support
 * - Focus ring styling
 *
 * Usage:
 * <Select
 *   label="Category"
 *   options={[
 *     { value: 'food', label: 'Food' },
 *     { value: 'transport', label: 'Transport' }
 *   ]}
 *   placeholder="Select category"
 * />
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder,
      className = "",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
