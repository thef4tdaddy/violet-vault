# Card Primitives - Usage Examples

This directory contains reusable card primitive components using Tailwind CSS and the black border design system.

## Components

### Card

A flexible base card component with compound pattern (Header, Body, Footer).

#### Basic Usage

```tsx
import { Card } from '@/components/primitives/cards';

// Simple card
<Card>
  <p>Card content</p>
</Card>

// Card with variant
<Card variant="elevated">
  <p>Elevated card with shadow</p>
</Card>

// Card with all parts
<Card variant="elevated" padding="lg">
  <Card.Header
    icon="User"
    title="User Profile"
    subtitle="Manage your account"
    actions={<button>Edit</button>}
  />
  <Card.Body>
    <p>Profile content here</p>
  </Card.Body>
  <Card.Footer>
    <button>Save</button>
  </Card.Footer>
</Card>

// Clickable card
<Card variant="default" onClick={() => navigate('/profile')}>
  <Card.Header title="Go to Profile" />
</Card>
```

#### Props

**Card:**

- `variant?: "default" | "elevated" | "outlined" | "glass"` - Card style variant (default: "default")
- `padding?: "none" | "sm" | "md" | "lg"` - Padding size (default: "md")
- `children: React.ReactNode` - Card content
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler (makes card clickable with hover effects)

**Card.Header:**

- `icon?: string` - Icon name from icon registry (e.g., "User", "DollarSign")
- `title: string` - Header title
- `subtitle?: string` - Optional subtitle
- `actions?: React.ReactNode` - Optional action buttons

**Card.Body:**

- `children: React.ReactNode` - Body content
- `className?: string` - Additional CSS classes

**Card.Footer:**

- `children: React.ReactNode` - Footer content
- `className?: string` - Additional CSS classes

---

### MetricCard

A specialized card for displaying metrics with formatting and change indicators.

#### Basic Usage

```tsx
import { MetricCard } from '@/components/primitives/cards';

// Simple metric
<MetricCard
  title="Total Revenue"
  value={123456.78}
/>

// Formatted metric with change
<MetricCard
  title="Total Revenue"
  value={123456.78}
  change={5.2}
  icon="DollarSign"
  variant="success"
  format="currency"
  subtitle="Last 30 days"
/>

// Custom formatter
<MetricCard
  title="Custom Metric"
  value={42}
  format="custom"
  customFormatter={(val) => `${val} items`}
/>

// Loading state
<MetricCard
  title="Loading"
  value={0}
  loading={true}
/>

// Clickable metric
<MetricCard
  title="Click me"
  value={100}
  onClick={() => console.log('Clicked!')}
/>
```

#### Props

- `title: string` - Metric title
- `value: number | string` - Metric value
- `change?: number` - Percentage change (positive/negative/zero)
- `icon?: string` - Icon name from icon registry
- `variant?: "default" | "success" | "warning" | "danger" | "info"` - Color variant (default: "default")
- `format?: "currency" | "number" | "percentage" | "custom"` - Value format (default: "number")
- `customFormatter?: (value: number | string) => string` - Custom formatting function
- `subtitle?: string` - Optional subtitle text
- `loading?: boolean` - Show loading skeleton (default: false)
- `onClick?: () => void` - Click handler

#### Format Examples

- **currency**: `$123,456.78`
- **number**: `123,456`
- **percentage**: `12.5%`
- **custom**: Use `customFormatter` function

#### Variant Colors

- **default**: Purple (`text-purple-600`)
- **success**: Green (`text-emerald-600`)
- **warning**: Amber (`text-amber-600`)
- **danger**: Red (`text-red-600`)
- **info**: Cyan (`text-cyan-600`)

#### Change Indicators

- **Positive** (`change > 0`): Green with TrendingUp icon
- **Negative** (`change < 0`): Red with TrendingDown icon
- **Zero** (`change === 0`): Gray with Minus icon

---

## Design System

All cards follow the black border design system:

- 2px solid black borders
- Rounded corners (rounded-2xl)
- Consistent spacing and typography
- Tailwind CSS only (no custom CSS)

## Testing

Tests are located in `__tests__/` directory:

- `Card.test.tsx`: 28 tests covering variants, interactions, compound components
- `MetricCard.test.tsx`: 29 tests covering formatting, states, edge cases

Run tests:

```bash
npm run test:run -- src/components/primitives/cards/
```

## Examples

### Dashboard Summary Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard
    title="Total Revenue"
    value={123456.78}
    change={5.2}
    icon="DollarSign"
    variant="success"
    format="currency"
    subtitle="Last 30 days"
  />
  <MetricCard
    title="Active Users"
    value={1234}
    change={-2.1}
    icon="Users"
    variant="danger"
    format="number"
    subtitle="Last 7 days"
  />
  <MetricCard
    title="Conversion Rate"
    value={12.5}
    change={0}
    icon="TrendingUp"
    variant="info"
    format="percentage"
    subtitle="This month"
  />
  <MetricCard
    title="Satisfaction"
    value={4.8}
    icon="Star"
    variant="warning"
    format="custom"
    customFormatter={(val) => `${val}/5.0`}
    subtitle="Based on 523 reviews"
  />
</div>
```

### Profile Card

```tsx
<Card variant="elevated" padding="lg">
  <Card.Header
    icon="User"
    title="John Doe"
    subtitle="john.doe@example.com"
    actions={
      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Edit Profile</button>
    }
  />
  <Card.Body>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-600">Bio</label>
        <p className="mt-1 text-gray-900">Software engineer and designer...</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">Location</label>
        <p className="mt-1 text-gray-900">San Francisco, CA</p>
      </div>
    </div>
  </Card.Body>
  <Card.Footer>
    <div className="flex justify-end gap-3">
      <button className="px-4 py-2 border-2 border-black rounded-lg">Cancel</button>
      <button className="px-4 py-2 bg-black text-white rounded-lg">Save Changes</button>
    </div>
  </Card.Footer>
</Card>
```

### Glass Card with No Padding

```tsx
<Card variant="glass" padding="none">
  <img src="/hero.jpg" alt="Hero" className="w-full h-48 object-cover rounded-t-2xl" />
  <div className="p-6">
    <h3 className="text-xl font-bold">Beautiful Image Card</h3>
    <p className="mt-2 text-gray-600">With glass morphism effect</p>
  </div>
</Card>
```
