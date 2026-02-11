# Component Catalog

## Summary Card Components

**PageSummaryCard vs SummaryCard** – two distinct patterns:

1. **PageSummaryCard** (`src/components/ui/PageSummaryCard.tsx`)
   - **Usage**: Page-specific metrics (Bills, Debts, Transactions, etc.)
   - **Design**: Gradient backgrounds with icons
   - **Features**: Alert states, hover effects, interactive
   - **Colors**: Full gradient spectrum (red, blue, green, purple, etc.)

2. **SummaryCard** (`src/components/layout/SummaryCards.tsx`)
   - **Usage**: Main dashboard financial overview
   - **Design**: Solid color backgrounds
   - **Features**: Large values, click handlers for modals
   - **Colors**: Solid colors (purple, emerald, cyan, amber)

> Always use `PageSummaryCard` for consistent page-level metrics across the application.

---

## StandardTabs Component

`StandardTabs` (`src/components/ui/StandardTabs.tsx`) provides accessible, consistent tabbed navigation.

```tsx
import { StandardTabs } from "@/components/ui/StandardTabs";

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

---

## StandardFilters Component

`StandardFilters` (`src/components/ui/StandardFilters.tsx`) is the shared filtering surface.

```tsx
import { StandardFilters } from "@/components/ui/StandardFilters";

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

---

## Core Global Components

- **ConfirmModal** (`src/components/shared/modals/ConfirmModal.tsx`)
  - Standardized confirmation dialog used via `useConfirm()` hook.
  - Supports destructive red styling and accessibility guarantees.
- **Toast System** (`src/components/shared/feedback/Toast.tsx`)
  - Standard notification surface (success, error, warning, info).
  - Accessible ARIA handling with auto-dismiss.
- **LoadingSpinner** (`src/components/ui/LoadingSpinner.tsx`)
  - Consistent loading indicator with multiple sizes and theme colors.

---

## Usage Guidelines

1. **Strict TypeScript**: Always define prop interfaces for new components.
2. **Glassmorphism**: Follow the v2 design system using `glass-panel` utilities.
3. **Zod Validation**: Forms within components must use Zod for validation.
4. **Custom Hooks**: Extract stateful logic into custom hooks (e.g., `useBillForm.ts`).

---

**Last Updated**: January 18, 2026
