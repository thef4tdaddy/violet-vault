export const encryptionUtils = {
  async deriveKey(password) {
    return this.generateKey(password);
  },

  async deriveKeyFromSalt(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
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
      ["encrypt", "decrypt"]
    );

    return key;
  },

  async generateKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
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
      ["encrypt", "decrypt"]
    );

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
      encoder.encode(stringData)
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  },

  async decrypt(encryptedData, key, iv) {
    try {
      // Add validation logging for debug
      console.log("🔓 Decrypt attempt:", {
        hasEncryptedData: !!encryptedData,
        encryptedDataType: typeof encryptedData,
        encryptedDataLength: encryptedData?.length,
        hasKey: !!key,
        keyType: typeof key,
        hasIv: !!iv,
        ivType: typeof iv,
        ivLength: iv?.length
      });

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        new Uint8Array(encryptedData)
      );

      const decoder = new TextDecoder();
      const result = JSON.parse(decoder.decode(decrypted));
      console.log("🔓 Decrypt successful");
      return result;
    } catch (error) {
      console.error("🔓 Decrypt failed:", {
        error: error.message,
        errorName: error.name,
        errorType: typeof error,
        stack: error.stack
      });
      throw error;
    }
  },

  async decryptRaw(encryptedData, key, iv) {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(encryptedData)
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
