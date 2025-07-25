import * as Sentry from "@sentry/react";

export const initSentry = () => {
  console.log("🔧 Initializing Sentry in", import.meta.env.MODE, "mode");

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
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    debug: import.meta.env.MODE === "development", // Enable debug logging in dev
    beforeSend(event) {
      console.log("📤 Sentry sending event:", event.level, event.message);

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

  console.log("✅ Sentry initialized");

  // Only setup console capture in production to avoid dev log spam
  if (import.meta.env.MODE === "production") {
    setupConsoleCapture();
  }
};

const setupConsoleCapture = () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.log = (...args) => {
    // Only log to console in development
    if (import.meta.env.MODE === "development") {
      originalConsoleLog(...args);
    }

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message: args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
        .join(" "),
      level: "info",
      category: "console",
    });
  };

  console.error = (...args) => {
    originalConsoleError(...args);

    // Send errors to Sentry
    Sentry.captureException(new Error(args.join(" ")));
  };

  console.warn = (...args) => {
    originalConsoleWarn(...args);

    // Send warnings as breadcrumbs
    Sentry.addBreadcrumb({
      message: args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
        .join(" "),
      level: "warning",
      category: "console",
    });
  };
};

export { Sentry };
