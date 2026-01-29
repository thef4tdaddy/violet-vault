import React from "react";
import { Link } from "react-router-dom";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";
import { BadgeButton } from "@/components/primitives/buttons/BadgeButton";

/**
 * Props for BottomNavItem component
 */
interface BottomNavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  badgeCount?: number;
  onBadgeClick?: (e: React.MouseEvent) => void;
}

/**
 * Individual navigation item for bottom navigation bar
 * Touch-optimized with haptic feedback and smooth animations
 */
const BottomNavItem: React.FC<BottomNavItemProps> = ({
  to,
  icon: Icon,
  label,
  isActive,
  badgeCount = 0,
  onBadgeClick,
}) => {
  const handleClick = (): void => {
    hapticFeedback(10, "light");
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center p-0"
      style={{
        scrollSnapAlign: "center",
        scrollSnapStop: "always",
        minWidth: "20%", // Show 5 items at a time (100% / 5 = 20%)
        flex: "0 0 20%",
      }}
    >
      <Link
        to={to}
        onClick={handleClick}
        className={`
          flex flex-col items-center justify-center
          w-full h-full px-2 py-2
          transition-all duration-200 ease-out
          ${isActive ? "text-brand-600" : "text-gray-600 hover:text-gray-800"}
        `}
        aria-label={label}
      >
        {/* Icon with smooth scaling animation */}
        <div
          className={`
            transition-all duration-200 ease-out
            ${isActive ? "scale-110" : "scale-100"}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Label with conditional visibility */}
        <span
          className={`
            text-xs font-medium mt-1 leading-tight
            transition-all duration-200 ease-out
            ${isActive ? "opacity-100" : "opacity-70"}
          `}
        >
          {label}
        </span>

        {/* Active indicator dot */}
        {isActive && (
          <div
            className="
              absolute -top-1 left-1/2 transform -translate-x-1/2
              w-1 h-1 bg-brand-600 rounded-full
              animate-pulse
            "
          />
        )}
      </Link>

      {/* Badge for pending receipts - positioned outside Link for correct semantics */}
      <BadgeButton
        count={badgeCount > 9 ? "9+" : badgeCount}
        onClick={onBadgeClick}
        positionClass="top-1 right-2"
        data-testid="bottom-nav-badge"
        aria-label={`${badgeCount} pending receipts`}
      />
    </div>
  );
};

export default BottomNavItem;
