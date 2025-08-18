import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initLogRocket } from "./utils/logrocket.js";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/queryClient";

// Initialize LogRocket for session replay and error tracking
initLogRocket();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
