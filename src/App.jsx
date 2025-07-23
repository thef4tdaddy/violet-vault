import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

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
