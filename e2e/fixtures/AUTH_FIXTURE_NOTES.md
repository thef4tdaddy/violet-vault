# E2E Auth Fixture Investigation Notes

## Problem Statement
The e2e smoke tests for Phase 2.1 were failing because the auth fixture couldn't bypass the authentication screen when navigating to `/demo/dashboard`.

## Root Cause Analysis

### Issue 1: Missing Demo API
The demo-factory API (`/api/demo-factory`) returns 404 in the test environment because the Go backend isn't running during Playwright tests.

**Solution:** Mock the API response with empty data arrays in the fixture.

### Issue 2: Authentication Flow Bug
The authentication flow has 3 steps:
1. **Step 1**: Enter master password → Click "Continue"
2. **Step 2**: Enter username + select color → Click "Start Tracking"
3. **Step 3**: View share code → Click "Create My Budget"

**Critical Bug:** After clicking "Start Tracking" in Step 2, the page reloads and resets back to Step 1. This happens because:
- The `handleStartTrackingClick` function in `useUserSetup.ts` tries to generate a share code
- If this fails or encounters an error, the form resets
- The page reload clears all form state

### Issue 3: LocalStorage Bypass Doesn't Work
Attempted to bypass auth by pre-populating localStorage with mock user profile, but the app doesn't recognize this and still shows the setup screen.

## Current Solution

The fixture now:
1. ✅ Navigates to `/demo/dashboard`
2. ✅ Mocks the `/api/demo-factory` endpoint to prevent JSON parse errors
3. ✅ Detects the setup screen
4. ✅ Completes Step 1 (password entry)
5. ✅ Completes Step 2 (username entry)
6. ⚠️  **Step 3 transition fails** - page reloads back to Step 1

## Test Status
- **Passing Steps**: Navigation, API mocking, Step 1, Step 2
- **Failing Step**: Step 2 → Step 3 transition (form resets)
- **Result**: Tests still fail because dashboard never loads

## Recommended Next Steps

### Option 1: Fix the App Bug (Recommended)
Investigate why `handleStartTrackingClick` in `/src/hooks/auth/useUserSetup.ts` causes a page reload:
- Check share code generation logic
- Add error handling to prevent form reset
- Ensure demo mode properly initializes before auth flow

### Option 2: Update Test Expectations
Change tests to use `/demo` route instead of `/demo/dashboard`:
- `/demo` loads the DemoPage component without requiring auth
- Tests would need to be updated to match the marketing demo interface

### Option 3: Implement Auth Bypass in App
Add a special bypass for E2E tests:
```typescript
if (window.location.search.includes('e2eBypass=true')) {
  // Skip auth and use mock user
}
```

## Files Modified
- `e2e/fixtures/auth.fixture.ts` - Added API mocking and auth flow handling

## Related Code
- `/src/hooks/auth/useUserSetup.ts` - Authentication flow logic
- `/src/components/auth/UserSetup.tsx` - Setup UI component  
- `/src/services/demo/demoDataService.ts` - Demo data loading
- `/src/utils/platform/demo/demoModeDetection.ts` - Demo mode detection

## Debugging Commands
```bash
# Run failing test
npx playwright test e2e/smoke/app-basic-flow.spec.ts:10 --project=chromium --timeout=90000 --retries=0

# Run with headed browser (requires xvfb in CI)
xvfb-run npx playwright test e2e/smoke/app-basic-flow.spec.ts:10 --project=chromium --headed

# View trace
npx playwright show-trace test-results/.../trace.zip
```

## Test Output Example
```
✓ Navigated to /demo/dashboard
⚠ Setup screen detected - completing authentication
✓ Password filled
✓ Continue clicked
✓ Step 2 loaded
✓ Username filled
✓ Start Tracking clicked
⚠️  Step 3 did not appear - may have navigated or encountered error
⚠ Budget ID not found - waiting longer
❌ Test failed: Main content not visible
```

## Conclusion
The fixture successfully navigates and completes Steps 1-2 of the auth flow, but cannot complete Step 3 due to an application bug that causes the form to reset. The app's authentication flow needs to be fixed to properly handle the Step 2 → Step 3 transition in demo mode.
