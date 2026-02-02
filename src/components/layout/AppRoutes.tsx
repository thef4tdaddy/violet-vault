import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ViewRendererComponent from "./ViewRenderer";
import LandingPage from "../marketing/LandingPage";
import OfflinePage from "../pwa/OfflinePage";
import ShareTargetHandler from "../pwa/ShareTargetHandler";
import DevAuthBypass from "../dev/DevAuthBypass";
import DemoPage from "../demo/DemoPage";
import { routeConfig } from "./routeConfig";

// Lazy load API Documentation (dev-only)
const APIDocumentation = lazy(() => import("../api-docs/APIDocumentation"));

interface AppRoutesProps {
  budget: Record<string, unknown>;
  currentUser: Record<string, unknown>;
  totalBiweeklyNeed: number;
  setActiveView: (view: string) => void;
}

/**
 * Application Routes Component
 * Handles both marketing (/) and app (/app/*) routes
 * Landing page at root, full app under /app/ prefix
 */
const AppRoutes = ({ budget, currentUser, totalBiweeklyNeed, setActiveView }: AppRoutesProps) => {
  const commonProps = {
    budget,
    currentUser,
    totalBiweeklyNeed,
    setActiveView,
  };

  return (
    <Routes>
      {/* Landing page route */}
      <Route path="/" element={<LandingPage />} />

      {/* Demo page route */}
      <Route path="/demo" element={<DemoPage />} />

      {/* Offline fallback route */}
      <Route path="/offline" element={<OfflinePage />} />

      {/* Share Target API route */}
      <Route path="/app/import" element={<ShareTargetHandler />} />

      {/* Dev auth bypass route */}
      <Route path="/__dev_auth" element={<DevAuthBypass />} />

      {/* API Documentation route - dev only */}
      {(import.meta.env.MODE === "development" ||
        window.location.hostname.includes("dev.") ||
        window.location.hostname.includes("localhost")) && (
        <Route
          path="/api-docs"
          element={
            <Suspense
              fallback={<div className="p-8 text-center">Loading API Documentation...</div>}
            >
              <APIDocumentation />
            </Suspense>
          }
        />
      )}

      {/* App routes under /app prefix */}
      {routeConfig.map(({ path, activeView }) => (
        <Route
          key={path}
          path={path}
          element={<ViewRendererComponent activeView={activeView} {...commonProps} />}
        />
      ))}

      {/* Catch-all for everything else goes to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;
