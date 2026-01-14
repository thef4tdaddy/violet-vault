import logger from "../common/logger";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEF",
};

// Validate config
const requiredKeys = ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_PROJECT_ID"];

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);
if (missingKeys.length > 0) {
  logger.warn("Using demo Firebase config. Set environment variables for production", {
    missingKeys,
  });
}

// Debug: Log what Firebase project we're connecting to (dev/preview only)
if (
  import.meta.env.MODE === "development" ||
  window.location.hostname.includes("vercel.app") ||
  window.location.hostname.includes("staging.violetvault.app") ||
  window.location.hostname.includes("violetvault.app")
) {
  logger.debug("Firebase Config Debug", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    usingDemo: firebaseConfig.projectId === "demo-project",
    environment: import.meta.env.MODE,
    hostname: window.location.hostname,
  });
}
