import React from "react";
import { Link } from "react-router-dom";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";

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

  const handleBadgeClickInternal = (e: React.MouseEvent) => {
    if (onBadgeClick) {
      e.preventDefault();
      e.stopPropagation();
      hapticFeedback(15, "medium");
      onBadgeClick(e);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center
        px-2 py-2
        relative transition-all duration-200 ease-out
        ${isActive ? "text-brand-600" : "text-gray-600 hover:text-gray-800"}
      `}
      style={{
        scrollSnapAlign: "center",
        scrollSnapStop: "always",
        minWidth: "20%", // Show 5 items at a time (100% / 5 = 20%)
        flex: "0 0 20%",
      }}
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

      {/* Badge for pending receipts */}
      {badgeCount > 0 && (
        <button
          onClick={handleBadgeClickInternal}
          className="
            absolute top-1 right-2
            min-w-[18px] h-[18px] px-1
            bg-red-500 text-white text-[10px] font-black
            rounded-full flex items-center justify-center
            border-2 border-brand-100
            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            z-10 animate-in zoom-in-50 duration-200
          "
          data-testid="bottom-nav-badge"
          aria-label={`${badgeCount} pending receipts`}
        >
          {badgeCount > 9 ? "9+" : badgeCount}
        </button>
      )}

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
  );
};

export default BottomNavItem;
