import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only log in development mode
  if (import.meta.env.MODE === "development") {
    console.log("🔧 Initializing Sentry in", import.meta.env.MODE, "mode");
  }

  Sentry.init({
    dsn: "https://ac4d3e11c63ed8d0379b9a7f98740d01@o4509435944108032.ingest.us.sentry.io/4509725353967616",
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Reduce sampling to minimize noise while maintaining coverage
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.05, // Reduced from 0.1
    replaysOnErrorSampleRate: 0.5, // Reduced from 1.0
    debug: import.meta.env.MODE === "development",
    // Limit breadcrumbs to reduce noise
    maxBreadcrumbs: 50, // Default is 100
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === "console") {
        // Only keep error/warn console messages, skip debug/info logs
        if (breadcrumb.level !== "error" && breadcrumb.level !== "warning") {
          return null;
        }
        // Skip frequent recurring messages
        if (
          breadcrumb.message?.includes("🔧") ||
          breadcrumb.message?.includes("✅") ||
          breadcrumb.message?.includes("Layout component is running") ||
          breadcrumb.message?.includes("Network status:")
        ) {
          return null;
        }
      }

      // Filter out navigation breadcrumbs for same-page changes
      if (
        breadcrumb.category === "navigation" &&
        breadcrumb.data?.from === breadcrumb.data?.to
      ) {
        return null;
      }

      // Filter out fetch requests to common endpoints that create noise
      if (breadcrumb.category === "fetch" && breadcrumb.data?.url) {
        const url = breadcrumb.data.url;
        if (
          url.includes("/assets/") ||
          url.includes(".js") ||
          url.includes(".css") ||
          url.includes("sentry.io")
        ) {
          return null;
        }
      }

      return breadcrumb;
    },
    beforeSend(event) {
      // Filter out duplicate errors to reduce notification spam
      const errorMessage = event.exception?.values?.[0]?.value || event.message;

      // Filter out empty error objects and React element type errors caused by icon issues
      if (
        !errorMessage ||
        errorMessage === "{}" ||
        errorMessage.trim() === "" ||
        errorMessage.includes(
          "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object",
        )
      ) {
        return null; // Don't send these to Sentry
      }

      // Only log in development mode to reduce production noise
      if (import.meta.env.MODE === "development") {
        console.log("📤 Sentry sending event:", event.level, event.message);
      }

      // Check for the specific null amount error and throttle it
      if (
        errorMessage?.includes(
          "Cannot read properties of null (reading 'amount')",
        )
      ) {
        // Only send this error once every 5 minutes
        const errorKey = "null_amount_error";
        const lastSent = window.sessionStorage.getItem(`sentry_${errorKey}`);
        const now = Date.now();

        if (lastSent && now - parseInt(lastSent) < 300000) {
          // 5 minutes
          return null; // Don't send duplicate
        }

        window.sessionStorage.setItem(`sentry_${errorKey}`, now.toString());
      }

      // Filter out sensitive data
      if (event.exception) {
        event.exception.values?.forEach((exception) => {
          if (exception.stacktrace?.frames) {
            exception.stacktrace.frames.forEach((frame) => {
              // Remove sensitive data from error messages
              if (frame.vars) {
                delete frame.vars.encryptionKey;
                delete frame.vars.password;
                delete frame.vars.token;
              }
            });
          }
        });
      }
      return event;
    },
  });

  // Test Sentry connection
  Sentry.addBreadcrumb({
    message: "Sentry initialized successfully",
    level: "info",
    category: "init",
  });

  // Only log in development mode
  if (import.meta.env.MODE === "development") {
    console.log("✅ Sentry initialized");
  }

  // Setup console capture in both environments
  setupConsoleCapture();
};

const setupConsoleCapture = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Remove console.log capture to reduce noise - only capture errors and warnings

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
      message.includes("Non-Error promise rejection captured")
    ) {
      return;
    }

    // Send errors to Sentry
    Sentry.captureException(new Error(message));
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

    // Send warnings as breadcrumbs (filtered by beforeBreadcrumb)
    Sentry.addBreadcrumb({
      message,
      level: "warning",
      category: "console",
    });
  };
};

export { Sentry };
