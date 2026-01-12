import React from "react";
import { Link } from "react-router-dom";
import { getIcon } from "@/utils/icons";

export interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Icon name from lucide-react */
  icon?: string;
  /** Breadcrumb navigation items */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Action buttons or controls */
  actions?: React.ReactNode;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * PageHeader - Reusable page-level header component
 *
 * Features:
 * - Icon + Title/Subtitle on left
 * - Actions on right
 * - Optional breadcrumbs
 * - Responsive layout (stacks on mobile)
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Bill Manager"
 *   subtitle="Manage your scheduled expenses"
 *   icon="Receipt"
 *   breadcrumbs={[
 *     { label: "Home", href: "/" },
 *     { label: "Bills" }
 *   ]}
 *   actions={<Button icon="Plus">Add Bill</Button>}
 * />
 * ```
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions,
  className = "",
}) => {
  const IconComponent = icon ? getIcon(icon) : null;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}
    >
      {/* Left side: Icon + Title + Subtitle */}
      <div className="flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex items-center gap-2 text-sm text-slate-600 mb-3"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const key = `${crumb.href ?? "nohref"}-${crumb.label}`;
              return (
                <React.Fragment key={key}>
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-slate-900 transition-colors"
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className="text-slate-900 font-medium"
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <span className="text-slate-400">
                      {React.createElement(getIcon("ChevronRight"), {
                        className: "h-4 w-4",
                      })}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {IconComponent && (
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-purple-500 p-3 rounded-2xl">
                {React.createElement(IconComponent, {
                  className: "h-8 w-8 text-white",
                })}
              </div>
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;
