# Component Props Validation Guide

**Part of Issue #987: Comprehensive Zod Schema Implementation (Phase 3)**

This guide explains how to use Zod schemas for runtime validation of React component props in VioletVault.

## Table of Contents

- [Overview](#overview)
- [When to Use Prop Validation](#when-to-use-prop-validation)
- [Implementation Pattern](#implementation-pattern)
- [Available Schemas](#available-schemas)
- [Testing Prop Validation](#testing-prop-validation)
- [Best Practices](#best-practices)
- [Performance Considerations](#performance-considerations)

## Overview

Component prop validation provides runtime type checking for React components during development. This catches prop type errors early and provides better error messages than TypeScript alone.

**Key Features:**

- ✅ Runtime validation during development
- ✅ Zero performance impact in production
- ✅ Better error messages with specific validation failures
- ✅ Component contract documentation through schemas
- ✅ Improved refactoring safety

## When to Use Prop Validation

Add prop validation to components that:

1. **Have complex props** - Multiple nested objects, arrays, or callback functions
2. **Are frequently used** - Components used throughout the application
3. **Accept data from external sources** - Props derived from API responses or user input
4. **Have strict requirements** - Props that must conform to specific formats or ranges

### Priority Components (Already Implemented)

**High Priority:**

- ✅ `EnvelopeGrid` - Complex props, frequently used
- ✅ `TransactionTable` - Large prop set with callbacks
- ✅ `BillTable` - Multiple data prop structures
- ✅ `MainDashboard` - Page-level props

**Medium Priority:**

- ✅ `EnvelopeItem` - Nested component props
- ✅ `TransactionRow` - List item props
- ✅ `BillItem` - List item props
- ✅ `AnalyticsDashboard` - Chart props

## Implementation Pattern

### 1. Define the Props Schema

Create or use an existing schema in `/src/domain/schemas/component-props.ts`:

```typescript
import { z } from "zod";
import { EnvelopeSchema } from "./envelope";

export const MyComponentPropsSchema = z.object({
  // Required props
  items: z.array(EnvelopeSchema),
  onSelect: z.function(),

  // Optional props with defaults
  isLoading: z.boolean().optional().default(false),
  className: z.string().optional().default(""),

  // Complex nested props
  config: z
    .object({
      sortBy: z.string(),
      direction: z.enum(["asc", "desc"]),
    })
    .optional(),
});

export type MyComponentProps = z.infer<typeof MyComponentPropsSchema>;
```

### 2. Add Validation to Component

Import and use the validation utility in your component:

```typescript
import React from "react";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { MyComponentPropsSchema, type MyComponentProps } from "@/domain/schemas/component-props";

const MyComponent: React.FC<MyComponentProps> = (props) => {
  // Validate props (development only)
  validateComponentProps("MyComponent", props, MyComponentPropsSchema);

  // Component implementation
  return <div>...</div>;
};

export default MyComponent;
```

### 3. Export Schema from Index

Add your schema to `/src/domain/schemas/index.ts`:

```typescript
export { MyComponentPropsSchema, type MyComponentProps } from "./component-props";
```

## Available Schemas

### EnvelopeGridPropsSchema

Validates props for the EnvelopeGrid component:

```typescript
import { EnvelopeGridPropsSchema } from "@/domain/schemas";

const props = {
  envelopes: [], // Optional array of Envelope objects
  transactions: [], // Optional array of Transaction objects
  unassignedCash: 100, // Optional non-negative number
  className: "custom-class", // Optional string
};
```

### TransactionTablePropsSchema

Validates props for the TransactionTable component:

```typescript
import { TransactionTablePropsSchema } from "@/domain/schemas";

const props = {
  transactions: [], // Optional array of Transaction objects
  envelopes: [], // Optional array of Envelope objects
  onEdit: (transaction) => {}, // Required function
  onDelete: (id) => {}, // Required function (accepts string or number)
  onSplit: (transaction) => {}, // Required function
};
```

### BillTablePropsSchema

Validates props for the BillTable component with complex state management:

```typescript
import { BillTablePropsSchema } from "@/domain/schemas";

const props = {
  filteredBills: [], // Required array of Bill objects
  selectionState: {
    selectedBillIds: [],
    isAllSelected: false,
  },
  clearSelection: () => {},
  selectAllBills: () => {},
  toggleBillSelection: (id) => {},
  setShowBulkUpdateModal: (show) => {},
  setShowBillDetail: (bill) => {},
  getBillDisplayData: (bill) => ({}),
  billOperations: {
    handlePayBill: (id) => {},
  },
  categorizedBills: {},
  viewMode: "list",
};
```

### MainDashboardPropsSchema

Validates props for page-level dashboard component:

```typescript
import { MainDashboardPropsSchema } from "@/domain/schemas";

const props = {
  setActiveView: (view) => {}, // Required function
};
```

## Testing Prop Validation

### Unit Tests for Schemas

Test your schemas with valid and invalid data:

```typescript
import { describe, it, expect } from "vitest";
import { MyComponentPropsSchema } from "@/domain/schemas/component-props";

describe("MyComponentPropsSchema", () => {
  it("should validate valid props", () => {
    const validProps = {
      items: [],
      onSelect: () => {},
    };

    const result = MyComponentPropsSchema.parse(validProps);
    expect(result).toBeDefined();
  });

  it("should reject invalid props", () => {
    const invalidProps = {
      items: "not an array", // Should be array
      onSelect: () => {},
    };

    expect(() => MyComponentPropsSchema.parse(invalidProps)).toThrow();
  });

  it("should apply defaults for optional props", () => {
    const minimalProps = {
      items: [],
      onSelect: () => {},
    };

    const result = MyComponentPropsSchema.parse(minimalProps);
    expect(result.isLoading).toBe(false);
    expect(result.className).toBe("");
  });
});
```

### Integration Tests for Components

Test that components handle invalid props gracefully:

```typescript
import { render } from "@testing-library/react";
import { vi } from "vitest";
import MyComponent from "../MyComponent";

describe("MyComponent prop validation", () => {
  it("should warn about invalid props in development", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <MyComponent
        items="invalid" // Should be array
        onSelect={() => {}}
      />
    );

    // In development mode, should log warning
    if (import.meta.env.MODE === "development") {
      expect(warnSpy).toHaveBeenCalled();
    }

    warnSpy.mockRestore();
  });
});
```

## Best Practices

### 1. Validate Early in Component

Place validation at the top of your component function:

```typescript
function MyComponent(props: MyComponentProps) {
  // ✅ Validate first, before any logic
  validateComponentProps("MyComponent", props, MyComponentPropsSchema);

  // Then component logic
  const [state, setState] = useState();
  // ...
}
```

### 2. Use Descriptive Component Names

Provide clear component names for better error messages:

```typescript
// ✅ Good - clear component name
validateComponentProps("TransactionTable", props, schema);

// ❌ Bad - generic name
validateComponentProps("Component", props, schema);
```

### 3. Validate Complex Props Only

Don't validate every single component - focus on complex, high-impact components:

```typescript
// ✅ Good - complex component with many props
function TransactionTable(props: TransactionTableProps) {
  validateComponentProps("TransactionTable", props, schema);
  // ...
}

// ❌ Unnecessary - simple component with few props
function SimpleButton({ label, onClick }: ButtonProps) {
  validateComponentProps("SimpleButton", { label, onClick }, schema); // Overkill
  // ...
}
```

### 4. Reuse Domain Schemas

Leverage existing domain schemas for prop validation:

```typescript
import { EnvelopeSchema, TransactionSchema } from "@/domain/schemas";

export const MyComponentPropsSchema = z.object({
  // ✅ Reuse existing schemas
  envelope: EnvelopeSchema,
  transactions: z.array(TransactionSchema),

  // Add component-specific props
  onEdit: z.function(),
});
```

### 5. Document Prop Requirements

Use schema comments to document complex prop requirements:

```typescript
export const ComplexPropsSchema = z.object({
  /**
   * Configuration object for the component.
   * - sortBy: Field to sort by (must match data keys)
   * - direction: Sort direction ("asc" or "desc")
   */
  config: z.object({
    sortBy: z.string().min(1, "Sort field is required"),
    direction: z.enum(["asc", "desc"]),
  }),
});
```

## Performance Considerations

### Development Mode Only

All prop validation is automatically skipped in production:

```typescript
// In propValidator.ts
export const validateComponentProps = (name, props, schema) => {
  // Only runs in development
  if (import.meta.env.MODE !== "development") {
    return true; // Skip validation in production
  }

  // Validation logic...
};
```

### No Runtime Overhead

- ✅ Zero performance impact in production builds
- ✅ No bundle size increase for validation code (tree-shaken in production)
- ✅ Validation runs once per component render in development

### Measuring Impact

Monitor development performance:

```bash
# Check bundle size
npm run build
# Validation code should not appear in production bundle

# Profile in development
# Open React DevTools Profiler
# Validation overhead should be negligible (<1ms per component)
```

## Validation Utilities

### validateComponentProps

Logs warnings for invalid props without throwing errors:

```typescript
import { validateComponentProps } from "@/utils/validation/propValidator";

function MyComponent(props) {
  // Returns true/false, logs warnings on failure
  const isValid = validateComponentProps("MyComponent", props, schema);
  // Component continues rendering even if invalid
}
```

### isValidProps

Silent type guard for conditional logic:

```typescript
import { isValidProps } from "@/utils/validation/propValidator";

function MyComponent(props) {
  // Returns true/false without logging
  if (!isValidProps(props, schema)) {
    // Handle invalid props
    return <ErrorState />;
  }

  // Render normally
}
```

### validateComponentPropsStrict

Throws errors for critical prop validation:

```typescript
import { validateComponentPropsStrict } from "@/utils/validation/propValidator";

function CriticalComponent(props) {
  // Throws error on invalid props (use sparingly)
  validateComponentPropsStrict("CriticalComponent", props, schema);

  // Only reaches here if props are valid
}
```

## Error Messages

Validation errors provide detailed feedback:

```typescript
// Invalid prop example
const props = {
  items: "not an array", // Should be array
  onSelect: "not a function", // Should be function
  count: -5, // Should be positive
};

// Error output (development only):
⚠️ Invalid props for MyComponent:
  {
    component: "MyComponent",
    errors: [
      { path: "items", message: "Expected array, received string" },
      { path: "onSelect", message: "Expected function, received string" },
      { path: "count", message: "Number must be greater than 0" }
    ]
  }
```

## Adding New Component Schemas

1. **Create schema** in `/src/domain/schemas/component-props.ts`
2. **Export schema** from `/src/domain/schemas/index.ts`
3. **Add validation** to component
4. **Write tests** in `/src/domain/schemas/__tests__/component-props.test.ts`
5. **Update documentation** (this file and README.md)

### Example Template

```typescript
// In component-props.ts
export const NewComponentPropsSchema = z.object({
  // Define props
  requiredProp: z.string().min(1),
  optionalProp: z.number().optional(),
});

export type NewComponentProps = z.infer<typeof NewComponentPropsSchema>;

// In component file
import { validateComponentProps } from "@/utils/validation/propValidator";
import { NewComponentPropsSchema } from "@/domain/schemas/component-props";

function NewComponent(props: NewComponentProps) {
  validateComponentProps("NewComponent", props, NewComponentPropsSchema);
  // ...
}

// In tests
describe("NewComponentPropsSchema", () => {
  it("should validate valid props", () => {
    const validProps = { requiredProp: "value" };
    expect(() => NewComponentPropsSchema.parse(validProps)).not.toThrow();
  });
});
```

## Related Documentation

- **[Domain Schemas README](/src/domain/schemas/README.md)** - Overview of all schemas
- **[TypeScript Patterns Guide](/docs/TypeScript-Patterns-Guide.md)** - TypeScript best practices
- **[Testing Documentation](/docs/TESTING_DOCUMENTATION.md)** - Testing guidelines

## Related Issues

- **[#987](https://github.com/thef4tdaddy/violet-vault/issues/987)** - Phase 3: Component Prop Validation (Current)
- **[#412](https://github.com/thef4tdaddy/violet-vault/issues/412)** - Phase 1: Domain Types & Zod Schemas

## Architecture Compliance

All component prop validation follows VioletVault's architecture guidelines:

- ✅ Zero `any` types - strict TypeScript
- ✅ Use `@` import paths
- ✅ Use `logger` utility (not console.log)
- ✅ Development-only execution
- ✅ Comprehensive test coverage
- ✅ JSDoc documentation
