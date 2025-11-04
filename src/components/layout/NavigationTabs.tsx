import React, { memo, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getIcon } from "@/utils";
import { getButtonClasses, hapticFeedback } from "@/utils/ui/touchFeedback";

interface NavButtonProps {
  active: boolean;
  to: string;
  icon: React.ElementType;
  label: string;
  viewKey: string;
}

/**
 * Navigation tabs component for the main layout
 * Now using React Router for proper URL-based navigation
 */
const NavigationTabs = memo(() => {
  const location = useLocation();
  const navRef = useRef(null);
  const leftFadeRef = useRef(null);
  const rightFadeRef = useRef(null);

  // Handle scroll indicators for mobile
  useEffect(() => {
    const navElement = navRef.current;
    const leftFade = leftFadeRef.current;
    const rightFade = rightFadeRef.current;

    if (!navElement || !leftFade || !rightFade) return;

    const updateScrollIndicators = () => {
      const { scrollLeft, scrollWidth, clientWidth } = navElement;
      const maxScroll = scrollWidth - clientWidth;

      // Show left fade if scrolled right
      if (scrollLeft > 10) {
        leftFade.style.opacity = "1";
      } else {
        leftFade.style.opacity = "0";
      }

      // Show right fade if not at the end
      if (scrollLeft < maxScroll - 10) {
        rightFade.style.opacity = "1";
      } else {
        rightFade.style.opacity = "0";
      }
    };

    // Initial check
    updateScrollIndicators();

    // Listen for scroll events
    navElement.addEventListener("scroll", updateScrollIndicators);

    // Also check on resize
    window.addEventListener("resize", updateScrollIndicators);

    return () => {
      navElement.removeEventListener("scroll", updateScrollIndicators);
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, []);

  const tabs = [
    {
      key: "dashboard",
      path: "/app/dashboard",
      icon: getIcon("CreditCard"),
      label: "Dashboard",
    },
    {
      key: "envelopes",
      path: "/app/envelopes",
      icon: getIcon("Wallet"),
      label: "Envelopes",
    },
    {
      key: "bills",
      path: "/app/bills",
      icon: getIcon("Calendar"),
      label: "Manage Bills",
    },
    {
      key: "transactions",
      path: "/app/transactions",
      icon: getIcon("BookOpen"),
      label: "Transactions",
    },
    {
      key: "savings",
      path: "/app/savings",
      icon: getIcon("Target"),
      label: "Savings Goals",
    },
    {
      key: "supplemental",
      path: "/app/supplemental",
      icon: getIcon("CreditCard"),
      label: "Supplemental",
    },
    {
      key: "paycheck",
      path: "/app/paycheck",
      icon: getIcon("DollarSign"),
      label: "Add Paycheck",
    },
    {
      key: "debts",
      path: "/app/debts",
      icon: getIcon("TrendingDown"),
      label: "Debt Tracking",
    },
    {
      key: "analytics",
      path: "/app/analytics",
      icon: getIcon("BarChart3"),
      label: "Analytics",
    },
  ];

  // Get current active view from URL
  const getCurrentView = () => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    return currentTab?.key || "dashboard";
  };

  const activeView = getCurrentView();

  return (
    <div className="glassmorphism rounded-3xl mb-6 lg:shadow-xl border border-white/20 ring-1 ring-gray-800/10 hidden sm:block lg:static z-50 overflow-hidden relative">
      <nav
        ref={navRef}
        className="flex justify-evenly lg:justify-around overflow-x-auto scrollbar-hide pb-safe px-1 lg:px-0 gap-1 lg:gap-0 py-3 lg:py-2"
      >
        {tabs.map((tab) => (
          <NavButton
            key={tab.key}
            active={activeView === tab.key}
            to={tab.path}
            icon={tab.icon}
            label={tab.label}
            viewKey={tab.key}
          />
        ))}
      </nav>

      {/* Mobile scroll indicators - only show on small screens */}
      <div
        ref={rightFadeRef}
        className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/60 via-white/20 to-transparent pointer-events-none rounded-r-3xl transition-opacity duration-300"
      ></div>
      <div
        ref={leftFadeRef}
        className="lg:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/60 via-white/20 to-transparent pointer-events-none rounded-l-3xl opacity-0 transition-opacity duration-300"
      ></div>
    </div>
  );
});

const NavButton = memo(({ active, to, icon: _Icon, label, viewKey }: NavButtonProps) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    data-view={viewKey}
    data-tab={viewKey}
    onClick={() => hapticFeedback(10, "light")}
    className={getButtonClasses(
      `flex-shrink-0 lg:flex-1 flex flex-col items-center lg:flex-row lg:px-4 px-3 py-3 text-xs lg:text-sm font-medium border border-black/10 ${
        active
          ? "border-t-2 lg:border-b-2 border-purple-500 text-purple-600 bg-purple-50/50 border-purple-400 ring-1 ring-purple-300"
          : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30 hover:border-purple-200"
      }`,
      "tab"
    )}
    style={{ minWidth: "80px", minHeight: "44px" }} // Increase minimum tap target for accessibility
  >
    <_Icon className="h-4 w-4 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
    <span className="text-center lg:text-left leading-tight">
      {/* Responsive label display with better text truncation */}
      <span className="hidden lg:inline truncate">{label}</span>
      {/* Medium screens (tablets) - show abbreviated labels for long words */}
      <span className="hidden md:inline lg:hidden text-xs truncate max-w-[60px] overflow-hidden">
        {label === "Supplemental"
          ? "Extra"
          : label === "Analytics"
            ? "Stats"
            : label === "Debt Tracking"
              ? "Debts"
              : label === "Add Paycheck"
                ? "Paycheck"
                : label === "Manage Bills"
                  ? "Bills"
                  : label === "Savings Goals"
                    ? "Savings"
                    : label.split(" ")[0]}
      </span>
      {/* Small screens - show optimized short labels */}
      <span className="md:hidden text-xs truncate max-w-[50px] overflow-hidden whitespace-nowrap">
        {label === "Supplemental"
          ? "Extra"
          : label === "Analytics"
            ? "Chart"
            : label === "Add Paycheck"
              ? "Pay"
              : label === "Manage Bills"
                ? "Bills"
                : label === "Savings Goals"
                  ? "Save"
                  : label === "Debt Tracking"
                    ? "Debt"
                    : label.split(" ")[0]}
      </span>
    </span>
  </Link>
));

export default NavigationTabs;
