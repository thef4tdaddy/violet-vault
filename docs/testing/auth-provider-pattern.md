# AuthProvider Testing Pattern

## Overview

Component tests that use auth-related hooks (`useAuth`, `useAuthManager`, `useActivityLogger`) require `<AuthProvider>` to be present in the component tree.

## Problem

When components use auth hooks without `AuthProvider`, tests fail with:

```
Error: useAuth must be used within an AuthProvider. Make sure your component is wrapped with <AuthProvider>.
```

## Solution

### Option 1: Use Global Test Wrapper (Recommended)

For tests using TanStack Query hooks, use the `createQueryWrapper` utility which includes both `QueryClientProvider` and `AuthProvider`:

```typescript
import { renderHook } from "@testing-library/react";
import { createQueryWrapper } from "@/test/queryTestUtils";

const wrapper = createQueryWrapper();
const { result } = renderHook(() => useMyHook(), { wrapper });
```

### Option 2: Manual AuthProvider Wrapper

For component tests that don't use TanStack Query:

```typescript
import { render } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';

const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

// Usage
renderWithAuth(<MyComponent />);
```

### Option 3: Combined Wrappers

For tests that need both QueryClient and AuthProvider:

```typescript
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};
```

## Logger Mock (Required)

All tests must include a complete logger mock since `AuthContext` initialization uses `logger.auth()`:

```typescript
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    auth: vi.fn(),
  },
}));
```

## Dependency Chain

Understanding why AuthProvider is needed:

```
Component
  → useActivityLogger
    → useAuthManager
      → useAuth (requires AuthProvider)
```

## Examples

### Example 1: Testing a Component with useAuthManager

```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';
import MyComponent from '../MyComponent';

// Mock the hook
vi.mock('@/hooks/auth/useAuthManager', () => ({
  useAuthManager: vi.fn(() => ({
    user: { userName: 'Test User' },
    isAuthenticated: true,
  })),
}));

// Mock logger
vi.mock('@/utils/common/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    auth: vi.fn(),
  },
}));

describe('MyComponent', () => {
  const renderWithAuth = (component: React.ReactElement) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  it('should render user name', () => {
    renderWithAuth(<MyComponent />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

### Example 2: Testing a Hook with TanStack Query

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/test/queryTestUtils";
import { useMyAuthQuery } from "../useMyAuthQuery";

describe("useMyAuthQuery", () => {
  it("should fetch user data", async () => {
    const wrapper = createQueryWrapper();
    const { result } = renderHook(() => useMyAuthQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Updated Files

The following test files have been updated to use this pattern:

- `src/components/layout/__tests__/ViewRenderer.test.tsx`
- `src/components/bills/__tests__/AddBillModal.test.tsx`
- `src/components/auth/__tests__/UserSetup.test.tsx`
- `src/components/layout/__tests__/MainLayout.test.tsx`
- `src/components/sharing/__tests__/ShareCodeModal.test.tsx`

## Related

- Issue: #1506 - Fix 47 component test files failing due to missing AuthProvider wrappers
- Architecture: ChastityOS v4.0.0 data flow pattern
- Epic: #665 - Migrate Auth from Zustand to React Context + TanStack Query
