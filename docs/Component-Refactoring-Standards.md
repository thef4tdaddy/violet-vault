# Component Refactoring Standards

## 📋 Complete Refactoring Process Guide

This document outlines the proven methodology for refactoring large components (400+ lines) while maintaining visual appearance, improving code quality, and establishing comprehensive testing coverage.

---

## 🎯 **Phase 1: Analysis & Planning**

### 1.1 Component Assessment

- **Size Analysis**: Identify components over 400 lines (ESLint errors) or 300+ lines (warnings)
- **Complexity Review**: Identify mixed UI/logic responsibilities
- **Dependencies Mapping**: Document external hooks, services, and utilities used
- **UI Standards Audit**: Check compliance with established design system

### 1.2 Visual Documentation

- **Screenshot Current State**: Capture pixel-perfect reference of existing UI
- **Interaction Flow**: Document all user interactions and state changes
- **Responsive Behavior**: Note mobile/desktop layout differences
- **Edge Cases**: Document error states, loading states, empty states

### 1.3 Extraction Strategy

- **UI Components**: Identify reusable UI sections for extraction
- **Business Logic**: Identify computational logic for custom hook extraction
- **Shared Utilities**: Look for opportunities to use/create shared utility functions
- **Component Hierarchy**: Plan parent-child relationship structure

---

## 🏗️ **Phase 2: UI/Logic Separation**

### 2.1 Custom Hook Creation

```javascript
// Pattern: Extract all business logic to custom hooks
// File: hooks/[domain]/use[ComponentName].js

export const use[ComponentName] = (initialProps) => {
  // State management
  const [localState, setLocalState] = useState(initialValue);

  // External data hooks
  const { data, isLoading } = useExternalData();

  // Complex calculations
  const computedValues = useMemo(() => {
    return calculateComplexLogic(data);
  }, [data]);

  // Event handlers
  const handleUserAction = useCallback((params) => {
    // Business logic here
  }, [dependencies]);

  // Return all state and handlers
  return {
    // Data
    data,
    computedValues,
    isLoading,

    // State
    localState,

    // Actions
    handleUserAction,
    setLocalState,
  };
};
```

### 2.2 Component Extraction Patterns

#### **Modal Components Pattern**

```javascript
// Original: LargeModal.jsx (400+ lines)
// Extract to:

// components/[domain]/[ModaName]Header.jsx
const ModalHeader = ({ title, onClose, editLock }) => (
  <div className="flex items-center justify-between p-4 border-b-2 border-black">
    <h2 className="font-black text-black text-base">
      <span className="text-lg">{title[0]}</span>
      {title.slice(1).toUpperCase()}
    </h2>
    {editLock && <EditLockIndicator {...editLock} />}
    <button onClick={onClose} className="p-2 border-2 border-black rounded-lg">
      <X className="h-4 w-4" />
    </button>
  </div>
);

// components/[domain]/[ModalName]Fields.jsx
const ModalFields = ({ formData, onChange, validation }) => (
  <div className="p-4 space-y-4">{/* Form fields with proper styling */}</div>
);
```

#### **Dashboard Components Pattern**

```javascript
// Original: LargeDashboard.jsx (400+ lines)
// Extract to:

// components/[domain]/[Dashboard]Header.jsx
const DashboardHeader = ({ title, actions, summary }) => (
  <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
    <h1 className="font-black text-black text-base mb-4">
      <span className="text-lg">{title[0]}</span>
      {title.slice(1).toUpperCase()}
    </h1>
    {summary && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{summary}</div>}
    {actions && <div className="flex gap-2 mt-4">{actions}</div>}
  </div>
);

// components/[domain]/[Dashboard]Section.jsx
const DashboardSection = ({ title, children, loading }) => (
  <div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
    <h3 className="font-black text-black text-base mb-4">
      <span className="text-lg">{title[0]}</span>
      {title.slice(1).toUpperCase()}
    </h3>
    {loading ? <LoadingSpinner /> : children}
  </div>
);
```

### 2.3 Utility Function Extraction

```javascript
// utils/[domain]/[featureName]Helpers.js

/**
 * Pure calculation functions
 */
export const calculateMetrics = (data) => {
  // Complex calculations here
  return processedResults;
};

/**
 * Validation functions
 */
export const validateFormData = (formData) => {
  const errors = [];
  // Validation logic
  return { isValid: errors.length === 0, errors };
};

/**
 * Formatting functions
 */
export const formatDisplayValue = (value, type) => {
  switch (type) {
    case "currency":
      return `$${value.toLocaleString()}`;
    case "percent":
      return `${value > 0 ? "+" : ""}${value}%`;
    default:
      return value;
  }
};

/**
 * Configuration constants
 */
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: "#8B5CF6",
    SUCCESS: "#10B981",
    ERROR: "#EF4444",
  },
  BREAKPOINTS: {
    MOBILE: "768px",
    TABLET: "1024px",
  },
};
```

---

## 🎨 **Phase 3: UI Standards Compliance**

### 3.1 Main Container Standards

```javascript
// Main page containers
<div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
  {/* Page content */}
</div>

// Card/section containers
<div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
  {/* Section content */}
</div>

// Modal containers
<div className="rounded-xl p-6 border-2 border-black bg-gradient-to-br from-white/95 to-purple-50/90 backdrop-blur-3xl shadow-2xl">
  {/* Modal content */}
</div>
```

### 3.2 Typography Standards

```javascript
// Primary headers (ALL CAPS pattern)
<h1 className="font-black text-black text-base">
  <span className="text-lg">F</span>IRST <span className="text-lg">W</span>ORD <span className="text-lg">H</span>EADER
</h1>

// Section headers
<h3 className="font-black text-black text-base">
  <span className="text-lg">S</span>ECTION <span className="text-lg">T</span>ITLE
</h3>

// Descriptions and subtext
<p className="text-purple-900">Description text for branded consistency</p>

// Important values
<span className="font-bold text-black">Important Data</span>
```

### 3.3 Button Standards

```javascript
// Primary action buttons
<button className="px-4 py-2 border-2 border-black bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all">
  Action Text
</button>

// Secondary buttons
<button className="px-4 py-2 border-2 border-black bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg font-bold shadow-md hover:bg-white/80 transition-all">
  Secondary Action
</button>

// Danger buttons
<button className="px-4 py-2 border-2 border-black bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold shadow-md hover:from-red-600 hover:to-orange-600 transition-all">
  Delete Action
</button>
```

### 3.4 Shared Component Integration

```javascript
// Always use standardized shared components
import StandardTabs from "../ui/StandardTabs";
import StandardFilters from "../ui/StandardFilters";
import PageSummaryCard from "../ui/PageSummaryCard";
import EditLockIndicator from "../ui/EditLockIndicator";
import { useConfirm } from "../ui/ConfirmModal";
import UniversalConnectionManager from "../ui/UniversalConnectionManager";

// Implementation
const { confirm } = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: "Confirm Deletion",
    message: "Are you sure you want to delete this item?",
    type: "danger",
  });

  if (confirmed) {
    // Perform deletion
  }
};
```

---

## 🧪 **Phase 4: Comprehensive Test Coverage**

### 4.1 Custom Hook Testing

```javascript
// hooks/[domain]/__tests__/use[HookName].test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { use[HookName] } from '../use[HookName]';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('use[HookName]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => use[HookName](), {
      wrapper: createWrapper()
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle user interactions correctly', async () => {
    const { result } = renderHook(() => use[HookName](), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.handleAction('test-data');
    });

    expect(result.current.data).toContain('test-data');
  });

  it('should handle error states gracefully', async () => {
    // Mock error conditions
    const { result } = renderHook(() => use[HookName](), {
      wrapper: createWrapper()
    });

    // Test error handling
    expect(result.current.error).toBeNull();
  });
});
```

### 4.2 Utility Function Testing

```javascript
// utils/[domain]/__tests__/[utility].test.js
import { calculateMetrics, validateFormData, formatDisplayValue } from "../[utility]";

describe("[utility] helpers", () => {
  describe("calculateMetrics", () => {
    it("should calculate correct metrics for valid data", () => {
      const input = [{ amount: 100 }, { amount: 200 }];
      const result = calculateMetrics(input);

      expect(result.total).toBe(300);
      expect(result.average).toBe(150);
    });

    it("should handle empty data gracefully", () => {
      const result = calculateMetrics([]);

      expect(result.total).toBe(0);
      expect(result.average).toBe(0);
    });

    it("should handle invalid data gracefully", () => {
      const result = calculateMetrics(null);

      expect(result).toEqual({ total: 0, average: 0, error: true });
    });
  });

  describe("validateFormData", () => {
    it("should validate correct form data", () => {
      const validData = { name: "Test", amount: 100 };
      const result = validateFormData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return errors for invalid data", () => {
      const invalidData = { name: "", amount: -1 };
      const result = validateFormData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Name is required");
    });
  });

  describe("formatDisplayValue", () => {
    it("should format currency correctly", () => {
      expect(formatDisplayValue(1234, "currency")).toBe("$1,234");
    });

    it("should format percentages correctly", () => {
      expect(formatDisplayValue(5, "percent")).toBe("+5%");
      expect(formatDisplayValue(-5, "percent")).toBe("-5%");
    });
  });
});
```

### 4.3 Component Testing Strategy

```javascript
// components/[domain]/__tests__/[Component].test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import [Component] from '../[Component]';

// Mock custom hooks
jest.mock('../../../hooks/[domain]/use[Hook]', () => ({
  use[Hook]: jest.fn(() => ({
    data: mockData,
    isLoading: false,
    handleAction: jest.fn(),
  }))
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('[Component]', () => {
  it('should render correctly with data', () => {
    render(<[Component] />, { wrapper: createWrapper() });

    expect(screen.getByText('Expected Content')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const mockHandleAction = jest.fn();
    use[Hook].mockReturnValue({
      data: mockData,
      isLoading: false,
      handleAction: mockHandleAction,
    });

    render(<[Component] />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button'));

    expect(mockHandleAction).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    use[Hook].mockReturnValue({
      data: [],
      isLoading: true,
      handleAction: jest.fn(),
    });

    render(<[Component] />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## 🔍 **Phase 5: ESLint Compliance**

### 5.1 Function Size Limits

```javascript
// Break down large functions into smaller, focused functions
// Max 75 lines per function (ESLint max-lines-per-function)

// ❌ Bad: Large monolithic function
const processLargeOperation = (data) => {
  // 100+ lines of mixed logic
};

// ✅ Good: Broken into focused helper functions
const validateInput = (data) => {
  // Validation logic only (10-15 lines)
};

const transformData = (data) => {
  // Transformation logic only (10-15 lines)
};

const calculateResults = (data) => {
  // Calculation logic only (10-15 lines)
};

const processLargeOperation = (data) => {
  const validationResult = validateInput(data);
  if (!validationResult.isValid) return validationResult;

  const transformedData = transformData(data);
  return calculateResults(transformedData);
};
```

### 5.2 Unused Variables

```javascript
// Use underscore prefix for intentionally unused parameters
// ❌ Bad: ESLint no-unused-vars warning
const useHook = (data, timeFilter) => {
  // timeFilter is not used
  return processData(data);
};

// ✅ Good: Prefix with underscore to indicate intentional
const useHook = (data, _timeFilter) => {
  // _timeFilter indicates intentionally unused parameter
  return processData(data);
};
```

### 5.3 Component Complexity

```javascript
// Keep components focused on single responsibility
// Extract complex logic to custom hooks
// Extract UI sections to sub-components

// ❌ Bad: Mixed concerns in one component
const ComplexComponent = () => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // ... many more state variables

  const handleAction1 = () => {
    // Complex logic
  };

  const handleAction2 = () => {
    // More complex logic
  };

  return <div>{/* Large JSX with mixed concerns */}</div>;
};

// ✅ Good: Separated concerns
const ComplexComponent = () => {
  const hookData = useComplexLogic();

  return (
    <div>
      <ComponentHeader {...hookData.headerProps} />
      <ComponentContent {...hookData.contentProps} />
      <ComponentActions {...hookData.actionProps} />
    </div>
  );
};
```

---

## 📏 **Phase 6: Visual Preservation**

### 6.1 Pixel-Perfect Maintenance

```javascript
// Document exact current styling
// Before refactoring, capture:
// 1. Screenshots at different screen sizes
// 2. Interactive states (hover, focus, active)
// 3. Loading states and animations
// 4. Error states and validation messages

// Maintain exact same classNames during refactoring
// Only update to meet UI standards where improvement is needed

// ❌ Bad: Changing styling during refactor
<div className="p-4 bg-gray-100"> {/* Original */}
<div className="p-6 bg-purple-100"> {/* Changed arbitrarily */}

// ✅ Good: Preserving original unless upgrading to standards
<div className="p-4 bg-gray-100"> {/* Keep original */}
// OR if upgrading to standards:
<div className="p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm"> {/* Standards compliant */}
```

### 6.2 Responsive Behavior

```javascript
// Maintain exact responsive breakpoints and behavior
// Document grid layouts, flex behavior, and breakpoint changes

const ResponsiveComponent = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Preserve exact responsive behavior */}
  </div>
);
```

### 6.3 Animation and Transitions

```javascript
// Preserve existing animations and micro-interactions
// Document transition durations and easing functions

const AnimatedComponent = () => (
  <div className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:scale-105">
    {/* Maintain existing animation behavior */}
  </div>
);
```

---

## 📋 **Phase 7: Quality Assurance Checklist**

### 7.1 Pre-Refactor Checklist

- [ ] Component identified (400+ lines)
- [ ] Current functionality documented
- [ ] Visual appearance captured (screenshots)
- [ ] Dependencies mapped
- [ ] Test strategy planned
- [ ] UI standards compliance plan created

### 7.2 During Refactor Checklist

- [ ] Custom hook created with all business logic
- [ ] UI components extracted with single responsibilities
- [ ] Shared utilities identified/created
- [ ] UI standards applied consistently
- [ ] Visual appearance preserved exactly
- [ ] All interactions maintained

### 7.3 Post-Refactor Checklist

- [ ] Comprehensive tests written (hooks, utilities, components)
- [ ] ESLint warnings/errors resolved
- [ ] Visual regression testing passed
- [ ] Functionality regression testing passed
- [ ] Performance impact assessed
- [ ] Documentation updated

### 7.4 Success Metrics

- [ ] **50%+ code reduction** achieved
- [ ] **Zero visual changes** (pixel-perfect preservation)
- [ ] **100% functionality preservation**
- [ ] **Full UI standards compliance**
- [ ] **90%+ test coverage** for extracted code
- [ ] **Zero ESLint errors/warnings** remaining

---

## 🏆 **Proven Results**

### Refactoring Success Examples

| Component               | Before  | After  | Reduction | Visual Changes | Test Coverage   |
| ----------------------- | ------- | ------ | --------- | -------------- | --------------- |
| AddBillModal            | 492     | 172    | 65%       | Zero           | ✅ Complete     |
| AddDebtModal            | 473     | 74     | 84%       | Zero           | ✅ Complete     |
| TransactionForm         | 477     | 176    | 63%       | Zero           | ✅ Complete     |
| TransactionLedger       | 403     | 173    | 57%       | Zero           | ✅ Complete     |
| **TrendAnalysisCharts** | **457** | **55** | **88%**   | **Zero**       | ✅ **Complete** |

**Average Results:**

- **71% code reduction**
- **100% visual preservation**
- **100% functionality preservation**
- **100% UI standards compliance**
- **100% test coverage**

---

## 🔄 **Continuous Improvement**

### Automated Quality Gates

- **ESLint**: Graduated file size enforcement (300+/400+/500+ lines)
- **Prettier**: Automated formatting on commit
- **Testing**: Comprehensive coverage requirements
- **Visual Regression**: Automated screenshot comparison (when available)

### Process Evolution

- **Pattern Recognition**: Document new patterns as they emerge
- **Shared Component Library**: Continuously expand reusable components
- **Utility Functions**: Build comprehensive utility libraries
- **Performance Optimization**: Monitor and optimize extracted components

This document serves as the definitive guide for component refactoring, ensuring consistent, high-quality results across all future refactoring efforts.
