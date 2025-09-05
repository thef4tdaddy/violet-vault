import React from "react";
import { Routes, Route } from "react-router-dom";
import ViewRendererComponent from "./ViewRenderer";
import { routeConfig } from "./routeConfig";

/**
 * Application Routes Component
 * Renders all application routes using configuration-driven approach
 * Eliminates repetitive route definitions in MainContent
 */
const AppRoutes = ({ budget, currentUser, totalBiweeklyNeed, setActiveView }) => {
  const commonProps = {
    budget,
    currentUser,
    totalBiweeklyNeed,
    setActiveView,
  };

  return (
    <Routes>
      {routeConfig.map(({ path, activeView }) => (
        <Route
          key={path}
          path={path}
          element={
            <ViewRendererComponent
              activeView={activeView}
              {...commonProps}
            />
          }
        />
      ))}
      {/* Catch-all route redirects to dashboard */}
      <Route
        path="*"
        element={
          <ViewRendererComponent
            activeView="dashboard"
            {...commonProps}
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;