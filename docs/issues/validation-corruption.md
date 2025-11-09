# Validation Cache Corruption Lockout (Mobile)

- **Status:** Pending
- **Reported by:** Customer (mobile Safari/Chrome)
- **Severity:** High (blocks login/session recovery on mobile)

## Summary

On mobile, the “[Corrupted Validation Data Detected]” modal surfaces repeatedly after importing the
enhanced seed data. Clearing the corrupted payload does not persist; the modal returns on the very
next navigation, and the session eventually forces a logout.

## Reproduction (current best guess)

1. Launch the app on a mobile viewport (Chrome dev tools, Safari remote inspector, or physical
   device).
2. Import backup data using the enhanced seed JSON.
3. Navigate between dashboard analytics, bills, or transactions.
4. Background the tab/app (e.g., switch to Notes) for 10–20 seconds, then return.
5. Observe the repeated corruption modal and inability to re-authenticate after dismissal.

## Expected Behaviour

- Validation cache refresh should succeed after clearing local corruption.
- The modal should only appear once per corruption event and never block sign-in on mobile after the
  user accepts the recovery flow.

## Actual Behaviour

- The modal reappears immediately after clearing.
- IndexedDB/session rehydration appears to fail silently, leaving the user in a perpetual lockout.
- Eventually the auth session expires and re-login fails (likely due to missing rehydrated secrets).

## Suspected Scope

- Mobile-specific focus/blur handling in `validationCache` or `localKeyRing` layers.
- IndexedDB transaction rollback when the tab loses visibility.
- Import flow may be populating stale validation timestamps that never advance on mobile.

## Debug Tasks

- [ ] Reproduce with remote mobile debugging while capturing IndexedDB operations.
- [ ] Audit `validationCache.syncFromCloud` and local storage writes for mobile throttling.
- [ ] Confirm whether `onVisibilityChange` handlers prematurely clear validation keys.
- [ ] Capture the modal telemetry payload (operation name, error codes) for a failing run.
- [ ] Add resilience (retry/backoff) around the validation data decrypt + import path.

## Attachments / Notes

- User reports the issue triggered immediately after importing test data and multitasking.
- No console logs yet; user will attempt to capture once they have dev tools access.
- Relates to prioritised bug list item: “Corrupted Validation Data Detected (OperationError)”.

---

_Created automatically by GPT-5 Codex on behalf of the product team._ 

