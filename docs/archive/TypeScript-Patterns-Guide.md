# TypeScript Patterns Contributor Guide

## 📋 Overview

VioletVault is a **JavaScript** codebase with **JSDoc annotations** for type safety. This guide explains how to properly type props, hooks, and Dexie queries using JSDoc, along with the decision log for type-related compromises and shims.

**Status**: Production Standard
**Related**: GitHub Issue #409

---

## 🎯 Type System Philosophy

### Why JSDoc Instead of TypeScript?

**Decision**: VioletVault uses JavaScript + JSDoc instead of TypeScript for the following reasons:

1. **Lower barrier to entry**: Contributors don't need TypeScript expertise
2. **Faster build times**: No TypeScript compilation step
3. **Gradual typing**: Type annotations are optional and can be added incrementally
4. **VSCode integration**: Full IntelliSense and type checking with JSDoc
5. **React 19 compatibility**: Simpler integration with latest React features

### Type Safety Strategy

- **Required typing**: Props for reusable components, public hook APIs, service functions
- **Optional typing**: Internal utilities, one-off components, simple functions
- **Type checking**: Enabled in VSCode via `@ts-check` or IDE settings (not enforced at build time)

---

## 🧩 Typing React Component Props

### Pattern 1: Simple Props (Recommended)

Use JSDoc `@param` tags for simple component props:

```javascript
/**
 * Bill Modal Header Component
 * @param {Object} props - Component props
 * @param {Object|null} props.editingBill - Bill being edited (null for new bill)
 * @param {Object} props.formData - Current form data
 * @param {string} props.formData.iconName - Icon name for the bill
 * @param {Function} props.onClose - Close modal handler
 */
const BillModalHeader = ({ editingBill, formData, onClose }) => {
  return (
    // Component JSX
  );
};
```

### Pattern 2: Complex Props with @typedef

For reusable components with complex prop types, use `@typedef`:

```javascript
/**
 * @typedef {Object} EnvelopeCardProps
 * @property {string} id - Envelope unique identifier
 * @property {string} name - Envelope name
 * @property {number} balance - Current balance
 * @property {number} allocated - Allocated amount
 * @property {string} category - Category name
 * @property {boolean} archived - Whether envelope is archived
 * @property {Function} onClick - Click handler
 * @property {Function} [onDelete] - Optional delete handler
 */

/**
 * Envelope Card Component
 * @param {EnvelopeCardProps} props - Component props
 */
const EnvelopeCard = ({ id, name, balance, allocated, category, archived, onClick, onDelete }) => {
  // Component implementation
};
```

### Pattern 3: Props with Nested Objects

For props containing nested structures (common in VioletVault):

```javascript
/**
 * @typedef {Object} Transaction
 * @property {string} id - Transaction ID
 * @property {number} date - Transaction date (timestamp)
 * @property {number} amount - Transaction amount
 * @property {string} envelopeId - Associated envelope ID
 * @property {string} category - Transaction category
 * @property {string} type - Type: 'income' | 'expense' | 'transfer'
 * @property {string} description - Transaction description
 */

/**
 * @typedef {Object} TransactionListProps
 * @property {Transaction[]} transactions - Array of transactions
 * @property {boolean} isLoading - Loading state
 * @property {Function} onEdit - Edit handler
 * @property {Function} onDelete - Delete handler
 */

/**
 * Transaction List Component
 * @param {TransactionListProps} props - Component props
 */
const TransactionList = ({ transactions, isLoading, onEdit, onDelete }) => {
  // Component implementation
};
```

### Pattern 4: Props with Union Types

Use JSDoc union syntax for props that accept multiple types:

```javascript
/**
 * Universal Connection Manager
 * @param {Object} props - Component props
 * @param {'bill'|'debt'|'savings'} props.entityType - Type of entity
 * @param {Object} props.entity - The entity object
 * @param {Array<Object>} props.envelopes - Available envelopes
 * @param {Function} props.onConnect - Connection handler
 * @param {Function} [props.onDisconnect] - Optional disconnect handler
 */
const UniversalConnectionManager = ({ entityType, entity, envelopes, onConnect, onDisconnect }) => {
  // Component implementation
};
```

---

## 🪝 Typing Custom Hooks

### Pattern 1: Simple Hook Return

Document hook return values with `@returns`:

```javascript
/**
 * Hook for managing activity logging
 * @returns {Object} Activity logger interface
 * @returns {Function} returns.logActivity - Log an activity
 * @returns {Function} returns.logEnvelopeCreated - Log envelope creation
 * @returns {Function} returns.logTransactionAdded - Log transaction addition
 * @returns {Function} returns.getRecentActivity - Get recent activities
 */
const useActivityLogger = () => {
  const { user: currentUser } = useAuthManager();

  useEffect(() => {
    if (currentUser) {
      activityLogger.setCurrentUser(currentUser);
    }
  }, [currentUser]);

  return {
    logActivity: activityLogger.logActivity.bind(activityLogger),
    logEnvelopeCreated: activityLogger.logEnvelopeCreated.bind(activityLogger),
    logTransactionAdded: activityLogger.logTransactionAdded.bind(activityLogger),
    getRecentActivity: activityLogger.getRecentActivity.bind(activityLogger),
    ACTIVITY_TYPES,
    ENTITY_TYPES,
  };
};
```

### Pattern 2: Hook with Options Parameter

Type hook options using `@typedef`:

```javascript
/**
 * @typedef {Object} TransactionQueryOptions
 * @property {Object} [dateRange] - Date range filter
 * @property {number} [dateRange.start] - Start timestamp
 * @property {number} [dateRange.end] - End timestamp
 * @property {string} [envelopeId] - Filter by envelope ID
 * @property {string} [category] - Filter by category
 * @property {'income'|'expense'|'transfer'} [type] - Transaction type filter
 * @property {number} [limit=100] - Maximum results
 * @property {string} [sortBy='date'] - Sort field
 * @property {'asc'|'desc'} [sortOrder='desc'] - Sort direction
 */

/**
 * Hook for querying transactions with TanStack Query
 * @param {TransactionQueryOptions} [options={}] - Query options
 * @returns {Object} Transaction query result
 * @returns {Array<Transaction>} returns.transactions - Transaction array
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error|null} returns.error - Error if any
 * @returns {Function} returns.refetch - Refetch function
 */
export const useTransactionQuery = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    dateRange,
    envelopeId,
    category,
    type,
    limit = 100,
    sortBy = "date",
    sortOrder = "desc",
  } = options;

  // Hook implementation
};
```

### Pattern 3: Hook with Complex Return Object

For hooks returning many values (like `useBudgetData`):

```javascript
/**
 * @typedef {Object} BudgetDataHook
 * @property {Array<Object>} envelopes - All envelopes
 * @property {Array<Transaction>} transactions - All transactions
 * @property {Array<Object>} bills - All bills
 * @property {Array<Object>} savingsGoals - All savings goals
 * @property {Array<Object>} paycheckHistory - Paycheck history
 * @property {number} unassignedCash - Unassigned cash amount
 * @property {number} actualBalance - Actual account balance
 * @property {boolean} isLoading - Global loading state
 * @property {boolean} isFetching - Global fetching state
 * @property {Function} addEnvelope - Add envelope mutation
 * @property {Function} updateEnvelope - Update envelope mutation
 * @property {Function} deleteEnvelope - Delete envelope mutation
 * @property {Function} addTransaction - Add transaction mutation
 * @property {Function} deleteTransaction - Delete transaction mutation
 * @property {Function} processPaycheck - Process paycheck mutation
 */

/**
 * Unified budget data hook combining TanStack Query, Zustand, and Dexie
 * Provides single interface for all budget data operations with smart caching,
 * real-time state, and offline persistence.
 *
 * @returns {BudgetDataHook} Complete budget data interface
 */
const useBudgetData = () => {
  // Get all queries
  const queries = useBudgetQueries();
  const mutations = useBudgetMutations();
  const paycheckMutations = usePaycheckMutations(queries.envelopesQuery, queries.savingsGoalsQuery);

  return {
    // Data
    envelopes: queries.envelopes,
    transactions: queries.transactions,
    // ... more properties
  };
};
```

### Pattern 4: Hook with Async Functions

Document async return values properly:

```javascript
/**
 * Hook for managing actual balance with reconciliation
 * @returns {Object} Actual balance interface
 * @returns {number} returns.actualBalance - Current actual balance
 * @returns {number} returns.calculatedBalance - System-calculated balance
 * @returns {number} returns.discrepancy - Difference between actual and calculated
 * @returns {Function} returns.updateActualBalance - Update balance (async)
 * @returns {Function} returns.reconcileWithCalculated - Reconcile balances (async)
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.hasDiscrepancy - Whether discrepancy exists
 */
const useActualBalance = () => {
  /**
   * Update the actual balance
   * @param {number} newBalance - The new balance value
   * @param {Object} options - Configuration options
   * @param {boolean} options.isManual - Whether this is a manual user input
   * @param {string} options.source - Source of the balance update
   * @returns {Promise<void>}
   */
  const updateActualBalance = async (newBalance, options = {}) => {
    // Implementation
  };

  return {
    actualBalance,
    calculatedBalance,
    discrepancy,
    updateActualBalance,
    reconcileWithCalculated,
    isLoading,
    hasDiscrepancy,
  };
};
```

---

## 💾 Typing Dexie Queries

### Pattern 1: Basic Dexie Query Functions

Type Dexie query functions that return arrays:

```javascript
/**
 * Query functions for budget data
 * These functions fetch data directly from Dexie (primary data source)
 */

export const queryFunctions = {
  /**
   * Get all envelopes from Dexie
   * @returns {Promise<Array<Object>>} Array of envelope objects
   */
  envelopes: async () => {
    const cachedEnvelopes = await budgetDb.envelopes.toArray();
    return cachedEnvelopes || [];
  },

  /**
   * Get transactions with optional filters
   * @param {Object} [filters={}] - Query filters
   * @param {Object} [filters.dateRange] - Date range filter
   * @param {number} [filters.dateRange.start] - Start timestamp
   * @param {number} [filters.dateRange.end] - End timestamp
   * @param {string} [filters.envelopeId] - Filter by envelope ID
   * @returns {Promise<Array<Transaction>>} Filtered transactions
   */
  transactions: async (filters = {}) => {
    let result;

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = await budgetDb.getTransactionsByDateRange(start, end);
    } else {
      result = await budgetDb.transactions.orderBy("date").reverse().toArray();
    }

    // Apply additional filters
    if (filters.envelopeId) {
      result = result.filter((t) => t.envelopeId === filters.envelopeId);
    }

    return result || [];
  },

  /**
   * Get all bills from Dexie
   * @returns {Promise<Array<Object>>} Array of bill objects
   */
  bills: async () => {
    const cachedBills = await budgetDb.bills.toArray();
    return cachedBills || [];
  },
};
```

### Pattern 2: Dexie Class Methods

Type methods in the Dexie database class:

```javascript
export class VioletVaultDB extends Dexie {
  constructor() {
    super("VioletVault");
    // Schema definition
  }

  /**
   * Get envelopes by category
   * @param {string} category - Category name
   * @param {boolean} [includeArchived=false] - Include archived envelopes
   * @returns {Promise<Array<Object>>} Filtered envelopes
   */
  async getEnvelopesByCategory(category, includeArchived = false) {
    const cacheKey = `envelopes_category_${category}_${includeArchived}`;
    let result = await this.getCachedValue(cacheKey);

    if (!result) {
      if (includeArchived) {
        result = await this.envelopes.where("category").equals(category).toArray();
      } else {
        result = await this.envelopes
          .where("[category+archived]")
          .equals([category, false])
          .toArray();
      }
      await this.setCachedValue(cacheKey, result, 60000);
    }

    return result;
  }

  /**
   * Get active envelopes (non-archived)
   * @returns {Promise<Array<Object>>} Active envelopes
   */
  async getActiveEnvelopes() {
    return this.envelopes.where("archived").equals(false).toArray();
  }

  /**
   * Get transactions by date range
   * @param {number} startDate - Start timestamp
   * @param {number} endDate - End timestamp
   * @returns {Promise<Array<Transaction>>} Transactions in date range
   */
  async getTransactionsByDateRange(startDate, endDate) {
    return this.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .reverse()
      .toArray();
  }

  /**
   * Get transactions for a specific envelope
   * @param {string} envelopeId - Envelope ID
   * @param {Object|null} [dateRange=null] - Optional date range
   * @param {number} [dateRange.start] - Start timestamp
   * @param {number} [dateRange.end] - End timestamp
   * @returns {Promise<Array<Transaction>>} Envelope transactions
   */
  async getTransactionsByEnvelope(envelopeId, dateRange = null) {
    if (dateRange) {
      return this.transactions
        .where("[envelopeId+date]")
        .between([envelopeId, dateRange.start], [envelopeId, dateRange.end], true, true)
        .reverse()
        .toArray();
    }

    return this.transactions.where("envelopeId").equals(envelopeId).toArray();
  }
}
```

### Pattern 3: Dexie Hooks

Type Dexie hook functions (for creating, updating):

```javascript
/**
 * Enhanced hooks for automatic timestamping across all tables
 * @param {Dexie.Table} table - Dexie table instance
 */
const addTimestampHooks = (table) => {
  /**
   * Creating hook - adds timestamps to new records
   * @param {string|number} primKey - Primary key
   * @param {Object} obj - Object being created
   * @param {Dexie.Transaction} trans - Dexie transaction
   */
  table.hook("creating", (primKey, obj, trans) => {
    try {
      obj.lastModified = Date.now();
      if (!obj.createdAt) obj.createdAt = Date.now();
    } catch (error) {
      // Handle frozen/sealed objects from Firebase
      if (
        error.message.includes("not extensible") ||
        error.message.includes("Cannot add property")
      ) {
        // Create extensible copy
        const extensibleObj = {};
        Object.keys(obj).forEach((key) => {
          extensibleObj[key] = obj[key];
        });
        extensibleObj.lastModified = Date.now();
        extensibleObj.createdAt = obj.createdAt || Date.now();
        return extensibleObj;
      }
      throw error;
    }
  });

  /**
   * Updating hook - updates lastModified timestamp
   * @param {Object} modifications - Modifications object
   * @param {string|number} _primKey - Primary key (unused)
   * @param {Object} _obj - Original object (unused)
   * @param {Dexie.Transaction} _trans - Dexie transaction (unused)
   */
  table.hook("updating", (modifications, _primKey, _obj, _trans) => {
    modifications.lastModified = Date.now();
  });
};
```

### Pattern 4: Complex Dexie Queries with Compound Indexes

Document queries using compound indexes:

```javascript
/**
 * Get bills by status and due date
 * Uses compound index [isPaid+dueDate] for efficient querying
 * @param {boolean} isPaid - Payment status
 * @param {number} startDate - Start date timestamp
 * @param {number} endDate - End date timestamp
 * @returns {Promise<Array<Object>>} Bills matching criteria
 */
async getBillsByStatusAndDueDate(isPaid, startDate, endDate) {
  return this.bills
    .where("[isPaid+dueDate]")
    .between([isPaid, startDate], [isPaid, endDate], true, true)
    .toArray();
}

/**
 * Get recurring bills by frequency
 * Uses compound index [isRecurring+frequency]
 * @param {'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly'} frequency - Bill frequency
 * @returns {Promise<Array<Object>>} Recurring bills with specified frequency
 */
async getRecurringBillsByFrequency(frequency) {
  return this.bills
    .where("[isRecurring+frequency]")
    .equals([true, frequency])
    .toArray();
}
```

---

## 🛠️ Utility Functions and Services

### Pattern 1: Pure Utility Functions

Type utility functions with clear inputs and outputs:

```javascript
/**
 * Calculate frequency in days
 * @param {'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly'} frequency - Frequency string
 * @returns {number} Number of days in the frequency period
 */
export const frequencyToDays = (frequency) => {
  const frequencies = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };
  return frequencies[frequency] || 30;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {Object} [options={}] - Formatting options
 * @param {string} [options.currency='USD'] - Currency code
 * @param {boolean} [options.showSymbol=true] - Show currency symbol
 * @param {number} [options.decimals=2] - Decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const { currency = "USD", showSymbol = true, decimals = 2 } = options;

  const formatted = new Intl.NumberFormat("en-US", {
    style: showSymbol ? "currency" : "decimal",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return formatted;
};
```

### Pattern 2: Service Class Methods

Type service class methods with clear documentation:

```javascript
/**
 * Activity Logger Service
 * Logs user activities for audit and analytics
 */
class ActivityLogger {
  /**
   * Set the current user for logging
   * @param {Object} user - User object
   * @param {string} user.uid - User ID
   * @param {string} user.email - User email
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * Log a general activity
   * @param {Object} activity - Activity details
   * @param {string} activity.type - Activity type from ACTIVITY_TYPES
   * @param {string} activity.entityType - Entity type from ENTITY_TYPES
   * @param {string} activity.entityId - Entity ID
   * @param {string} [activity.description] - Activity description
   * @param {Object} [activity.metadata] - Additional metadata
   * @returns {Promise<void>}
   */
  async logActivity(activity) {
    // Implementation
  }

  /**
   * Get recent activities
   * @param {Object} [options={}] - Query options
   * @param {number} [options.limit=50] - Maximum activities to return
   * @param {string} [options.entityType] - Filter by entity type
   * @param {number} [options.since] - Get activities since timestamp
   * @returns {Promise<Array<Object>>} Recent activities
   */
  async getRecentActivity(options = {}) {
    // Implementation
  }
}
```

---

## 🧪 Type Shims and Compromises

### Decision Log

This section documents type-related decisions, workarounds, and compromises made in the codebase.

#### 1. Firebase Frozen Objects Shim

**Problem**: Firebase returns frozen/sealed objects that can't have properties added.

**Solution**: Detect frozen objects in Dexie hooks and create extensible copies.

**Code Location**: `src/db/budgetDb.js` - `addTimestampHooks` function

```javascript
try {
  obj.lastModified = Date.now();
  if (!obj.createdAt) obj.createdAt = Date.now();
} catch (error) {
  if (error.message.includes("not extensible") || error.message.includes("Cannot add property")) {
    // Create extensible copy
    const extensibleObj = {};
    Object.keys(obj).forEach((key) => {
      extensibleObj[key] = obj[key];
    });
    extensibleObj.lastModified = Date.now();
    extensibleObj.createdAt = obj.createdAt || Date.now();
    return extensibleObj;
  }
  throw error;
}
```

**Decision Rationale**: Creating a new object is the only way to add properties to frozen objects. This is a necessary compromise for Firebase integration.

#### 2. Zustand `get()` Compromise

**Problem**: Using `get()` inside Zustand actions causes React error #185 (infinite loops).

**Solution**: Use `set((state) => ...)` pattern or external `store.getState()` for async operations.

**Code Location**: See `docs/Zustand-Safe-Patterns.md`

```javascript
// ❌ FORBIDDEN
const store = create((set, get) => ({
  count: 0,
  increment: () => {
    const current = get().count; // Causes infinite loops
    set({ count: current + 1 });
  },
}));

// ✅ CORRECT
const store = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

**Decision Rationale**: This pattern prevents infinite render loops while maintaining type safety. External `getState()` is safe for async operations.

#### 3. Optional Chaining in Dexie Queries

**Problem**: Dexie queries may return `undefined` if database is not initialized.

**Solution**: Always provide fallback values and use optional chaining.

```javascript
// ✅ SAFE - Always provide fallback
const envelopes = (await budgetDb.envelopes.toArray()) || [];

// ✅ SAFE - Optional chaining with fallback
const transactions = (await budgetDb.transactions?.orderBy("date").toArray()) || [];
```

**Decision Rationale**: Prevents runtime errors when database is not yet initialized or data is missing.

#### 4. Union Type Strings

**Problem**: String literal unions are not enforced at runtime in JavaScript.

**Solution**: Document expected values in JSDoc and validate in code when critical.

```javascript
/**
 * @param {'income'|'expense'|'transfer'} type - Transaction type
 */
const processTransaction = (type) => {
  // Validate critical enum values
  const validTypes = ["income", "expense", "transfer"];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid transaction type: ${type}`);
  }
  // Process transaction
};
```

**Decision Rationale**: Runtime validation for critical values, documentation for non-critical values.

#### 5. Any-Typed Firebase Responses

**Problem**: Firebase responses have dynamic structure that's hard to type accurately.

**Solution**: Type the _expected_ structure but handle unexpected data gracefully.

```javascript
/**
 * Fetch budget data from Firebase
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Budget data (structure may vary)
 */
const fetchBudgetData = async (userId) => {
  try {
    const doc = await getDoc(doc(db, "budgets", userId));
    const data = doc.data();

    // Validate expected structure
    if (!data || typeof data !== "object") {
      logger.warn("Invalid budget data structure", { userId });
      return getDefaultBudgetData();
    }

    return data;
  } catch (error) {
    logger.error("Failed to fetch budget data", error);
    return getDefaultBudgetData();
  }
};
```

**Decision Rationale**: Firebase data structure can change. Graceful handling is better than strict typing.

#### 6. React Component Children Type

**Problem**: `children` prop type is ambiguous in JSDoc.

**Solution**: Use `React.ReactNode` equivalent or describe expected structure.

```javascript
/**
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} [props.className] - Additional CSS classes
 */
const Container = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

// Alternative: Describe expected structure
/**
 * @param {Object} props - Component props
 * @param {JSX.Element|JSX.Element[]|string|null} props.children - Child elements
 */
```

**Decision Rationale**: JSDoc doesn't have perfect React type support. Document what's expected.

#### 7. TanStack Query Generic Types

**Problem**: TanStack Query uses complex generic types that are verbose in JSDoc.

**Solution**: Type the return value, not the query object itself.

```javascript
/**
 * Query for transactions data
 * @returns {Object} Query result
 * @returns {Array<Transaction>} returns.data - Transaction data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error|null} returns.error - Error if any
 */
const useTransactionsQuery = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      return await budgetDb.transactions.toArray();
    },
  });
};
```

**Decision Rationale**: Focus on what the consumer needs to know, not internal TanStack types.

#### 8. Event Handler Types

**Problem**: Event types are verbose and vary by element.

**Solution**: Use generic event description or specific handler signature.

```javascript
/**
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler (receives mouse event)
 * @param {Function} props.onChange - Change handler (receives input value)
 */
const Button = ({ onClick, onChange }) => {
  return (
    <button onClick={onClick} onChange={(e) => onChange(e.target.value)}>
      Click me
    </button>
  );
};

// Alternative: Full event type (more verbose)
/**
 * @param {Object} props - Component props
 * @param {(event: React.MouseEvent<HTMLButtonElement>) => void} props.onClick
 */
```

**Decision Rationale**: Simpler documentation for better readability. Full types available in IDE autocomplete.

---

## 🎨 Best Practices Summary

### DO ✅

- **Document public APIs**: Type all exported hooks, components, and service functions
- **Use `@typedef` for complex types**: Share type definitions across multiple functions
- **Provide fallback values**: Always handle `undefined`/`null` cases
- **Validate critical inputs**: Add runtime checks for critical enum/union values
- **Keep it simple**: Favor readability over exhaustive type coverage
- **Use meaningful names**: Variable and parameter names should indicate their purpose

### DON'T ❌

- **Over-document**: Internal utilities with obvious signatures don't need full JSDoc
- **Duplicate React types**: Don't redefine standard React types (use `React.ReactNode`)
- **Use `any` type**: If you can't type it, document what's expected
- **Ignore errors**: Always handle Dexie/Firebase errors gracefully
- **Trust external data**: Validate data from Firebase before using
- **Use complex generics**: Keep JSDoc types simple and clear

---

## 📚 Related Documentation

- **[Zustand Safe Patterns](./Zustand-Safe-Patterns.md)** - Patterns for state management
- **[Shared UI Components](./Shared-UI-Components.md)** - Component prop patterns
- **[ESLint Rules](./ESLint-Rules.md)** - Linting rules for code quality
- **[Testing Strategy](./Testing-Strategy.md)** - How to test typed code
- **[Source Code Directory](./Source-Code-Directory.md)** - Codebase structure

---

## 🔄 Version History

- **v1.0** (2024-01-XX): Initial TypeScript/JSDoc patterns guide
- Parent Issue: [#409 - Developer experience enhancements](https://github.com/thef4tdaddy/violet-vault/issues/409)
