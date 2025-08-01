import React from "react";
import MainLayout from "./components/layout/MainLayout";
import { ErrorBoundary } from "@highlight-run/react";

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
