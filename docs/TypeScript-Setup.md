# TypeScript Setup Documentation

**Last Updated:** October 7, 2025  
**Status:** ✅ TypeScript Bootstrap Complete - Ready for Gradual Migration

## Overview

VioletVault now has full TypeScript support configured with `allowJs: true` for gradual migration. Both `.js/.jsx` and `.ts/.tsx` files are supported simultaneously.

## Configuration Files

### `tsconfig.json` - Main TypeScript Configuration

- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **JSX**: react-jsx (automatic runtime)
- **allowJs**: `true` - Allows JavaScript files to coexist with TypeScript
- **checkJs**: `false` - JavaScript files are not type-checked (for gradual migration)
- **strict**: `false` - Relaxed type checking initially
- **Path Aliases**: `@/*` maps to `./src/*`

### `tsconfig.node.json` - Node.js Configuration

Separate configuration for build tools and configuration files:
- vite.config.js/ts
- vitest.config.js/ts
- configs/**/*

### `vite-env.d.ts` - Type Definitions

Comprehensive type definitions for:
- **Vite Environment Variables**: `import.meta.env.*`
- **Custom Environment Variables**: Firebase config, Git info, Highlight.io
- **Module Imports**: SVG, images (png, jpg, gif, webp), CSS, fonts, JSON, Web Workers, WASM, HTML, Markdown

## ESLint Integration

### TypeScript-Specific Rules

The ESLint configuration now includes:
- `@typescript-eslint/parser` for parsing TypeScript
- `@typescript-eslint/eslint-plugin` for TypeScript linting rules
- Separate configuration blocks for `.ts/.tsx` files
- TypeScript-specific rules (no-explicit-any, no-unused-vars, etc.)

### Type Definition Files

- `.d.ts` files are excluded from restricted import rules
- `vite-env.d.ts` can import any modules needed for type definitions

## Scripts

### `npm run typecheck`

Runs TypeScript compiler in check mode (no emit) to validate types across the entire codebase.

```bash
npm run typecheck
```

### Combined with Linting

```bash
npm run typecheck && npm run lint
```

## Usage Examples

### Basic TypeScript Component

```tsx
// src/components/example/MyComponent.tsx
import { useState } from 'react';

interface MyComponentProps {
  title: string;
  count?: number;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0 }) => {
  const [value, setValue] = useState<number>(count);

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {value}</p>
      <button onClick={() => setValue(value + 1)}>Increment</button>
    </div>
  );
};
```

### TypeScript Utility Function

```ts
// src/utils/example/helpers.ts
export interface CalculationResult {
  total: number;
  average: number;
  count: number;
}

export function calculateStats(numbers: number[]): CalculationResult {
  const total = numbers.reduce((sum, n) => sum + n, 0);
  const count = numbers.length;
  const average = count > 0 ? total / count : 0;

  return { total, average, count };
}
```

### Using Vite Environment Variables

```ts
// TypeScript knows about all environment variables defined in vite-env.d.ts
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY; // string
const isDev = import.meta.env.DEV; // boolean
const gitBranch = import.meta.env.VITE_GIT_BRANCH; // string
```

### Importing Assets

```tsx
// All these imports are properly typed
import logo from './assets/logo.png'; // string
import styles from './App.module.css'; // { [key: string]: string }
import icon from './icon.svg'; // string
```

## Migration Strategy

### Phase 1: Current State ✅
- TypeScript configured with `allowJs: true`
- All existing JavaScript files continue to work
- Can start writing new files in TypeScript

### Phase 2: Gradual Migration (Recommended Approach)
1. **Start with Utilities**: Migrate pure utility functions first
   - `src/utils/**/*.js` → `.ts`
   - Add type annotations
   - Export types for reuse

2. **Move to Hooks**: Migrate custom hooks
   - `src/hooks/**/*.js` → `.ts`
   - Type hook parameters and return values

3. **Services Layer**: Type service functions
   - `src/services/**/*.js` → `.ts`
   - Add proper API response types

4. **Components**: Migrate React components last
   - `src/components/**/*.jsx` → `.tsx`
   - Type props interfaces
   - Use proper event types

### Phase 3: Stricter Type Checking
Once most code is migrated:
1. Enable `checkJs: true` to type-check remaining JavaScript
2. Enable `strict: true` for stricter type checking
3. Enable additional strict flags as needed

## Best Practices

### 1. Type Props Interfaces
```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}
```

### 2. Use Type Inference When Obvious
```ts
// Good - type is obvious
const count = 5; // number

// Good - type is not obvious
const result: CalculationResult = calculateStats([1, 2, 3]);
```

### 3. Export Types for Reuse
```ts
// src/types/budget.ts
export interface Envelope {
  id: string;
  name: string;
  balance: number;
  goal: number;
}

export type EnvelopeType = 'bill' | 'variable' | 'savings';
```

### 4. Use Type Guards
```ts
function isEnvelope(obj: unknown): obj is Envelope {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'balance' in obj
  );
}
```

### 5. Avoid `any` - Use `unknown` Instead
```ts
// Bad
function processData(data: any) { }

// Good
function processData(data: unknown) {
  if (isEnvelope(data)) {
    // TypeScript knows data is Envelope here
  }
}
```

## Common Issues and Solutions

### Issue: Import errors in existing JS files
**Solution**: Ensure `allowJs: true` is set in tsconfig.json

### Issue: Module not found errors
**Solution**: Check that `vite-env.d.ts` includes the module type declaration

### Issue: ESLint errors on TypeScript-specific syntax
**Solution**: Verify ESLint is using the TypeScript parser for `.ts/.tsx` files

### Issue: Build fails with TypeScript errors
**Solution**: Run `npm run typecheck` to see detailed error messages

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)
- [TypeScript-ESLint](https://typescript-eslint.io/)

## Troubleshooting

### TypeScript Compiler Issues
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Verify TypeScript installation
npx tsc --version
```

### ESLint Issues with TypeScript
```bash
# Verify ESLint can parse TypeScript
npx eslint src/test.ts --config ./configs/eslint.config.js

# Check ESLint configuration
npx eslint --print-config src/test.ts
```

## Next Steps

1. ✅ TypeScript bootstrap complete
2. ⏳ Begin migrating utility files to TypeScript
3. ⏳ Add shared type definitions in `src/types/`
4. ⏳ Migrate hooks and services
5. ⏳ Migrate React components
6. ⏳ Enable stricter type checking

---

**Note**: This is a gradual migration. There is no rush to convert all files to TypeScript immediately. Focus on new features and files being actively modified.
