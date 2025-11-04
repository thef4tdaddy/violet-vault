import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getIcon } from "../../utils";

/**
 * Hook for bottom navigation state management
 * Handles navigation items, active states, and responsive behavior
 */
export const useBottomNavigation = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Track window size for responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    };

    // Initial check
    checkIsMobile();

    // Listen for resize events
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Define navigation items with icons and paths
  // Order: Dashboard > Envelopes > Bills > Transactions > rest
  const navigationItems = useMemo(
    () => [
      {
        key: "dashboard",
        path: "/app/dashboard",
        icon: getIcon("CreditCard"),
        label: "Dashboard",
        priority: 1, // Always visible
      },
      {
        key: "envelopes",
        path: "/app/envelopes",
        icon: getIcon("Wallet"),
        label: "Envelopes",
        priority: 1, // Always visible
      },
      {
        key: "bills",
        path: "/app/bills",
        icon: getIcon("Calendar"),
        label: "Bills",
        priority: 1, // Always visible
      },
      {
        key: "transactions",
        path: "/app/transactions",
        icon: getIcon("BookOpen"),
        label: "Transactions",
        priority: 2, // Show on medium screens
      },
      {
        key: "savings",
        path: "/app/savings",
        icon: getIcon("Target"),
        label: "Savings",
        priority: 2, // Show on medium screens
      },
      {
        key: "supplemental",
        path: "/app/supplemental",
        icon: getIcon("CreditCard"),
        label: "Supplemental",
        priority: 3, // Show on larger screens
      },
      {
        key: "paycheck",
        path: "/app/paycheck",
        icon: getIcon("DollarSign"),
        label: "Paycheck",
        priority: 3, // Show on larger screens
      },
      {
        key: "debts",
        path: "/app/debts",
        icon: getIcon("TrendingDown"),
        label: "Debts",
        priority: 3, // Show on larger screens
      },
      {
        key: "analytics",
        path: "/app/analytics",
        icon: getIcon("BarChart3"),
        label: "Analytics",
        priority: 4, // Show on extra large screens
      },
    ],
    []
  );

  // Get current active item based on URL
  const activeItem = useMemo(() => {
    const currentItem = navigationItems.find((item) => item.path === location.pathname);
    return currentItem?.key || "dashboard";
  }, [location.pathname, navigationItems]);

  // Check if bottom navigation should be visible (mobile only)
  const isVisible = useMemo(() => {
    // Only show on mobile devices and within app routes
    const isAppRoute = location.pathname.startsWith("/app");

    return isMobile && isAppRoute;
  }, [isMobile, location.pathname]);

  // Filter items based on screen size (for overflow handling)
  const getVisibleItems = (maxItems = 5) => {
    // Always show priority 1 items, then add others based on space
    const priority1 = navigationItems.filter((item) => item.priority === 1);
    const remaining = navigationItems.filter((item) => item.priority > 1);

    const availableSlots = maxItems - priority1.length;
    const additionalItems = remaining.slice(0, availableSlots);

    return [...priority1, ...additionalItems].sort((a, b) => a.priority - b.priority);
  };

  return {
    navigationItems,
    activeItem,
    isVisible,
    getVisibleItems,

    // Utility functions
    isItemActive: (itemKey) => activeItem === itemKey,
    getItemByKey: (key) => navigationItems.find((item) => item.key === key),

    // Responsive helpers
    shouldShowScrollHint: navigationItems.length > 5,
  };
};
