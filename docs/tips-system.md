# Tips & Hints System

A comprehensive contextual help system that provides users with timely tips and hints throughout the application.

## Overview

The Tips & Hints system delivers smart, context-aware guidance to users based on their experience level and current activities. Tips are categorized, prioritized, and can be easily dismissed or revisited by users.

## Architecture

### Components

```
src/
├── domain/schemas/
│   └── tip.ts                      # Zod schemas and TypeScript types
├── constants/
│   └── tips.ts                     # Central tip configuration
├── services/
│   └── tipService.ts               # Business logic for tips
├── stores/ui/
│   └── tipStore.ts                 # Zustand store for UI state
├── hooks/tips/
│   └── useUserStateForTips.ts      # Hook to get user state for filtering
└── components/tips/
    ├── TipCard.tsx                 # Individual tip display
    ├── TipContainer.tsx            # Context-aware tip container
    └── TipSettings.tsx             # Settings UI for tip management
```

## Features

### 1. Tip Categories

- **Onboarding**: Welcome messages and first-time setup guidance
- **Budgeting**: Envelope system tips and budget management
- **Debt Management**: Debt payoff strategies and extra payment advice
- **Bills**: Recurring bill setup and automation tips
- **Transactions**: Transaction tracking best practices
- **Advanced Features**: Auto-funding, cloud sync, etc.
- **Best Practices**: Weekly reviews, emergency funds
- **Security**: Backup and recovery phrase reminders

### 2. Priority Levels

- **Critical**: Must-see tips (e.g., security warnings)
- **High**: Important tips for new users
- **Medium**: Helpful guidance
- **Low**: Nice-to-know information

### 3. Smart Conditions

Tips can be shown based on:

- User maturity score (0-100)
- Whether user has envelopes, transactions, debts, bills, paychecks
- Days since signup
- Whether user is new

### 4. User Maturity Scoring

Progressive disclosure system that shows tips based on user experience:

- **0-20**: New user (basic onboarding tips)
- **20-40**: Getting started (first features)
- **40-60**: Intermediate (bills, debts)
- **60-80**: Advanced (automation, optimization)
- **80-100**: Expert (best practices, advanced strategies)

## Usage

### Displaying Tips in a Component

```tsx
import TipContainer from "@/components/tips/TipContainer";
import { TipContext } from "@/domain/schemas/tip";
import { useUserStateForTips } from "@/hooks/tips/useUserStateForTips";

const MyComponent = () => {
  const userState = useUserStateForTips();

  return (
    <div>
      {/* Your content */}

      {/* Show up to 2 tips for this context */}
      <TipContainer
        context={TipContext.DEBT}
        userState={userState}
        maxTips={2}
        compact={false} // or true for compact display
      />
    </div>
  );
};
```

### Available Contexts

- `TipContext.DASHBOARD` - Main dashboard
- `TipContext.ENVELOPES` - Envelope management
- `TipContext.TRANSACTIONS` - Transaction views
- `TipContext.DEBT` - Debt tracking
- `TipContext.BILLS` - Bill management
- `TipContext.SETTINGS` - Settings pages
- `TipContext.ONBOARDING` - Onboarding flow
- `TipContext.QUICK_ADD` - Quick add modals
- `TipContext.INSIGHTS` - Analytics and insights

### Adding New Tips

Edit `src/constants/tips.ts`:

```typescript
{
  id: "my-new-tip",
  category: TipCategory.BUDGETING,
  priority: TipPriority.MEDIUM,
  context: [TipContext.ENVELOPES],
  title: "Tip Title (optional)",
  content: "Tip content that will be displayed to users",
  icon: "Lightbulb", // Lucide icon name
  dismissible: true,
  showOnce: false, // If true, only shows once even if restored
  minUserMaturity: 30, // 0-100 scale
  conditions: {
    hasEnvelopes: true, // Only show if user has envelopes
    hasTransactions: false, // Only show if user doesn't have transactions
  },
}
```

### User Settings

Users can manage tips in Settings > Tips & Hints:

- Toggle tips globally on/off
- View statistics (viewed, dismissed, maturity score)
- Restore dismissed tips
- Reset all tip preferences

## Service API

### TipService Methods

```typescript
import { tipService } from "@/services/tipService";

// Get all tips
const allTips = tipService.getAllTips();

// Get tips for specific context
const dashboardTips = tipService.getTipsForContext(TipContext.DASHBOARD);

// Get specific tip
const tip = tipService.getTip("onboarding-welcome");

// Check if tip should be shown
const shouldShow = tipService.shouldShowTip(tip, preferences, userState);

// Get applicable tips (filtered and sorted)
const applicable = tipService.getApplicableTips(TipContext.DEBT, preferences, userState);

// Mark tip as viewed
const updatedPrefs = tipService.markTipViewed(preferences, "tip-id");

// Dismiss tip
const updatedPrefs = tipService.dismissTip(preferences, "tip-id");

// Calculate user maturity score
const score = tipService.calculateUserMaturityScore(userState);
```

## Store API

### Using the Tip Store

```typescript
import useTipStore from "@/stores/ui/tipStore";

const MyComponent = () => {
  const {
    preferences,
    setTipsEnabled,
    markTipViewed,
    dismissTip,
    undismissTip,
    updateUserMaturityScore,
    isTipDismissed,
    isTipViewed,
  } = useTipStore();

  // Toggle tips
  const handleToggle = () => {
    setTipsEnabled(!preferences.tipsEnabled);
  };

  // Check if dismissed
  if (isTipDismissed("my-tip-id")) {
    return null;
  }

  return (
    <div>
      <button onClick={() => dismissTip("my-tip-id")}>
        Dismiss Tip
      </button>
    </div>
  );
};
```

## Testing

### Running Tests

```bash
# Run all tip tests
npm run test:run -- src/services/__tests__/tipService.test.ts
npm run test:run -- src/stores/ui/__tests__/tipStore.test.ts

# All tests
npm run test:run
```

### Test Coverage

- 19 tests for TipService
- 21 tests for TipStore
- All tests passing

## Best Practices

### For Developers

1. **Keep tips concise**: 1-2 sentences maximum
2. **Use appropriate contexts**: Tips should be relevant to current view
3. **Set proper conditions**: Don't show advanced tips to new users
4. **Use icons**: Visual cues help users identify tip types
5. **Test conditions**: Ensure tips show at the right time

### For Content

1. **Be helpful, not annoying**: Tips should provide value
2. **Use action-oriented language**: "Try this..." instead of "You could..."
3. **Provide context**: Explain why the tip matters
4. **Link to actions**: Use actionLabel for next steps when appropriate

## Integration Checklist

When adding tips to a new area:

- [ ] Import `TipContainer` and `TipContext`
- [ ] Import and call `useUserStateForTips` hook
- [ ] Add `<TipContainer>` component at appropriate location
- [ ] Choose correct context from `TipContext`
- [ ] Set appropriate `maxTips` (usually 1-2)
- [ ] Add relevant tips to `tips.ts` configuration
- [ ] Test that tips show/hide based on conditions
- [ ] Verify dismissal works correctly

## Future Enhancements

- [ ] A/B testing framework for tip effectiveness
- [ ] Analytics for tip views and dismissals
- [ ] Tip effectiveness scoring
- [ ] Dynamic tip loading from backend
- [ ] Tip scheduling (show at optimal times)
- [ ] Tip campaigns for feature launches
- [ ] User feedback on tip helpfulness

## Related Files

- Issue: `feat: implement comprehensive tips/hints system with onboarding integration`
- Tests:
  - `src/services/__tests__/tipService.test.ts`
  - `src/stores/ui/__tests__/tipStore.test.ts`
- Integration Examples:
  - `src/components/debt/DebtStrategies.tsx`
  - `src/components/analytics/insights/FinancialInsights.tsx`
  - `src/components/settings/SettingsDashboard.tsx`
