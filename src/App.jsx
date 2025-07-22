import React from "react";
import EnvelopeSystem from "./components/EnvelopeSystem";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <EnvelopeSystem />
    </ErrorBoundary>
  );
}

export default App;
