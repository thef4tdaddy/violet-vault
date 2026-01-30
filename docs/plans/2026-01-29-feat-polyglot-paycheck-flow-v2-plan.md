---
title: Polyglot Human-Centered Paycheck Flow v2.1
type: feat
date: 2026-01-29
epic: "#156"
milestone: v2.1
---

# Polyglot Human-Centered Paycheck Flow v2.1

## Overview

Transform the paycheck allocation experience into a premium, conversational wizard that guides users through intelligent income distribution with privacy-first architecture. This epic redesigns how users allocate their paychecks across envelopes using a multi-step wizard with AI-powered suggestions (blinded/anonymized), high-performance backend services in Go and Python, and a "Hard Lines" design aesthetic.

**Epic**: #156
**Sub-Issues**:
- **Infrastructure**: #1833 (Zustand Store ✅), #1843 (Zod Validation)
- **Frontend**: #157 (Entry Point), #1785 (Wizard Container), #1837 (Amount Entry), #162 (Smart Allocation UI), #1838 (Review Step), #161 (Success Screen)
- **Backend**: #1786 (Go Engine), #1787 (Python Predictor)

**Status**: In Progress (1/10 sub-issues complete)
**Priority**: High (🟠)
**Target Milestone**: v2.1

### Executive Summary

This is a **full-stack polyglot feature** spanning:
- **Frontend**: React 19 wizard with Zustand state management, Framer Motion animations, IndexedDB persistence
- **Backend**: Go allocation engine (<1ms performance), Python ML prediction service (privacy-preserving)
- **Privacy**: E2EE compliant, blinded calculations, zero-persistence analytics
- **Design**: "Hard Lines" aesthetic (thick black borders, sharp corners, high-contrast palette)

The implementation involves 6 coordinated components across multiple technologies, requiring careful orchestration of frontend state, backend services, and privacy architecture.

---

## Problem Statement

### Current State Pain Points

1. **No Guided Experience**: Users manually allocate paychecks without suggestions or assistance
2. **Repetitive Work**: Each paycheck requires the same allocation decisions
3. **No Intelligence**: System doesn't learn from user patterns or provide smart defaults
4. **Fragmented UX**: Allocation happens in generic transaction forms, not a specialized flow
5. **Missing Motivation**: No celebration or feedback when completing budget allocations
6. **Performance**: Current allocation logic can be slow with many envelopes

### User Impact

- **Time Waste**: Users spend 5-10 minutes per paycheck manually entering amounts
- **Decision Fatigue**: 20+ envelopes means 20+ decisions every 2 weeks
- **Errors**: Manual entry leads to typos, miscalculations, forgotten envelopes
- **Lack of Guidance**: New users don't know how much to allocate where
- **No Pattern Recognition**: Users repeat the same allocations without system memory

### Business Impact

- **Engagement Drop**: Paycheck allocation is a high-friction moment
- **Abandonment Risk**: Users may leave platform due to tedious workflows
- **Feature Gap**: Competitors offer guided allocation experiences
- **Data Insights Lost**: Without tracking patterns, we can't provide personalized advice

---

## Proposed Solution

### High-Level Approach

Build a **multi-step conversational wizard** that:
1. Detects when user gets paid (±3 days of expected date)
2. Presents prominent "GOT PAID?" entry point on dashboard
3. Guides user through 3-4 wizard steps with smooth animations
4. Offers intelligent allocation suggestions based on historical patterns
5. Provides real-time validation and feedback
6. Celebrates completion with motivational summary and confetti
7. Persists progress so users can resume if interrupted

### Key Capabilities

**Smart Allocation Options**:
- **Use Last Split**: Clone ratios from previous paycheck (scaled to new amount)
- **Split Evenly**: Distribute based on monthly funding targets (weighted)
- **Smart Split**: AI-powered suggestions from Python prediction service (blinded)
- **Manual Override**: User can always customize individual allocations

**Privacy-First Architecture**:
- **Blinded Calculations**: Server receives only numbers (amounts, ratios), never envelope names or user identity
- **Zero-Persistence Analytics**: Python service processes data in ephemeral sessions, no logs
- **Client-Side Encryption**: All sensitive data encrypted before IndexedDB storage
- **No Tracking**: Analytics track interactions (clicks, time), not financial amounts

**Performance**:
- **<1ms Allocation**: Go engine calculates splits for 100+ envelopes in under 1 millisecond
- **Cents-Perfect Math**: Integer-based calculations avoid floating-point errors
- **Offline Support**: IndexedDB + TanStack Query mutations persistence for reliability
- **Smooth UX**: React 19 concurrent features + Framer Motion for lag-free experience

---

## Technical Approach

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React 19 Frontend                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dashboard with "GOT PAID?" Entry Point (#157)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Paycheck Wizard Container (#1785)                       │   │
│  │  - Zustand state (wizard step, form data, allocations)  │   │
│  │  - IndexedDB persistence (survives page refresh)        │   │
│  │  - Framer Motion transitions (AnimatePresence)          │   │
│  │  - Routing: /vault/wizard/paycheck                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                    │                    │              │
│    ┌────▼────┐         ┌─────▼─────┐       ┌────▼─────┐        │
│    │ Step 1  │         │  Step 2   │       │  Step 3  │        │
│    │ Amount  │ ─────▶  │ Allocate  │ ────▶ │  Review  │        │
│    └─────────┘         └───────────┘       └──────────┘        │
│                              │                    │              │
│                         (#162 Smart UI)           │              │
│                              │                    │              │
│                              ▼                    ▼              │
│                    [SMART SPLIT Button]    [CONTINUE Button]    │
│                              │                    │              │
└──────────────────────────────┼────────────────────┼──────────────┘
                               │                    │
                    ┌──────────▼────────────────────▼──────────┐
                    │      TanStack Query v5                   │
                    │  - Optimistic updates                    │
                    │  - Offline mutations persistence         │
                    │  - Server state cache                    │
                    └──────────┬────────────────────┬───────────┘
                               │                    │
                    ┌──────────▼──────────┐  ┌──────▼───────────────┐
                    │  Go Allocation      │  │  Python Prediction   │
                    │  Engine (#1786)     │  │  Service (#1787)     │
                    │                     │  │                      │
                    │  - Cents-perfect    │  │  - Blinded requests  │
                    │    integer math     │  │  - Pattern detection │
                    │  - <1ms performance │  │  - Ephemeral session │
                    │  - Largest remainder│  │  - NO persistence    │
                    │    dust distribution│  │                      │
                    └─────────────────────┘  └──────────────────────┘
                               │                    │
                    ┌──────────▼────────────────────▼──────────┐
                    │  Firestore Database (E2EE)               │
                    │  - Envelopes                             │
                    │  - Paycheck history (encrypted)          │
                    │  - User settings                         │
                    └──────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Success Screen     │
                    │  (#161)             │
                    │  - Summary          │
                    │  - Confetti         │
                    │  - Query invalidate │
                    └─────────────────────┘
```

### Data Schema & Validation Architecture

#### Paychecks as Transactions

**Critical Architecture Decision**: Paychecks are NOT a separate entity type. They are **Transaction** records with type `"income"` and special paycheck-specific fields.

**Why This Matters**:
- Single source of truth for financial data
- Consistent querying and reporting
- Unified transaction history
- Leverages existing Transaction schema validation

**Transaction Schema for Paychecks** (`src/domain/schemas/transaction.ts`):
```typescript
{
  // Required Transaction fields
  id: string,
  date: Date | string,
  amount: number,                           // Total paycheck in cents (positive)
  type: "income",                           // Always "income" for paychecks
  envelopeId: string,                       // Primary envelope (e.g., "Paycheck" envelope)
  category: string,
  lastModified: number,

  // Paycheck-specific fields (lines 43-48)
  allocations: Record<string, number>,      // envelopeId -> amountCents mapping
  unassignedCashBefore: number | null,      // Balance before allocation
  unassignedCashAfter: number | null,       // Balance after allocation
  actualBalanceBefore: number | null,       // Actual balance before
  actualBalanceAfter: number | null,        // Actual balance after

  // Recurring paycheck support (line 42)
  recurrenceRule: string | null,            // iCal RRule format (e.g., "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR")

  // Additional paycheck metadata
  paycheckId: string | null,                // Optional identifier
  payerName: string | null,                 // Employer name
}
```

**Example Paycheck Transaction**:
```typescript
{
  id: "txn_paycheck_2026_01_15",
  date: "2026-01-15",
  amount: 250000,  // $2,500.00
  type: "income",
  envelopeId: "env_paycheck",
  category: "Salary",
  lastModified: 1706140800000,

  // Paycheck allocation to 3 envelopes
  allocations: {
    "env_rent": 100000,      // $1,000 to Rent
    "env_groceries": 50000,  // $500 to Groceries
    "env_savings": 100000,   // $1,000 to Savings
  },

  // Recurring biweekly on Friday
  recurrenceRule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR",

  payerName: "Acme Corp",
  paycheckId: "paycheck_biweekly_001",
}
```

**Recurring Paycheck Support**:
- Use `recurrenceRule` field with iCal RRule syntax ([RFC 5545](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html))
- Python prediction service can detect patterns and suggest recurrence rules
- Common patterns:
  - Weekly: `FREQ=WEEKLY;BYDAY=FR` (every Friday)
  - Biweekly: `FREQ=WEEKLY;INTERVAL=2;BYDAY=FR` (every other Friday)
  - Monthly: `FREQ=MONTHLY;BYMONTHDAY=15` (15th of each month)
  - Semi-monthly: `FREQ=MONTHLY;BYMONTHDAY=1,15` (1st and 15th)

#### Zod Validation Integration (#1843)

**Critical Requirement**: All financial data MUST be validated using Zod schemas before:
- Setting state in Zustand store
- Sending to API endpoints
- Creating Transaction records
- Persisting to database

**Validation Layers**:

1. **Wizard Input Validation** (`paycheckWizardValidation.ts`):
   ```typescript
   // Paycheck amount validation
   const PaycheckAmountSchema = z.object({
     amountCents: z.number()
       .int("Amount must be in whole cents")
       .positive("Amount must be positive")
       .min(100, "Minimum $1.00")
       .max(100_000_000, "Maximum $1,000,000.00"),
   });

   // Allocation validation
   const AllocationSchema = z.object({
     envelopeId: z.string().min(1),
     amountCents: z.number().int().nonnegative(),
   });

   const AllocationsArraySchema = z.array(AllocationSchema)
     .refine(
       (allocations, ctx) => {
         const total = ctx.parent.paycheckAmountCents;
         const sum = allocations.reduce((s, a) => s + a.amountCents, 0);
         return sum === total; // MUST sum exactly
       },
       { message: "Allocations must sum to exact paycheck amount" }
     );
   ```

2. **Store Action Validation**:
   ```typescript
   setPaycheckAmountCents: (amountCents: number) => {
     const result = PaycheckAmountSchema.safeParse({ amountCents });
     if (!result.success) {
       logger.error("Invalid paycheck amount", result.error);
       return; // Don't update state
     }
     set((state) => { state.paycheckAmountCents = amountCents; });
   }
   ```

3. **Transaction Creation Validation**:
   ```typescript
   const createPaycheckTransaction = (wizardData: PaycheckWizardData): Transaction => {
     // Build Transaction object
     const transaction = {
       type: "income",
       amount: wizardData.paycheckAmountCents,
       allocations: wizardData.allocations.reduce(
         (acc, a) => ({ ...acc, [a.envelopeId]: a.amountCents }),
         {}
       ),
       recurrenceRule: wizardData.recurrenceRule || null,
       // ... other fields
     };

     // Validate against TransactionSchema
     return TransactionSchema.parse(transaction);
   };
   ```

4. **API Boundary Validation**:
   - Go engine validates allocation request structure (blinded, no envelope names)
   - Python service validates prediction request structure
   - Both validate responses before client consumes

**Privacy Compliance**:
- Validation happens **client-side** (no data leaves browser during validation)
- API requests are **blinded** (only numbers, no envelope names or user identity)
- Validation errors **never log sensitive data** (amounts, allocations)

**Validation Dependencies**:
- #1843 (Zod Validation) must complete before #1785, #1837, #162, #1838
- All wizard steps depend on validation infrastructure
- Transaction creation requires validation helper functions

#### Local Paycheck History Service

**File**: `src/utils/core/services/paycheckHistory.ts`

**Purpose**: Privacy-first local storage for paycheck history to enable smart pre-fill and autocomplete in Amount Entry Step (#1837).

**localStorage Schema**:
```typescript
interface PaycheckHistoryEntry {
  payerName: string;              // Employer name
  lastAmountCents: number;        // Most recent paycheck amount
  lastDate: string;               // ISO date of last paycheck
  totalCount: number;             // Number of paychecks received
  averageAmountCents: number;     // Rolling average
  frequency?: "weekly" | "biweekly" | "semi-monthly" | "monthly";
}

// Storage key: 'violet-vault-paycheck-history'
// Max 50 entries, LRU eviction
```

**Service Methods**:
```typescript
export class PaycheckHistoryService {
  private static STORAGE_KEY = 'violet-vault-paycheck-history';
  private static MAX_ENTRIES = 50;

  // Get all history entries
  static getHistory(): PaycheckHistoryEntry[]

  // Get history for specific employer
  static getByPayerName(name: string): PaycheckHistoryEntry | null

  // Add or update paycheck entry
  static addOrUpdate(entry: {
    payerName: string;
    amountCents: number;
    date: string;
  }): void

  // Get recent employer names for autocomplete
  static getRecentPayers(limit = 10): string[]

  // Detect pay frequency from historical patterns
  static detectFrequency(payerName: string): string | null

  // Clear all history (privacy)
  static clear(): void
}
```

**Privacy Guarantees**:
- ✅ **100% Client-Side**: All data stored in browser localStorage, never synced to server
- ✅ **Minimal Data**: Only stores employer name, amount, date, count, average
- ✅ **User Control**: Can be cleared anytime via browser storage settings
- ✅ **No PII**: No sensitive employer details, bank accounts, SSN, or tax data
- ✅ **No Tracking**: History never sent to analytics or external services

**Integration with Amount Entry Step**:
1. User types employer name → autocomplete suggests from `getRecentPayers()`
2. User selects employer → `getByPayerName()` retrieves history
3. If history found → pre-fill amount with `lastAmountCents`
4. Show hint: "💡 Last paycheck: $X,XXX.XX on [date] ⏰ [frequency]"
5. On wizard success → `addOrUpdate()` saves new paycheck data

**Testing**:
- Unit tests for all service methods
- Edge cases: duplicate employers, malformed data, storage quota exceeded
- Integration tests with AmountEntryStep component
- Privacy compliance validation (no server calls)

### Component Breakdown

#### 1. Entry Point (#157)
**File**: `src/components/dashboard/GotPaidCTA.tsx`

**Responsibilities**:
- Display prominent "GOT PAID?" button on dashboard
- Calculate visibility based on expected pay date (±3 days)
- Route to wizard on click
- Visual: Slate-50 bg, fuchsia-500 borders, dollar emoji with pulse animation

**Integration Points**:
- Dashboard layout (top of page or QuickActions bar)
- User settings (expected pay date)
- Paycheck history (for date calculation)

**Technical Details**:
```tsx
// Pseudo-code structure
interface GotPaidCTAProps {
  userId: string
  expectedPayDate?: Date
  hasPaycheckEnvelope: boolean
}

// Visibility logic
const isVisible = useMemo(() => {
  if (!hasPaycheckEnvelope) return false
  if (!expectedPayDate) return true // Always show if no expected date

  const today = new Date()
  const daysDiff = Math.abs(differenceInDays(today, expectedPayDate))
  return daysDiff <= 3
}, [expectedPayDate, hasPaycheckEnvelope])

// Visual states
- Default: Slate-50 bg, black border-2, fuchsia-500 accent
- Hover: Scale up, glow effect
- Active: Scale down (active:scale-95)
- Animation: Dollar emoji pulses (animate-pulse)
```

**Acceptance Criteria**:
- [ ] Button visible when user has Paycheck envelope
- [ ] Button visible within ±3 days of expected pay date
- [ ] Button hidden outside pay window (if expected date configured)
- [ ] Click routes to `/vault/wizard/paycheck`
- [ ] Hover/active states smooth and responsive
- [ ] 80%+ test coverage

#### 2. Wizard Container (#1785)
**File**: `src/components/budgeting/paycheck-flow/PaycheckWizardModal.tsx`

**Responsibilities**:
- Multi-step navigation with [BACK]/[CONTINUE] buttons
- Zustand state management (current step, form data, allocations)
- IndexedDB persistence (resume on page refresh)
- Framer Motion slide transitions between steps
- Progress indicator (Step X of Y)

**State Management**:
```typescript
// src/stores/ui/paycheckFlowStore.ts
interface PaycheckFlowState {
  // Modal state
  isOpen: boolean
  currentStep: number  // 0-indexed

  // Form data
  paycheckAmount: number | null  // cents
  selectedStrategy: 'last' | 'even' | 'smart' | 'manual'
  allocations: Array<{
    envelopeId: string
    amountCents: number
  }>
  payerName: string | null                 // Employer/payer name (optional)

  // Actions
  openWizard: () => void
  closeWizard: () => void
  nextStep: () => void
  prevStep: () => void
  setPaycheckAmount: (amount: number) => void
  setPayerName: (name: string | null) => void
  setAllocations: (allocs: Allocation[]) => void
  reset: () => void
}

// Middleware stack
export const usePaycheckFlowStore = create<PaycheckFlowState>()(
  devtools(
    persist(
      immer((set) => ({
        // ... state and actions
      })),
      {
        name: 'paycheck-flow-storage',
        storage: createJSONStorage(() => indexedDBStorage),
        version: 1,

        // CRITICAL: Only persist non-sensitive data
        partialize: (state) => ({
          currentStep: state.currentStep,
          selectedStrategy: state.selectedStrategy,
          payerName: state.payerName,  // OK to persist (helps with autocomplete)
          // DO NOT persist paycheckAmount or allocations (privacy)
        })
      }
    ),
    { name: 'PaycheckFlowStore' }
  )
)
```

**Step Sequence**:
1. **Step 0**: Amount Entry
   - Optional payee/employer name input (text field)
   - Autocomplete from local history (last 10 employers)
   - Smart pre-fill: typing employer name → auto-fill amount from history
   - Show helpful hint when match found: "💡 Last paycheck: $2,500.00 on Jan 15 ⏰ Usually biweekly"
   - Input field for paycheck amount (auto-filled if employer match found)
   - Validation: min $0.01, max $1,000,000
   - Auto-format: $1,234.56
   - Local history tracking (localStorage, privacy-first, never synced)

2. **Step 1**: Allocation Strategy Selection
   - Quick action buttons: [USE LAST SPLIT], [SPLIT EVENLY], [SMART SPLIT]
   - Each button fetches/calculates allocations
   - Real-time "Remaining to Allocate" counter

3. **Step 2**: Review & Adjust
   - Grid of envelopes with allocation amounts
   - Manual adjustment inputs
   - Validation: sum must equal paycheck amount

4. **Step 3**: Success Screen
   - Summary of allocations
   - Motivational messaging
   - Confetti animation

**Technical Details**:
```tsx
// Animation configuration
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
}

const transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
}

// Step navigation
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={transition}
  >
    <CurrentStepComponent />
  </motion.div>
</AnimatePresence>
```

**Acceptance Criteria**:
- [ ] Fluid multi-step navigation (forward/backward)
- [ ] State persists between steps (survives page refresh)
- [ ] Responsive design matching "Hard Lines" aesthetic
- [ ] Progress indicator accurate and clear
- [ ] Browser back button navigates steps correctly
- [ ] Cancel/exit clears state after confirmation
- [ ] 80%+ test coverage for state transitions

#### 3. Go Allocation Engine (#1786)
**File**: `api/paycheck/allocate.go`

**Responsibilities**:
- High-speed biweekly income distribution calculation
- Cents-perfect integer math (no floating point errors)
- Dust/remainder distribution using largest remainder method
- Support for multiple allocation strategies

**API Contract**:
```go
// Request
type AllocationRequest struct {
    PaycheckCents int64                 `json:"paycheck_cents"`
    Strategy      string                 `json:"strategy"` // "even", "last", "target_first"
    Envelopes     []EnvelopeAllocation  `json:"envelopes"`
    LastSplitRatios []float64           `json:"last_split_ratios,omitempty"` // For "last" strategy
}

type EnvelopeAllocation struct {
    ID              string `json:"id"`
    MonthlyTarget   int64  `json:"monthly_target"`   // cents
    CurrentBalance  int64  `json:"current_balance"`  // cents
    Category        string `json:"category"`
    Priority        int    `json:"priority"`
}

// Response
type AllocationResponse struct {
    Allocations []AllocationResult `json:"allocations"`
    TotalCents  int64              `json:"total_cents"`
    DustCents   int64              `json:"dust_cents"` // Should always be 0
}

type AllocationResult struct {
    EnvelopeID    string `json:"envelope_id"`
    AmountCents   int64  `json:"amount_cents"`
    Percentage    float64 `json:"percentage"`
}
```

**Allocation Strategies**:

**Even Split**:
```go
// Distribute based on monthly targets (weighted)
func evenSplit(total int64, envelopes []EnvelopeAllocation) []int64 {
    targetSum := int64(0)
    for _, e := range envelopes {
        targetSum += e.MonthlyTarget
    }

    if targetSum == 0 {
        // No targets, split equally
        return equalSplit(total, len(envelopes))
    }

    allocations := make([]int64, len(envelopes))
    remainders := make([]int64, len(envelopes))
    allocated := int64(0)

    for i, e := range envelopes {
        // Proportional allocation
        amount := (total * e.MonthlyTarget) / targetSum
        allocations[i] = amount
        allocated += amount

        // Track remainder for largest remainder method
        remainders[i] = (total * e.MonthlyTarget) % targetSum
    }

    // Distribute dust using largest remainder method
    dust := total - allocated
    if dust > 0 {
        indices := argsortDesc(remainders)
        for j := int64(0); j < dust; j++ {
            allocations[indices[j]]++
        }
    }

    return allocations
}
```

**Last Split**:
```go
// Apply historical ratios to new amount
func lastSplit(total int64, ratios []float64) []int64 {
    n := len(ratios)
    allocations := make([]int64, n)
    remainders := make([]float64, n)
    allocated := int64(0)

    for i, ratio := range ratios {
        amount := int64(float64(total) * ratio)
        allocations[i] = amount
        allocated += amount

        // Track fractional remainder
        remainders[i] = float64(total)*ratio - float64(amount)
    }

    // Distribute dust to highest remainders
    dust := total - allocated
    if dust > 0 {
        indices := argsortDesc(remainders)
        for j := int64(0); j < dust; j++ {
            allocations[indices[j]]++
        }
    }

    return allocations
}
```

**Target First**:
```go
// Prioritize envelopes with funding targets (bills first)
func targetFirst(total int64, envelopes []EnvelopeAllocation) []int64 {
    // Sort by priority (bills = highest priority)
    sort.Slice(envelopes, func(i, j int) bool {
        return envelopes[i].Priority > envelopes[j].Priority
    })

    allocations := make([]int64, len(envelopes))
    remaining := total

    for i, e := range envelopes {
        if e.MonthlyTarget > 0 && remaining > 0 {
            needed := e.MonthlyTarget - e.CurrentBalance
            if needed > remaining {
                allocations[i] = remaining
                remaining = 0
            } else {
                allocations[i] = needed
                remaining -= needed
            }
        }
    }

    // Distribute any remaining amount evenly
    if remaining > 0 {
        perEnvelope := remaining / int64(len(envelopes))
        dust := remaining % int64(len(envelopes))

        for i := range allocations {
            allocations[i] += perEnvelope
            if i < int(dust) {
                allocations[i]++
            }
        }
    }

    return allocations
}
```

**Performance Requirements**:
- <1ms execution time for 100 envelopes
- <10ms for 1000 envelopes (soft limit)
- Benchmark tests in CI/CD to catch regressions

**Testing Strategy**:
```go
// Property-based testing
func TestAllocationSumProperty(t *testing.T) {
    for i := 0; i < 1000; i++ {
        total := rand.Int63n(10000000) // Up to $100k
        envelopes := generateRandomEnvelopes(rand.Intn(200) + 1)

        result := AllocatePaycheck(total, "even", envelopes, nil)

        sum := int64(0)
        for _, alloc := range result.Allocations {
            sum += alloc.AmountCents
        }

        require.Equal(t, total, sum, "allocations must sum to total")
        require.Equal(t, int64(0), result.DustCents, "no dust allowed")
    }
}

// Benchmark
func BenchmarkAllocationEngine(b *testing.B) {
    envelopes := generateEnvelopes(100)
    total := int64(500000) // $5,000

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        AllocatePaycheck(total, "even", envelopes, nil)
    }
}
```

**Acceptance Criteria**:
- [ ] Cents-perfect math (no floating point errors)
- [ ] Sum of allocations always equals paycheck amount exactly
- [ ] Unit tests for dust/rounding handling (all edge cases)
- [ ] Integration with Paycheck Wizard (#1785)
- [ ] Benchmark showing <1ms for 100 envelopes
- [ ] 90%+ test coverage

#### 4. Python Prediction Service (#1787)
**File**: `api/analytics/paycheck_prediction.py`

**Responsibilities**:
- Suggest optimal allocation splits based on historical patterns
- **CRITICAL**: Blinded/anonymized processing only
- Detect biweekly/monthly allocation patterns
- Seasonal adjustments (e.g., heating in winter, travel in summer)
- Zero persistence (ephemeral sessions only)

**Privacy Architecture**:

**Request Payload (Anonymized)**:
```json
{
  "paycheck_cents": 250000,
  "historical_sessions": [
    {
      "date": "2026-01-15",
      "amount_cents": 240000,
      "ratios": [0.50, 0.25, 0.15, 0.10]
    },
    {
      "date": "2025-12-31",
      "amount_cents": 250000,
      "ratios": [0.48, 0.27, 0.15, 0.10]
    }
  ],
  "current_month": 1,  // January (for seasonal detection)
  "num_envelopes": 4
}
```

**Key Privacy Protections**:
- ❌ NO user IDs
- ❌ NO envelope names
- ❌ NO transaction descriptions
- ❌ NO persistent logs
- ✅ Only ratios and amounts (context-free numbers)
- ✅ Ephemeral session (destroyed after response)
- ✅ No database writes

**Response Payload**:
```json
{
  "suggested_allocations_cents": [125000, 62500, 37500, 25000],
  "confidence": 0.87,
  "reasoning": {
    "based_on": "historical_patterns",
    "data_points": 12,
    "pattern_type": "biweekly_consistent",
    "seasonal_adjustment": false
  },
  "model_version": "v1.0.0",
  "last_trained_date": "2026-01-20"
}
```

**Client-Side Mapping**:
```typescript
// Client maintains envelope order securely
const envelopes = [
  { id: 'env_1', name: 'Rent' },
  { id: 'env_2', name: 'Groceries' },
  { id: 'env_3', name: 'Car' },
  { id: 'env_4', name: 'Savings' }
]

// Send anonymized request
const request = {
  paycheck_cents: 250000,
  historical_sessions: history.map(h => ({
    date: h.date,
    amount_cents: h.amount,
    ratios: h.allocations.map(a => a.amount / h.amount)
  })),
  num_envelopes: envelopes.length
}

// Receive anonymized response
const response = await fetchPrediction(request)

// Map back to named envelopes
const allocations = envelopes.map((env, i) => ({
  envelopeId: env.id,
  envelopeName: env.name,
  amountCents: response.suggested_allocations_cents[i]
}))
```

**Prediction Algorithm**:
```python
def predict_allocations(
    paycheck_cents: int,
    historical_sessions: List[HistoricalSession],
    current_month: int,
    num_envelopes: int
) -> PredictionResponse:
    """
    Predict optimal allocation based on historical patterns.
    Privacy-preserving: operates on ratios only, no identifiable data.
    """

    if len(historical_sessions) < 3:
        raise InsufficientDataError("Need at least 3 historical paychecks")

    # Calculate weighted average of historical ratios
    # Recent sessions weighted higher
    weights = [1.0 / (i + 1) for i in range(len(historical_sessions))]
    weight_sum = sum(weights)

    avg_ratios = []
    for envelope_idx in range(num_envelopes):
        weighted_ratio = sum(
            session.ratios[envelope_idx] * weights[i]
            for i, session in enumerate(historical_sessions)
        ) / weight_sum
        avg_ratios.append(weighted_ratio)

    # Seasonal adjustments (if applicable)
    seasonal_ratios = apply_seasonal_adjustments(
        avg_ratios,
        current_month,
        num_envelopes
    )

    # Convert ratios to absolute amounts
    allocations_cents = []
    allocated = 0

    for ratio in seasonal_ratios:
        amount = int(paycheck_cents * ratio)
        allocations_cents.append(amount)
        allocated += amount

    # Distribute dust using largest remainder
    dust = paycheck_cents - allocated
    if dust > 0:
        remainders = [
            (paycheck_cents * ratio) - int(paycheck_cents * ratio)
            for ratio in seasonal_ratios
        ]
        sorted_indices = sorted(
            range(len(remainders)),
            key=lambda i: remainders[i],
            reverse=True
        )
        for i in range(dust):
            allocations_cents[sorted_indices[i]] += 1

    # Calculate confidence based on pattern consistency
    confidence = calculate_consistency_score(historical_sessions)

    return PredictionResponse(
        suggested_allocations_cents=allocations_cents,
        confidence=confidence,
        reasoning={
            "based_on": "historical_patterns",
            "data_points": len(historical_sessions),
            "pattern_type": detect_pattern_type(historical_sessions),
            "seasonal_adjustment": current_month in [11, 12, 1, 2]  # Winter
        }
    )
```

**Seasonal Adjustments**:
```python
def apply_seasonal_adjustments(
    ratios: List[float],
    current_month: int,
    num_envelopes: int
) -> List[float]:
    """
    Adjust ratios based on seasonal patterns.
    E.g., increase heating in winter, travel in summer.

    PRIVACY NOTE: Seasonal adjustments are heuristic, not user-specific.
    """

    adjusted = ratios.copy()

    # Winter months (Nov-Feb): typically higher utility costs
    if current_month in [11, 12, 1, 2]:
        # Increase first envelope by 5% (assume utilities/bills first)
        if num_envelopes > 0:
            adjusted[0] *= 1.05
            # Normalize to sum to 1.0
            total = sum(adjusted)
            adjusted = [r / total for r in adjusted]

    # Summer months (Jun-Aug): typically higher travel/vacation
    elif current_month in [6, 7, 8]:
        # Increase last envelope by 5% (assume discretionary last)
        if num_envelopes > 0:
            adjusted[-1] *= 1.05
            total = sum(adjusted)
            adjusted = [r / total for r in adjusted]

    return adjusted
```

**Error Handling**:
```python
class InsufficientDataError(Exception):
    """Raised when < 3 historical paychecks available"""
    pass

class InvalidPayloadError(Exception):
    """Raised when request payload is malformed"""
    pass

# FastAPI endpoint
@app.post("/api/analytics/paycheck-prediction")
async def predict_paycheck(request: PredictionRequest):
    try:
        result = predict_allocations(
            request.paycheck_cents,
            request.historical_sessions,
            request.current_month,
            request.num_envelopes
        )
        return result
    except InsufficientDataError as e:
        raise HTTPException(
            status_code=400,
            detail="Insufficient historical data. Need at least 3 paychecks."
        )
    except InvalidPayloadError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Log error (but NOT request payload for privacy)
        logger.error(f"Prediction failed: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail="Prediction service unavailable"
        )
```

**Acceptance Criteria**:
- [ ] Suggestions return numerical allocations (cents) matching paycheck total
- [ ] Seasonal adjustments correctly detect patterns (Winter/Summer)
- [ ] Zero storage of user data (verify no database writes)
- [ ] API reachable within <500ms
- [ ] Error handling for insufficient data (< 3 paychecks)
- [ ] Confidence score reflects pattern consistency
- [ ] 85%+ test coverage including privacy validation

#### 5. Smart Allocation Step (#162)
**File**: `src/components/budgeting/paycheck-flow/steps/AllocationStrategyStep.tsx`

**Responsibilities**:
- Present quick action buttons for allocation strategies
- Fetch predictions from Python service (blinded)
- Display real-time "Remaining to Allocate" counter
- Show envelope grid with allocation inputs
- Highlight underfunded bills with pulsing indicators
- Validate allocations sum to paycheck amount

**UI Layout**:
```tsx
<div className="space-y-6">
  {/* Quick Actions */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Button
      onClick={handleLastSplit}
      disabled={!hasHistory}
      className="border-2 border-black"
    >
      USE LAST SPLIT
    </Button>
    <Button
      onClick={handleEvenSplit}
      className="border-2 border-black"
    >
      SPLIT EVENLY
    </Button>
    <Button
      onClick={handleSmartSplit}
      loading={fetchingPrediction}
      disabled={!hasHistory}
      className="border-2 border-black bg-fuchsia-500"
    >
      SMART SPLIT ✨
    </Button>
  </div>

  {/* Real-time Counter */}
  <div className={cn(
    "p-4 rounded-lg border-2 border-black",
    remaining === 0 ? "bg-green-100" : "bg-red-100"
  )}>
    <div className="text-center">
      <div className="text-sm font-bold uppercase">
        {remaining === 0 ? "Fully Allocated ✓" : "Remaining to Allocate"}
      </div>
      <div className="text-3xl font-black">
        ${Math.abs(remaining / 100).toFixed(2)}
      </div>
      {remaining < 0 && (
        <div className="text-xs text-red-600">Over by this amount</div>
      )}
    </div>
  </div>

  {/* Envelope Allocation Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {allocations.map((alloc) => (
      <AllocationCard
        key={alloc.envelopeId}
        allocation={alloc}
        isUnderfunded={isUnderfunded(alloc)}
        onChange={handleAllocationChange}
      />
    ))}
  </div>

  {/* Validation Error */}
  {validationError && (
    <div className="p-3 rounded border-2 border-red-500 bg-red-50">
      {validationError}
    </div>
  )}
</div>
```

**Allocation Card Component**:
```tsx
function AllocationCard({ allocation, isUnderfunded, onChange }: Props) {
  const [localValue, setLocalValue] = useState(allocation.amountCents)

  // Debounced update to store
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(allocation.envelopeId, localValue)
    }, 300)
    return () => clearTimeout(timeout)
  }, [localValue])

  return (
    <div className={cn(
      "p-4 rounded-lg border-2 border-black",
      isUnderfunded && "animate-pulse ring-2 ring-fuchsia-500"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">{allocation.envelopeName}</span>
        {isUnderfunded && <span className="text-fuchsia-600">⚠️</span>}
      </div>

      <Input
        type="text"
        value={formatCurrency(localValue)}
        onChange={(e) => setLocalValue(parseCurrency(e.target.value))}
        className="text-right text-xl font-bold"
      />

      <div className="text-xs text-gray-500 mt-1">
        {(localValue / paycheckAmount * 100).toFixed(1)}% of paycheck
      </div>
    </div>
  )
}
```

**Smart Split Integration**:
```typescript
async function handleSmartSplit() {
  setFetchingPrediction(true)

  try {
    // Prepare anonymized request
    const request = {
      paycheck_cents: paycheckAmount,
      historical_sessions: paycheckHistory.map(h => ({
        date: h.date,
        amount_cents: h.amount,
        ratios: h.allocations.map(a => a.amount / h.amount)
      })),
      current_month: new Date().getMonth() + 1,
      num_envelopes: envelopes.length
    }

    // Fetch from Python service (blinded)
    const response = await fetch('/api/analytics/paycheck-prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error('Prediction failed')
    }

    const prediction = await response.json()

    // Map back to named envelopes
    const allocations = envelopes.map((env, i) => ({
      envelopeId: env.id,
      envelopeName: env.name,
      amountCents: prediction.suggested_allocations_cents[i]
    }))

    // Update store
    setAllocations(allocations)

    // Show explainability
    toast.success(
      `Smart split based on ${prediction.reasoning.data_points} past paychecks (${(prediction.confidence * 100).toFixed(0)}% confidence)`,
      { duration: 5000 }
    )
  } catch (error) {
    console.error('Smart split failed:', error)

    // Fallback to even split
    toast.error('Smart predictions unavailable. Using even split.')
    handleEvenSplit()
  } finally {
    setFetchingPrediction(false)
  }
}
```

**Underfunded Detection**:
```typescript
function isUnderfunded(allocation: Allocation): boolean {
  const envelope = envelopes.find(e => e.id === allocation.envelopeId)
  if (!envelope) return false

  // Check if envelope is a bill with funding target
  if (envelope.category !== 'Bill') return false
  if (!envelope.fundingTarget) return false

  // Check if current balance + allocation < target
  const newBalance = envelope.currentBalance + allocation.amountCents
  return newBalance < envelope.fundingTarget
}
```

**Acceptance Criteria**:
- [ ] Quick action buttons correctly apply strategies
- [ ] [USE LAST SPLIT] disabled if no history exists
- [ ] [SMART SPLIT] shows loading state during fetch
- [ ] Real-time counter updates as user adjusts allocations
- [ ] Validation prevents navigation if sum ≠ paycheck amount
- [ ] Underfunded bills show pulsing indicators
- [ ] Manual adjustments allowed after quick actions
- [ ] 80%+ unit test coverage

#### 6. Success Screen (#161)
**File**: `src/components/budgeting/paycheck-flow/steps/SuccessStep.tsx`

**Responsibilities**:
- Display allocation summary with clear breakdown
- Show monthly completion percentage
- Motivational messaging ("82% to your goal!")
- Canvas confetti celebration animation
- [BACK TO DASHBOARD] button with query invalidation

**UI Layout**:
```tsx
function SuccessStep() {
  const allocations = usePaycheckFlowStore(s => s.allocations)
  const envelopes = useEnvelopes()

  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  const monthlyCompletion = calculateMonthlyCompletion(envelopes, allocations)
  const topAllocations = allocations
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Hero Message */}
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase mb-2">
          Paycheck Allocated! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          You're {monthlyCompletion}% of the way to your monthly goals!
        </p>
      </div>

      {/* Summary Card */}
      <div className="p-6 rounded-lg border-2 border-black bg-gradient-to-br from-green-50 to-green-100">
        <h2 className="text-xl font-black uppercase mb-4">Summary</h2>

        {topAllocations.map((alloc) => {
          const envelope = envelopes.find(e => e.id === alloc.envelopeId)
          const isCovered = envelope &&
            (envelope.currentBalance + alloc.amountCents >= envelope.fundingTarget)

          return (
            <div key={alloc.envelopeId} className="flex justify-between items-center py-2">
              <span className="font-bold">{envelope?.name}</span>
              <span className="text-lg">
                {isCovered ? (
                  <>Covered ✅</>
                ) : (
                  <>+${(alloc.amountCents / 100).toFixed(2)}</>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* Monthly Completion Indicator */}
      <div className="p-4 rounded-lg border-2 border-black">
        <div className="flex justify-between mb-2">
          <span className="font-bold">Monthly Progress</span>
          <span className="font-black text-fuchsia-600">{monthlyCompletion}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500"
            style={{ width: `${monthlyCompletion}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleBackToDashboard}
        size="lg"
        className="w-full border-2 border-black bg-fuchsia-500 hover:bg-fuchsia-600"
      >
        BACK TO DASHBOARD
      </Button>
    </div>
  )
}
```

**Monthly Completion Calculation**:
```typescript
function calculateMonthlyCompletion(
  envelopes: Envelope[],
  allocations: Allocation[]
): number {
  // Filter envelopes with funding targets
  const envelopesWithTargets = envelopes.filter(e => e.fundingTarget && e.fundingTarget > 0)

  if (envelopesWithTargets.length === 0) return 100

  let totalCompletion = 0

  for (const env of envelopesWithTargets) {
    const allocation = allocations.find(a => a.envelopeId === env.id)
    const newBalance = env.currentBalance + (allocation?.amountCents || 0)

    const completion = Math.min(100, (newBalance / env.fundingTarget!) * 100)
    totalCompletion += completion
  }

  return Math.round(totalCompletion / envelopesWithTargets.length)
}
```

**Confetti Configuration**:
```typescript
import confetti from 'canvas-confetti'

// Respect prefers-reduced-motion
function triggerConfetti() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981']
  })
}
```

**Dashboard Navigation**:
```typescript
function handleBackToDashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const resetWizard = usePaycheckFlowStore(s => s.reset)

  // Invalidate queries to refresh dashboard
  queryClient.invalidateQueries({ queryKey: ['envelopes'] })
  queryClient.invalidateQueries({ queryKey: ['user', 'balance'] })
  queryClient.invalidateQueries({ queryKey: ['paycheck', 'history'] })

  // Reset wizard state
  resetWizard()

  // Navigate to dashboard
  navigate('/dashboard')
}
```

**Acceptance Criteria**:
- [ ] Summary data accurate based on allocations
- [ ] "Covered ✅" shows when balance ≥ funding target
- [ ] "+$X" shows delta amount when not covered
- [ ] Monthly completion percentage calculated correctly
- [ ] Confetti triggers on mount (respects prefers-reduced-motion)
- [ ] Transition to dashboard seamless (queries invalidated)
- [ ] 80%+ test coverage including visual snapshots

### Design System Implementation

#### "Hard Lines" Aesthetic Standards

**Core Principles** (from [docs/shared-ui/design-standards.md](docs/shared-ui/design-standards.md:1)):
- Thick black borders: `border-2 border-black` on all major UI components
- Sharp corners: Use `rounded-lg` (8px) max, no excessive rounding
- Color palette: Slate-50/Brand-600 (fuchsia-500/purple-600) with high contrast
- Shadows: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` for neo-brutalist depth
- Typography: ALL CAPS headers with `font-black`, enlarged first letters

**Component Templates**:
```tsx
// Wizard Container
<div className="
  rounded-lg p-6
  border-2 border-black
  bg-purple-100/40
  backdrop-blur-sm
  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
">
  {/* Wizard steps */}
</div>

// Primary Button
<Button className="
  border-2 border-black
  font-black text-black text-base
  uppercase
  bg-fuchsia-500
  hover:bg-fuchsia-600
  active:scale-95
  transition-transform
">
  GOT PAID?
</Button>

// Input Field
<Input className="
  border-2 border-black
  focus:ring-2 focus:ring-fuchsia-500
  rounded-lg
  text-lg font-semibold
" />

// Success Card
<div className="
  p-6 rounded-lg
  border-2 border-black
  bg-gradient-to-br from-green-50 to-green-100
  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
">
  {/* Summary content */}
</div>
```

**Glassmorphism Integration**:
```css
.glassmorphic-wizard {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid rgba(0, 0, 0, 1);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}
```

**Animation Standards**:
- Spring physics: `stiffness: 300, damping: 30`
- Transition duration: 200-300ms
- Easing: `ease-in-out` for smooth feel
- Hover scale: `hover:scale-105`
- Active scale: `active:scale-95`

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
**Goal**: Set up core infrastructure, validation, and routing

**Sub-Issues**: #1833 (Zustand Store ✅), #1843 (Zod Validation)

**Tasks**:
1. ✅ **COMPLETED** - Set up Zustand store with middleware (#1833):
   ```
   src/stores/ui/paycheckFlowStore.ts           # ✅ Done
   src/stores/ui/__tests__/paycheckFlowStore.test.ts  # ✅ Done (37 tests, 100% passing)
   ```

2. **Create Zod validation schemas** (#1843) - **CRITICAL DEPENDENCY**:
   ```
   src/utils/core/validation/paycheckWizardValidation.ts
   src/utils/core/validation/__tests__/paycheckWizardValidation.test.ts
   ```
   - Paycheck amount validation (min $1, max $1M, cents precision)
   - Allocations validation (sum must equal paycheck, non-negative)
   - Strategy validation (enum: "last" | "even" | "smart" | "manual")
   - Transaction creation validation (integrate with TransactionSchema)
   - **Blocks**: All wizard step components depend on this

3. Create feature directory structure:
   ```
   src/components/budgeting/paycheck-flow/
     ├── PaycheckWizardModal.tsx
     ├── steps/
     │   ├── AmountEntryStep.tsx
     │   ├── AllocationStrategyStep.tsx
     │   ├── ReviewStep.tsx
     │   └── SuccessStep.tsx
     ├── components/
     │   ├── AllocationCard.tsx
     │   ├── RemainingCounter.tsx
     │   └── SuccessSummary.tsx
     └── __tests__/
   ```

4. Add routing for `/vault/wizard/paycheck`

5. Create entry point component on dashboard

6. Set up TanStack Query mutations for paycheck submission

**Deliverables**:
- [x] Zustand store with persist + devtools + immer (#1833 ✅)
- [ ] Zod validation schemas for all wizard data (#1843)
- [ ] Validation integrated into store actions
- [ ] Transaction creation helper with validation
- [ ] Feature directory structure created
- [ ] Basic routing functional
- [ ] Entry point button visible on dashboard
- [ ] 90%+ test coverage (store + validation)

**Success Criteria**:
- User can click "GOT PAID?" and see wizard modal
- Wizard state persists on page refresh
- **All financial data validated before state updates**
- **Invalid data rejected with clear error messages**
- **Transaction creation validates against TransactionSchema**
- Browser back button navigates steps correctly

#### Phase 2: Go Allocation Engine (Week 2-3)
**Goal**: Build high-performance backend calculation service

**Tasks**:
1. Create Go service structure:
   ```
   api/paycheck/
     ├── allocate.go         # Main handler
     ├── allocate_test.go    # Unit tests
     ├── benchmark_test.go   # Performance tests
     └── types.go            # Request/response types
   ```

2. Implement allocation strategies:
   - Even Split (weighted by targets)
   - Last Split (apply ratios)
   - Target First (priority-based)

3. Implement cents-perfect integer math with largest remainder method

4. Write comprehensive tests:
   - Property-based tests (sum always equals total)
   - Edge cases ($0.01, $999,999.99, prime numbers)
   - Dust distribution validation
   - Benchmark tests (<1ms for 100 envelopes)

5. Deploy to Vercel Functions

**Deliverables**:
- [ ] Go service deployed and accessible
- [ ] All three allocation strategies working
- [ ] 90%+ test coverage
- [ ] Benchmarks passing (<1ms for 100 envelopes)
- [ ] API documentation in code comments

**Success Criteria**:
- `/api/paycheck/allocate` endpoint functional
- Allocations always sum to exact paycheck amount (no rounding errors)
- Performance benchmarks green in CI/CD

#### Phase 3: Frontend Wizard Flow (Week 3-4)
**Goal**: Build interactive multi-step wizard UI

**Tasks**:
1. Implement wizard container with AnimatePresence transitions

2. Build Step 1 (Amount Entry):
   - Input field with validation
   - Currency formatting
   - Min/max bounds

3. Build Step 2 (Allocation Strategy):
   - Quick action buttons
   - Real-time counter
   - Integration with Go engine

4. Build Step 3 (Review & Adjust):
   - Envelope allocation grid
   - Manual adjustment inputs
   - Validation logic

5. Implement Framer Motion animations:
   - Horizontal slide transitions
   - Spring physics configuration
   - Loading states

6. Add accessibility:
   - Focus management
   - Keyboard navigation
   - Screen reader labels

**Deliverables**:
- [ ] All wizard steps functional
- [ ] Smooth transitions between steps
- [ ] Real-time validation working
- [ ] Responsive design (mobile + desktop)
- [ ] 80%+ test coverage
- [ ] Accessibility audit passing

**Success Criteria**:
- User can complete full wizard flow
- Allocations validate correctly
- Animations smooth (60fps)
- Keyboard navigation works end-to-end

#### Phase 4: Python Prediction Service (Week 4-5)
**Goal**: Build privacy-preserving ML prediction service

**Tasks**:
1. Create Python service structure:
   ```
   api/analytics/
     ├── paycheck_prediction.py     # Main endpoint
     ├── test_prediction.py         # Unit tests
     ├── algorithms.py              # Prediction logic
     └── requirements.txt           # Dependencies
   ```

2. Implement blinded request/response handling:
   - Validate anonymized payloads
   - No logging of sensitive data
   - Ephemeral session management

3. Implement prediction algorithms:
   - Weighted average of historical ratios
   - Seasonal adjustments (winter/summer)
   - Confidence scoring
   - Dust distribution

4. Write comprehensive tests:
   - Privacy validation (no PII in logs)
   - Insufficient data handling
   - Seasonal adjustment logic
   - Confidence score accuracy

5. Deploy to Vercel Functions with rate limiting

6. Frontend integration:
   - [SMART SPLIT] button
   - Loading states
   - Error handling with fallback to even split
   - Explainability UI (show reasoning)

**Deliverables**:
- [ ] Python service deployed and functional
- [ ] Privacy audit passed (no PII in logs/database)
- [ ] 85%+ test coverage
- [ ] Frontend integration complete
- [ ] Rate limiting configured (10 req/min)
- [ ] API documentation

**Success Criteria**:
- [SMART SPLIT] returns allocations matching paycheck total
- Confidence scores reflect pattern consistency
- Service handles errors gracefully (insufficient data, timeout)
- Network inspection confirms no envelope names in payload

#### Phase 5: Success Screen & Polish (Week 5-6)
**Goal**: Complete user experience with celebration and refinement

**Tasks**:
1. Build Success Step:
   - Allocation summary
   - Monthly completion percentage
   - Motivational messaging
   - Canvas confetti animation

2. Implement query invalidation:
   - Refresh envelopes query
   - Update user balance
   - Refresh paycheck history

3. Add confetti animation:
   - Install `canvas-confetti` library
   - Configure particles, spread, colors
   - Respect `prefers-reduced-motion`

4. UI polish:
   - Loading skeletons
   - Empty states
   - Error messages
   - Micro-interactions

5. Performance optimization:
   - Memoize expensive calculations
   - Debounce input handlers
   - Lazy load wizard modal
   - Optimize re-renders

6. Mobile responsiveness:
   - Test on iOS/Android
   - Optimize touch targets (48x48px min)
   - Single-column layouts
   - Sticky navigation buttons

**Deliverables**:
- [ ] Success screen complete with confetti
- [ ] Query invalidation working
- [ ] All loading/error states designed
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Visual regression tests passing

**Success Criteria**:
- Confetti triggers on success (with reduced-motion support)
- Dashboard updates immediately after allocation
- Mobile experience smooth on iOS/Android
- No layout shifts or jank

#### Phase 6: Testing & Documentation (Week 6-7)
**Goal**: Ensure quality and prepare for launch

**Tasks**:
1. Comprehensive testing:
   - Unit tests (80%+ coverage target)
   - Integration tests (wizard flow end-to-end)
   - E2E tests (critical paths)
   - Privacy audit (network inspection)
   - Performance testing (allocation speed, bundle size)

2. Documentation:
   - API documentation (Go + Python)
   - Component documentation (Storybook)
   - User guide (how to use wizard)
   - Privacy architecture document
   - Testing strategy document

3. Code review:
   - Security review (privacy compliance)
   - Performance review (benchmarks)
   - Accessibility review (WCAG AA)
   - Code quality review (linting, formatting)

4. Bug fixes and refinement:
   - Address code review feedback
   - Fix failing tests
   - Resolve edge cases
   - Polish animations

5. Deployment preparation:
   - Environment variables configured
   - Feature flags ready
   - Monitoring/analytics setup
   - Rollback plan documented

**Deliverables**:
- [ ] 80%+ overall test coverage
- [ ] All documentation complete
- [ ] Code reviews approved
- [ ] Privacy audit passed
- [ ] Performance benchmarks green
- [ ] Deployment checklist complete

**Success Criteria**:
- All tests passing in CI/CD
- Documentation reviewed and approved
- Security/privacy audit passed
- Ready for production deployment

#### Phase 7: Launch & Monitoring (Week 7-8)
**Goal**: Deploy to production and monitor success

**Tasks**:
1. Beta deployment:
   - Deploy behind feature flag
   - Enable for 10% of users
   - Monitor errors and performance

2. Gather feedback:
   - User interviews
   - Analytics review
   - Error log analysis
   - Performance metrics

3. Iteration:
   - Fix bugs discovered in beta
   - Refine UX based on feedback
   - Optimize performance bottlenecks

4. Full rollout:
   - Gradually increase to 100%
   - Monitor key metrics
   - Celebrate launch 🎉

5. Post-launch:
   - Document lessons learned
   - Plan v2.2 improvements
   - Maintain and support

**Deliverables**:
- [ ] Beta deployment successful
- [ ] User feedback collected
- [ ] Full rollout complete
- [ ] Monitoring dashboards configured
- [ ] Post-mortem document written

**Success Criteria**:
- No critical bugs in production
- User engagement metrics positive
- Performance targets met
- Privacy compliance verified

---

## Privacy & Security Architecture

### E2EE Compliance

**Encryption at Rest**:
- **IndexedDB**: Wizard state encrypted with user's master key before storage
- **Firestore**: Paycheck history encrypted client-side before upload
- **Server**: No sensitive data stored (ephemeral only)

**Encryption in Transit**:
- **HTTPS**: All API requests over TLS 1.3
- **WebSocket**: Metadata signals only (no financial data)
- **Payload Sanitization**: Envelope names stripped before transmission

**Key Management**:
- User master key derived from auth session
- Never sent to server
- Stored in browser secure context only

### Blinded Calculation Flow

```
┌────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  User Data (Unencrypted):                                  │
│  - Envelope names: ["Rent", "Groceries", "Car", "Savings"]│
│  - Paycheck amount: $2,500.00                              │
│  - Historical allocations: [(1200, 600, 400, 300), ...]   │
│                                                             │
│  ▼ ANONYMIZATION STEP                                      │
│                                                             │
│  Anonymized Request:                                        │
│  {                                                          │
│    "paycheck_cents": 250000,                               │
│    "historical_sessions": [                                │
│      {"date": "2026-01-15", "ratios": [0.48, 0.24, ...]}, │
│      {"date": "2025-12-31", "ratios": [0.50, 0.22, ...]}  │
│    ],                                                       │
│    "num_envelopes": 4                                      │
│  }                                                          │
│                                                             │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ HTTPS POST
                              ▼
┌────────────────────────────────────────────────────────────┐
│              SERVER (Python Prediction Service)             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Receives ONLY:                                             │
│  - Anonymous ratios                                         │
│  - Paycheck amount (context-free number)                   │
│  - No envelope names                                        │
│  - No user identity                                         │
│                                                             │
│  Processes:                                                 │
│  - Calculate weighted average of ratios                     │
│  - Apply seasonal adjustments                               │
│  - Compute confidence score                                 │
│                                                             │
│  Returns:                                                   │
│  {                                                          │
│    "suggested_allocations_cents": [120000, 60000, ...],    │
│    "confidence": 0.87,                                     │
│    "reasoning": {"based_on": "historical_patterns"}        │
│  }                                                          │
│                                                             │
│  ❌ NO LOGS                                                │
│  ❌ NO DATABASE WRITES                                     │
│  ❌ NO SESSION PERSISTENCE                                 │
│                                                             │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ JSON Response
                              ▼
┌────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Receives: [120000, 60000, 40000, 30000]                   │
│                                                             │
│  ▼ MAPPING STEP                                            │
│                                                             │
│  Maps back to envelope names:                               │
│  [                                                          │
│    { id: "env_1", name: "Rent", amount: 120000 },         │
│    { id: "env_2", name: "Groceries", amount: 60000 },     │
│    { id: "env_3", name: "Car", amount: 40000 },           │
│    { id: "env_4", name: "Savings", amount: 30000 }        │
│  ]                                                          │
│                                                             │
│  ✅ Server NEVER saw envelope names                        │
│  ✅ Server NEVER saw user identity                         │
│  ✅ Server cannot correlate data to individual             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Privacy Audit Checklist

**Before Deployment**:
- [ ] Network payload inspection (no envelope names)
- [ ] Server logs review (no PII)
- [ ] Database query audit (no sensitive writes)
- [ ] Code review for accidental logging
- [ ] IndexedDB encryption verified
- [ ] HTTPS enforced (no HTTP fallback)

**Ongoing Monitoring**:
- [ ] Automated PII detection in logs
- [ ] Rate limiting on prediction endpoint
- [ ] Anomaly detection for unusual requests
- [ ] Regular security audits

### Zero-Persistence Validation

**Python Service Contract**:
```python
# CRITICAL: Enforce zero persistence
@app.post("/api/analytics/paycheck-prediction")
async def predict_paycheck(request: PredictionRequest):
    # ❌ FORBIDDEN: Do not log request payload
    # logger.info(f"Received request: {request}")  # NEVER DO THIS

    # ✅ ALLOWED: Log non-sensitive metadata
    logger.info(f"Prediction request received (num_envelopes={request.num_envelopes})")

    result = predict_allocations(...)

    # ❌ FORBIDDEN: Do not write to database
    # db.insert(request)  # NEVER DO THIS

    # ✅ ALLOWED: Ephemeral processing only
    return result
```

**Verification**:
- Code review for database writes
- Integration tests mock database to catch writes
- Manual inspection of database after test runs

---

## Alternative Approaches Considered

### Alternative 1: Client-Side Only (No Backend Services)

**Approach**: Run all allocation logic and predictions entirely in browser using JavaScript/TypeScript.

**Pros**:
- ✅ Maximum privacy (no data ever leaves client)
- ✅ Works offline by default
- ✅ Simpler deployment (no backend services)
- ✅ Zero server costs

**Cons**:
- ❌ Performance bottleneck for complex calculations
- ❌ Limited ML capabilities (TensorFlow.js has constraints)
- ❌ Larger JS bundle size
- ❌ Can't leverage Go's performance for 100+ envelopes
- ❌ Harder to update algorithms (requires app redeployment)

**Decision**: Rejected. While privacy is maximized, the performance requirements (<1ms for 100 envelopes) and ML prediction quality justify backend services. Blinded architecture preserves privacy adequately.

### Alternative 2: Single Backend Language (Go or Python Only)

**Approach**: Use either Go or Python for all backend logic instead of polyglot.

**Pros**:
- ✅ Simpler maintenance (one language)
- ✅ Fewer dependencies
- ✅ Easier onboarding for developers

**Cons**:
- ❌ Go lacks ML ecosystem (no scikit-learn, pandas equivalent)
- ❌ Python slower than Go for financial calculations
- ❌ Compromise on either performance or ML quality

**Decision**: Rejected. Go excels at high-performance financial math (<1ms), Python excels at ML/analytics. Polyglot approach leverages strengths of each language.

### Alternative 3: Traditional Wizard (No State Persistence)

**Approach**: Build wizard without IndexedDB persistence, start fresh each time.

**Pros**:
- ✅ Simpler state management
- ✅ No storage quota concerns
- ✅ Faster initial implementation

**Cons**:
- ❌ User loses progress on page refresh
- ❌ No resume capability if interrupted
- ❌ Higher abandonment rate (research shows 20% reduction with persistence)

**Decision**: Rejected. Users expect modern apps to preserve progress. IndexedDB persistence is industry standard for multi-step flows.

### Alternative 4: Real AI/ML (Non-Blinded)

**Approach**: Send full envelope names and transaction history to server for richer ML predictions.

**Pros**:
- ✅ Better prediction quality (more context)
- ✅ Can correlate with category names
- ✅ Easier to debug and improve models

**Cons**:
- ❌ Violates privacy-first principle
- ❌ User trust erosion
- ❌ Regulatory compliance risks (GDPR, CCPA)
- ❌ Requires secure data storage and retention policies

**Decision**: Rejected. Privacy is non-negotiable. Blinded calculations provide adequate prediction quality while maintaining user trust.

### Alternative 5: No Quick Actions (Manual Only)

**Approach**: Skip [USE LAST SPLIT], [SPLIT EVENLY], [SMART SPLIT] buttons, require manual allocation.

**Pros**:
- ✅ Simpler implementation
- ✅ No backend prediction service needed
- ✅ Fewer edge cases to handle

**Cons**:
- ❌ High cognitive load (20+ envelopes = 20+ decisions)
- ❌ Slow user flow (5-10 minutes per paycheck)
- ❌ Misses opportunity to leverage historical patterns
- ❌ No competitive advantage

**Decision**: Rejected. Quick actions are core value proposition. Users want guidance, not just a form.

---

## Acceptance Criteria

### Functional Requirements

#### Entry Point (#157)
- [ ] "GOT PAID?" button visible on dashboard when conditions met
- [ ] Button shows when user has Paycheck envelope configured
- [ ] Button shows within ±3 days of expected pay date (if configured)
- [ ] Button hidden outside pay window (if expected date set)
- [ ] Click navigates to `/vault/wizard/paycheck`
- [ ] Hover/active states smooth and responsive (no jank)
- [ ] Visual design matches "Hard Lines" aesthetic
- [ ] Button accessible via keyboard (Enter/Space to activate)

#### Wizard Container (#1785)
- [ ] Modal opens on entry point click
- [ ] Multi-step navigation works forward/backward
- [ ] [BACK] button enabled on steps 1-3, navigates to previous step
- [ ] [CONTINUE] button validates current step before proceeding
- [ ] Progress indicator accurate (Step X of Y)
- [ ] State persists on page refresh (IndexedDB)
- [ ] Wizard resets to step 0 on completion or cancel
- [ ] Browser back button navigates steps correctly
- [ ] Escape key closes wizard (with confirmation if in-progress)
- [ ] AnimatePresence transitions smooth (no layout shifts)
- [ ] Responsive design (mobile + tablet + desktop)

#### Amount Entry (Step 1)
- [ ] Input accepts dollar amounts with formatting ($1,234.56)
- [ ] Validation: minimum $0.01, maximum $1,000,000
- [ ] Validation: only 2 decimal places allowed
- [ ] Negative amounts rejected with error message
- [ ] Empty input shows validation error on [CONTINUE] click
- [ ] Currency symbol auto-added on blur
- [ ] Commas auto-inserted for thousands (1234 → 1,234)
- [ ] [CONTINUE] button disabled until valid amount entered

#### Allocation Strategy (Step 2 - #162)
- [ ] Three quick action buttons visible: [USE LAST SPLIT], [SPLIT EVENLY], [SMART SPLIT]
- [ ] [USE LAST SPLIT] disabled if no paycheck history
- [ ] [USE LAST SPLIT] applies ratios from last paycheck to new amount
- [ ] [SPLIT EVENLY] distributes weighted by monthly targets
- [ ] [SMART SPLIT] shows loading spinner during prediction fetch
- [ ] [SMART SPLIT] disabled if insufficient history (< 3 paychecks)
- [ ] [SMART SPLIT] displays confidence score and reasoning on success
- [ ] [SMART SPLIT] falls back to [SPLIT EVENLY] on error
- [ ] Real-time "Remaining to Allocate" counter updates as user adjusts
- [ ] Counter green when remaining = $0, red otherwise
- [ ] Counter shows "Over by $X" if allocations exceed paycheck
- [ ] Envelope grid displays all active envelopes
- [ ] Underfunded bills show pulsing indicator
- [ ] Manual adjustments allowed after quick action
- [ ] Input fields accept dollar amounts with auto-formatting
- [ ] [CONTINUE] button disabled if allocations ≠ paycheck total
- [ ] Validation error message shown if allocations ≠ total

#### Review & Adjust (Step 3)
- [ ] Summary of all allocations displayed
- [ ] Total allocation amount matches paycheck amount exactly
- [ ] User can adjust individual allocations before submission
- [ ] [BACK] button returns to allocation step with data preserved
- [ ] [SUBMIT] button triggers allocation submission
- [ ] Loading state shown during submission
- [ ] Error handling if submission fails (show retry button)

#### Success Screen (Step 4 - #161)
- [ ] Allocation summary displayed with top 5 envelopes
- [ ] "Covered ✅" shown for envelopes meeting funding targets
- [ ] "+$X" shown for envelopes not meeting targets
- [ ] Monthly completion percentage calculated and displayed
- [ ] Progress bar animates to completion percentage
- [ ] Confetti animation triggers on mount
- [ ] Confetti respects `prefers-reduced-motion`
- [ ] [BACK TO DASHBOARD] button navigates to dashboard
- [ ] Dashboard queries invalidated on navigation (fresh data)
- [ ] Wizard state reset after navigation

#### Go Allocation Engine (#1786)
- [ ] `/api/paycheck/allocate` endpoint functional
- [ ] Accepts JSON payload with paycheck_cents, strategy, envelopes
- [ ] Returns allocations array matching paycheck total exactly
- [ ] Even split strategy works (weighted by targets)
- [ ] Last split strategy works (applies ratios)
- [ ] Target first strategy works (priority-based)
- [ ] Cents-perfect math (no floating point errors)
- [ ] Dust distributed using largest remainder method
- [ ] Response includes total_cents and dust_cents (should be 0)
- [ ] Performance <1ms for 100 envelopes
- [ ] Performance <10ms for 1000 envelopes
- [ ] Handles edge cases: $0.01, $999,999.99, prime numbers

#### Python Prediction Service (#1787)
- [ ] `/api/analytics/paycheck-prediction` endpoint functional
- [ ] Accepts anonymized JSON payload (no envelope names)
- [ ] Returns allocations array matching paycheck total exactly
- [ ] Returns confidence score (0-1 range)
- [ ] Returns reasoning object with explainability data
- [ ] Handles insufficient data gracefully (< 3 paychecks)
- [ ] Seasonal adjustments applied correctly (winter/summer)
- [ ] Response within <500ms
- [ ] No PII in logs or database (verified via audit)
- [ ] Rate limiting enforced (10 req/min per user)
- [ ] Error responses include helpful messages

### Non-Functional Requirements

#### Performance
- [ ] Wizard modal lazy-loaded (not in main bundle)
- [ ] Initial wizard render <200ms
- [ ] Step transitions smooth 60fps
- [ ] Go allocation calculation <1ms for 100 envelopes
- [ ] Python prediction response <500ms
- [ ] JS bundle size increase <150KB (gzipped)
- [ ] Lighthouse Performance score >90
- [ ] Core Web Vitals green:
  - LCP <2.5s
  - FID <100ms
  - CLS <0.1

#### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible and logical order
- [ ] Screen reader labels on all inputs
- [ ] Form errors announced to screen readers
- [ ] Color contrast ratio ≥4.5:1 (WCAG AA)
- [ ] `prefers-reduced-motion` respected (confetti)
- [ ] Touch targets ≥48x48px (mobile)
- [ ] Semantic HTML elements used
- [ ] ARIA attributes where needed
- [ ] Tested with NVDA/JAWS screen readers

#### Security & Privacy
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] Network payloads inspected (no envelope names)
- [ ] Python service logs contain no PII
- [ ] IndexedDB wizard state encrypted
- [ ] Firestore paycheck history encrypted
- [ ] CORS configured correctly
- [ ] Rate limiting on prediction endpoint
- [ ] Input sanitization prevents XSS
- [ ] No SQL injection vulnerabilities
- [ ] Dependency scan passing (no known CVEs)

#### Browser Compatibility
- [ ] Chrome 100+ (desktop + mobile)
- [ ] Firefox 100+
- [ ] Safari 15+ (desktop + iOS)
- [ ] Edge 100+
- [ ] No critical bugs on older browsers (graceful degradation)

#### Mobile Responsiveness
- [ ] Wizard usable on 320px width (iPhone SE)
- [ ] Single-column layout on mobile
- [ ] Sticky [BACK]/[CONTINUE] buttons on mobile
- [ ] Touch-friendly inputs (no zoom on focus)
- [ ] No horizontal scrolling
- [ ] Tested on iOS Safari and Android Chrome

### Quality Gates

#### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint passing (no warnings)
- [ ] Prettier formatted
- [ ] No console.log statements
- [ ] No TODO comments in production code
- [ ] Functions <50 lines (SLOC)
- [ ] Cyclomatic complexity <10

#### Testing
- [ ] 80%+ overall test coverage
- [ ] 90%+ coverage for Go allocation engine
- [ ] 85%+ coverage for Python prediction service
- [ ] Unit tests for all state actions
- [ ] Integration tests for wizard flow
- [ ] E2E tests for critical paths:
  - Happy path (entry → amount → strategy → success)
  - Error recovery (network failure → retry)
  - Offline scenario (IndexedDB persistence)
- [ ] Visual regression tests (Percy/Chromatic)
- [ ] Property-based tests for financial calculations

#### Documentation
- [ ] API documentation (request/response examples)
- [ ] Component documentation (props, usage)
- [ ] Storybook stories for key components
- [ ] Privacy architecture document
- [ ] Testing strategy document
- [ ] Deployment runbook
- [ ] User guide (how to use wizard)

#### Performance Benchmarks
- [ ] Go allocation engine benchmarks passing
- [ ] Frontend bundle size within limits
- [ ] Lighthouse CI passing
- [ ] No performance regressions in CI/CD

---

## Success Metrics

### Primary Metrics (P0)

**Adoption Rate**:
- **Target**: 60% of users who receive paychecks use wizard within 1 month
- **Measurement**: `(users who completed wizard) / (users with paycheck transactions)`
- **Success**: ≥60% adoption

**Completion Rate**:
- **Target**: 85% of users who start wizard complete it
- **Measurement**: `(wizard completions) / (wizard starts)`
- **Success**: ≥85% completion (industry standard: 70%)

**Time to Allocate**:
- **Target**: Reduce allocation time by 50% (from 5-10 min to 2-5 min)
- **Measurement**: Time from wizard open to success screen
- **Success**: Median time ≤5 minutes

**Allocation Accuracy**:
- **Target**: 100% of allocations sum to exact paycheck amount (no rounding errors)
- **Measurement**: `(exact allocations) / (total allocations)`
- **Success**: 100% (zero tolerance for math errors)

### Secondary Metrics (P1)

**Smart Split Usage**:
- **Target**: 40% of users try [SMART SPLIT] at least once
- **Measurement**: `(users who clicked SMART SPLIT) / (total wizard users)`
- **Success**: ≥40%

**Repeat Usage**:
- **Target**: 70% of users return to wizard for next paycheck
- **Measurement**: `(users with 2+ wizard completions) / (users with 1+ completion)`
- **Success**: ≥70%

**Error Rate**:
- **Target**: <5% of wizard sessions encounter errors
- **Measurement**: `(sessions with errors) / (total sessions)`
- **Success**: ≤5%

**Performance**:
- **Target**: Go allocation <1ms, Python prediction <500ms
- **Measurement**: P95 latency from monitoring
- **Success**: P95 within targets

### User Satisfaction (P2)

**NPS (Net Promoter Score)**:
- **Target**: NPS ≥50 (from post-wizard survey)
- **Measurement**: Survey after 3rd wizard completion
- **Success**: NPS ≥50 (excellent)

**Feature Rating**:
- **Target**: 4.5/5 stars average rating
- **Measurement**: In-app rating prompt after success screen
- **Success**: ≥4.5 stars

### Business Impact (P2)

**User Retention**:
- **Target**: 10% increase in 30-day retention for wizard users
- **Measurement**: Cohort analysis (wizard users vs. non-wizard users)
- **Success**: Wizard users have ≥10% higher retention

**Engagement**:
- **Target**: 15% increase in overall app sessions
- **Measurement**: Average sessions per user per month
- **Success**: ≥15% increase

---

## Dependencies & Prerequisites

### Technical Dependencies

**Frontend**:
- React 19.2.0 ✅ (already in project)
- Zustand 5.0.9 ✅ (already in project)
- Framer Motion 12.27.0 ✅ (already in project)
- Dexie 4.0.11 ✅ (already in project)
- TanStack Query v5 ✅ (already in project)
- **NEW**: `canvas-confetti` (need to install)

**Backend**:
- Go 1.22+ ✅ (Vercel Functions support)
- Python 3.12+ ✅ (Vercel Functions support)
- **NEW**: `shopspring/decimal` (Go library for cents-perfect math)
- **NEW**: FastAPI + Pydantic (Python prediction service)

**Infrastructure**:
- Vercel Functions ✅ (already deployed)
- Firestore ✅ (already configured)
- IndexedDB ✅ (browser native)

### Data Prerequisites

**User Settings**:
- [ ] Expected pay date field (optional)
- [ ] Paycheck envelope configured
- [ ] At least 1 active envelope (other than Paycheck)

**Historical Data** (for Smart Split):
- [ ] Paycheck history table/collection in Firestore
- [ ] At least 3 past paycheck allocations for predictions
- [ ] Envelope funding targets configured

### Design Prerequisites

- [ ] Figma designs for all wizard steps (or approval for "Hard Lines" standards)
- [ ] Icon assets (dollar emoji, checkmark, warning icons)
- [ ] Color palette confirmed (Slate-50, Fuchsia-500, Purple-600)

### Organizational Prerequisites

- [ ] Privacy review approval (blinded calculations architecture)
- [ ] Security audit scheduled (before beta launch)
- [ ] QA resources allocated (testing all flows)
- [ ] PM sign-off on scope and timeline

---

## Risk Analysis & Mitigation

### High-Risk Areas

#### Risk 1: Privacy Compliance Violation
**Likelihood**: Low
**Impact**: Critical
**Risk Score**: Medium

**Description**: Accidental logging of envelope names or user PII in Python service could violate privacy-first principle and user trust.

**Mitigation**:
1. Code review checklist includes privacy verification
2. Integration tests mock database to catch writes
3. Network payload inspection in tests
4. Automated PII detection in log scanning
5. Open-source Python service code for auditing

**Contingency**: If privacy violation discovered post-launch, immediately disable service and notify users.

#### Risk 2: Financial Calculation Error
**Likelihood**: Low
**Impact**: Critical
**Risk Score**: Medium

**Description**: Rounding errors or incorrect dust distribution could cause allocations to not sum to paycheck amount, eroding user trust.

**Mitigation**:
1. Property-based testing (1000+ random test cases)
2. Benchmark tests in CI/CD catch regressions
3. Cents-perfect integer math (no floats)
4. Largest remainder method for dust
5. Validation on both client and server

**Contingency**: If math error discovered, rollback immediately and notify affected users with correction flow.

#### Risk 3: Performance Degradation
**Likelihood**: Medium
**Impact**: High
**Risk Score**: High

**Description**: Go allocation engine or Python prediction service slower than targets, causing user frustration.

**Mitigation**:
1. Benchmark tests with hard thresholds (<1ms, <500ms)
2. Load testing before launch (100 concurrent users)
3. Caching of prediction results (client-side)
4. Timeout handling with fallbacks
5. Performance monitoring in production

**Contingency**: If performance degrades, disable [SMART SPLIT] button and investigate offline.

### Medium-Risk Areas

#### Risk 4: Browser Compatibility Issues
**Likelihood**: Medium
**Impact**: Medium
**Risk Score**: Medium

**Description**: Wizard doesn't work correctly on older browsers or specific mobile devices.

**Mitigation**:
1. Cross-browser testing (Chrome, Firefox, Safari, Edge)
2. Mobile testing on real devices (iOS/Android)
3. Graceful degradation for missing features
4. Polyfills for IndexedDB if needed

**Contingency**: Feature detection with warning message for unsupported browsers.

#### Risk 5: State Persistence Corruption
**Likelihood**: Medium
**Impact**: Medium
**Risk Score**: Medium

**Description**: IndexedDB state becomes corrupted, causing wizard to fail on resume.

**Mitigation**:
1. Try-catch on state hydration with fallback to reset
2. Version migrations for schema changes
3. State validation on load
4. User-facing "Reset Wizard" button

**Contingency**: Clear corrupted state and start fresh, inform user progress was lost.

#### Risk 6: ML Prediction Quality
**Likelihood**: Medium
**Impact**: Low
**Risk Score**: Low

**Description**: Smart Split suggestions don't match user expectations, reducing trust in feature.

**Mitigation**:
1. Confidence score displayed to user
2. Explainability UI (show reasoning)
3. Manual override always available
4. Gather feedback and iterate on algorithm

**Contingency**: Reduce prominence of [SMART SPLIT] button if confidence consistently low.

### Low-Risk Areas

#### Risk 7: Animation Performance on Low-End Devices
**Likelihood**: High
**Impact**: Low
**Risk Score**: Low

**Description**: Framer Motion transitions laggy on old phones.

**Mitigation**:
1. Use GPU-accelerated properties (transform, opacity)
2. Reduce animation complexity on low-end devices
3. `prefers-reduced-motion` support

**Contingency**: Disable animations for users with slow devices (detect via performance API).

---

## Resource Requirements

### Engineering Resources

**Frontend Engineers**: 2 FTEs
- Primary: Wizard UI, state management, animations
- Secondary: Testing, accessibility, performance

**Backend Engineers**: 1 FTE
- Primary: Go allocation engine, Python prediction service
- Secondary: API design, monitoring, deployment

**QA Engineer**: 0.5 FTE
- Testing all flows, edge cases, browser compatibility

**Design Review**: 0.2 FTE (part-time)
- Ensure "Hard Lines" aesthetic consistency

**Security Review**: 0.1 FTE (one-time)
- Privacy architecture audit before launch

### Infrastructure

**Vercel Functions**:
- Go allocation endpoint: ~1000 invocations/day
- Python prediction endpoint: ~500 invocations/day
- Estimated cost: $5-10/month (within free tier likely)

**Firestore**:
- Paycheck history writes: ~1000/day
- Envelope reads: ~10,000/day
- Estimated cost: $2-5/month (within existing quota)

**Monitoring**:
- Sentry (error tracking)
- Datadog (performance monitoring)
- Estimated cost: $0 (within existing plans)

### Timeline

**Total Effort**: 6-8 weeks (1.5-2 sprints)

**Phase Breakdown**:
1. Foundation (Week 1-2): 2 weeks
2. Go Engine (Week 2-3): 1.5 weeks
3. Frontend Wizard (Week 3-4): 1.5 weeks
4. Python Service (Week 4-5): 1.5 weeks
5. Success Screen (Week 5-6): 1 week
6. Testing & Docs (Week 6-7): 1 week
7. Launch (Week 7-8): 1 week

**Critical Path**:
- Zustand store → Wizard UI → Go Engine → Python Service
- Any delay in foundation or Go engine blocks downstream work

**Buffer**: 2 weeks (25% contingency for unknowns)

---

## Future Considerations

### v2.2 Enhancements

**Advanced Allocation Strategies**:
- **Goal-Based Allocation**: Prioritize envelopes with savings goals
- **Debt Payoff Strategy**: Extra payments to highest-interest debts
- **Flex Allocation**: Adjust based on current balances and spending trends
- **Custom Rules**: User-defined allocation rules (e.g., "Always allocate 10% to savings")

**Recurring Allocation Templates**:
- Save allocation strategies as templates
- Quick-apply templates to future paychecks
- Share templates with other users (community library)

**Predictive Insights**:
- "You're $200 short on Rent this month" warnings
- "You usually spend $X on Groceries, allocate more?"
- Seasonal spending forecasts (holidays, vacations)

**Multi-Paycheck Support**:
- Handle multiple paychecks in one period (e.g., two jobs)
- Combine paychecks into single allocation
- Split allocations across paychecks

### Technical Debt & Refactoring

**Go Engine Optimization**:
- Migrate from `float64` to `shopspring/decimal` for all money operations
- Benchmark regression testing in CI/CD
- Explore WASM compilation for client-side execution

**Python Service Evolution**:
- Federated learning (train models on-device)
- Differential privacy for aggregate insights
- Model versioning and A/B testing

**State Management Cleanup**:
- Migrate from Zustand to Jotai (if team prefers)
- Unified state architecture across all wizards
- Improved testing utilities

### Internationalization

**Currency Support**:
- Multi-currency allocation (EUR, GBP, CAD, AUD)
- Exchange rate handling for international users
- Locale-specific number formatting

**Language Support**:
- Spanish translation (high priority)
- French, German, Portuguese (medium priority)
- RTL languages (Arabic, Hebrew) for global reach

### Platform Expansion

**Mobile Native Apps**:
- iOS app with Swift UI wizard
- Android app with Jetpack Compose wizard
- Shared Go/Python backend services

**Integrations**:
- Direct deposit import (partner with payroll providers)
- Bank account linking (Plaid integration)
- Calendar sync for expected pay dates

---

## Documentation Plan

### Technical Documentation

**API Documentation**:
- [ ] Go allocation engine OpenAPI spec
- [ ] Python prediction service OpenAPI spec
- [ ] Request/response examples for all endpoints
- [ ] Error codes and handling guide
- [ ] Rate limiting and quotas

**Architecture Documentation**:
- [ ] Privacy architecture diagram (blinded calculation flow)
- [ ] Component hierarchy diagram (wizard steps)
- [ ] State management flow (Zustand → IndexedDB → Firestore)
- [ ] Data flow diagram (client → backend → client)

**Code Documentation**:
- [ ] Inline comments for complex logic
- [ ] JSDoc/TSDoc for public functions
- [ ] Go package documentation
- [ ] Python docstrings

### User Documentation

**User Guide**:
- [ ] How to allocate a paycheck (step-by-step)
- [ ] Understanding allocation strategies
- [ ] What is Smart Split and how it works
- [ ] Privacy and security explanation
- [ ] Troubleshooting common issues

**Help Center Articles**:
- [ ] "What is the Paycheck Wizard?"
- [ ] "How does Smart Split protect my privacy?"
- [ ] "Why don't my allocations add up?" (math explanation)
- [ ] "Can I customize allocation strategies?"

### Developer Documentation

**Setup Guide**:
- [ ] Local development environment setup
- [ ] Running Go/Python services locally
- [ ] Testing strategy and running tests
- [ ] Deployment process

**Contributing Guide**:
- [ ] Code style and conventions
- [ ] Git workflow (branch naming, commit messages)
- [ ] Pull request template
- [ ] Code review checklist

---

## References & Research

### Local Resources

**Architecture**:
- [docs/architecture/Client-State-Management.md](docs/architecture/Client-State-Management.md:1) - Zustand patterns
- [docs/shared-ui/design-standards.md](docs/shared-ui/design-standards.md:1) - "Hard Lines" aesthetic
- [docs/testing/polyglot-backend-testing.md](docs/testing/polyglot-backend-testing.md:1) - Backend testing guide

**Existing Patterns**:
- [src/components/receipts/import-dashboard/](src/components/receipts/import-dashboard/) - Sentinel wizard pattern
- [src/stores/ui/importDashboardStore.ts](src/stores/ui/importDashboardStore.ts:1) - Zustand store example
- [api/budget/index.go](api/budget/index.go:1) - Go service structure
- [api/analytics/prediction.py](api/analytics/prediction.py:1) - Python service structure

**Institutional Learnings**:
- React Error #185 Prevention (CRITICAL: Never use `get()` in store actions)
- Privacy-first E2EE patterns
- Financial calculation best practices
- Offline mutation handling

### External Resources

**Financial Calculations**:
- [Floats Don't Work For Storing Cents | Modern Treasury](https://www.moderntreasury.com/journal/floats-dont-work-for-storing-cents)
- [shopspring/decimal - Go Package](https://pkg.go.dev/github.com/shopspring/decimal)
- [Largest Remainder Method | Sage 50](http://help.sage50.na.sage.com/en-us/2017/sage50us/Content/PR01/Allocation_Method.htm)

**Privacy & Security**:
- [Privacy Laws 2026 | SecurePrivacy](https://secureprivacy.ai/blog/privacy-laws-2026)
- [Zero-Knowledge Architecture | Medium](https://medium.com/@rosgluk/zero-knowledge-architecture-privacy-by-design-ba8993fa27d7)
- [E2EE in Finance | Fullestop](https://www.fullestop.com/blog/privacy-first-social-apps-how-end-to-end-encryption-and-user-control-protect-your-data)

**Wizard UX**:
- [Wizard UI Pattern Explained | Eleken](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
- [Multi-Step Form Best Practices | Growform](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)
- [8 Multi-Step Form Examples | Webstacks](https://www.webstacks.com/blog/multi-step-form)

**Framework Documentation**:
- [Zustand Official Docs](https://zustand.docs.pmnd.rs)
- [Framer Motion Docs](https://motion.dev)
- [TanStack Query v5 Docs](https://tanstack.com/query/v5)
- [Dexie.js Docs](https://dexie.org)

**AI/ML Integration**:
- [Banking AI Predictions 2026 | SAS](https://www.sas.com/en_us/news/press-releases/2025/december/banking-predictions-2026.html)
- [FastAPI for ML | NVIDIA](https://developer.nvidia.com/blog/building-a-machine-learning-microservice-with-fastapi/)

**Performance**:
- [IndexedDB Performance | RxDB](https://rxdb.info/slow-indexeddb.html)
- [Go Benchmarking Guide | BetterStack](https://betterstack.com/community/guides/scaling-go/golang-benchmarking/)

---

## Appendix: Critical Questions from SpecFlow Analysis

The SpecFlow analyzer identified 30 questions. Below are the **8 CRITICAL** questions that must be answered before implementation begins:

### 1. Python Service Historical Data Source
**Question**: How does the Python service access "historical allocations" if it never receives envelope names or user identity? Is the client sending anonymized past allocation ratios in the request payload?

**Current Plan**: Client sends last 12 paycheck allocation ratios as unlabeled array in request payload.

**Example Request**:
```json
{
  "paycheck_cents": 250000,
  "historical_sessions": [
    {"date": "2026-01-15", "amount_cents": 240000, "ratios": [0.5, 0.3, 0.2]},
    {"date": "2025-12-31", "amount_cents": 250000, "ratios": [0.48, 0.27, 0.25]}
  ],
  "current_month": 1,
  "num_envelopes": 3
}
```

**Status**: ✅ Resolved

---

### 2. Wizard Step Definition
**Question**: What are the exact steps in the wizard flow?

**Current Plan**:
- **Step 0**: Amount Entry
- **Step 1**: Allocation Strategy Selection
- **Step 2**: Review & Adjust (optional)
- **Step 3**: Success Screen

**Status**: ✅ Resolved

---

### 3. Entry Point Routing
**Question**: Which route is correct: `/app/paycheck/flow` or `/vault/wizard/paycheck`?

**Current Plan**: `/vault/wizard/paycheck` is canonical. `/app/paycheck/flow` redirects for backward compatibility.

**Status**: ✅ Resolved

---

### 4. IndexedDB Encryption
**Question**: Must wizard state in IndexedDB be encrypted per E2EE standards?

**Current Plan**: Yes. Sensitive data (paycheck amount, allocation details) encrypted with user's master key. Only `currentStep` and `selectedStrategy` persisted in plaintext.

**Status**: ✅ Resolved

---

### 5. "Last Split" Pattern Definition
**Question**: Does [USE LAST SPLIT] apply (a) absolute amounts or (b) ratios scaled to new amount?

**Current Plan**: (b) Ratios scaled to new amount.

**Example**: Last paycheck $1000 (Rent=$500, Food=$300, Savings=$200). New paycheck $1500 → Rent=$750, Food=$450, Savings=$300.

**Status**: ✅ Resolved

---

### 6. Remainder Distribution
**Question**: Which envelope gets the remainder penny from rounding?

**Current Plan**: Largest remainder method. Distribute dust to envelopes with highest fractional remainders.

**Status**: ✅ Resolved

---

### 7. Transaction Creation Atomicity
**Question**: How does allocation create transactions? What if creation partially fails?

**Current Plan**: Single batch API call to `/api/paycheck/allocate` with server-side atomic transaction. All-or-nothing guarantee.

**Status**: ✅ Resolved

---

### 8. Expected Pay Date Calculation
**Question**: How is "expected pay date" determined for entry point visibility?

**Current Plan**: Two options:
1. User manually sets expected pay date in settings
2. System infers from average of last 3 paychecks' date intervals

**Default**: If no expected date configured, entry point always visible.

**Status**: ✅ Resolved

---

## Appendix: File Structure

```
violet-vault/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── GotPaidCTA.tsx                    # #157 Entry Point
│   │   │   └── __tests__/
│   │   │       └── GotPaidCTA.test.tsx
│   │   └── budgeting/
│   │       └── paycheck-flow/
│   │           ├── PaycheckWizardModal.tsx       # #1785 Container
│   │           ├── steps/
│   │           │   ├── AmountEntryStep.tsx
│   │           │   ├── AllocationStrategyStep.tsx # #162 Smart Allocation
│   │           │   ├── ReviewStep.tsx
│   │           │   └── SuccessStep.tsx           # #161 Success Screen
│   │           ├── components/
│   │           │   ├── AllocationCard.tsx
│   │           │   ├── RemainingCounter.tsx
│   │           │   └── SuccessSummary.tsx
│   │           └── __tests__/
│   │               ├── PaycheckWizardModal.test.tsx
│   │               └── AllocationStrategyStep.test.tsx
│   └── stores/
│       └── ui/
│           ├── paycheckFlowStore.ts              # Zustand store
│           └── __tests__/
│               └── paycheckFlowStore.test.ts
├── api/
│   ├── paycheck/
│   │   ├── allocate.go                           # #1786 Go Engine
│   │   ├── allocate_test.go
│   │   ├── benchmark_test.go
│   │   └── types.go
│   └── analytics/
│       ├── paycheck_prediction.py                # #1787 Python Service
│       ├── test_prediction.py
│       ├── algorithms.py
│       └── requirements.txt
└── docs/
    └── plans/
        └── 2026-01-29-feat-polyglot-paycheck-flow-v2-plan.md  # This file
```

---

**Plan Status**: Ready for Implementation
**Next Steps**: Present to stakeholders → Gather feedback → Begin Phase 1
**Estimated Start Date**: TBD
**Estimated Completion**: 6-8 weeks from start
