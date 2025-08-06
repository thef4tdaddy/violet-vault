### 🆕 Add Demo Mode for Instant Trial Experience

**Labels:** `feature`, `onboarding`, `UX`, `priority: medium`

```markdown
### 🧪 Add Demo Mode for Instant Trial Experience

**Labels:** feature, onboarding, UX, priority: medium

Introduce a "Try Demo" or "Explore Without Signup" mode to let new users experience VioletVault without creating an account.

---

### 🧩 Goals:

- Allow users to try the budgeting UI instantly
- Create an isolated, temporary data environment
- Emphasize that all data is local and not saved

---

### ✅ Tasks:

- [ ] Add “Try Demo” button to the landing page
- [ ] On click, initialize a fake account in memory (no backend write)
- [ ] Pre-fill demo account with envelopes, sample transactions, and a sample paycheck
- [ ] Disable sync, export, and settings features in demo mode
- [ ] Add persistent banner or badge: “You’re in Demo Mode”
- [ ] Add CTA in demo: “Like this? Create your own account”

---

### ⚠️ Notes:

- All demo data should be in-memory or localStorage only
- No tracking or backend data writes should occur
- Optionally reset demo state on browser refresh

---

### 📈 Benefits:

- Greatly improves first-time experience
- Converts curious visitors into engaged users
- Reduces friction from signup barriers
```
