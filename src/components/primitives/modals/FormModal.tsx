import React from "react";
import BaseModal from "./BaseModal";

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  title: string;
  subtitle?: string;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * FormModal.Field - Form field wrapper component
 * Provides consistent styling for form fields
 */
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
}) => {
  const fieldId = React.useId();

  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // Preserve an existing id if the child already has one
    const existingId = (child.props as { id?: string }).id;

    return React.cloneElement(child, {
      id: existingId ?? fieldId,
    });
  });

  return (
    <div className="mb-4">
      <label
  const helperId = React.useId();
  const errorId = React.useId();

  const describedByIds: string[] = [];
  if (error) {
    describedByIds.push(errorId);
  } else if (helperText) {
    describedByIds.push(helperId);
  }

  let field = children;
  if (React.isValidElement(children)) {
    const existingDescribedBy = children.props["aria-describedby"] as string | undefined;
    const mergedDescribedBy = [existingDescribedBy, ...describedByIds].filter(Boolean).join(" ") || undefined;

    field = React.cloneElement(children, {
      "aria-describedby": mergedDescribedBy,
      "aria-invalid": error ? true : children.props["aria-invalid"],
    });
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {field}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * FormModal.Section - Section divider for grouping form fields
 */
interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>}
      {children}
    </div>
  );
};

/**
 * FormModal - Modal wrapper for form submission
 *
 * A specialized modal for forms with:
 * - Form wrapper with onSubmit handler
 * - Header with title and optional subtitle
 * - Footer with Cancel/Submit buttons
 * - Loading state support
 * - Compound component pattern for flexible layouts
 *
 * Composes BaseModal for consistent behavior.
 *
 * Part of Phase 1.1: Component Library Standardization
 * Issue #1526 - Modal Primitives
 *
 * @example
 * ```tsx
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSubmit}
 *   title="Add New Item"
 *   subtitle="Fill out the form below"
 *   submitLabel="Save"
 *   loading={isSubmitting}
 * >
 *   <FormModal.Field label="Name" required>
 *     <input type="text" name="name" />
 *   </FormModal.Field>
 *   <FormModal.Field label="Description">
 *     <textarea name="description" />
 *   </FormModal.Field>
 * </FormModal>
 * ```
 */
const FormModalComponent: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  loading = false,
  children,
  size = "md",
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    await onSubmit(e);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size={size} closeOnEscape={!loading}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>

        {/* Content - scrollable if needed */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
          {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border-2 border-black rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library */}
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </div>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

// Create the compound component with proper typing
interface FormModalWithCompounds extends React.FC<FormModalProps> {
  Field: typeof FormField;
  Section: typeof FormSection;
}

const FormModal = FormModalComponent as FormModalWithCompounds;
FormModal.Field = FormField;
FormModal.Section = FormSection;

export default FormModal;
