import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getIcon } from "../../utils";
import { useTouchFeedback } from "../../utils/ui/touchFeedback";

/**
 * FloatingActionButton - Context-aware mobile FAB
 *
 * Phase 1: Core component with context detection and primary action support
 *
 * Features:
 * - Material Design 56px FAB
 * - Context detection using current route
 * - Hardware-accelerated animations
 * - Haptic feedback integration
 * - Mobile-only visibility
 *
 * Part of Issue #165 - Add Floating Action Button (FAB) with Contextual Actions
 * Sub-issue #640 - FAB Phase 1: Core Component with Context Detection
 */

// Context-based action mapping
const fabActions = {
  dashboard: {
    icon: "DollarSign",
    label: "Add Paycheck",
    action: "openPaycheckModal",
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
  envelopes: {
    icon: "FolderPlus",
    label: "Create Envelope",
    action: "openCreateEnvelopeModal",
    color: "bg-purple-600 hover:bg-purple-700",
  },
  bills: {
    icon: "FileText",
    label: "Add Bill",
    action: "openAddBillModal",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  savings: {
    icon: "Target",
    label: "New Goal",
    action: "openAddGoalModal",
    color: "bg-green-600 hover:bg-green-700",
  },
  transactions: {
    icon: "Plus",
    label: "Add Transaction",
    action: "openTransactionModal",
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
  debts: {
    icon: "CreditCard",
    label: "Add Debt",
    action: "openAddDebtModal",
    color: "bg-red-600 hover:bg-red-700",
  },
  // Hidden on these screens
  analytics: null,
  activity: null,
  automation: {
    icon: "Zap",
    label: "New Rule",
    action: "openNewRuleModal",
    color: "bg-orange-600 hover:bg-orange-700",
  },
};

// Extract current view from pathname
const getCurrentView = (pathname) => {
  const pathSegments = pathname.split("/").filter(Boolean);
  const viewSegment = pathSegments[1]; // /app/[view]
  return viewSegment || "dashboard";
};

const FloatingActionButton = ({ onAction, className = "", ...props }) => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for mobile-only visibility
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Update current view based on route changes
  useEffect(() => {
    const view = getCurrentView(location.pathname);
    setCurrentView(view);

    // Determine if FAB should be visible for this view
    const action = fabActions[view];
    setIsVisible(!!action && isMobile);
  }, [location.pathname, isMobile]);

  // Get current action configuration
  const currentAction = fabActions[currentView];

  // Touch feedback with context-aware type
  const touchFeedback = useTouchFeedback("tap", "primary");

  // Handle FAB click
  const handleClick = () => {
    if (currentAction && onAction) {
      onAction(currentAction.action, currentAction);
    }
  };

  // Don't render if not visible or no action defined
  if (!isVisible || !currentAction) {
    return null;
  }

  return (
    <button
      onClick={touchFeedback.onClick(handleClick)}
      onTouchStart={touchFeedback.onTouchStart}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        ${currentAction.color}
        text-white shadow-lg hover:shadow-xl
        focus:ring-4 focus:ring-offset-2 focus:ring-current/30
        transition-all duration-200 ease-out
        flex items-center justify-center
        border-2 border-black
        transform-gpu
        ${touchFeedback.className}
        ${className}
      `}
      aria-label={currentAction.label}
      title={currentAction.label}
      style={{
        // Enable hardware acceleration
        willChange: "transform",
      }}
      {...props}
    >
      {React.createElement(getIcon(currentAction.icon), {
        className: "h-6 w-6",
      })}
    </button>
  );
};

export default FloatingActionButton;
