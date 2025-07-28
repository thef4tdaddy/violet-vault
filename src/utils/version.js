// src/utils/version.js
import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

// Format version for display
export const getVersionInfo = () => {
  return {
    version: APP_VERSION,
    name: APP_NAME,
    displayName: "VioletVault",
    buildDate: new Date().toISOString().split("T")[0], // Current build date
  };
};
