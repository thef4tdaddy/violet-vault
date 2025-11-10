# Component Catalog

## Summary Card Components

**PageSummaryCard vs SummaryCard** – two distinct patterns:

1. **PageSummaryCard** (`src/components/ui/PageSummaryCard.jsx`)
   - **Usage**: Page-specific metrics (Bills, Debts, Transactions, etc.)
   - **Design**: Gradient backgrounds with icons
   - **Features**: Alert states, hover effects, interactive
   - **Colors**: Full gradient spectrum (red, blue, green, purple, etc.)

2. **SummaryCard** (`src/components/layout/SummaryCards.jsx`)
   - **Usage**: Main dashboard financial overview
   - **Design**: Solid color backgrounds
   - **Features**: Large values, click handlers for modals
   - **Colors**: Solid colors (purple, emerald, cyan, amber)

> Always use `PageSummaryCard` for consistent page-level metrics across the application.

## StandardTabs Component

`StandardTabs` (`src/components/ui/StandardTabs.jsx`) provides accessible, consistent tabbed navigation.

```jsx
import StandardTabs from "../ui/StandardTabs";

const tabs = [
  { id: "all", label: "All Bills", icon: FileText, count: 10, color: "gray" },
  { id: "overdue", label: "Overdue", icon: AlertTriangle, count: 2, color: "red" },
  { id: "upcoming", label: "Upcoming", icon: Clock, count: 5, color: "blue", disabled: false },
];

<StandardTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  size="md" // 'sm' | 'md' | 'lg'
  variant="colored" // 'underline' | 'pills' | 'buttons' | 'tabs' | 'colored'
/>;
```

**Features**

- High contrast text (`text-gray-700`) for inactive states
- Multiple variants: underline, pills, buttons, tabs, colored
- Pastel-to-bright transitions matching summary card colors
- Optional icon and count badge support
- Disabled state and hover transitions out of the box

**When to Use**

- Replace custom tab implementations across Bills, Debts, Transactions, etc.
- Default tab system for new feature work

## StandardFilters Component

`StandardFilters` (`src/components/ui/StandardFilters.jsx`) is the shared filtering surface.

```jsx
import StandardFilters from "../ui/StandardFilters";

<StandardFilters
  filters={filterOptions}
  onFilterChange={(key, value) => setFilterOptions((prev) => ({ ...prev, [key]: value }))}
  filterConfigs={[
    {
      key: "status",
      type: "select",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "category",
      type: "select",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Categories" },
        { value: "bills", label: "Bills" },
        { value: "income", label: "Income" },
      ],
    },
  ]}
  searchPlaceholder="Search items..."
  size="md" // 'sm' | 'md'
/>;
```

**Features**

- Glassmorphism styling with hard black borders
- "Filters" header with icon for instant recognition
- Built-in search field with icon and clear button
- Configurable selects and filter controls
- Clear-all button appears only when filters are active
- Plays nicely with `StandardTabs` (use `className="-mb-1"` to connect)

## Core Modal Components

- **EditLockIndicator** (`src/components/ui/EditLockIndicator.jsx`)
  - Multi-user edit locking display with timer
  - Full and compact variants
- **ConfirmModal** (`src/components/ui/ConfirmModal.jsx`)
  - Standardized confirmation dialog used via `useConfirm()`
  - Supports destructive red styling and accessibility guarantees
- **UniversalConnectionManager** (`src/components/ui/ConnectionDisplay.jsx`)
  - Unified connection UI for bills, envelopes, debts
  - Theme-aware (purple, blue, red) with consistent layout

## Form Components

- **Toast System** (`src/components/ui/Toast.jsx`)
  - Standard notification surface (success, error, warning, info)
  - Accessible ARIA handling with auto-dismiss

## Navigation & Layout

- **LoadingSpinner** (`src/components/ui/LoadingSpinner.jsx`)
  - Consistent loading indicator with multiple sizes and theme colors

## Extracted Modal Components

- **BillModalHeader** (`src/components/bills/BillModalHeader.jsx`)
  - Icon, title, close button with preserved visuals
- **BillFormFields** (`src/components/bills/BillFormFields.jsx`)
  - Aggregates bill form logic (icon selection, validation, connections)

## Usage Guidelines

1. Always prefer shared components over one-off implementations.
2. Maintain visual consistency by adhering to shared patterns.
3. Apply theme-aware palettes and standardized typography.
4. Prioritize accessibility—ARIA support and keyboard navigation are built-in.
5. Extract repeated UI/logic into reusable components following existing patterns.
6. Preserve pixel-perfect visuals when refactoring UI into shared pieces.

## Benefits

- Consistent user experience across pages and modals
- Reduced code duplication and faster maintenance
- Built-in accessibility compliance
- Smaller bundle footprint through reuse
- Easier testing thanks to centralized logic

## Refactoring Standards

When turning bespoke UI into shared components:

1. Maintain pixel-perfect appearance and behavior.
2. Avoid user-visible changes during refactors.
3. Group related fields/UI elements to keep components focused.
4. Follow existing extraction patterns for naming, structure, and styling.
5. Document component responsibilities with concise comments.
6. Fully test before and after refactoring to ensure no regressions.

## Summary Card Visual Standards

All page-specific summary cards follow the **bill card pattern**: gradient backgrounds, white text, and icon support.

```jsx
<div className="bg-gradient-to-br from-[color]-500 to-[color]-600 p-4 rounded-lg text-white">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[color]-100 text-sm">[Label]</p>
      <p className="text-2xl font-bold">[Value]</p>
      {subtext && <p className="text-xs text-[color]-100 mt-2">[Subtext]</p>}
    </div>
    <Icon className="h-8 w-8 text-[color]-200" />
  </div>
</div>
```

**Layout**

- `bg-gradient-to-br`: Bottom-right gradient adds depth.
- `p-4`: Consistent padding.
- `rounded-lg`: Standard border radius.
- `text-white`: High-contrast text baseline.

**Content Structure**

- Metric label (light color), value (bold white), optional subtext (light color).
- Icon positioned on the right (`h-8 w-8`).

**Color Palette**

Available gradient pairs: red, orange, amber, yellow, green, emerald, teal, cyan, blue, indigo, purple, pink, gray (all `500` → `600`).

**Text Color Mapping**

- Labels: `text-[color]-100`
- Icons: `text-[color]-200`
- Values: `text-white`
- Subtext: `text-[color]-100`

**Interactive States**

```jsx
<div
  className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105"
  onClick={handleClick}
>
  {/* Card content */}
</div>
```

**Alert States**

```jsx
<div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white ring-2 ring-white ring-opacity-50">
  {/* Card content */}
</div>
```

**Design Goals**

1. Visual distinction from dashboard summary cards.
2. Shared layout and sizing across pages.
3. High readability via strong contrast.
4. Clear information hierarchy: label → value → subtext.
5. Icon integration with consistent placement.

**Pages Using This Pattern**

- Envelope System (`src/components/budgeting/envelope/EnvelopeSummary.jsx`)
- Debt Dashboard (`src/components/debt/ui/DebtSummaryCards.jsx`)
- Transaction Ledger (`src/components/transactions/TransactionSummary.jsx`)
- Analytics Dashboard (`src/components/analytics/AnalyticsDashboard.tsx`)
- Bill Management (`src/components/bills/BillManager.jsx`)

**Implementation Notes**

- Replace older glassmorphism or bordered cards with this gradient approach for page-level metrics.
- Keep icons right-aligned and sized `h-8 w-8`.
- Ensure text remains white or light variants for readability.
