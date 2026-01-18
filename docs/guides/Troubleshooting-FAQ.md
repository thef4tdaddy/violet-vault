# VioletVault Troubleshooting FAQ

**Last Updated:** January 18, 2026
**Version:** 2.0.x (TypeScript Architecture)

This document addresses common issues and technical questions for the VioletVault v2.0 system.

## 🔄 Synchronization & Data

### Sync Not Working / "Out of Sync" Label

**Symptoms:**

- Changes on Mobile don't show on Desktop.
- "Syncing..." status never resolves.
- "Sync Conflict" modal appears frequently.

**Common Causes:**

1. **Network Throttling**: Corporate or public WiFi may block Firestore WebSockets.
2. **Encryption Key Mismatch**: If you changed your budget password on one device, other devices must be re-authenticated using the new key.
3. **Browser Storage Policy**: Safari or Chrome Incognito may limit IndexedDB (Dexie) storage, causing local writes to fail.

**Solutions:**

- **Refresh & Re-auth**: Refresh the page. You will be prompted for your password; this re-derives the cryptographic key.
- **Check Sync Health**: Go to Settings → Sync Status and look for the "Health Check" indicator. If it shows 🔴, your network is likely blocking Firebase.
- **Switch to Mobile Data**: If on a restricted WiFi, try a quick sync via cellular data to verify the service is up.

---

### Large Budget Sync Lag

**Symptoms:**

- Saving data takes 5+ seconds.
- Browser becomes unresponsive during sync.

**Explanation (v2.0 Chunking):**
In v2.0, budgets exceeding 1MB are split into "chunks" to bypass Firestore document limits. If you have 5,000+ transactions, the system creates multiple documents.

**Solutions:**

- **Archive Transactions**: Use the "Archive Old Transactions" tool in Settings to move historical data to the cold-storage table.
- **Reduce Envelope Count**: Consolidate inactive envelopes into a single "Archive" envelope.

---

## 🔐 Authentication & Security

### "Invalid Password" on Known Good Password

**Symptoms:**

- You are 100% sure of your password, but the vault won't unlock.

**Causes & Solutions:**

- **Case Sensitivity**: Passwords are case-sensitive. Check Caps Lock.
- **Cached Key Metadata**: Rarely, local metadata can become desynchronized. Try a "Force Logout" (Settings → Logout) and clear browser cache.
- **Key Derivation Change**: If you are returning to a budget created before v1.9, the legacy key derivation might be incompatible. Contact support for migration options.

### Stuck on "Authenticating..."

**Solution:**
V2.0 uses **React Context** for Auth. If the state is stuck, it typically means the `onAuthStateChanged` listener in `AuthContext` hasn't fired.

1. Check your internet connection (Firebase Auth needs a handshake).
2. Ensure you haven't blocked the `violet-vault-auth` domain in your browser.

---

## 📱 Platform Specifics

### PWA / Mobile Safari Issues

**Symptoms:**

- App won't install of Home Screen.
- Screen flickers during glassmorphic transitions.

**Solutions:**

- **Safari Settings**: Ensure "Service Workers" are enabled in Safari Advanced Experimental Features (usually enabled by default in recent iOS).
- **Update iOS**: Glassmorphism (Backdrop-filter) and Tailwind CSS 4 require iOS 16+.

---

## 🔧 Advanced Debugging

### Developer Console Commands

If you need to provide logs for a bug report (Labeled `bug` on GitHub), open the console (F12) and check:

```javascript
// Verify Dexie DB is healthy
(await import("@/db/budgetDb")).budgetDb.envelopes.count();

// Check for Sync Orchestrator status
window.__VIOLET_VAULT_SYNC__;
```

### Reporting a Bug

When creating an issue on the [GitHub Repository](https://github.com/thef4tdaddy/violet-vault/issues):

1. Use the **bug** label.
2. Attachment the **Diagnostic Bundle** from Settings → Support → Generate Debug Report.
3. Specify if you are using the **production**, **staging**, or **dev** environment.
