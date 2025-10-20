#!/usr/bin/env node

/**
 * Generate Dev Auth Token
 * Simple token generator for development authentication bypass
 *
 * Part of Lighthouse monitoring workflow - Issue #621
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */

import crypto from "crypto";

const DEV_AUTH_SECRET = process.env.DEV_AUTH_SECRET;

if (!DEV_AUTH_SECRET) {
  console.error("❌ DEV_AUTH_SECRET environment variable is required");
  process.exit(1);
}

// Generate a simple token based on the secret and current time
// This is for dev/staging only - not production security
const generateToken = (secret) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `dev-auth-${timestamp}`;

  // Create a simple hash-based token
  const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex").substring(0, 32); // Truncate to 32 chars for simplicity

  return `${timestamp}.${hash}`;
};

try {
  const token = generateToken(DEV_AUTH_SECRET);

  console.log("🔗 Token:");
  console.log(token);

  // Exit successfully
  process.exit(0);
} catch (error) {
  console.error("❌ Error generating token:", error.message);
  process.exit(1);
}
