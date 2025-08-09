### 🆕 Audit Highlight.io Config for Privacy and Add Disable Option

**Labels:** `privacy`, `error monitoring`, `highlight.io`

```markdown
### 🛡️ Audit Highlight.io Config for Privacy and Add Disable Option

**Labels:** privacy, error monitoring, highlight.io

Ensure Highlight.io is configured to respect user privacy and is disabled when Local-Only Mode is enabled.

---

### ✅ Tasks:

- [ ] Use `maskAllInputs: true` in Highlight config
- [ ] Ensure no financial or user-identifying data is sent
- [ ] Add setting toggle to disable Highlight session collection
- [ ] Automatically skip Highlight init if in Local-Only Mode
- [ ] Log internal usage of Highlight without exposing user info
- [ ] Document Highlight use in `/privacy` or `/about`

---

### 📎 Example Disclosure:

“We use Highlight.io to monitor bugs and crashes. All sessions are anonymized and redacted. You can disable this in Settings.”
```
