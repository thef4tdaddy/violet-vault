/**
 * Backend Analytics Hook
 * Provides access to backend analytics endpoints
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnalyticsAPIClient } from '@/services/backendAPI';
import logger from '@/utils/common/logger';

/**
 * Hook for payday prediction using backend API
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} options - Query options
 * @returns {Object} Query result with payday prediction
 */
export const usePaydayPrediction = (transactions, options = {}) => {
  return useQuery({
    queryKey: ['payday-prediction', transactions?.length],
    queryFn: async () => {
      if (!transactions || transactions.length === 0) {
        return {
          success: false,
          nextPayday: null,
          confidence: 0,
          pattern: null,
          message: 'No transactions provided',
        };
      }

      return await AnalyticsAPIClient.predictNextPayday(transactions);
    },
    enabled: !!transactions && transactions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    ...options,
  });
};

/**
 * Hook for merchant pattern analysis using backend API
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} envelopes - Array of existing envelopes
 * @param {number} monthsOfData - Number of months to analyze
 * @param {Object} options - Query options
 * @returns {Object} Query result with merchant suggestions
 */
export const useMerchantPatterns = (transactions, envelopes = [], monthsOfData = 1, options = {}) => {
  return useQuery({
    queryKey: ['merchant-patterns', transactions?.length, envelopes?.length, monthsOfData],
    queryFn: async () => {
      if (!transactions || transactions.length === 0) {
        return {
          success: false,
          suggestions: [],
          message: 'No transactions provided',
        };
      }

      return await AnalyticsAPIClient.analyzeMerchantPatterns(
        transactions,
        envelopes,
        monthsOfData
      );
    },
    enabled: !!transactions && transactions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    ...options,
  });
};

/**
 * Hook for comprehensive analytics using backend API
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} envelopes - Array of existing envelopes
 * @param {number} monthsOfData - Number of months to analyze
 * @param {Object} options - Query options
 * @returns {Object} Query result with all analytics
 */
export const useBackendAnalytics = (transactions, envelopes = [], monthsOfData = 1, options = {}) => {
  return useQuery({
    queryKey: ['backend-analytics', transactions?.length, envelopes?.length, monthsOfData],
    queryFn: async () => {
      if (!transactions || transactions.length === 0) {
        return {
          success: false,
          payday: {
            success: false,
            nextPayday: null,
            confidence: 0,
            pattern: null,
          },
          merchants: {
            success: false,
            suggestions: [],
          },
        };
      }

      return await AnalyticsAPIClient.runComprehensiveAnalytics(
        transactions,
        envelopes,
        monthsOfData
      );
    },
    enabled: !!transactions && transactions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    ...options,
  });
};

/**
 * Mutation hook for on-demand payday prediction
 * @returns {Object} Mutation result
 */
export const usePaydayPredictionMutation = () => {
  return useMutation({
    mutationFn: async (transactions) => {
      if (!transactions || transactions.length === 0) {
        throw new Error('No transactions provided');
      }

      const result = await AnalyticsAPIClient.predictNextPayday(transactions);

      if (!result.success) {
        throw new Error(result.error || 'Payday prediction failed');
      }

      return result;
    },
    onSuccess: (data) => {
      logger.info('Payday prediction successful', {
        nextPayday: data.nextPayday,
        confidence: data.confidence,
      });
    },
    onError: (error) => {
      logger.error('Payday prediction mutation failed', error);
    },
  });
};

/**
 * Mutation hook for on-demand merchant pattern analysis
 * @returns {Object} Mutation result
 */
export const useMerchantPatternsMutation = () => {
  return useMutation({
    mutationFn: async ({ transactions, envelopes, monthsOfData }) => {
      if (!transactions || transactions.length === 0) {
        throw new Error('No transactions provided');
      }

      const result = await AnalyticsAPIClient.analyzeMerchantPatterns(
        transactions,
        envelopes || [],
        monthsOfData || 1
      );

      if (!result.success) {
        throw new Error(result.error || 'Merchant pattern analysis failed');
      }

      return result;
    },
    onSuccess: (data) => {
      logger.info('Merchant pattern analysis successful', {
        suggestionCount: data.suggestions.length,
      });
    },
    onError: (error) => {
      logger.error('Merchant pattern analysis mutation failed', error);
    },
  });
};

/**
 * Default export with all hooks
 */
export default {
  usePaydayPrediction,
  useMerchantPatterns,
  useBackendAnalytics,
  usePaydayPredictionMutation,
  useMerchantPatternsMutation,
};
