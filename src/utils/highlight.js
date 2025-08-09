import { H } from "highlight.run";

export const initHighlight = () => {
  // Only log in development mode
  if (import.meta.env.MODE === "development") {
    console.log(
      "🔧 Initializing Highlight.io in",
      import.meta.env.MODE,
      "mode",
    );
  }

  H.init(import.meta.env.VITE_HIGHLIGHT_PROJECT_ID || "your-project-id-here", {
    serviceName: "violet-vault",
    environment: import.meta.env.MODE,
    tracingOrigins: true,

    // Session replay configuration
    sessionShortcut: false, // Don't show session replay shortcut in UI
    inlineImages: false, // Don't inline images for privacy
    sessionSamplingRate: import.meta.env.MODE === "development" ? 1.0 : 0.1, // 10% sampling in prod, 100% in dev
    errorSamplingRate: 1.0, // Always capture errors

    networkRecording: {
      enabled: true,
      recordHeadersAndBody: false, // Don't record sensitive data for privacy
      urlBlocklist: [
        // Default blocked URLs for security
        "https://www.googleapis.com/identitytoolkit",
        "https://securetoken.googleapis.com",
        // Firebase URLs that might contain sensitive data
        "https://firestore.googleapis.com",
        "https://firebase.googleapis.com",
      ],
    },

    // Privacy settings for financial app
    maskAllInputs: true, // Mask all input fields by default
    maskAllText: false, // Don't mask all text, just inputs
  });

  // Only log in development mode
  if (import.meta.env.MODE === "development") {
    console.log("✅ Highlight.io initialized");
  }

  // Setup console capture for enhanced error tracking (commented out to avoid conflicts)
  // setupConsoleCapture();
};

const setupConsoleCapture = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Capture console errors and send to Highlight.io
  console.error = (...args) => {
    originalConsoleError(...args);

    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");

    // Skip frequent or expected errors that create noise
    if (
      message.includes("Failed to fetch dynamically imported module") ||
      message.includes("ResizeObserver loop limit exceeded") ||
      message.includes("Non-Error promise rejection captured") ||
      message.includes("🔧") ||
      message.includes("✅") ||
      message.includes("Layout component is running") ||
      message.includes("Network status:")
    ) {
      return;
    }

    // Send errors to Highlight.io
    H.consumeError(new Error(message));
  };

  console.warn = (...args) => {
    originalConsoleWarn(...args);

    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");

    // Skip common development warnings that don't need tracking
    if (
      message.includes("React does not recognize") ||
      message.includes("validateDOMNesting") ||
      message.includes("componentWillReceiveProps") ||
      message.includes("Legacy context API")
    ) {
      return;
    }

    // Log warnings for debugging but don't send to Highlight (they handle this automatically)
    if (import.meta.env.MODE === "development") {
      console.log("⚠️ Warning captured:", message);
    }
  };
};

// User identification for session tracking
export const identifyUser = (email, userData = {}) => {
  H.identify(email, {
    ...userData,
    app: "violet-vault",
    environment: import.meta.env.MODE,
  });
};

// Export Highlight instance for direct usage if needed
export { H };
