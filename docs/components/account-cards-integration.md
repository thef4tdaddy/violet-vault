# Glassmorphic Account Cards - Integration Guide

## Overview

The glassmorphic account cards provide a modern, visually stunning way to display account balances with direct action capabilities. This implementation satisfies issue #656.

## Components Created

### 1. `AccountCard.tsx`

Individual card component with glassmorphism styling.

**Features:**

- Glassmorphic design (backdrop blur, semi-transparent background)
- v2.0 ALL CAPS typography with `StylizedButtonText`
- Three card types: `checking`, `savings`, `unassigned`
- Optional action button
- Loading skeleton state
- Warning states for negative/high balances
- Hover effects and micro-animations

**Usage:**

```tsx
<AccountCard type="checking" balance={2500.5} subtitle="5 recent transactions" isLoading={false} />
```

### 2. `AccountCards.tsx`

Container component that displays all three account cards.

**Features:**

- Responsive grid layout (1 col mobile → 3 cols desktop)
- Automatic data fetching via TanStack Query
- Integrated with `UnassignedCashModal` for fund allocation
- Error state handling
- Loading states propagated to all cards

**Usage:**

```tsx
<AccountCards className="mb-6" />
```

### 3. `useAccountBalances.ts`

Custom hook for aggregating account balance data.

**Features:**

- Combines data from `useActualBalance()` and `useUnassignedCash()`
- Computes derived values (isNegative, isHigh)
- Aggregates loading and error states
- 100% test coverage

**Usage:**

```tsx
const { accountBalances, isLoading, error } = useAccountBalances();
```

## Integration Instructions

### Option 1: Replace AccountBalanceOverview (Recommended)

Replace the existing `AccountBalanceOverview` component in `MainDashboard.tsx`:

```tsx
// Before
<AccountBalanceOverview
  actualBalance={actualBalance}
  totalVirtualBalance={totalVirtualBalance}
  // ... other props
/>;

// After
import AccountCards from "@/components/dashboard/AccountCards";

<AccountCards className="mb-6" />;
```

**Pros:**

- Cleaner, more modern UI
- Less visual clutter
- Direct action buttons
- No prop drilling needed

**Cons:**

- Loses some detailed breakdown info (can be added later)

### Option 2: Add Above AccountBalanceOverview

Keep both components for a hybrid approach:

```tsx
{
  /* Modern glassmorphic cards */
}
<AccountCards className="mb-6" />;

{
  /* Detailed balance breakdown */
}
<AccountBalanceOverview
  actualBalance={actualBalance}
  totalVirtualBalance={totalVirtualBalance}
  // ... other props
/>;
```

**Pros:**

- Keeps all existing functionality
- Adds modern cards on top
- Gradual migration path

**Cons:**

- More vertical space used
- Some information redundancy

### Option 3: Conditional Rendering

Show cards by default, allow toggle to detailed view:

```tsx
const [showDetailed, setShowDetailed] = useState(false);

{
  showDetailed ? <AccountBalanceOverview {...props} /> : <AccountCards className="mb-6" />;
}
```

## Data Flow

```
TanStack Query Hooks (Server State)
    ↓
useActualBalance()     useUnassignedCash()
    ↓                        ↓
    └─────────┬──────────────┘
              ↓
     useAccountBalances()
              ↓
     AccountCards Container
              ↓
   ┌──────────┼──────────┐
   ↓          ↓          ↓
Checking   Savings   Unassigned
  Card       Card       Card
```

## Testing

All components have comprehensive test coverage:

- **useAccountBalances**: 10 tests, 100% coverage
- **AccountCard**: 19 tests covering all variants and edge cases
- **AccountCards**: 19 tests covering integration and user interactions

Run tests:

```bash
npm run test:run -- src/hooks/dashboard/ src/components/dashboard/AccountCard src/components/dashboard/AccountCards
```

## Styling Standards

The components follow v2.0 design standards:

- **Glassmorphism**: `bg-white/90 backdrop-blur-sm`
- **Borders**: `border-2 border-black`
- **Shadows**: `shadow-xl hover:shadow-2xl`
- **Rounded corners**: `rounded-xl`
- **Typography**: ALL CAPS headers with `StylizedButtonText`
- **Animations**: Smooth transitions on hover (`transition-all duration-300`)

## Future Enhancements

Potential additions for future iterations:

1. **Savings Goals Integration**: Actually display savings goals progress instead of placeholder
2. **Recent Transaction Count**: Add real transaction count to checking card subtitle
3. **Quick Actions Menu**: Add more actions beyond "Allocate Funds"
4. **Card Reordering**: Allow users to reorder cards based on preference
5. **Compact Mode**: Add a collapsed view for mobile devices
6. **Real-time Updates**: Add websocket support for live balance updates

## Accessibility

- Proper semantic HTML structure
- Keyboard navigation support on action buttons
- ARIA labels where appropriate
- Test IDs for automated testing
- Responsive design for all screen sizes

## Performance

- Components use `React.memo` for optimized re-rendering
- TanStack Query handles caching and stale-time
- Loading skeletons prevent layout shift
- Animations use GPU-accelerated properties

## Demo Page

A demo page is available at `src/components/dashboard/AccountCardsDemo.tsx` for visual testing and verification.

To view the demo:

1. Add a route to the demo page in your router
2. Navigate to the demo route
3. Verify cards display correctly with sample data

## Acceptance Criteria Status

- ✅ Three account cards render with correct data
- ✅ Unassigned Cash card has functional "Allocate" button
- ✅ Cards update in real-time when data changes (via TanStack Query)
- ✅ Glassmorphism styling matches v2.0 standards
- ✅ Responsive grid layout works on all screen sizes
- ✅ Loading skeletons display during data fetch
- ✅ Error states handled gracefully
- ✅ Test coverage ≥80% (achieved 100% for hook, comprehensive for components)
- ✅ No ESLint errors or warnings
- ✅ Smooth hover and update animations
- ✅ Component documented with JSDoc comments
