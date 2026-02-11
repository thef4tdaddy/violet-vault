import React from "react";
import { getIcon } from "@/utils";

export interface CardProps {
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface CardHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Base Card Component with Compound Component Pattern
 *
 * Features:
 * - Multiple variants (default, elevated, outlined, glass)
 * - Configurable padding
 * - Compound components (Header, Body, Footer)
 * - Clickable support
 * - Black border design system
 *
 * Usage:
 * ```tsx
 * <Card variant="elevated" onClick={() => navigate('/profile')}>
 *   <Card.Header
 *     icon="User"
 *     title="User Profile"
 *     subtitle="Manage your account"
 *     actions={<Button size="sm">Edit</Button>}
 *   />
 *   <Card.Body>
 *     <p>Profile content here</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Save</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ variant = "default", padding = "md", children, className = "", onClick }) => {
  // Variant styling - all use 2px solid black border
  const variantClasses = {
    default: "bg-white border-2 border-black rounded-2xl",
    elevated: "bg-white border-2 border-black rounded-2xl shadow-lg",
    outlined: "bg-transparent border-2 border-black rounded-2xl",
    glass: "bg-white/90 backdrop-blur-xl border-2 border-black rounded-2xl",
  };

  // Padding variants
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Clickable styling
  const clickableClasses = onClick
    ? "cursor-pointer hover:shadow-xl transition-shadow duration-200"
    : "";

  const cardClasses =
    `${variantClasses[variant]} ${paddingClasses[padding]} ${clickableClasses} ${className}`.trim();

  if (onClick) {
    return (
      <div
        className={cardClasses}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }

  return <div className={cardClasses}>{children}</div>;
};

/**
 * Card Header Component
 * Displays icon, title, subtitle, and actions
 */
const CardHeader: React.FC<CardHeaderProps> = ({ icon, title, subtitle, actions }) => {
  const Icon = icon ? getIcon(icon) : null;

  return (
    <div className="border-b-2 border-black/10 pb-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex-shrink-0">
                {React.createElement(Icon, {
                  className: "h-5 w-5 text-gray-700",
                })}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
        {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

/**
 * Card Body Component
 * Scrollable content area
 */
const CardBody: React.FC<CardBodyProps> = ({ children, className = "" }) => {
  return <div className={`overflow-auto ${className}`.trim()}>{children}</div>;
};

/**
 * Card Footer Component
 * Actions or additional info at bottom
 */
const CardFooter: React.FC<CardFooterProps> = ({ children, className = "" }) => {
  return (
    <div className={`border-t-2 border-black/10 pt-4 mt-4 ${className}`.trim()}>{children}</div>
  );
};

// Attach compound components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
