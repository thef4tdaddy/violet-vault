/**
 * Allocation Analytics Dashboard UI Store
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 * 
 * Zustand store for managing UI state of the allocation analytics dashboard.
 * Handles filters, active tabs, chart types, and export states.
 * 
 * CRITICAL: This store is for UI STATE ONLY.
 * Server/data state is managed by TanStack Query hooks.
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import logger from '@/utils/core/common/logger';
import type { AllocationStrategy, ExportFormat } from '@/types/allocationAnalytics';

/**
 * Active tab in the analytics dashboard
 */
export type AnalyticsDashboardTab =
  | 'overview'
  | 'heatmap'
  | 'trends'
  | 'distribution'
  | 'strategy'
  | 'health';

/**
 * Date range preset options
 */
export type DateRangePreset = 'last30days' | 'last3months' | 'last6months' | 'lastYear' | 'custom';

/**
 * Chart type for trend visualization
 */
export type TrendChartType = 'line' | 'area' | 'bar';

/**
 * Dashboard filters
 */
interface DashboardFilters {
  dateRange: {
    start: string; // ISO date
    end: string; // ISO date
    preset: DateRangePreset;
  };
  frequencies: Array<'weekly' | 'biweekly' | 'semi-monthly' | 'monthly'>;
  payers: string[];
  strategies: AllocationStrategy[];
  minAmount: number | null;
  maxAmount: number | null;
}

/**
 * Store state interface
 */
interface AllocationAnalyticsStoreState {
  // Navigation state
  activeTab: AnalyticsDashboardTab;

  // Filters
  filters: DashboardFilters;

  // Chart preferences
  trendChartType: TrendChartType;
  selectedEnvelopes: string[]; // For trend chart
  showLegend: boolean;
  showGrid: boolean;

  // Export state
  isExporting: boolean;
  exportFormat: ExportFormat | null;

  // Modal states
  isFilterModalOpen: boolean;
  isExportModalOpen: boolean;

  // Actions
  setActiveTab: (tab: AnalyticsDashboardTab) => void;
  setDateRange: (start: string, end: string, preset?: DateRangePreset) => void;
  setDateRangePreset: (preset: DateRangePreset) => void;
  setFrequencies: (frequencies: Array<'weekly' | 'biweekly' | 'semi-monthly' | 'monthly'>) => void;
  setPayers: (payers: string[]) => void;
  setStrategies: (strategies: AllocationStrategy[]) => void;
  setAmountRange: (min: number | null, max: number | null) => void;
  resetFilters: () => void;
  setTrendChartType: (type: TrendChartType) => void;
  setSelectedEnvelopes: (envelopeIds: string[]) => void;
  toggleEnvelope: (envelopeId: string) => void;
  setShowLegend: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  setExportFormat: (format: ExportFormat) => void;
  startExport: () => void;
  finishExport: () => void;
}

/**
 * Default date range (last 3 months)
 */
const getDefaultDateRange = (): { start: string; end: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  return {
    start: startDate.toISOString().split('T')[0]!,
    end: endDate.toISOString().split('T')[0]!,
  };
};

/**
 * Initial state
 */
const initialState = {
  activeTab: 'overview' as AnalyticsDashboardTab,
  filters: {
    dateRange: {
      ...getDefaultDateRange(),
      preset: 'last3months' as DateRangePreset,
    },
    frequencies: [] as Array<'weekly' | 'biweekly' | 'semi-monthly' | 'monthly'>,
    payers: [] as string[],
    strategies: [] as AllocationStrategy[],
    minAmount: null,
    maxAmount: null,
  },
  trendChartType: 'line' as TrendChartType,
  selectedEnvelopes: [] as string[],
  showLegend: true,
  showGrid: true,
  isExporting: false,
  exportFormat: null,
  isFilterModalOpen: false,
  isExportModalOpen: false,
};

/**
 * Allocation Analytics Dashboard Store
 * 
 * @example
 * ```tsx
 * const { activeTab, setActiveTab, filters } = useAllocationAnalyticsStore();
 * 
 * return (
 *   <div>
 *     <Tabs activeTab={activeTab} onChange={setActiveTab} />
 *     <DateRangePicker dateRange={filters.dateRange} />
 *   </div>
 * );
 * ```
 */
export const useAllocationAnalyticsStore = create<AllocationAnalyticsStoreState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // Navigation actions
        setActiveTab: (tab: AnalyticsDashboardTab) =>
          set((state) => {
            state.activeTab = tab;
            logger.info('Analytics tab changed', { tab });
          }),

        // Filter actions
        setDateRange: (start: string, end: string, preset?: DateRangePreset) =>
          set((state) => {
            state.filters.dateRange.start = start;
            state.filters.dateRange.end = end;
            state.filters.dateRange.preset = preset || 'custom';
          }),

        setDateRangePreset: (preset: DateRangePreset) =>
          set((state) => {
            const today = new Date();
            const startDate = new Date();

            switch (preset) {
              case 'last30days':
                startDate.setDate(today.getDate() - 30);
                break;
              case 'last3months':
                startDate.setMonth(today.getMonth() - 3);
                break;
              case 'last6months':
                startDate.setMonth(today.getMonth() - 6);
                break;
              case 'lastYear':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
              case 'custom':
                // Keep current dates for custom
                return;
            }

            state.filters.dateRange.start = startDate.toISOString().split('T')[0]!;
            state.filters.dateRange.end = today.toISOString().split('T')[0]!;
            state.filters.dateRange.preset = preset;
          }),

        setFrequencies: (frequencies) =>
          set((state) => {
            state.filters.frequencies = frequencies;
          }),

        setPayers: (payers) =>
          set((state) => {
            state.filters.payers = payers;
          }),

        setStrategies: (strategies) =>
          set((state) => {
            state.filters.strategies = strategies;
          }),

        setAmountRange: (min, max) =>
          set((state) => {
            state.filters.minAmount = min;
            state.filters.maxAmount = max;
          }),

        resetFilters: () =>
          set((state) => {
            state.filters = { ...initialState.filters };
            logger.info('Analytics filters reset');
          }),

        // Chart preference actions
        setTrendChartType: (type) =>
          set((state) => {
            state.trendChartType = type;
          }),

        setSelectedEnvelopes: (envelopeIds) =>
          set((state) => {
            state.selectedEnvelopes = envelopeIds;
          }),

        toggleEnvelope: (envelopeId) =>
          set((state) => {
            const index = state.selectedEnvelopes.indexOf(envelopeId);
            if (index >= 0) {
              state.selectedEnvelopes.splice(index, 1);
            } else {
              state.selectedEnvelopes.push(envelopeId);
            }
          }),

        setShowLegend: (show) =>
          set((state) => {
            state.showLegend = show;
          }),

        setShowGrid: (show) =>
          set((state) => {
            state.showGrid = show;
          }),

        // Modal actions
        openFilterModal: () =>
          set((state) => {
            state.isFilterModalOpen = true;
          }),

        closeFilterModal: () =>
          set((state) => {
            state.isFilterModalOpen = false;
          }),

        openExportModal: () =>
          set((state) => {
            state.isExportModalOpen = true;
          }),

        closeExportModal: () =>
          set((state) => {
            state.isExportModalOpen = false;
          }),

        // Export actions
        setExportFormat: (format) =>
          set((state) => {
            state.exportFormat = format;
          }),

        startExport: () =>
          set((state) => {
            state.isExporting = true;
            logger.info('Export started', { format: state.exportFormat });
          }),

        finishExport: () =>
          set((state) => {
            state.isExporting = false;
            state.isExportModalOpen = false;
            logger.info('Export completed');
          }),
      })),
      {
        name: 'allocation-analytics-storage',
        storage: createJSONStorage(() => localStorage),
        version: 1,

        // Only persist user preferences, not transient state
        partialize: (state) => ({
          trendChartType: state.trendChartType,
          showLegend: state.showLegend,
          showGrid: state.showGrid,
          filters: {
            dateRange: {
              preset: state.filters.dateRange.preset,
              // Don't persist actual dates (they'll be recalculated)
            },
          },
        }),

        // Merge persisted state with fresh defaults
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<AllocationAnalyticsStoreState>;
          return {
            ...currentState,
            trendChartType: persisted.trendChartType || currentState.trendChartType,
            showLegend: persisted.showLegend ?? currentState.showLegend,
            showGrid: persisted.showGrid ?? currentState.showGrid,
            filters: {
              ...currentState.filters,
              dateRange: {
                ...getDefaultDateRange(),
                preset: persisted.filters?.dateRange?.preset || 'last3months',
              },
            },
          };
        },
      }
    ),
    {
      name: 'AllocationAnalyticsStore',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Selectors for performance optimization
 */
export const selectActiveTab = (state: AllocationAnalyticsStoreState) => state.activeTab;
export const selectFilters = (state: AllocationAnalyticsStoreState) => state.filters;
export const selectDateRange = (state: AllocationAnalyticsStoreState) => state.filters.dateRange;
export const selectTrendChartType = (state: AllocationAnalyticsStoreState) => state.trendChartType;
export const selectSelectedEnvelopes = (state: AllocationAnalyticsStoreState) =>
  state.selectedEnvelopes;
export const selectIsExporting = (state: AllocationAnalyticsStoreState) => state.isExporting;
