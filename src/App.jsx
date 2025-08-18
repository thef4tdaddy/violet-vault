import React from "react";
import MainLayout from "./components/layout/MainLayout";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./utils/errorViewer"; // Initialize local error viewer for dev debugging

function App() {
  if (import.meta.env.MODE === "development") {
    console.log("🌟 App component is running - VioletVault starting up");
  }

  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
}

export default App;
