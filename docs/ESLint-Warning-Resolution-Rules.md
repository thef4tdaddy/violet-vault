# ESLint Warning Resolution Rules

**Comprehensive guidelines for systematically addressing ESLint warnings without creating technical debt or regression**

## Core Principles

### 1. **Never Disable Warnings**

❌ **Forbidden**: `// eslint-disable-next-line`  
❌ **Forbidden**: Adding files to ESLint ignore patterns  
✅ **Required**: Address the underlying issue causing the warning

### 2. **Preserve Future-Intent Variables**

❌ **Don't Remove**: Variables marked with TODO comments  
❌ **Don't Remove**: Variables in configuration objects  
❌ **Don't Remove**: Hook return values that might be used later  
✅ **Use Underscore Prefix**: `const _futureFeature = useHook();`

### 3. **Avoid Problem Transfer**

❌ **Don't Create**: New complexity violations when fixing function size  
❌ **Don't Create**: New unused variable warnings when extracting functions  
❌ **Don't Create**: Import/export issues when moving code  
✅ **Validate**: Each fix doesn't introduce new warnings

## Warning-Specific Resolution Strategies

### **Function Size Warnings (`max-lines-per-function`)**

**Threshold**: 75 lines maximum

**Resolution Process**:

1. **Extract UI Components** - Move JSX blocks to separate components
2. **Extract Business Logic** - Create custom hooks for complex state management
3. **Extract Utilities** - Move calculations/validations to utility functions
4. **Maintain Single Responsibility** - Each extracted piece should have one clear purpose

**Example**:

```jsx
// ❌ Before: 150-line component
const LargeComponent = () => {
  // 50 lines of state logic
  // 50 lines of event handlers
  // 50 lines of JSX
};

// ✅ After: Extracted components
const useLargeComponentLogic = () => {
  /* 50 lines */
};
const LargeComponentHeader = () => {
  /* 20 lines */
};
const LargeComponentBody = () => {
  /* 30 lines */
};
const LargeComponent = () => {
  /* 25 lines */
};
```

### **Unused Variables (`no-unused-vars`)**

**Categories & Solutions**:

1. **Future Features** - Use underscore prefix

   ```js
   // ✅ Keep for future use
   const { data, _error, _loading } = useQuery();
   ```

2. **Hook Returns** - Extract only needed values

   ```js
   // ❌ Before
   const { data, error, loading, refetch } = useQuery();
   // Only using 'data'

   // ✅ After
   const { data } = useQuery();
   ```

3. **Function Parameters** - Use underscore prefix for intentionally unused

   ```js
   // ✅ Callback that doesn't need all parameters
   const handleClick = (event, _index, _item) => {
     event.preventDefault();
   };
   ```

4. **Configuration Objects** - Keep complete structure, use underscore
   ```js
   // ✅ Complete config for consistency
   const config = {
     api: "/endpoint",
     _timeout: 5000, // Not used yet but part of config
     retries: 3,
   };
   ```

### **Complexity Warnings (`complexity`)**

**Threshold**: 15 complexity maximum

**Resolution Strategies**:

1. **Extract Conditional Logic** - Move complex if/switch statements to utilities
2. **Use Strategy Pattern** - Replace complex conditionals with object maps
3. **Early Returns** - Reduce nesting with guard clauses
4. **Split Functions** - Break complex operations into focused functions

**Example**:

```js
// ❌ Before: High complexity
const processData = (data, type, options) => {
  if (type === "A") {
    if (options.fast) {
      if (data.length > 100) {
        // complex logic
      } else {
        // different logic
      }
    } else {
      // more complex logic
    }
  } else if (type === "B") {
    // more conditionals...
  }
};

// ✅ After: Extracted strategies
const DATA_PROCESSORS = {
  A: processTypeA,
  B: processTypeB,
};

const processData = (data, type, options) => {
  const processor = DATA_PROCESSORS[type];
  return processor?.(data, options) || defaultProcess(data);
};
```

### **React Hook Dependencies (`react-hooks/exhaustive-deps`)**

**Resolution Process**:

1. **Analyze Dependency** - Understand if missing dep is intentional
2. **Add Missing Dependencies** - Include all referenced variables
3. **Use useCallback/useMemo** - Stabilize function references
4. **Extract to useEffect** - For one-time initialization logic

**Example**:

```js
// ❌ Missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId

// ✅ Added dependency
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ Or stable reference if needed
const stableFetch = useCallback(() => {
  fetchData(userId);
}, [userId]);

useEffect(() => {
  stableFetch();
}, [stableFetch]);
```

### **Max Statements (`max-statements`)**

**Threshold**: 25 statements maximum

**Resolution**:

1. **Extract Logic Blocks** - Group related statements into functions
2. **Use Early Returns** - Reduce nested statement blocks
3. **Combine Variable Declarations** - Merge related declarations
4. **Extract Constants** - Move complex initializations outside function

## Implementation Checklist

### **Before Making Changes**:

- [ ] Identify warning category and root cause
- [ ] Check if variable/code has future-use comments
- [ ] Verify change won't break existing functionality
- [ ] Plan extraction strategy to maintain single responsibility

### **During Changes**:

- [ ] Use underscore prefix for intentionally unused variables
- [ ] Extract code into appropriately named functions/components
- [ ] Maintain existing functionality exactly
- [ ] Keep related code together when possible

### **After Changes**:

- [ ] Run ESLint to verify warning resolved
- [ ] Check no new warnings were introduced
- [ ] Verify build still passes
- [ ] Test affected functionality works correctly
- [ ] Review extracted code for clarity and reusability

## Priority Matrix

### **High Priority** (Fix Immediately)

- Function size violations (75+ lines)
- Complexity violations (15+ complexity)
- Actual unused variables (not future-intent)

### **Medium Priority** (Fix in Batches)

- Hook dependency warnings
- Max statements warnings
- Unused function parameters

### **Low Priority** (Fix During Related Work)

- Style/formatting warnings
- Import order warnings
- Prop validation warnings

## Examples of What NOT to Do

### ❌ **Disabling Warnings**

```js
// NEVER DO THIS
const largeFunction = () => {
  // eslint-disable-next-line max-lines-per-function
  // 200 lines of code...
};
```

### ❌ **Removing Future-Intent Code**

```js
// DON'T REMOVE - May be needed for analytics
const { data, error, loading } = useAnalytics(); // error & loading unused but kept

// WRONG - Removed potentially needed values
const { data } = useAnalytics();
```

### ❌ **Creating New Problems**

```js
// WRONG - Extracting creates more complexity
const extractedFunction = (a, b, c, d, e, f) => {
  // Now 6 parameters!
  if (a && b && c && d && e && f) {
    // Still complex!
    // logic
  }
};
```

## Success Metrics

- **Warning Reduction**: Target 10-20 warnings fixed per session
- **No New Warnings**: Each fix must not introduce new ESLint issues
- **Functionality Preservation**: All existing features must work identically
- **Code Quality**: Extracted code should be more readable and reusable
- **Build Stability**: All changes must pass build and test suites

## Documentation Requirements

When fixing ESLint warnings:

1. **Comment Intent**: Explain why variables are kept with underscore prefix
2. **Document Extractions**: Clear names for extracted functions/components
3. **Preserve Context**: Keep related functionality grouped logically
4. **Update Tests**: Ensure test coverage for extracted code

This systematic approach ensures ESLint warnings are resolved properly while maintaining code quality and avoiding technical debt.
