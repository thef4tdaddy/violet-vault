---
title: "feat: Unified Sentinel/OCR Import Dashboard"
type: feat
date: 2026-01-26
issue: "#1791"
epic: "#1109"
milestone: v2.1
labels: [enhancement, frontend]
---

# Unified Sentinel/OCR Import Dashboard

## Overview

Build a high-performance import dashboard that unifies digital Sentinel receipts and physical OCR scans into a single "Hard Line" interface. Users can switch between Digital and Scan modes, view pending receipts in an inbox-style card grid, and link receipts to transactions with one-tap actions.

## Problem Statement / Motivation

Currently, receipt ingestion is fragmented across multiple interfaces:

- Sentinel digital receipts require navigating to a separate sync flow
- Physical receipt scanning uses the standalone OCR scanner
- No unified view to manage and process pending receipts from all sources

This creates friction for users who want a single "inbox" to process their receipts efficiently, regardless of source.

## Proposed Solution

Create a unified Import Dashboard (`/import` or modal) with:

1. **Mode Sidebar**: Toggle between Digital (Sentinel sync) and Scan (OCR upload) sources
2. **Receipt Inbox**: Card grid displaying pending receipts with match confidence indicators
3. **Quick Actions**: One-tap linking to suggested transactions
4. **Real-time Status**: Live OCR processing states and Sentinel sync updates

### Scope

| Feature                       | Status   |
| ----------------------------- | -------- |
| Digital (Sentinel App Sync)   | IN SCOPE |
| Scan (Physical Receipt Image) | IN SCOPE |
| Manual Entry                  | DEFERRED |

## Technical Approach

### Architecture

Following existing codebase patterns:

```
src/components/receipts/import-dashboard/
├── ImportDashboard.tsx              # Main container, mode state
├── ImportSidebar.tsx                # Mode selector (Digital/Scan)
├── ReceiptInbox.tsx                 # Virtualized card grid
├── ReceiptCard.tsx                  # Individual receipt display
├── MatchConfidenceGlow.tsx          # Green/yellow indicator
├── EmptyState.tsx                   # Empty inbox states
└── __tests__/                       # Component tests

src/hooks/platform/receipts/
└── useUnifiedReceipts.ts            # Combines Sentinel + local receipts

src/types/
└── import-dashboard.types.ts        # DashboardReceiptItem interface

src/components/sentinel/              # EXISTING - Will integrate
└── OCRScanner.tsx                   # Complete OCR UI with all states
```

### Data Flow

```mermaid
graph TD
    A[Sentinel API] -->|useSentinelReceipts| B[Unified Hook]
    C[Local OCR Receipts] -->|useReceipts| B
    B -->|DashboardReceiptItem[]| D[ReceiptInbox]
    D -->|Virtualized| E[ReceiptCard]
    E -->|onClick| F[MatchConfirmationModal]
    F -->|useReceiptMatchingMutations| G[Link to Transaction]
```

### Key Integrations

| Hook                          | Purpose                                      | File                                                         |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `useSentinelReceipts`         | Poll Sentinel API (30s), filter by status    | `src/hooks/api/useSentinelReceipts.ts`                       |
| `useReceiptMatching`          | Get match suggestions with confidence scores | `src/hooks/platform/receipts/useReceiptMatching.ts`          |
| `useReceiptMutations`         | CRUD for local receipts                      | `src/hooks/platform/data/useReceiptMutations.ts`             |
| `useReceiptScanner`           | Drag-drop, file validation, OCR flow         | `src/hooks/platform/receipts/useReceiptScanner.ts`           |
| `useReceiptMatchingMutations` | Link/dismiss actions                         | `src/hooks/platform/receipts/useReceiptMatchingMutations.ts` |

### Unified Receipt Type

Create adapter to normalize Sentinel and local receipt types:

```typescript
// src/types/import-dashboard.types.ts

export interface DashboardReceiptItem {
  id: string;
  source: "sentinel" | "ocr";
  merchant: string;
  amount: number;
  date: string; // ISO 8601
  status: "pending" | "processing" | "matched" | "failed" | "ignored";
  matchConfidence?: number; // 0-1 scale
  suggestedTransactionId?: string;
  ocrConfidence?: {
    merchant: "high" | "medium" | "low" | "none";
    total: "high" | "medium" | "low" | "none";
    date: "high" | "medium" | "low" | "none";
    overall: number;
  };
  rawData: SentinelReceipt | Receipt; // Original type for mutations
}
```

### Virtualization Strategy

Using `@tanstack/react-virtual` (already in codebase):

```typescript
// src/components/receipts/import-dashboard/ReceiptInbox.tsx

const virtualizer = useVirtualizer({
  count: receipts.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => 120, // Fixed card height for performance
  overscan: 5,
});

// Activate virtualization when > 50 items
const shouldVirtualize = receipts.length > 50;
```

### Confidence Glow Thresholds

| Confidence      | Color  | Border Class                                             |
| --------------- | ------ | -------------------------------------------------------- |
| >= 80% (HIGH)   | Green  | `border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]`  |
| 60-79% (MEDIUM) | Yellow | `border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]` |
| < 60% (LOW)     | None   | `border-black` (default)                                 |

### OCR Status Flow

```
Uploading → Processing → Extracting → Success/Failure
    ↓           ↓            ↓            ↓
  Spinner   "Analyzing"  "Reading..."  Toast + Card Update
```

Status stored in local state during processing, persisted to Dexie on completion.

## Implementation Phases

### Phase 1: Foundation

- [ ] Create `ImportDashboard` route/modal container
- [ ] Implement `ImportSidebar` with Digital/Scan mode toggle
- [ ] Create `DashboardReceiptItem` type and adapter functions
- [ ] Build `useUnifiedReceipts` hook combining both sources
- [ ] Write unit tests for adapter functions and hook (80%+ coverage)

**Files to create:**

- `src/components/receipts/import-dashboard/ImportDashboard.tsx`
- `src/components/receipts/import-dashboard/ImportSidebar.tsx`
- `src/hooks/platform/receipts/useUnifiedReceipts.ts`
- `src/types/import-dashboard.types.ts`
- `src/hooks/platform/receipts/__tests__/useUnifiedReceipts.test.ts`
- `src/components/receipts/import-dashboard/__tests__/ImportSidebar.test.tsx`

### Phase 2: Core UI

- [ ] Build `ReceiptInbox` with grid layout
- [ ] Implement `ReceiptCard` with Hard Line styling
- [ ] Add `MatchConfidenceGlow` component
- [ ] Integrate virtualization for large lists
- [ ] Add empty state designs for each mode
- [ ] Write component tests (80%+ coverage)

**Files to create:**

- `src/components/receipts/import-dashboard/ReceiptInbox.tsx`
- `src/components/receipts/import-dashboard/ReceiptCard.tsx`
- `src/components/receipts/import-dashboard/MatchConfidenceGlow.tsx`
- `src/components/receipts/import-dashboard/EmptyState.tsx`
- `src/components/receipts/import-dashboard/__tests__/ReceiptInbox.test.tsx`
- `src/components/receipts/import-dashboard/__tests__/ReceiptCard.test.tsx`
- `src/components/receipts/import-dashboard/__tests__/MatchConfidenceGlow.test.tsx`

### Phase 3: Interactions

- [ ] **Integrate existing `OCRScanner` component** from `src/components/sentinel/` (already implements drag-drop, processing states, error handling)
- [ ] Wire up "Link to Transaction" action via existing `MatchConfirmationModal`
- [ ] Add real-time OCR status indicators (reuse `ScannerProcessingState`)
- [ ] Implement success feedback (toast + card animation)
- [ ] Write integration tests for upload and link flows (80%+ coverage)

**Files to modify:**

- `src/components/receipts/MatchConfirmationModal.tsx` (if needed)

**Files already exist (will integrate):**

- `src/components/sentinel/OCRScanner.tsx` - Complete OCR UI with Hard Line v2.1 styling
- `src/components/sentinel/components/ScannerUploadArea.tsx` - Drag-drop upload
- `src/components/sentinel/components/ScannerProcessingState.tsx` - Processing animation
- `src/components/sentinel/components/ScannerErrorState.tsx` - Error handling with retry
- `src/components/sentinel/components/ScannerResults.tsx` - Display extracted data
- `src/hooks/platform/receipts/useReceiptScanner.ts` - Complete OCR flow logic

**Files to create:**

- `src/components/receipts/import-dashboard/__tests__/ImportDashboard.integration.test.tsx`

### Phase 4: Polish & Testing

- [ ] Mobile-responsive sidebar (bottom tabs on mobile)
- [ ] Loading skeletons
- [ ] Error states with retry actions
- [ ] Accessibility: ARIA labels, focus management, keyboard nav
- [ ] Offline queue integration for Scan mode
- [ ] Accessibility tests (axe-core)
- [ ] Verify 80%+ coverage across all files
- [ ] Visual regression tests for Hard Line styling

## Technical Considerations

### Performance

- Virtualize grid when > 50 items using `@tanstack/react-virtual`
- Fixed card height (120px) for optimal virtualization
- Sentinel polling already optimized at 30s intervals
- Use TanStack Query caching; avoid redundant fetches

### State Management

- **TanStack Query**: Server state (receipts, transactions, matches)
- **Zustand**: UI state only (upload progress, selected mode)
- **Local State**: Transient processing status during OCR

Pattern from `docs/architecture/Client-State-Management.md`:

```typescript
// UI state in Zustand
const useImportDashboardStore = create<ImportDashboardState>()(
  devtools(
    immer((set) => ({
      selectedMode: "digital" as "digital" | "scan",
      setSelectedMode: (mode) => set({ selectedMode: mode }),
      uploadProgress: 0,
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
    }))
  )
);

// Server state via TanStack Query
const { data: receipts } = useUnifiedReceipts();
```

### Offline Support

- **Digital mode**: Show cached data with "Last synced: X" indicator
- **Scan mode**: Queue images locally via `OfflineRequestQueueService`
- Process queued images when connection restores

### Design System (Hard Line v2.1)

From codebase patterns:

```typescript
// Container
className = "bg-purple-100/40 border-2 border-black rounded-lg p-6";

// Card
className = "bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

// Interactive press effect
className = "hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all";

// Typography
className = "font-mono font-black uppercase tracking-tight text-black";

// Drop zone
className = "border-4 border-dashed border-purple-800 bg-white/50";
```

### Error Handling

| Error                | User Experience                    | Recovery                           |
| -------------------- | ---------------------------------- | ---------------------------------- |
| Sentinel API failure | "Unable to sync. Retry?" toast     | Retry button                       |
| OCR timeout (>10s)   | "Taking longer than expected..."   | Auto-retry once, then manual       |
| OCR extraction fail  | "Couldn't read receipt" + raw text | Manual entry fields                |
| File validation fail | Inline error below drop zone       | Clear guidance on accepted formats |
| WebSocket disconnect | Subtle indicator, auto-reconnect   | Manual refresh button              |

### Security

- Images processed via base64 JSON (no disk writes)
- Explicit cleanup after OCR processing
- Follow E2EE patterns from existing Sentinel integration

## Acceptance Criteria

### Functional Requirements

- [ ] Unified UI displays both Sentinel and OCR receipts in single inbox
- [ ] Sidebar allows switching between Digital and Scan modes
- [ ] Receipt cards show merchant, amount, date, and status
- [ ] Match confidence indicator (green/yellow glow) based on score thresholds
- [ ] One-tap "Link to Transaction" opens confirmation modal
- [ ] Drag-and-drop file upload works in Scan mode
- [ ] Camera capture available on mobile devices
- [ ] Real-time OCR status: Processing → Success/Failure
- [ ] Grid virtualizes when > 50 receipts

### Non-Functional Requirements

- [ ] Page load < 2s on 3G connection
- [ ] Smooth scrolling (60fps) with virtualized list
- [ ] Works offline (queues uploads, shows cached data)
- [ ] Mobile responsive (sidebar becomes bottom tabs)

### Design Requirements

- [ ] Adheres to "Hard Line" v2.1 aesthetic
- [ ] Border-2 border-black on all cards
- [ ] Shadow offset pattern on interactive elements
- [ ] Font-mono uppercase for headers
- [ ] Purple-100/40 glassmorphism backgrounds

### Accessibility Requirements

- [ ] ARIA labels on all interactive elements
- [ ] Focus visible indicators
- [ ] Keyboard navigation through card grid
- [ ] Screen reader announcements for status changes
- [ ] Color-blind friendly confidence indicators (icons as backup)

### Error Handling Requirements

- [ ] OCR failure displays retry option with error message
- [ ] Sentinel API failure shows graceful error with retry
- [ ] Offline state clearly communicated to user
- [ ] File validation errors shown inline

### Testing Requirements

- [ ] **80%+ test coverage** for all new files
- [ ] **80%+ test coverage** for existing files being integrated/modified
- [ ] Unit tests for `useUnifiedReceipts` hook
- [ ] Unit tests for `DashboardReceiptItem` adapter functions
- [ ] Component tests for `ReceiptCard`, `ReceiptInbox`, `ImportSidebar`
- [ ] Integration tests for drag-drop upload flow
- [ ] Integration tests for "Link to Transaction" flow
- [ ] Accessibility tests (axe-core) for all components
- [ ] Visual regression tests for Hard Line styling

**Test files for NEW components:**

- `src/components/receipts/import-dashboard/__tests__/ImportDashboard.test.tsx`
- `src/hooks/platform/receipts/__tests__/useUnifiedReceipts.test.ts`
- `src/components/receipts/import-dashboard/__tests__/ReceiptCard.test.tsx`
- `src/components/receipts/import-dashboard/__tests__/ReceiptInbox.test.tsx`
- `src/components/receipts/import-dashboard/__tests__/ImportSidebar.test.tsx`
- `src/components/receipts/import-dashboard/__tests__/MatchConfidenceGlow.test.tsx`

**Test files that ALREADY EXIST:**

- `src/components/sentinel/__tests__/OCRScanner.test.tsx` - Complete OCR scanner tests

**Test files for EXISTING components (missing coverage):**

- `src/hooks/platform/receipts/__tests__/useReceiptMatching.test.ts`
- `src/hooks/platform/data/__tests__/useReceiptMutations.test.ts`
- `src/hooks/platform/receipts/__tests__/useReceiptMatchingMutations.test.ts`
- `src/components/receipts/__tests__/MatchConfirmationModal.test.tsx`

## Success Metrics

- Receipt processing time reduced by 50% (unified flow vs. separate interfaces)
- 80%+ of receipts matched with one tap (high confidence matches)
- < 5% OCR extraction failure rate
- User satisfaction survey: ease of receipt management

## Dependencies & Risks

### Dependencies

- OCR backend from #1784 (server-side Python Tesseract) - should be ready
- Existing hooks: `useReceiptMatching`, `useSentinelReceipts`, `useReceiptScanner`
- TanStack Virtual already in dependencies

### Risks

| Risk                           | Likelihood | Impact | Mitigation                                        |
| ------------------------------ | ---------- | ------ | ------------------------------------------------- |
| OCR backend not ready          | Low        | High   | Use existing client-side tesseract.js as fallback |
| Performance with 500+ receipts | Medium     | Medium | Aggressive virtualization, pagination option      |
| Mobile drag-drop issues        | Medium     | Low    | Camera capture as primary mobile UX               |

## References & Research

### Internal References

- Receipt matching hook: `src/hooks/platform/receipts/useReceiptMatching.ts`
- Sentinel receipts hook: `src/hooks/api/useSentinelReceipts.ts`
- Receipt scanner hook: `src/hooks/platform/receipts/useReceiptScanner.ts`
- Match confirmation modal: `src/components/receipts/MatchConfirmationModal.tsx`
- Design patterns: `src/components/sentinel/OCRScanner.tsx` (Hard Line styling)
- State management: `docs/architecture/Client-State-Management.md`
- Virtualization example: `src/components/budgeting/EnvelopeGrid.tsx`

### Institutional Learnings

- OCR engine (Python Tesseract): `docs/plans/2026-01-26-feat-python-ocr-extraction-engine-plan.md`
- Offline queue patterns: `docs/features/offline-queue.md`
- WebSocket signaling: `docs/features/websocket-signaling.md`
- Sync orchestration: `docs/features/sync-orchestration.md`

### Related Issues

- Parent Epic: #1109
- OCR Backend: #1784
- Match Confidence Scoring: #1784
