import * as Sentry from "@sentry/react";

export const initSentry = () => {
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
    beforeSend(event) {
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
};

export { Sentry };