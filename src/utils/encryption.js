export const encryptionUtils = {
  async deriveKey(password) {
    return this.generateKey(password);
  },

  async deriveKeyFromSalt(password, salt) {
    // CRITICAL: Track when deriveKeyFromSalt is called vs generateKey
    try {
      const logger = (await import("./logger.js")).default;
      logger.debug(
        "🔍 CRITICAL DEBUG: deriveKeyFromSalt called instead of generateKey",
        {
          passwordLength: password?.length || 0,
          saltLength: salt?.length || 0,
          saltType: salt?.constructor?.name || "unknown",
          saltPreview:
            Array.from(salt.slice(0, 8))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("") + "...",
        },
      );
    } catch {
      console.log(
        "🔍 CRITICAL DEBUG: deriveKeyFromSalt called instead of generateKey",
      );
    }

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    // Export and log the derived key for cross-browser comparison
    try {
      const logger = (await import("./logger.js")).default;
      const exportedKey = await crypto.subtle.exportKey("raw", key);
      const keyBytes = new Uint8Array(exportedKey);
      const keyHex = Array.from(keyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      logger.debug("🔍 CRITICAL DEBUG: deriveKeyFromSalt result", {
        keyHex: keyHex,
        keyPreview: keyHex.slice(0, 32) + "...",
        keyLength: keyBytes.length,
        iterations: 100000,
      });
    } catch {
      console.log("🔍 CRITICAL DEBUG: deriveKeyFromSalt completed");
    }

    return key;
  },

  async generateKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    );

    // Generate deterministic salt from password to ensure same password = same key
    const passwordBytes = encoder.encode(password + "VioletVault_Salt");
    const saltHash = await crypto.subtle.digest("SHA-256", passwordBytes);
    const salt = new Uint8Array(saltHash.slice(0, 16));

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    // CRITICAL: Add comprehensive cross-browser encryption key debugging
    try {
      const logger = (await import("./logger.js")).default;

      // Export raw key material for cross-browser verification
      const exportedKey = await crypto.subtle.exportKey("raw", key);
      const keyBytes = new Uint8Array(exportedKey);
      const keyHex = Array.from(keyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const saltHex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      logger.debug(`🔍 CRITICAL DEBUG: generateKey cross-browser analysis`, {
        passwordLength: password?.length || 0,
        passwordPreview: password
          ? `${password[0]}***${password[password.length - 1]}`
          : "none",
        saltHex: saltHex,
        saltLength: salt.length,
        keyHex: keyHex,
        keyLength: keyBytes.length,
        keyPreview: keyHex.slice(0, 32) + "...",
        pbkdf2Iterations: 100000,
        hashAlgorithm: "SHA-256",
        keyAlgorithm: "AES-GCM",
        keyLength256: keyBytes.length === 32,
        browserInfo: {
          userAgent: navigator.userAgent.slice(0, 50),
          cryptoSubtle: !!crypto.subtle,
          webCrypto: !!window.crypto,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      // Fallback console logging if logger fails
      console.log(`🔍 CRITICAL DEBUG: generateKey cross-browser analysis`, {
        passwordLength: password?.length || 0,
        saltLength: salt?.length || 0,
        keyType: key?.constructor?.name || "unknown",
        loggerError: logError.message,
      });
    }

    return { key, salt };
  },

  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Handle both string data (already JSON stringified) and object data
    const stringData = typeof data === "string" ? data : JSON.stringify(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(stringData),
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  },

  async decrypt(encryptedData, key, iv) {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(encryptedData),
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  },

  async decryptRaw(encryptedData, key, iv) {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(encryptedData),
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  },

  generateDeviceFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || "unknown",
      navigator.deviceMemory || "unknown",
    ].join("|");

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  },

  async generateBudgetId(masterPassword) {
    let hash = 0;
    for (let i = 0; i < masterPassword.length; i++) {
      const char = masterPassword.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const budgetId = `budget_${Math.abs(hash).toString(16)}`;

    // Debug logging to track cross-browser budget ID generation consistency
    try {
      const logger = (await import("./logger.js")).default;
      logger.debug(`🔍 DEBUG: generateBudgetId detailed analysis`, {
        passwordLength: masterPassword?.length || 0,
        passwordType: typeof masterPassword,
        passwordPreview: masterPassword
          ? `${masterPassword[0]}***${masterPassword[masterPassword.length - 1]}`
          : "none",
        firstCharCode: masterPassword?.charCodeAt(0) || 0,
        lastCharCode:
          masterPassword?.charCodeAt(masterPassword.length - 1) || 0,
        hash: hash,
        absHash: Math.abs(hash),
        hexHash: Math.abs(hash).toString(16),
        finalBudgetId: budgetId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fallback if logger import fails
      console.log(`🔍 DEBUG: generateBudgetId detailed analysis`, {
        passwordLength: masterPassword?.length || 0,
        passwordType: typeof masterPassword,
        hash: hash,
        finalBudgetId: budgetId,
      });
    }

    return budgetId;
  },

  generateHash(data) {
    let hash = 0;
    const str = typeof data === "string" ? data : JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  },
};
