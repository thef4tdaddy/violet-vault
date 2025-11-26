import { useLocation } from "react-router-dom";
import MainLayout from "./MainLayout";

interface FirebaseSync {
  isOnline?: boolean;
  status?: string;
  [key: string]: unknown;
}

/**
 * App Wrapper Component
 * Determines whether to show MainLayout (for /app routes) or standalone pages
 * Allows PWA to bypass marketing and go straight to app functionality
 */
const AppWrapper = ({ firebaseSync }: { firebaseSync: FirebaseSync }) => {
  const location = useLocation();

  // Determine if this is an app route that needs MainLayout
  const isAppRoute = location.pathname.startsWith("/app");

  // For PWA builds, we can configure this to always be true
  const isPWA = process.env.REACT_APP_BUILD_TARGET === "pwa";

  if (isPWA) {
    // PWA always uses MainLayout with app functionality
    return <MainLayout firebaseSync={firebaseSync} />;
  }

  if (isAppRoute) {
    // Web app routes use MainLayout
    return <MainLayout firebaseSync={firebaseSync} />;
  }

  // Marketing routes (like /) use standalone components
  // These will be handled by AppRoutes directly
  return null; // Let AppRoutes handle it
};

export default AppWrapper;
