# UI Component Patterns & Solutions

This document contains proven solutions for common UI layout issues in VioletVault.

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
{/* Connected Status Display */}
{isEditMode && hasConnections && (
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
      {connections.map(connection => (
        <div key={connection.id} className="flex items-center p-3 bg-white rounded-lg border border-green-200">
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
)}
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
{/* Connection Options - Hidden when connected */}
{!(isEditMode && hasConnections) && (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 mb-4">
    <label className="block text-lg font-bold text-purple-800 mb-4 flex items-center">
      <IconComponent className="h-6 w-6 mr-3" />
      🔗 Connect to [Connection Type]
    </label>

    {/* Connection options (dropdowns, radio buttons, etc.) */}
  </div>
)}
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
