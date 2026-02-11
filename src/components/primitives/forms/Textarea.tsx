import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether the textarea has an error state */
  error?: boolean;
}

/**
 * Textarea Component
 *
 * A styled textarea primitive matching the custom form CSS.
 * Designed to work with FormField wrapper.
 *
 * Features:
 * - Rounded corners with backdrop blur effect
 * - Purple focus ring
 * - Error state styling
 * - Disabled state
 * - Resizable
 *
 * Design Specs:
 * - Base: rounded-2xl, backdrop-blur, purple-500 focus
 * - Padding: px-4 py-3
 * - Same styling as Input component
 *
 * Usage:
 * ```tsx
 * <FormField label="Notes" error={errors.notes}>
 *   <Textarea
 *     rows={4}
 *     placeholder="Enter notes..."
 *     error={!!errors.notes}
 *   />
 * </FormField>
 * ```
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className = "", disabled = false, ...props }, ref) => {
    // Base styles matching custom CSS
    const baseStyles = `
      w-full px-4 py-3 rounded-2xl
      bg-white/90 backdrop-blur-sm
      border border-slate-200
      text-base text-slate-900
      transition-all duration-200
      focus:outline-none
      disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
      resize-y
    `;

    // Focus and error state styles
    const focusStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-200"
      : "focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${focusStyles} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
