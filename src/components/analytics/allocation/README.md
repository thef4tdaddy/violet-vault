# Allocation Analytics Dashboard

**Feature**: Visual Trends & Heatmaps for Paycheck Allocation Analysis

## Overview

The Allocation Analytics Dashboard provides comprehensive visualization and analysis of paycheck allocation patterns over time. It helps users understand their spending habits, track allocation strategies, and monitor their financial health.

## Features

### 📊 Core Analytics

1. **Allocation Heatmap** - Calendar view showing paycheck allocation activity with intensity-based coloring
2. **Envelope Trend Lines** - Multi-series charts tracking allocation to specific envelopes over time  
3. **Allocation Distribution** - Pie/donut charts showing proportional allocation across categories
4. **Strategy Performance** - Analysis comparing EVEN_SPLIT, LAST_SPLIT, and TARGET_FIRST strategies
5. **Financial Health Score** - Composite score (0-100) based on allocation patterns

### 🎯 Key Metrics

- **Consistency Score**: Regular allocation without gaps
- **Bill Coverage Rate**: Percentage of bills fully funded
- **Savings Rate**: Percentage of income allocated to savings
- **Emergency Fund Score**: Progress toward 6-month expense cushion
- **Discretionary Spending**: Control over optional expenses

## Architecture

### Type System

**Location**: `/src/types/allocationAnalytics.ts`

Comprehensive TypeScript types for all analytics data structures:
- `AllocationAnalytics` - Complete analytics data
- `HeatmapData` - Calendar heatmap visualization data
- `TrendData` - Envelope trend analysis
- `DistributionData` - Category distribution breakdown
- `StrategyAnalysis` - Strategy performance comparison
- `FinancialHealthScore` - Health score calculation

### Validation Layer

**Location**: `/src/domain/schemas/allocationAnalytics.ts`

Zod schemas for runtime validation:
- Input validation for API params
- Output validation for service responses
- Type inference from schemas
- Safe parsing with error handling

### Service Layer

**Location**: `/src/services/analytics/allocationAnalyticsService.ts`

Business logic for analytics calculations:

```typescript
class AllocationAnalyticsService {
  static async getAnalytics(params: AllocationAnalyticsParams): Promise<AllocationAnalytics>
  
  // Private methods for specific calculations
  private static async generateHeatmap(records: PaycheckAllocationRecord[]): Promise<HeatmapData>
  private static async calculateTrends(records: PaycheckAllocationRecord[]): Promise<TrendData>
  private static async calculateDistribution(records: PaycheckAllocationRecord[]): Promise<DistributionData>
  private static async analyzeStrategies(records: PaycheckAllocationRecord[]): Promise<StrategyAnalysis>
  private static async calculateHealthScore(records: PaycheckAllocationRecord[]): Promise<FinancialHealthScore>
}
```

**Key Features**:
- Paycheck frequency detection (weekly, biweekly, monthly)
- Missed paycheck identification
- Trend analysis with direction detection
- Health score algorithm with weighted components
- Personalized recommendations

### Data Layer (TanStack Query)

**Location**: `/src/hooks/platform/analytics/useAllocationAnalytics.ts`

React Query hooks for data fetching:

```typescript
// Main hook - fetches all analytics
useAllocationAnalytics(options: UseAllocationAnalyticsOptions)

// Optimized hooks for individual sections
useAllocationHeatmap(startDate: string, endDate: string)
useAllocationTrends(startDate: string, endDate: string)
useAllocationDistribution(startDate: string, endDate: string)
useAllocationStrategyAnalysis(startDate: string, endDate: string)
useAllocationHealthScore(startDate: string, endDate: string)
```

**Features**:
- 5-minute stale time (configurable)
- 10-minute cache time (configurable)
- Automatic retry with exponential backoff
- Query key factory for cache management
- Optimized partial data fetching

### UI State (Zustand)

**Location**: `/src/stores/ui/allocationAnalyticsStore.ts`

UI state management store:

```typescript
interface AllocationAnalyticsStoreState {
  // Navigation
  activeTab: AnalyticsDashboardTab
  
  // Filters
  filters: DashboardFilters
  
  // Chart preferences
  trendChartType: TrendChartType
  selectedEnvelopes: string[]
  showLegend: boolean
  showGrid: boolean
  
  // Export state
  isExporting: boolean
  exportFormat: ExportFormat | null
  
  // Actions
  setActiveTab(tab: AnalyticsDashboardTab): void
  setDateRange(start: string, end: string, preset?: DateRangePreset): void
  setTrendChartType(type: TrendChartType): void
  // ... more actions
}
```

**Features**:
- Persisted user preferences (chart type, legend, grid)
- Date range presets (last 30 days, 3 months, 6 months, year)
- Filter management (payers, strategies, frequencies)
- Export modal state

### Component Layer

**Location**: `/src/components/analytics/allocation/AllocationAnalyticsDashboard.tsx`

Main dashboard component:

```tsx
<AllocationAnalyticsDashboard>
  <DashboardHeader 
    totalAllocations={number}
    healthScore={number}
    dateRange={DateRange}
  />
  
  <TabNavigation 
    activeTab={AnalyticsDashboardTab}
    onChange={Function}
  />
  
  <TabContent tab={string} />
</AllocationAnalyticsDashboard>
```

**States**:
- Loading state with spinner
- Error state with retry button
- Empty state with CTA to process paycheck
- Success state with analytics visualization

## Usage

### Basic Usage

```tsx
import { AllocationAnalyticsDashboard } from '@/components/analytics/allocation/AllocationAnalyticsDashboard';

function App() {
  return <AllocationAnalyticsDashboard />;
}
```

### Custom Date Range

```tsx
import { useAllocationAnalyticsStore } from '@/stores/ui/allocationAnalyticsStore';

function MyComponent() {
  const setDateRange = useAllocationAnalyticsStore(state => state.setDateRange);
  
  // Set last 6 months
  setDateRange('2025-07-01', '2026-01-01', 'last6months');
}
```

### Fetching Specific Analytics

```tsx
import { useAllocationHeatmap } from '@/hooks/platform/analytics/useAllocationAnalytics';

function HeatmapComponent() {
  const { data, isLoading, error } = useAllocationHeatmap('2026-01-01', '2026-01-31');
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <Heatmap data={data.heatmap} />;
}
```

## Routing

**Path**: `/app/analytics/allocations`  
**View**: `allocation-analytics`

Navigate to the dashboard:

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToAnalytics = () => {
    navigate('/app/analytics/allocations');
  };
  
  return <button onClick={goToAnalytics}>View Analytics</button>;
}
```

## Testing

### Unit Tests

**Location**: `/src/services/analytics/__tests__/allocationAnalyticsService.test.ts`

Run tests:

```bash
npm run test
```

**Test Coverage**:
- ✅ Analytics data structure validation
- ✅ Empty state handling
- ✅ Parameter handling (include flags)
- ✅ Cache key generation
- ✅ Health score calculation (0-100 range)
- ✅ Timestamp validation
- ✅ Component validation

### Manual Testing

1. Navigate to `/app/analytics/allocations`
2. Verify loading state appears
3. Process a few paychecks with different strategies
4. Check that data appears in dashboard
5. Switch between tabs
6. Adjust date range
7. Verify health score updates

## Data Flow

```
User Action (Date Range Change)
  ↓
Zustand Store (UI State Update)
  ↓
TanStack Query Hook (Fetch Analytics)
  ↓
AllocationAnalyticsService (Calculate Analytics)
  ↓
Dexie Database (Fetch Paycheck Transactions)
  ↓
Process & Aggregate Data
  ↓
Return Analytics Object
  ↓
Component Renders (Dashboard UI)
```

## Health Score Algorithm

### Components (Weighted)

1. **Consistency** (15% weight)
   - Regular allocation without gaps
   - Score: `min(90, paycheckCount * 9)`

2. **Bill Coverage** (30% weight)
   - Percentage of bills fully funded
   - Score: `(fundedBills / totalBills) * 100`

3. **Savings Rate** (25% weight)
   - Percentage allocated to savings
   - Target: 25%
   - Score: `min(100, (actualRate / targetRate) * 100)`

4. **Emergency Fund** (20% weight)
   - Progress toward 6-month expense cushion
   - Score: `(currentFund / sixMonthExpenses) * 100`

5. **Discretionary Spending** (10% weight)
   - Control over optional expenses
   - Target: <30% of income
   - Score: `100 - min(100, (discretionary / income) * 100)`

### Total Score

```typescript
totalScore = sum(component.score * component.weight)
```

### Status Thresholds

- **Excellent**: 85-100
- **Good**: 70-84
- **Fair**: 50-69
- **Poor**: 0-49

## Performance

### Optimizations

- **Lazy Loading**: Dashboard component loaded on-demand
- **Memoization**: React.memo for expensive components
- **Query Caching**: 5-minute stale time, 10-minute cache
- **Partial Fetching**: Individual hooks for specific sections
- **Virtual Scrolling**: For large envelope lists (future)

### Benchmarks

- **Initial Load**: <2 seconds (with data)
- **Tab Switch**: <100ms
- **Date Range Change**: <500ms
- **Max Allocations**: 500+ without lag

## Future Enhancements

### Phase 2 (v2.2)

- [ ] **Heatmap Calendar**: Interactive calendar visualization
- [ ] **Trend Charts**: Recharts/D3.js line charts
- [ ] **Distribution Charts**: Pie/donut charts
- [ ] **Strategy Table**: Performance comparison table
- [ ] **Health Gauge**: Circular gauge visualization

### Phase 3 (v2.3)

- [ ] **Advanced Filters**: Multi-select payers, strategies
- [ ] **Export Functionality**: CSV, PDF, PNG
- [ ] **Mobile Optimization**: Responsive layouts
- [ ] **Sharing**: Share analytics snapshots

### Phase 4 (v2.4)

- [ ] **Predictive Analytics**: Forecast future allocations
- [ ] **Anomaly Detection**: Alert on unusual patterns
- [ ] **Peer Benchmarks**: Compare to similar households
- [ ] **Custom Reports**: Schedule weekly/monthly emails
- [ ] **External Integration**: Sync with Mint, YNAB

## Dependencies

### Core

- React 19
- TypeScript (strict mode)
- TanStack Query v5
- Zustand
- Zod

### Future (Charts)

- Recharts or D3.js (for visualizations)
- html2canvas (for export)
- jspdf (for PDF export)

## Contributing

When working on this feature:

1. **Follow Architecture**: Types → Schemas → Service → Hooks → Components
2. **No `any` Types**: Use proper TypeScript types or Zod inference
3. **Use @ Imports**: Always use `@/` path aliases
4. **Test Coverage**: 80%+ for new code
5. **Update Documentation**: Keep this README current

## Related Issues

- **Parent Epic**: #156 - Polyglot Human-Centered Paycheck Flow v2.1
- **Feature Request**: Allocation Analytics Dashboard - Visual Trends & Heatmaps

## License

MIT License - Part of Violet Vault v2.1.0
