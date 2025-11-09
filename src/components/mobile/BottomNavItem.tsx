import React from "react";
import { Link } from "react-router-dom";
import { hapticFeedback } from "@/utils/ui/touchFeedback";

/**
 * Props for BottomNavItem component
 */
interface BottomNavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

/**
 * Individual navigation item for bottom navigation bar
 * Touch-optimized with haptic feedback and smooth animations
 */
const BottomNavItem: React.FC<BottomNavItemProps> = ({ to, icon: Icon, label, isActive }) => {
  const handleClick = (): void => {
    hapticFeedback(10, "light");
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center
        px-2 py-2
        relative transition-all duration-200 ease-out
        ${isActive ? "text-purple-600" : "text-gray-600 hover:text-gray-800"}
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
            w-1 h-1 bg-purple-600 rounded-full
            animate-pulse
          "
        />
      )}
    </Link>
  );
};

export default BottomNavItem;
