# VioletVault Troubleshooting FAQ

This document contains solutions to common issues and troubleshooting steps for VioletVault.

## 🔄 Sync Issues

### Sync Not Working / Data Not Syncing

**Symptoms:**

- Data added on one device doesn't appear on another
- Manual sync button doesn't seem to work
- "Sync failed" messages

**Most Common Causes:**

#### 1. Network Environment Issues ⭐ **Most Common**

- **Corporate/Work WiFi** blocking cloud services
- **Poor mobile signal** causing timeouts
- **Public WiFi** with restrictions
- **VPN interference** (rare, but possible)

**Solution Steps:**

1. Try switching networks (WiFi ↔ Mobile data)
2. Test on a different network (home vs work)
3. Check if VPN affects sync (try with/without)
4. Use mobile browser developer tools to check for network errors

**Case Study:** See [Issue #516](https://github.com/thef4tdaddy/violet-vault/issues/516) for a detailed investigation of network-related sync issues.

#### 2. Browser/Device Specific Issues

- **Safari vs Chrome** - Try alternative browser
- **Private/Incognito mode** - May block IndexedDB
- **Storage quota exceeded** - Clear browser data
- **Outdated browser** - Update to latest version

**Solution:**

```javascript
// Check browser compatibility in console:
console.log("IndexedDB:", !!window.indexedDB);
console.log("Storage:", navigator.storage);
```

#### 3. Data Corruption Recovery

If sync fails consistently, try a **data reset**:

⚠️ **Warning:** This will clear local data. Make sure you have data in the cloud first.

1. Go to Settings → Data Management
2. Export data (backup)
3. Clear all local data
4. Refresh page and re-login
5. Allow sync to download from cloud

## 🔐 Authentication Issues

### Cannot Login / Password Issues

**Symptoms:**

- "Invalid password" errors
- Login button not responding
- Stuck on login screen

**Solutions:**

1. **Clear browser cache** - Old encryption keys may be cached
2. **Try different browser** - Rule out browser-specific issues
3. **Check password carefully** - VioletVault uses strong encryption
4. **Reset if needed** - Use "Reset and Start Fresh" option

### Lost Access to Account

**Recovery Options:**

1. **Cloud Backup** - If you had cloud sync enabled, data is recoverable
2. **Local Backup Files** - Check Downloads folder for exported data
3. **Fresh Start** - Create new account (if no backup available)

## 📱 Mobile Device Issues

### Mobile Safari Problems

**Common Issues:**

- Touch events not working properly
- Sync failing on mobile only
- Display issues in mobile Safari

**Solutions:**

1. **Try Chrome on iOS** - Alternative browser option
2. **Clear Safari cache** - Settings → Safari → Clear History and Website Data
3. **Check mobile network** - Switch between WiFi and cellular
4. **Update iOS** - Ensure latest Safari version

### Performance Issues on Mobile

**Symptoms:**

- Slow loading
- App freezing
- Memory warnings

**Solutions:**

1. **Close other apps** - Free up memory
2. **Restart browser** - Clear temporary memory
3. **Check data size** - Large budgets may be slower on mobile

## 🌐 Network Troubleshooting

### Corporate/Work Network Issues

**If sync fails at work but works at home:**

1. **Network Restrictions** - IT may block Firebase/cloud services
2. **Firewall Rules** - Corporate firewall blocking requests
3. **Proxy Settings** - May interfere with encrypted connections

**Workarounds:**

- Use mobile data instead of work WiFi
- Ask IT to whitelist Firebase domains
- Use personal VPN (if company policy allows)

### Home Network Issues

**Router/ISP Problems:**

1. **DNS Issues** - Try different DNS (8.8.8.8, 1.1.1.1)
2. **Firewall Settings** - Check router firewall rules
3. **ISP Throttling** - Some ISPs throttle cloud services

## 🔧 Advanced Troubleshooting

### Using Browser Developer Tools

**To debug sync issues:**

1. **Open Developer Tools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Look for error messages** during sync
4. **Check Network tab** for failed requests

**Useful Console Commands:**

```javascript
// Check sync status
runSyncHealthCheck();

// View recent sync activity
getQuickSyncStatus();

// Run diagnostic tools
runDataDiagnostic();
```

### Mobile Debugging

**Safari on iOS:**

1. Connect iPhone to Mac via USB
2. Safari → Develop → [Your iPhone] → Select tab
3. Full developer tools available

**Alternative - Built-in Logging:**

- VioletVault has extensive console logging
- Use Safari Web Inspector to view logs
- All sync operations are logged with details

## 🆘 When to Report a Bug

**Report a bug if:**

- Issue persists across multiple networks
- Error occurs on multiple devices
- Data loss or corruption occurs
- Issue reproducible with specific steps

**Don't report if:**

- Issue only occurs on specific network
- Resolved by changing browsers
- Resolved by data reset/resync

**How to Report:**

1. Use the built-in bug reporter (preferred)
2. Include console logs from developer tools
3. Specify network environment (work, home, mobile)
4. Include device/browser information

## 📊 Performance Guidelines

### Data Size Limits

**Recommended Limits:**

- **Envelopes:** < 100 for best performance
- **Transactions:** < 1000 active transactions
- **Bills:** < 50 active bills

**If you exceed these:**

- Use transaction archiving
- Archive old envelopes
- Performance may be slower on mobile

### Network Requirements

**Minimum Requirements:**

- **Upload:** 1 Mbps for sync
- **Latency:** < 500ms to Firebase
- **Reliability:** Stable connection for 30+ seconds

## 🔗 Additional Resources

- **GitHub Issues:** [Common Problems](https://github.com/thef4tdaddy/violet-vault/issues?q=label%3Abug)
- **Network Debugging Case Study:** [Issue #516](https://github.com/thef4tdaddy/violet-vault/issues/516)
- **Feature Requests:** [Enhancement Label](https://github.com/thef4tdaddy/violet-vault/issues?q=label%3Aenhancement)

---

**Last Updated:** August 25, 2025  
**Version:** 1.8.0+
