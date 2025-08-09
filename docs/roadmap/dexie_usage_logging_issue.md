### 🆕 Implement Dexie-Based Usage Logging with Opt-In Upload

**Labels:** `analytics`, `privacy`, `feature`

```markdown
### 📊 Implement Dexie-Based Usage Logging with Opt-In Upload

**Labels:** analytics, privacy, feature

Log key user actions using Dexie locally and optionally allow the user to upload anonymized summaries to a backend or Discord webhook.

---

### ✅ Tasks:

- [ ] Create `analyticsEvents` table in Dexie
- [ ] Define event schema: `{ type, timestamp, payload? }`
- [ ] Build `logEvent()` utility to record actions like:
  - Paycheck flow started/completed
  - Envelope created
  - Demo mode started
- [ ] Store data locally by default (no transmission)
- [ ] Add opt-in toggle in settings: “Help improve VioletVault anonymously”
- [ ] On opt-in, allow user to send aggregated, anonymized data
- [ ] Batch and send JSON summary via webhook or Firebase if enabled
- [ ] Add privacy section explaining what’s tracked

---

### ⚠️ Notes:

- No user ID, no IP, no fingerprinting
- Must clearly disclose and require opt-in
```
