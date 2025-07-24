import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
