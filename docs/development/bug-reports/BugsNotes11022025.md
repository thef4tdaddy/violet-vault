# VioletVault - Testing Feedback

- **Date:** 11/2/2025
- **Device:** iPad mini

---

## Onboarding

- [x] **Security Warning:** Condense the first-load security warning to fit on a single, non-scrollable page.

## Envelope

- [x] **Layout (Mobile):** Stack "Smart suggestion" and "auto funding" elements vertically on mobile screens, as they currently don't fit. _(Fixed: 53894d3c)_

## Savings

- [x] **Bug:** Add the summary cards for savings goals back to the page (they were removed during a duplicate cleanup). _(Fixed: 53894d3c)_
- [x] **Theme:** Update the Savings page to the new, standardized color scheme.

## Debts

- [x] **Tabs:**
  - [x] Remove the white background from the tabs.
  - [x] Place a hard border _below_ the tabs (above the main content area) to make them look like physical tabs.
- [x] **"Your Debt" Section:**
  - [x] Add a hard black border around this section.
  - [x] Fix the letter-spacing in the "Your Debt" header.
- [x] **Buttons:** Change the "Filters" and "Sorting" expansion buttons to the light purple color.

## Transactions

- [x] **Header:**
  - [x] Increase the size of the transaction ledger header.
  - [x] Adjust header spacing.
  - [ ] **Task:** Define and apply a standard header size across all pages for consistency.
- [x] **Filters:** Implement the expandable filter UI from the "Debts" page.
- [x] **Buttons (Mobile):** Address button text visibility on smaller screens.
- [x] **Button Layout:**
  - [x] Move "Import File" and "Add Transaction" buttons to be right-justified.
  - [x] Layout (Large Screen): Place buttons side-by-side.
  - [x] Layout (Small Screen): Stack buttons vertically.

## Bill Manager

- [x] **Header:** Update the header text and icon.
- [ ] **Filters:** Implement the standard collapsible filter UI.
- [ ] **Task:** Investigate the purpose of the blue dot in the second section.

## Paycheck Processor

- [x] **Header:** Move the "Add Paycheck" header outside of the main white content area.
- [x] **Header:** Spread out the text of the header (adjust letter-spacing or padding).

## Analytics

- [ ] **Task:** Populate the page with test data for a proper review.
- [ ] **Header:** Update the header text.
- [ ] **Text:** Update the subtext to use the standardized text style.
- [ ] **Layout:** Add the standard white sub-section area.
- [ ] **Export Button:** Update the "Export" button to use the standard button style.
- [ ] **Filters:** Convert the "Last Month / Filter" UI into the standardized expandable filter.

## Header (App-wide)

- [ ] **"Sync Healthy" Button:**
  - [ ] **Task:** Re-evaluate the header menu structure, as this button's behavior (opening Security Settings) is confusing.
  - [ ] **Suggestion:** Move the green sync status dot to be a permanent part of the header.
  - [ ] **Suggestion:** Remove the "Sync Healthy" button and merge its options into the main "Settings" menu.
- [ ] **Profile Dropdown (Bug):** Fix the z-index so the dropdown appears _in front_ of the main navigation menu.
- [ ] **Profile Dropdown (Bug):** Fix the positioning so the modal appears in the center of the screen, not in the header.

## Summary Cards

- [x] **Sizing:** Fix inconsistent sizing between cards ("Total Cash" & "Unassigned Cash" vs. "Savings Total" & "Biweekly").
- [x] **Text Layout:** Move the "Click to distribute" text to its own line/row on both cards.
- [ ] **Task:** Investigate and verify the calculation being used for the "Total Allocation" value.

## Settings Menu

- [x] **Modal:** Remove the extra grey border around the outside of the modal.
- [x] **Buttons:**
  - [x] Change sub-menu buttons from grey to light purple for better visibility.
  - [x] Standardize the "Close" (X) button (e.g., make it red for a "close" action).

- [ ] **General Settings:**
  - [ ] Change the "Cloud Sync" button text from faded to a dark color.
  - [ ] **Bug:** Fix the sync status switch where the "On" text appears outside the switch boundary.

- [ ] **Account Settings:**
  - [ ] **Suggestion:** Move "Profile Settings" into this section.
  - [ ] Standardize all buttons in this section (uniform size, black border, non-grey text).

- [ ] **Security Settings:**
  - [ ] **Task:** Merge settings from the "Sync Healthy" button's menu here.
  - [ ] **Bug:** Fix the "Local Data Security" button modal (it flashes and disappears instantly).
  - [ ] Standardize all buttons in this section.

- [ ] **Data:**
  - [ ] Standardize all buttons in this section.
  - [ ] **Suggestion:** Remove the "Dev Tools" button (it's redundant with the main "Dev Tools" menu).

- [ ] **Notifications:**
  - [ ] **Task:** Add a notice stating that notifications are not yet implemented.
  - [ ] **Bug:** Fix the "Advanced Debug Info" button (it leads to a blank white screen).

- [ ] **Dev Tools:**
  - [ ] **Task:** Ensure this menu is _not_ available in production builds (unless an admin mode is active).
  - [ ] **Task:** Ensure this menu _is_ available in development builds.
  - [ ] Standardize all buttons in this section.
