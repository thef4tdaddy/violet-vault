import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Whether the select has an error state */
  error?: boolean;
}

/**
 * Select Component
 *
 * A styled select primitive matching the custom form CSS.
 * Designed to work with FormField wrapper.
 *
 * NOTE: This is a primitive component using native <select> element
 * as a lower-level building block, different from @/components/ui/Select.
 *
 * Features:
 * - Rounded corners with backdrop blur effect
 * - Purple focus ring
 * - Error state styling
 * - Disabled state
 *
 * Design Specs:
 * - Base: rounded-2xl, backdrop-blur, purple-500 focus
 * - Padding: px-4 py-3
 * - Same styling as Input component
 *
 * Usage:
 * ```tsx
 * <FormField label="Category" error={errors.category}>
 *   <Select error={!!errors.category}>
 *     <option value="">Select...</option>
 *     <option value="food">Food</option>
 *   </Select>
 * </FormField>
 * ```
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className = "", disabled = false, children, ...props }, ref) => {
    // Base styles matching custom CSS
    const baseStyles = `
      w-full px-4 py-3 rounded-2xl
      bg-white/90 backdrop-blur-sm
      border border-slate-200
      text-base text-slate-900
      transition-all duration-200
      focus:outline-none
      disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
      appearance-none
    `;

    // Focus and error state styles
    const focusStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-200"
      : "focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

    return (
      /* eslint-disable-next-line enforce-ui-library/enforce-ui-library */
      <select
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${focusStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
