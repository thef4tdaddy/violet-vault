/**
 * DashboardShell Component
 *
 * Foundational dashboard container with Bento Grid layout.
 * Provides responsive grid structure from mobile to desktop.
 *
 * @layout Desktop (≥1024px): 3-column CSS Grid
 * @layout Tablet (768px-1023px): 2-column responsive grid
 * @layout Mobile (<768px): Single-column stacked layout
 */
import React from "react";

/**
 * Props for DashboardShell component
 */
interface DashboardShellProps {
  /** Logo/branding component or element */
  logo?: React.ReactNode;
  /** Profile section component or element */
  profile?: React.ReactNode;
  /** PaydayBanner component slot */
  paydayBanner?: React.ReactNode;
  /** Main dashboard content to be rendered in grid */
  children?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * DashboardShell - Main responsive container for dashboard using Bento Grid layout
 *
 * @example
 * ```tsx
 * <DashboardShell
 *   logo={<Logo />}
 *   profile={<UserProfile />}
 *   paydayBanner={<PaydayBanner />}
 * >
 *   <DashboardCard />
 *   <DashboardCard />
 * </DashboardShell>
 * ```
 */
export const DashboardShell: React.FC<DashboardShellProps> = ({
  logo,
  profile,
  paydayBanner,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white border-2 border-black rounded-lg p-4 md:p-6 ${className}`}
      data-testid="dashboard-shell"
    >
      {/* Top Row - Logo, Profile, PaydayBanner */}
      {(logo || profile || paydayBanner) && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          data-testid="dashboard-top-row"
        >
          {/* Logo Section */}
          {logo && (
            <div className="flex items-center" data-testid="dashboard-logo">
              {logo}
            </div>
          )}

          {/* Profile Section */}
          {profile && (
            <div
              className="flex items-center justify-center md:justify-end lg:justify-center"
              data-testid="dashboard-profile"
            >
              {profile}
            </div>
          )}

          {/* PaydayBanner Section */}
          {paydayBanner && (
            <div
              className="flex items-center justify-center md:col-span-2 lg:col-span-1 lg:justify-end"
              data-testid="dashboard-payday-banner"
            >
              {paydayBanner}
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid - Responsive Bento Grid */}
      {children && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          data-testid="dashboard-content-grid"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardShell;
