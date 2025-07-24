import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  console.log("🌟 App component is running - VioletVault starting up");

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
