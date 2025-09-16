import React from "react";
import { Routes, Route } from "react-router-dom";
import ViewRendererComponent from "./ViewRenderer";
import LandingPage from "../marketing/LandingPage";
import { routeConfig } from "./routeConfig";

/**
 * Application Routes Component
 * Handles both marketing (/) and app (/app/*) routes
 * Landing page at root, full app under /app/ prefix
 */
const AppRoutes = ({
  budget,
  currentUser,
  totalBiweeklyNeed,
  setActiveView,
}) => {
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

      {/* App routes under /app prefix */}
      {routeConfig.map(({ path, activeView }) => (
        <Route
          key={path}
          path={path}
          element={
            <ViewRendererComponent activeView={activeView} {...commonProps} />
          }
        />
      ))}

      {/* Catch-all for everything else goes to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;
