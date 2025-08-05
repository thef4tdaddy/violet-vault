### 🆕 Implement Slide-Up Modals for Mobile Flows
**Labels:** `UX`, `mobile`, `motion`

```markdown
### Implement Slide-Up Modals for Mobile Flows
**Labels:** `UX`, `mobile`, `motion`

Convert modal dialogs to slide-up bottom sheets on mobile.

### Tasks:
- [ ] Refactor paycheck flow modal to slide up from the bottom
- [ ] Add swipe-to-dismiss functionality
- [ ] Use shadows and rounded corners for native look
- [ ] Ensure accessibility and keyboard dismissal
```

---
### 🆕 Add Floating Action Button (FAB) with Contextual Actions
**Labels:** `UI`, `mobile`, `enhancement`

```markdown
### Add Floating Action Button (FAB) with Contextual Actions
**Labels:** `UI`, `mobile`, `enhancement`

Create a FAB that adapts based on the current screen context.

### Tasks:
- [ ] FAB on dashboard → 'Add Paycheck'
- [ ] FAB on envelopes → 'Create Envelope'
- [ ] Animate FAB with Tailwind/Framer Motion
- [ ] Support long-press or expand for multiple quick actions
```

---
### 🆕 Add Pull-to-Refresh for Dashboard and Envelope Views
**Labels:** `UX`, `gesture`, `sync`

```markdown
### Add Pull-to-Refresh for Dashboard and Envelope Views
**Labels:** `UX`, `gesture`, `sync`

Support pull-to-refresh gesture to sync data.

### Tasks:
- [ ] Integrate `react-pull-to-refresh` on main views
- [ ] Show loading indicator with budget branding (e.g., bouncing envelope)
- [ ] Trigger sync for bank balance and transaction data
```

---
### 🆕 Design Onboarding Hints and First-Time Tutorial for Mobile
**Labels:** `UX`, `onboarding`, `mobile`

```markdown
### Design Onboarding Hints and First-Time Tutorial for Mobile
**Labels:** `UX`, `onboarding`, `mobile`

Introduce touch-friendly hints for new users.

### Tasks:
- [ ] Highlight Add Paycheck button on first launch
- [ ] Add checklist or progress indicator
- [ ] Save 'onboarded' flag in Zustand or localStorage
- [ ] Consider contextual prompts on empty states
```

---
### 🆕 Reposition Critical UI into Thumb Zones
**Labels:** `UX`, `design`, `mobile`

```markdown
### Reposition Critical UI into Thumb Zones
**Labels:** `UX`, `design`, `mobile`

Improve one-handed usability by repositioning high-priority actions.

### Tasks:
- [ ] Move profile switcher to bottom nav or bottom sheet
- [ ] Place frequent buttons within lower third of screen
- [ ] Adjust padding and spacing on smaller viewports
```

---
### 🆕 Add Haptic Feedback for Key Interactions
**Labels:** `PWA`, `native-like`, `Capacitor`

```markdown
### Add Haptic Feedback for Key Interactions
**Labels:** `PWA`, `native-like`, `Capacitor`

Use device vibration to provide tactile feedback.

### Tasks:
- [ ] Add `navigator.vibrate(10)` to confirm buttons
- [ ] Use Capacitor Haptics plugin for native wrappers
- [ ] Vibrate on successful assignment, transfer, and paycheck processing
```

---
