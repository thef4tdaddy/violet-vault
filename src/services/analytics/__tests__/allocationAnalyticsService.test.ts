/**
 * Allocation Analytics Service Tests
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 * 
 * Unit tests for allocation analytics service business logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AllocationAnalyticsService } from '@/services/analytics/allocationAnalyticsService';
import type { AllocationAnalyticsParams } from '@/types/allocationAnalytics';

// Mock the database
vi.mock('@/db/budgetDb', () => ({
  db: {
    transactions: {
      where: vi.fn(() => ({
        between: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    },
  },
}));

// Mock logger
vi.mock('@/utils/core/common/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('AllocationAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalytics', () => {
    it('should return analytics data structure', async () => {
      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('heatmap');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('distribution');
      expect(result).toHaveProperty('strategyAnalysis');
      expect(result).toHaveProperty('healthScore');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('lastCalculated');
      expect(result).toHaveProperty('cacheKey');
    });

    it('should return empty analytics when no data', async () => {
      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      expect(result.heatmap.totalAllocations).toBe(0);
      expect(result.heatmap.dataPoints).toHaveLength(0);
      expect(result.trends.envelopes).toHaveLength(0);
      expect(result.distribution.categories).toHaveLength(0);
      expect(result.strategyAnalysis.strategies).toHaveLength(0);
    });

    it('should generate cache key based on params', async () => {
      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      expect(result.cacheKey).toContain('test-user-123');
      expect(result.cacheKey).toContain('2026-01-01');
      expect(result.cacheKey).toContain('2026-01-31');
    });

    it('should set lastCalculated timestamp', async () => {
      const beforeCall = new Date().toISOString();

      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      const afterCall = new Date().toISOString();

      expect(result.lastCalculated).toBeDefined();
      expect(new Date(result.lastCalculated).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeCall).getTime()
      );
      expect(new Date(result.lastCalculated).getTime()).toBeLessThanOrEqual(
        new Date(afterCall).getTime()
      );
    });
  });

  describe('Health Score Calculation', () => {
    it('should calculate health score between 0 and 100', async () => {
      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        includeHealthScore: true,
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      expect(result.healthScore.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore.totalScore).toBeLessThanOrEqual(100);
    });

    it('should include health score components', async () => {
      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        includeHealthScore: true,
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      expect(result.healthScore.components).toBeDefined();
      expect(Array.isArray(result.healthScore.components)).toBe(true);
    });

    it('should set health status based on score', async () => {
      const params: AllocationAnalyticsParams = {
        userId: 'test-user-123',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        includeHealthScore: true,
      };

      const result = await AllocationAnalyticsService.getAnalytics(params);

      expect(result.healthScore.status).toBeDefined();
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.healthScore.status);
    });
  });
});
