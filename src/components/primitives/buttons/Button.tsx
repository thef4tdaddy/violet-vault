import React from "react";
import { getIcon } from "@/utils/ui/icons";
// eslint-disable-next-line no-direct-icon-imports/no-direct-icon-imports -- Loader2 is for loading state only
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "link";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /**
   * Icon name from the icon registry.
   *
   * Note: If an invalid or unknown icon name is provided, {@link getIcon}
   * will fall back to a default icon (e.g. FileText) without throwing.
   */
  icon?: string;
  /** Icon position relative to text */
  iconPosition?: "left" | "right";
  /** Show loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children?: React.ReactNode;
}

// Variant-specific styles
const variantClasses = {
  primary:
    "bg-gradient-to-br from-purple-500 to-purple-600 text-white border-2 border-black hover:-translate-y-0.5 hover:shadow-lg focus:ring-purple-200",
  secondary:
    "bg-slate-100 text-black border-2 border-black hover:bg-slate-200 hover:-translate-y-0.5 focus:ring-slate-200",
  success:
    "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-2 border-black hover:-translate-y-0.5 hover:shadow-lg focus:ring-emerald-200",
  danger:
    "bg-gradient-to-br from-red-500 to-red-600 text-white border-2 border-black hover:-translate-y-0.5 hover:shadow-lg focus:ring-red-200",
  ghost:
    "bg-transparent text-black border-2 border-transparent hover:bg-slate-100 focus:ring-slate-200",
  link: "bg-transparent text-purple-600 border-none hover:text-purple-700 hover:underline focus:ring-purple-200",
};

// Size-specific styles
const sizeClasses = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
};

// Icon sizes based on button size (using Tailwind classes)
const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

// Helper to build class names
const buildButtonClasses = (
  variant: ButtonProps["variant"] = "primary",
  size: ButtonProps["size"] = "md",
  fullWidth: boolean,
  hasIconAndChildren: boolean,
  customClassName: string
): string => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4";
  const widthClass = fullWidth ? "w-full" : "";
  const gapClass = hasIconAndChildren ? "gap-2" : "";

  return [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    gapClass,
    customClassName,
  ]
    .filter(Boolean)
    .join(" ");
};

// Helper to render an icon
const renderIconElement = (iconName: string | undefined, className: string) => {
  if (!iconName) return null;
  type IconProps = {
    className?: string;
    title?: string;
    "aria-hidden"?: string;
  };
  const IconComponent = getIcon(iconName) as React.ComponentType<IconProps>;
  return React.createElement(IconComponent, {
    className,
    "aria-hidden": "true",
  });
};

// Helper to build button attributes with accessibility
const buildButtonAttrs = (
  loading: boolean,
  disabled: boolean | undefined,
  finalClasses: string,
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) => ({
  type: "button" as const,
  disabled: disabled || loading,
  className: finalClasses,
  "aria-busy": loading,
  "aria-live": loading ? ("polite" as const) : undefined,
  ...props,
});

/**
 * Reusable Button Primitive Component
 *
 * A flexible button component with multiple variants, sizes, and icon support.
 * Uses Tailwind CSS for styling with neobrutalism design (black borders, gradients, shadows).
 *
 * @example
 * ```tsx
 * <Button variant="primary" icon="Plus" onClick={handleAdd}>
 *   Add Item
 * </Button>
 *
 * <Button variant="danger" size="sm" loading={isDeleting}>
 *   Delete
 * </Button>
 *
 * <Button variant="ghost" icon="Settings" iconPosition="right">
 *   Settings
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const finalClasses = buildButtonClasses(
      variant,
      size,
      fullWidth,
      Boolean(icon && children),
      className
    );

    const iconClassName = iconSizeClasses[size];
    const buttonAttrs = buildButtonAttrs(loading, disabled, finalClasses, props);

    return (
      // eslint-disable-next-line enforce-ui-library/enforce-ui-library -- This IS the primitive Button component
      <button ref={ref} {...buttonAttrs}>
        {loading && <Loader2 className={`animate-spin ${iconClassName}`} aria-hidden="true" />}
        {!loading && iconPosition === "left" && renderIconElement(icon, iconClassName)}
        {!loading && children}
        {!loading && iconPosition === "right" && renderIconElement(icon, iconClassName)}
      </button>
    );
  }
);

Button.displayName = "Button";
