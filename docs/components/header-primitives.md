# Header Primitives Documentation

This document showcases the newly created header primitive components: `PageHeader` and `SectionHeader`.

## Components Created

### 1. PageHeader

**Location**: `src/components/primitives/headers/PageHeader.tsx`

**Purpose**: Reusable page-level header component for main page titles.

**Features**:

- Icon + Title/Subtitle on left side
- Action buttons on right side
- Optional breadcrumb navigation
- Responsive layout (stacks on mobile)
- Tailwind CSS styling

**Props**:

```typescript
interface PageHeaderProps {
  title: string; // Main page title
  subtitle?: string; // Optional subtitle/description
  icon?: string; // Icon name from lucide-react
  breadcrumbs?: Array<{
    // Breadcrumb navigation
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode; // Action buttons or controls
  className?: string; // Custom className
}
```

**Usage Examples**:

```tsx
// Full example with all features
<PageHeader
  title="Bill Manager"
  subtitle="Manage your scheduled expenses"
  icon="Receipt"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Bills" }
  ]}
  actions={
    <>
      <Button variant="secondary" size="sm">Search</Button>
      <Button variant="primary" size="sm">Add Bill</Button>
    </>
  }
/>

// Simple example (title only)
<PageHeader title="Analytics Dashboard" />

// With icon and subtitle
<PageHeader
  title="Transaction History"
  subtitle="View all your financial transactions"
  icon="History"
/>
```

---

### 2. SectionHeader

**Location**: `src/components/primitives/headers/SectionHeader.tsx`

**Purpose**: Reusable section-level header for content sections within a page.

**Features**:

- Title + optional count badge on left
- Action buttons on right
- Bottom border divider
- Compact styling
- Consistent spacing

**Props**:

```typescript
interface SectionHeaderProps {
  title: string; // Section title
  count?: number; // Optional count badge
  actions?: React.ReactNode; // Action buttons or controls
  className?: string; // Custom className
}
```

**Usage Examples**:

```tsx
// With count and actions
<SectionHeader
  title="Upcoming Bills"
  count={5}
  actions={<Button size="sm" variant="ghost">View All</Button>}
/>

// Simple (title only)
<SectionHeader title="Recent Transactions" />

// With count badge
<SectionHeader title="Overdue Items" count={3} />

// With zero count
<SectionHeader title="Active Subscriptions" count={0} />

// With multiple actions
<SectionHeader
  title="Account Settings"
  actions={
    <>
      <Button variant="ghost" size="sm" icon="Edit" />
      <Button variant="ghost" size="sm" icon="Trash2" />
    </>
  }
/>
```

---

## Test Coverage

Both components have comprehensive test coverage:

- **PageHeader**: 100% coverage (21 tests)
- **SectionHeader**: 100% coverage (24 tests)

Test files located at:

- `src/components/primitives/headers/__tests__/PageHeader.test.tsx`
- `src/components/primitives/headers/__tests__/SectionHeader.test.tsx`

---

## Components to Replace

These primitives can replace 20+ duplicate header implementations:

### Page-Level Headers

- `bills/BillManagerHeader.tsx`
- `analytics/dashboard/AnalyticsDashboardHeader.tsx`
- `analytics/performance/PerformanceHeader.tsx`
- `accounts/AccountsHeader.tsx`
- `debt/DebtDashboardHeader.tsx`
- `transactions/ledger/TransactionLedgerHeader.tsx`
- `settings/archiving/ArchivingHeader.tsx`
- `receipts/components/ReceiptScannerHeader.tsx`
- `automation/AutoFundingViewComponents.tsx` (ViewHeader)
- `history/viewer/HistoryHeader.tsx`

### Section-Level Headers

- Various section headers in dashboard components
- Modal headers that don't need special modal styling
- Card headers within larger components

---

## Design System Consistency

### PageHeader Styling

- **Title**: `text-2xl font-bold text-slate-900`
- **Subtitle**: `text-sm text-slate-600 mt-1`
- **Icon**: 32px (h-8 w-8), colored with purple background glow
- **Breadcrumbs**: Small text with chevron separators
- **Layout**: Responsive flexbox (stacks on mobile)

### SectionHeader Styling

- **Title**: `text-lg font-semibold text-slate-900`
- **Count Badge**: `bg-purple-100 text-purple-700` rounded pill
- **Divider**: `border-b-2 border-slate-100 pb-3 mb-4`
- **Layout**: Horizontal flexbox with space-between

---

## Barrel Exports

Components are exported through barrel files for clean imports:

```typescript
// From src/components/primitives/headers/index.ts
export { PageHeader, SectionHeader } from "./headers";
export type { PageHeaderProps, SectionHeaderProps } from "./headers";

// Usage in components
import { PageHeader, SectionHeader } from "@/components/primitives";
```

---

## Next Steps

1. ✅ Components created with full TypeScript types
2. ✅ Comprehensive tests written (100% coverage)
3. ✅ Barrel exports configured
4. ✅ Linting and formatting passing
5. ✅ TypeScript compilation successful
6. ✅ Build verification successful
7. 🔄 Ready for integration into existing components
8. 🔄 Ready for code review

---

## Integration Guide

To replace an existing header with these primitives:

### Before (BillManagerHeader example):

```tsx
<BillManagerHeader
  isEditLocked={isEditLocked}
  currentEditor={currentEditor}
  isSearching={isSearching}
  searchNewBills={searchNewBills}
  handleAddNewBill={handleAddNewBill}
/>
```

### After (Using PageHeader):

```tsx
<PageHeader
  title="Bill Manager"
  subtitle="Track and manage your recurring bills and payments"
  icon="FileText"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Bills" }]}
  actions={
    <>
      <Button onClick={searchNewBills} disabled={isSearching} variant="secondary">
        {isSearching ? "Searching..." : "Discover Bills"}
      </Button>
      <Button onClick={handleAddNewBill}>Add Bill</Button>
    </>
  }
/>
```

Benefits:

- ✅ Consistent styling across all pages
- ✅ Reduced code duplication
- ✅ Easier to maintain and update
- ✅ Better accessibility
- ✅ Responsive by default
- ✅ Full test coverage
