import React, { useRef, useEffect } from "react";
import { useBottomNavigation } from "@/hooks/mobile/useBottomNavigation";
import BottomNavItem from "./BottomNavItem";

/**
 * Bottom Navigation Bar Component
 * Mobile-first navigation with thumb-friendly positioning and smooth animations
 */
const BottomNavigationBar: React.FC = () => {
  const { isVisible, getVisibleItems, isItemActive, shouldShowScrollHint } = useBottomNavigation();

  const navRef = useRef<HTMLElement>(null);
  const leftFadeRef = useRef<HTMLDivElement>(null);
  const rightFadeRef = useRef<HTMLDivElement>(null);

  // Handle scroll indicators for overflow
  useEffect(() => {
    const navElement = navRef.current;
    const leftFade = leftFadeRef.current;
    const rightFade = rightFadeRef.current;

    if (!navElement || !leftFade || !rightFade) return;

    const updateScrollIndicators = (): void => {
      const { scrollLeft, scrollWidth, clientWidth } = navElement;
      const maxScroll = scrollWidth - clientWidth;

      // Show left fade if scrolled right
      leftFade.style.opacity = scrollLeft > 10 ? "1" : "0";

      // Show right fade if not at the end
      rightFade.style.opacity = scrollLeft < maxScroll - 10 ? "1" : "0";
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

  // Don't render if not visible (desktop or non-app routes)
  if (!isVisible) {
    return null;
  }

  // Show all navigation items (make menu scrollable)
  const visibleItems = getVisibleItems(9); // Show all 9 items

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-white/80 backdrop-blur-lg border-t-2 border-black
        sm:hidden
      "
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
        height: "80px",
      }}
    >
      {/* Main navigation container */}
      <div className="relative h-full overflow-hidden">
        {/* Scrollable navigation */}
        <nav
          ref={navRef}
          className="
            flex items-center
            h-full px-2 overflow-x-auto scrollbar-hide
            gap-1
          "
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {visibleItems.map((item) => (
            <BottomNavItem
              key={item.key}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isActive={isItemActive(item.key)}
            />
          ))}
        </nav>

        {/* Scroll masks to hide partial items */}
        <>
          {/* Left mask - hides partial items on the left */}
          <div
            ref={leftFadeRef}
            className="
              absolute left-0 top-0 bottom-0 w-12
              bg-gradient-to-r from-white via-white/90 to-transparent
              pointer-events-none opacity-0 transition-opacity duration-300
              backdrop-blur-sm
            "
          />

          {/* Right mask - hides partial items on the right */}
          <div
            ref={rightFadeRef}
            className="
              absolute right-0 top-0 bottom-0 w-12
              bg-gradient-to-l from-white via-white/90 to-transparent
              pointer-events-none transition-opacity duration-300
              backdrop-blur-sm
            "
          />
        </>
      </div>

      {/* Hardware acceleration hint */}
      <div className="hidden" style={{ transform: "translateZ(0)" }} />
    </div>
  );
};

export default BottomNavigationBar;
