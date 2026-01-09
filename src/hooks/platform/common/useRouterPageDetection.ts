import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { pathToViewMap } from "@/components/layout/routeConfig";

/**
 * Router-aware page detection hook
 * Provides accurate page detection using React Router location
 * Enhances bug report page detection and app analytics
 * PWA-aware for different build targets
 */
export const useRouterPageDetection = () => {
  const location = useLocation();

  const pageInfo = useMemo(() => {
    const pathname = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // Check build environment
    const isPWA = process.env.REACT_APP_BUILD_TARGET === "pwa";

    // Map URL path to view name using existing config
    const currentView = (pathToViewMap as Record<string, string>)[pathname] || "unknown";

    // Determine if this is an app route or potential marketing route
    const isAppRoute = Object.keys(pathToViewMap).includes(pathname) || pathname.startsWith("/app");
    const isMarketingRoute = !isAppRoute && !pathname.startsWith("/app");

    // For PWA, everything is considered an app route
    const effectiveIsAppRoute = isPWA || isAppRoute;
    const effectiveIsMarketingRoute = !isPWA && isMarketingRoute;

    // Extract page context for bug reports
    const pageContext = {
      currentPath: pathname,
      currentView,
      searchParams: Object.fromEntries(searchParams),
      segments: pathname.split("/").filter(Boolean),
      hash: location.hash,
      isAppRoute: effectiveIsAppRoute,
      isMarketingRoute: effectiveIsMarketingRoute,
      buildTarget: isPWA ? "pwa" : "web",
      routeType: effectiveIsAppRoute ? "app" : "marketing",
    };

    // Generate user-friendly location string
    const getUserLocation = () => {
      if (effectiveIsMarketingRoute) {
        return `Marketing: ${pathname}`;
      }

      // Convert view to user-friendly name
      const viewNames = {
        dashboard: "Dashboard",
        envelopes: "Envelopes",
        savings: "Savings Goals",
        supplemental: "Supplemental Accounts",
        paycheck: "Paycheck Processor",
        bills: "Bills & Payments",
        transactions: "Transaction Ledger",
        debts: "Debt Management",
        analytics: "Analytics & Reports",
        automation: "Automation Rules",
        activity: "Activity History",
      };

      const viewName = (viewNames as Record<string, string>)[currentView] || currentView;
      return isPWA ? `PWA: ${viewName}` : `App: ${viewName}`;
    };

    return {
      ...pageContext,
      userLocation: getUserLocation(),
      displayName: getUserLocation(),
    };
  }, [location]);

  return pageInfo;
};

/**
 * Enhanced page detection for bug reports
 * Combines router location with DOM analysis for complete context
 */
export const useEnhancedPageDetection = () => {
  const routerInfo = useRouterPageDetection();

  const enhancedInfo = useMemo(() => {
    // Get modal context if any
    const getModalContext = () => {
      try {
        const modalSelectors = [
          '[role="dialog"] h1',
          '[role="dialog"] h2',
          '[role="dialog"] [class*="title"]',
          ".modal h1",
          ".modal h2",
        ];

        for (const selector of modalSelectors) {
          const element = document.querySelector(selector);
          if (element && (element as HTMLElement).offsetParent !== null) {
            const title = element.textContent?.trim();
            if (title) return title;
          }
        }
        return null;
      } catch {
        return null;
      }
    };

    const modalContext = getModalContext();

    // Build complete user location
    let completeLocation = routerInfo.userLocation;
    if (modalContext) {
      completeLocation += ` > ${modalContext}`;
    }

    return {
      ...routerInfo,
      modalContext,
      completeUserLocation: completeLocation,
      // For bug reports
      routerPath: routerInfo.currentPath,
      viewName: routerInfo.currentView,
      fullContext: {
        route: routerInfo.currentPath,
        view: routerInfo.currentView,
        modal: modalContext,
        params: routerInfo.searchParams,
      },
    };
  }, [routerInfo]);

  return enhancedInfo;
};
