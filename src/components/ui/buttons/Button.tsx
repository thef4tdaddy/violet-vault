import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "icon"
  | "ghost"
  | "outline"
  | "default";
export type ButtonColor = "red" | "orange" | "purple" | "blue" | "green" | "gradient" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Color scheme */
  color?: ButtonColor;
  /** Button size */
  size?: ButtonSize;
  /** Icon element (typically from lucide-react via utils) */
  icon?: React.ReactNode;
  /** Show loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Floating/circular icon button */
  floating?: boolean;
  /** Custom className (merged with generated classes) */
  className?: string;
  /** Button content */
  children?: React.ReactNode;
}

/**
 * Versatile Button component supporting multiple variants
 *
 * Variants:
 * - primary: Main action button with color
 * - secondary: Cancel/alternative action (gray border)
 * - destructive: Delete/destructive action (red)
 * - icon: Icon-only button (square or circular)
 * - ghost: Transparent button with hover effect
 *
 * Usage:
 * <Button variant="primary" color="red" icon={DeleteIcon}>Delete</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 * <Button variant="destructive">Remove</Button>
 * <Button variant="icon" floating icon={PlusIcon} />
 * <Button variant="ghost">Close</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      color = "blue",
      size = "md",
      icon,
      loading = false,
      fullWidth = false,
      floating = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    // Color classes for primary variant
    const colorClasses = {
      red: "bg-red-500 hover:bg-red-600 text-white",
      orange: "bg-orange-500 hover:bg-orange-600 text-white",
      purple: "bg-purple-600 hover:bg-purple-700 text-white",
      blue: "bg-blue-500 hover:bg-blue-600 text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
      gradient:
        "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    };

    // Base classes
    const baseClasses =
      "font-semibold transition-all duration-200 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg";

    // Variant-specific classes
    const variantClasses = {
      primary: `${colorClasses[color]}`,
      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-black",
      destructive: "bg-red-600 hover:bg-red-700 text-white",
      icon: "p-3 bg-transparent hover:bg-gray-100 text-gray-700 border-0",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700 border-0",
      outline: "bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-300",
      default: "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300",
    };

    // Floating button styles (circular icon button)
    const floatingClasses = floating
      ? "rounded-full p-3 shadow-lg hover:shadow-xl fixed bottom-24 right-4 lg:bottom-4 z-50 border-0"
      : "";

    // Full width
    const widthClass = fullWidth ? "w-full" : "";

    // Build final className
    const finalClasses = [
      baseClasses,
      variantClasses[variant],
      !floating && sizeClasses[size],
      floatingClasses,
      widthClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} disabled={disabled || loading} className={finalClasses} {...props}>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
