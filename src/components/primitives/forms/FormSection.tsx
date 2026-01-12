import React, { useState } from "react";
import { getIcon } from "@/utils";

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Whether the section can be collapsed */
  collapsible?: boolean;
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
  /** Form fields content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormSection Component
 *
 * A collapsible form section container with title and subtitle.
 * Groups related form fields with consistent spacing.
 *
 * Features:
 * - Title and subtitle display
 * - Optional collapsible functionality
 * - Smooth height animation
 * - Chevron icon rotation
 * - Consistent spacing between fields
 *
 * Layout:
 * ```
 * ┌─────────────────────────────┐
 * │ Title          [Collapse ▼] │
 * │ Subtitle                    │
 * ├─────────────────────────────┤
 * │ {children}                  │
 * └─────────────────────────────┘
 * ```
 *
 * Usage:
 * ```tsx
 * <FormSection
 *   title="Basic Information"
 *   subtitle="Enter the core details"
 *   collapsible
 *   defaultExpanded
 * >
 *   <FormField label="Name">
 *     <Input />
 *   </FormField>
 *   <FormField label="Email">
 *     <Input type="email" />
 *   </FormField>
 * </FormSection>
 * ```
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  collapsible = false,
  defaultExpanded = true,
  children,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header with title, subtitle, and collapse button */}
      <div className="mb-4">
        <div
          className={`flex items-center justify-between ${collapsible ? "cursor-pointer" : ""}`}
          onClick={toggleExpanded}
          role={collapsible ? "button" : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={
            collapsible
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpanded();
                  }
                }
              : undefined
          }
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
          {collapsible &&
            React.createElement(getIcon("ChevronDown"), {
              className: `h-5 w-5 text-slate-400 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`,
            })}
        </div>
        <div className="border-t-2 border-slate-100 mt-4" />
      </div>

      {/* Content area with animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default FormSection;
