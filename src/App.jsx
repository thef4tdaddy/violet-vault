import React from "react";
import Layout from "./components/layout/MainLayout";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  if (import.meta.env.MODE === "development") {
    console.log("🌟 App component is running - VioletVault starting up");
  }

  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  );
}

export default App;
