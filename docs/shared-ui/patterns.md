# Interaction Patterns

## Radio Button Positioning

### Problem

Radio inputs often appear centered when using flex layouts (`items-center`), creating excessive whitespace and a misaligned experience.

### Solution: CSS Grid

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

**Key properties**

- `grid-cols-[auto_1fr]`: Left column hugs the radio, right column fills remaining space.
- `justify-self-start`: Forces the radio to the absolute left.
- `items-start`: Aligns long content with the top of the radio.
- `mt-0.5`: Aligns the input with the first line of text.

**Use this pattern for** radio groups, checkbox lists, or any UI where flexbox centering fights left alignment.

## Checkbox Styling

### Standard Checkbox Construction

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

**Key properties**

- `h-4 w-4`: Shared control sizing
- `text-purple-600`: Brand color for checked state
- `focus:ring-purple-500`: Accessible focus ring color
- `border-gray-300` + `rounded`: Matches our form styling conventions

## Edit Modal Connection Pattern

When an entity (debt, envelope, bill, etc.) is linked to another, use the standardized connected and available states.

### Connected State Display

```jsx
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
        📝 <strong>Connected!</strong> [Explain implications + auto-sync behavior]
      </p>
    </div>
  </div>
)}
```

### Available to Connect State

```jsx
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

### Color Coding

- **Connected**: Greens (`green-50`, `green-300`, `green-600`, `green-800`)
- **Available**: Purples (`purple-50`, `purple-300`, `purple-600`, `purple-800`)
- **Warnings / Disconnect**: Reds (`red-50`, `red-300`, `red-500`, `red-600`)

### Iconography

- Connections: 🔗 emoji plus supporting icons (Receipt, Wallet, etc.)
- Success: `CheckCircle`, `Sparkles`
- Disconnect: `X`
- Bills: `Receipt`, `FileText`
- Envelopes: `Wallet`
- Debts: `CreditCard`

### Behavior Standards

1. **Connected**
   - Show connected summary, hide connection options, expose disconnect button, and reflect auto-sync status.
2. **Disconnected**
   - Present connection options and hide connected summary.
3. **Disconnect Action**
   - Clear connection data, reset form state, and reveal connection options again.

### Typography Notes

- Connected headers: `text-lg font-bold text-green-800`
- Available headers: `text-lg font-bold text-purple-800`
- Section headers and labels should use `font-medium text-gray-900`
- Status badges: `text-xs` with matching foreground/background hues (`bg-green-100 text-green-600`, etc.)

### Reference Implementations

- Debt modal – `src/components/debt/modals/AddDebtModal.jsx`
- Envelope edit modal – `src/components/budgeting/EditEnvelopeModal.jsx`

By following these shared patterns you ensure alignment with the established VioletVault design language while avoiding bespoke solutions.
