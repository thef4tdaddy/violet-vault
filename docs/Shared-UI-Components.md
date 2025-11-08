# Shared UI Components & Design Patterns

This document contains standardized shared UI components and proven solutions for common UI layout issues in VioletVault.

## Standardized Shared UI Components

VioletVault uses a comprehensive set of shared UI components to ensure consistency across all modals and forms:

### Summary Card Components

**PageSummaryCard vs SummaryCard** - Two distinct patterns:

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

**Always use PageSummaryCard for consistent page-level metrics across the application.**

### Standardized Tabs Component

**StandardTabs** (`src/components/ui/StandardTabs.jsx`)

A fully standardized tabs component with accessibility and consistent styling:

```jsx
import StandardTabs from "../ui/StandardTabs";

const tabs = [
  {
    id: "all",
    label: "All Bills",
    icon: FileText,
    count: 10,
    color: "gray",
  },
  {
    id: "overdue",
    label: "Overdue",
    icon: AlertTriangle,
    count: 2,
    color: "red",
  },
  {
    id: "upcoming",
    label: "Upcoming",
    icon: Clock,
    count: 5,
    color: "blue",
    disabled: false,
  },
];

<StandardTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  size="md" // 'sm' | 'md' | 'lg'
  variant="colored" // 'underline' | 'pills' | 'buttons' | 'tabs' | 'colored'
/>;
```

**Features:**

- **High Contrast Text**: Uses `text-gray-700` (inactive) and proper contrast for all variants
- **Multiple Variants**: Underline, pills, buttons, tabs, and colored styling
- **Colored Tabs**: Pastel-to-bright transitions matching summary card colors
- **Available Colors**: blue, green, red, amber, purple, cyan, gray
- **Flexible Sizing**: Small, medium, and large sizes available
- **Icon Support**: Optional icons with proper sizing
- **Count Badges**: Optional count display with variant-appropriate styling
- **Disabled State**: Full support for disabled tabs
- **Hover Effects**: Smooth transitions and hover states

**When to Use:**

- Use StandardTabs for all tabbed navigation in the app
- Replace existing custom tab implementations
- Ensures consistency across Bills, Debts, Transactions, and other pages

### Standardized Filters Component

**StandardFilters** (`src/components/ui/StandardFilters.jsx`)

A compact, space-efficient filtering component with consistent styling:

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

**Features:**

- **Glassmorphism Design**: Professional styling with backdrop blur and hard black borders
- **Proper Labeling**: "Filters" header with icon for clear identification
- **Search with Icon**: Built-in search input with search icon and clear button
- **Flexible Dropdowns**: Configure any number of select filters
- **Smart Clear Button**: Only shows when filters are active, clears all at once
- **Tab Connection**: Visually connects to StandardTabs when used together
- **Rounded Corners**: Modern appearance with proper container boundaries

### Design Standards

**Hard Black Borders**: All major UI components must use the standardized hard black border system:

- **Standard Border**: `border border-white/20 ring-1 ring-gray-800/10`
- **Usage**: Applied to cards, modals, filters, summary components, and all major UI elements
- **Benefits**: Creates professional depth, consistent visual hierarchy, and cohesive appearance
- **Examples**: Summary cards, StandardFilters, modals, form containers

**Main Container Purple Tint**: Page-level containers should use branded purple tint:

- **Style**: `rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm`
- **Usage**: Applied to main page containers (BillManager, DebtManager, etc.)
- **Benefits**: Creates branded visual identity while maintaining readability
- **Example**: BillManager main container with subtle purple background

**Typography Hierarchy Standards**:

- **Important Headers**: Use ALL CAPS with larger first letters pattern
  - **Style**: `font-black text-black text-base` with `text-lg` first letters
  - **Pattern**: `<span className="text-lg">B</span>ILL`
  - **Usage**: Table headers, section headers, important labels
- **Subtext/Descriptions**: Use dark purple for branded consistency
  - **Style**: `text-purple-900`
  - **Usage**: Page descriptions, help text, secondary information
  - **Example**: "Track and manage your recurring bills and payments"
- **Text Borders for Colored Text**: Add black text borders for visibility
  - **Style**: `textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black, 0px 2px 0px black, 2px 0px 0px black, 0px -2px 0px black, -2px 0px 0px black'`
  - **Usage**: When colored text needs visibility against complex backgrounds
- **Perfect Text Justification**: For professional text blocks
  - **Style**: `textAlign: 'justify', textAlignLast: 'justify'`
  - **Usage**: Important messages, formal content that needs clean edges

**Button Standards**: All action buttons must have hard black borders:

- **Style**: Add `border-2 border-black` to all buttons
- **Usage**: Primary actions, secondary actions, icon buttons
- **Benefits**: Creates consistent visual weight and professional appearance

**Background Pattern Standards**: Consistent texture and blur patterns:

- **Textured Pattern**: Subtle dot pattern for sophisticated backgrounds
  - **Style**: `backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)", backgroundSize: "100px 100px"`
  - **Overlay**: `opacity-10` for subtle texture
  - **Usage**: Full-screen backgrounds, landing pages, authentication screens
- **Heavy Blur Overlays**: For modal focus and emphasis
  - **Style**: `backdrop-blur-3xl` with colored overlay (`bg-purple-900/60`, `bg-black/60`)
  - **Usage**: Modal backgrounds, safety screens, important overlays

**Glassmorphism Styling**: Use the established glassmorphism design language:

- **Class**: `.glassmorphism` with `backdrop-filter: blur(20px)` and semi-transparent backgrounds
- **Complete Style**: `glassmorphism rounded-lg border border-white/20 ring-1 ring-gray-800/10 shadow-lg`
- **Usage**: Primary containers, filters, cards, and overlay components
- **Benefits**: Modern aesthetic, visual depth, professional appearance

**Tab Connection Pattern**: Tabs should visually connect to content below them:

- **Tab Styling**: Rounded top corners (`rounded-t-lg`) with hard black borders
- **Connection Method**: Use negative margins (`-mb-1`) to eliminate gaps
- **Content Styling**: Connected content should have matching border and glassmorphism
- **Visual Flow**: Creates seamless transition from navigation to content

**Implementation Example:**

```jsx
// Proper tab + filter connection pattern
<div className="space-y-0">
  <StandardTabs variant="colored" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

  <StandardFilters
    filters={filters}
    onFilterChange={handleFilterChange}
    filterConfigs={configs}
    className="-mb-1" // Creates visual connection
  />
</div>
```

**When to Use:**

- Use StandardFilters for all filtering UI across the app
- Replace bulky filter sections that take excessive space
- Always apply hard black borders to major UI components
- Connect tabs to content using the established pattern
- Use glassmorphism for primary containers and overlays

### Core Modal Components

**EditLockIndicator** (`src/components/ui/EditLockIndicator.jsx`)

- Standardized edit locking display for multi-user conflict prevention
- Shows lock status, user info, and expiration timer
- Used across bill, envelope, debt, and transaction modals
- Variants: Full display and compact inline indicator

**ConfirmModal** (`src/components/ui/ConfirmModal.jsx`)

- Standardized confirmation dialogs replacing browser alerts
- Supports destructive actions with red styling
- Accessible keyboard navigation and focus management
- Used via `useConfirm()` hook for promise-based API

**UniversalConnectionManager** (`src/components/ui/ConnectionDisplay.jsx`)

- Consistent connection UI across all entity types
- Handles bill-envelope, debt-envelope relationships
- Theme-aware styling (purple, blue, red themes)
- Unified UX for creating/managing entity connections

### Form Components

**Toast System** (`src/components/ui/Toast.jsx`)

- Standardized notifications replacing browser alerts
- Support for success, error, warning, info, and custom types
- Auto-dismiss with configurable duration
- Accessible with proper ARIA labels

### Navigation & Layout

**LoadingSpinner** (`src/components/ui/LoadingSpinner.jsx`)

- Consistent loading states across the application
- Multiple size variants (small, medium, large)
- Theme-aware coloring

### Extracted Modal Components

**BillModalHeader** (`src/components/bills/BillModalHeader.jsx`)

- Standardized header for bill modals
- Icon display, title management, close button
- Preserves exact visual appearance

**BillFormFields** (`src/components/bills/BillFormFields.jsx`)

- Complete bill form implementation
- Icon selection, validation, connection management
- Action buttons and calculation previews

### Usage Guidelines

1. **Always use shared components** instead of creating custom implementations
2. **Maintain visual consistency** by following established patterns
3. **Theme-aware implementation** using consistent color schemes
4. **Accessibility first** with proper ARIA labels and keyboard navigation
5. **Extract common patterns** into reusable components when patterns repeat
6. **Preserved Visual Appearance**: Exact same UI while dramatically reducing complexity when refactoring

### Benefits

- **Consistent UX**: Same behavior across all modals and forms
- **Reduced code duplication**: Single source of truth for common patterns
- **Easier maintenance**: Updates in one place benefit entire application
- **Accessibility compliance**: Shared components ensure consistent accessibility
- **Performance**: Reusable components reduce bundle size
- **Preserved Visual Appearance**: Component extractions maintain exact UI while improving code organization

### Refactoring Standards

When extracting components for code organization and complexity reduction:

1. **Maintain pixel-perfect visual appearance** - UI should remain identical
2. **Preserve user experience** - No behavioral changes during refactoring
3. **Extract logical sections** - Group related form fields and UI elements
4. **Use established patterns** - Follow existing component extraction approaches
5. **Document component purpose** - Clear comments explaining extracted sections
6. **Test thoroughly** - Verify functionality remains unchanged post-extraction

---

## Radio Button Positioning Issue

### Problem

Radio buttons in form layouts consistently appear centered instead of at the far left, causing poor UX with excessive white space.

### Root Cause

Flexbox's `items-center` and centering behaviors override attempts to position radio buttons at the absolute left edge.

### ❌ Problematic Patterns

```jsx
// These approaches fail due to flex centering behaviors:
<label className="flex items-center space-x-3">
  <input type="radio" className="w-4 h-4" />
  <div>Content</div>
</label>

<div className="flex items-center">
  <input type="radio" className="mr-3" />
  <div className="flex-1">Content</div>
</div>
```

### ✅ Proven Solution: CSS Grid

```jsx
<div className="glassmorphism border-2 border-white/20 rounded-xl p-2">
  <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
    <input
      type="radio"
      value="option"
      className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
    />
    <div>
      <div className="flex items-center mb-1">
        <Icon className="h-4 w-4 mr-2" />
        <span className="font-medium text-sm">Option Label</span>
      </div>
      <p className="text-xs text-gray-600 leading-tight ml-6">Description text</p>
    </div>
  </div>
</div>
```

### Key CSS Grid Properties

- `grid-cols-[auto_1fr]`: Auto-sized first column for radio, remaining space for content
- `justify-self-start`: Forces radio button to absolute left of its grid cell
- `gap-3`: Consistent spacing between radio and content
- `items-start`: Aligns content to top (prevents vertical centering)
- `mt-0.5`: Aligns radio button with first line of text

### When to Use This Pattern

- Radio button groups
- Checkbox lists
- Any form input that needs to be positioned at the absolute left edge
- Components where flexbox centering is causing layout issues

### Components Using This Pattern

- `PaycheckProcessor.jsx` - Allocation mode selection (commit: 658c91a)

### Notes

- This pattern eliminates the recurring radio button centering issue
- CSS Grid provides absolute positioning control that flexbox lacks
- Use `justify-self-start` to ensure elements stick to the left edge
- Always test with different content lengths to ensure consistency

## Checkbox Patterns

### Standard Checkbox Styling

Use consistent styling across the application:

```jsx
<input
  type="checkbox"
  id="checkboxId"
  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
  checked={value}
  onChange={handleChange}
/>
<label htmlFor="checkboxId" className="ml-3 text-sm text-gray-700">
  Label text
</label>
```

### Key Properties

- `h-4 w-4`: Standard size
- `text-purple-600`: Primary brand color for checked state
- `focus:ring-purple-500`: Focus ring color
- `border-gray-300`: Border color
- `rounded`: Rounded corners

## Edit Modal Connection Patterns

### Connected State Display

When entities (debts, envelopes, bills) are connected to each other, use this standardized pattern:

**Visual Structure:**

```jsx
{
  /* Connected Status Display */
}
{
  isEditMode && hasConnections && (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-lg font-bold text-green-800 flex items-center">
          <IconComponent className="h-6 w-6 mr-3" />
          🔗 Connected to [Connection Type]
        </label>
        <button
          type="button"
          onClick={handleDisconnect}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors flex items-center"
        >
          <X className="h-3 w-3 mr-1" />
          Disconnect
        </button>
      </div>

      {/* Connection Details */}
      <div className="space-y-3">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex items-center p-3 bg-white rounded-lg border border-green-200"
          >
            <ConnectionIcon className="h-5 w-5 mr-3 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-green-800">{connection.type}</div>
              <div className="text-sm text-green-700">{connection.details}</div>
            </div>
            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {connection.syncStatus}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
        <p className="text-sm text-green-700 font-medium">
          📝 <strong>Connected!</strong> [Explanation of what being connected means and behavior]
        </p>
      </div>
    </div>
  );
}
```

**Key Elements:**

- **Green gradient background** with green borders to indicate "connected" state
- **Disconnect button** prominently placed in top-right corner
- **Clear connection details** showing what's connected
- **Auto-sync badges** to indicate synchronization status
- **Informational footer** explaining the connection behavior

### Connection Options Display

When not connected, show connection options:

```jsx
{
  /* Connection Options - Hidden when connected */
}
{
  !(isEditMode && hasConnections) && (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 mb-4">
      <label className="block text-lg font-bold text-purple-800 mb-4 flex items-center">
        <IconComponent className="h-6 w-6 mr-3" />
        🔗 Connect to [Connection Type]
      </label>

      {/* Connection options (dropdowns, radio buttons, etc.) */}
    </div>
  );
}
```

### Color Coding Standards

**Connection States:**

- **Connected**: Green (`green-50`, `green-300`, `green-600`, `green-800`)
- **Available to Connect**: Purple (`purple-50`, `purple-300`, `purple-600`, `purple-800`)
- **Disconnected/Warning**: Red (`red-50`, `red-300`, `red-500`, `red-600`)

**Entity Types:**

- **Bills**: Blue (`blue-50`, `blue-300`, `blue-600`)
- **Envelopes**: Purple (`purple-50`, `purple-300`, `purple-600`)
- **Debts**: Red (`red-50`, `red-300`, `red-600`)
- **Transactions**: Gray (`gray-50`, `gray-300`, `gray-600`)

### Typography Patterns

**Modal Headers:**

- **Connected State**: `text-lg font-bold text-green-800`
- **Available Options**: `text-lg font-bold text-purple-800`
- **Section Headers**: `font-medium text-gray-900`

**Status Badges:**

- **Auto-synced**: `text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full`
- **Manual**: `text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full`
- **Warning**: `text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full`

### Component Behavior Standards

**Edit Modal Connections:**

1. **When Connected**:
   - Show connected state display
   - Hide connection options
   - Provide disconnect button
   - Auto-sync related data

2. **When Disconnected**:
   - Show connection options
   - Hide connected state display
   - Allow user to establish connections

3. **Disconnect Action**:
   - Clear connection data from form state
   - Reset to default/disconnected state
   - Show connection options again

### Examples

- **Debt Modal**: `src/components/debt/modals/AddDebtModal.jsx` (lines 502-572)
- **Envelope Modal**: `src/components/budgeting/EditEnvelopeModal.jsx` (lines 632-683)

### Icons Used

- **Connections**: 🔗 emoji + relevant icons (Receipt, Wallet, etc.)
- **Success/Connected**: CheckCircle, Sparkles
- **Disconnect**: X
- **Bills**: Receipt, FileText
- **Envelopes**: Wallet
- **Debts**: CreditCard

This pattern ensures consistent user experience across all edit modals while clearly communicating connection states and available actions.

## Page-Specific Summary Cards (Issue #545)

### Standard Design Pattern

All page-specific summary cards follow the **bill card design pattern** with gradient backgrounds and white text, making them visually distinct from the main dashboard cards at the top.

### Visual Structure

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

### Key Design Elements

**Layout:**

- `bg-gradient-to-br`: Bottom-right gradient for depth
- `p-4`: Consistent padding
- `rounded-lg`: Standard rounded corners
- `text-white`: Base text color

**Content Structure:**

- **Main content** on the left
- **Icon** on the right (`h-8 w-8`)
- **Label** with light color variant (`text-[color]-100`)
- **Value** with bold white text (`text-2xl font-bold`)
- **Subtext** with light color and smaller size (`text-xs text-[color]-100 mt-2`)

### Color Standards

**Available Colors:**

- **Red**: `from-red-500 to-red-600` (expenses, overdue, debt)
- **Orange**: `from-orange-500 to-orange-600` (warnings, due soon)
- **Amber**: `from-amber-500 to-amber-600` (alerts, pending)
- **Yellow**: `from-yellow-500 to-yellow-600` (caution items)
- **Green**: `from-green-500 to-green-600` (income, paid, positive)
- **Emerald**: `from-emerald-500 to-emerald-600` (growth, savings)
- **Teal**: `from-teal-500 to-teal-600` (neutral positive)
- **Cyan**: `from-cyan-500 to-cyan-600` (cash flow, liquidity)
- **Blue**: `from-blue-500 to-blue-600` (general info, totals)
- **Indigo**: `from-indigo-500 to-indigo-600` (secondary info)
- **Purple**: `from-purple-500 to-purple-600` (analytics, insights)
- **Pink**: `from-pink-500 to-pink-600` (special categories)
- **Gray**: `from-gray-500 to-gray-600` (neutral, inactive)

**Text Color Mapping:**

- **Labels**: `text-[color]-100` (light variant)
- **Icons**: `text-[color]-200` (slightly brighter)
- **Values**: `text-white` (always white for maximum contrast)
- **Subtext**: `text-[color]-100` (matches labels)

### Implementation Examples

**Envelope Summary Cards:**

```jsx
// Total Allocated - Blue
<div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-blue-100 text-sm">Total Allocated</p>
      <p className="text-2xl font-bold">${totals.totalAllocated.toFixed(2)}</p>
    </div>
    <DollarSign className="h-8 w-8 text-blue-200" />
  </div>
</div>
```

**Debt Summary Cards:**

```jsx
// Total Debt - Red
<div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
  <div className="flex items-center justify-between">
    <div>
      <div className="flex items-center">
        <p className="text-red-100 text-sm">Total Debt</p>
        {alert && <AlertTriangle className="h-3 w-3 ml-2 text-white" />}
      </div>
      <p className="text-2xl font-bold">$150,000.00</p>
      <p className="text-xs text-red-100 mt-2">5 active debts</p>
    </div>
    <DollarSign className="h-8 w-8 text-red-200" />
  </div>
</div>
```

**Transaction Summary Cards:**

```jsx
// Dynamic color based on value
<div
  className={`bg-gradient-to-br ${
    netCashFlow >= 0 ? "from-cyan-500 to-cyan-600" : "from-amber-500 to-amber-600"
  } p-4 rounded-lg text-white`}
>
  <div className="flex items-center justify-between">
    <div>
      <p className={`${netCashFlow >= 0 ? "text-cyan-100" : "text-amber-100"} text-sm`}>
        Net Cash Flow
      </p>
      <p className="text-2xl font-bold">
        {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toFixed(2)}
      </p>
    </div>
    <DollarSign className={`h-8 w-8 ${netCashFlow >= 0 ? "text-cyan-200" : "text-amber-200"}`} />
  </div>
</div>
```

### Interactive States

**Clickable Cards:**

```jsx
<div
  className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105"
  onClick={handleClick}
>
  {/* Card content */}
</div>
```

**Alert States:**

```jsx
<div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white ring-2 ring-white ring-opacity-50">
  {/* Card content with alert styling */}
</div>
```

### Pages Using This Pattern

- **Envelope System**: `src/components/budgeting/envelope/EnvelopeSummary.jsx`
- **Debt Dashboard**: `src/components/debt/ui/DebtSummaryCards.jsx`
- **Transaction Ledger**: `src/components/transactions/TransactionSummary.jsx`
- **Analytics Dashboard**: `src/components/analytics/AnalyticsDashboard.tsx`
- **Bill Management**: `src/components/bills/BillManager.jsx` (reference pattern)

### Design Goals

1. **Visual Distinction**: Bright gradient backgrounds clearly differentiate from main dashboard cards
2. **Consistency**: Same layout pattern across all pages
3. **Readability**: High contrast with white text on colored backgrounds
4. **Information Hierarchy**: Label → Value → Subtext structure
5. **Icon Integration**: Consistent icon placement and sizing

### Migration Notes

- **From Glassmorphism**: Replace `glassmorphism` classes with gradient backgrounds
- **From Border Cards**: Replace white cards with colored left borders
- **Icon Updates**: Move icons to right side, standardize size to `h-8 w-8`
- **Text Color**: Update all text to use white/light color variants instead of gray variants

This standardization ensures all page-specific summary cards follow the same visual language while maintaining their distinct identity from the main dashboard summary cards.
