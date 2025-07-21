export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate config
const requiredKeys = ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_PROJECT_ID"];

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);
if (missingKeys.length > 0) {
  console.error("❌ Missing Firebase config:", missingKeys);
}
