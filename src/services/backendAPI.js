/**
 * Backend API Service
 * Handles communication with the Go and Python backend APIs
 */
import logger from '@/utils/common/logger';

/**
 * Base URL for API endpoints
 * In development, this will be proxied by Vite
 * In production, this will be served by Vercel
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Bug Report API Client
 */
export class BugReportAPIClient {
  /**
   * Submit bug report to Go backend
   * @param {Object} reportData - Bug report data
   * @returns {Promise<Object>} Submission result
   */
  static async submitBugReport(reportData) {
    try {
      logger.debug('Submitting bug report to backend API', {
        title: reportData.title,
        hasScreenshot: !!reportData.screenshot,
      });

      const response = await fetch(`${API_BASE_URL}/bug-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Bug report submission failed');
      }

      logger.info('Bug report submitted successfully', {
        issueNumber: result.issueNumber,
        url: result.url,
      });

      return {
        success: true,
        issueNumber: result.issueNumber,
        url: result.url,
        provider: result.provider,
      };
    } catch (error) {
      logger.error('Bug report submission failed', error);
      return {
        success: false,
        error: error.message,
        provider: 'github',
      };
    }
  }
}

/**
 * Analytics API Client
 */
export class AnalyticsAPIClient {
  /**
   * Predict next payday based on transaction history
   * @param {Array} transactions - Array of transaction objects
   * @returns {Promise<Object>} Payday prediction result
   */
  static async predictNextPayday(transactions) {
    try {
      logger.debug('Requesting payday prediction from backend API', {
        transactionCount: transactions.length,
      });

      const response = await fetch(`${API_BASE_URL}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payday_prediction',
          transactions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Payday prediction failed');
      }

      logger.info('Payday prediction received', {
        nextPayday: result.data.nextPayday,
        confidence: result.data.confidence,
        pattern: result.data.pattern,
      });

      return {
        success: true,
        ...result.data,
      };
    } catch (error) {
      logger.error('Payday prediction failed', error);
      return {
        success: false,
        error: error.message,
        nextPayday: null,
        confidence: 0,
        pattern: null,
        message: 'Failed to predict payday',
      };
    }
  }

  /**
   * Analyze merchant patterns and suggest new envelopes
   * @param {Array} transactions - Array of transaction objects
   * @param {Array} envelopes - Array of existing envelopes
   * @param {number} monthsOfData - Number of months of data to analyze
   * @returns {Promise<Object>} Merchant pattern analysis result
   */
  static async analyzeMerchantPatterns(transactions, envelopes = [], monthsOfData = 1) {
    try {
      logger.debug('Requesting merchant pattern analysis from backend API', {
        transactionCount: transactions.length,
        envelopeCount: envelopes.length,
        monthsOfData,
      });

      const response = await fetch(`${API_BASE_URL}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'merchant_patterns',
          transactions,
          envelopes,
          monthsOfData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Merchant pattern analysis failed');
      }

      logger.info('Merchant pattern analysis received', {
        suggestionCount: result.data.suggestions.length,
      });

      return {
        success: true,
        suggestions: result.data.suggestions,
      };
    } catch (error) {
      logger.error('Merchant pattern analysis failed', error);
      return {
        success: false,
        error: error.message,
        suggestions: [],
      };
    }
  }

  /**
   * Run comprehensive analytics including payday prediction and merchant patterns
   * @param {Array} transactions - Array of transaction objects
   * @param {Array} envelopes - Array of existing envelopes
   * @param {number} monthsOfData - Number of months of data to analyze
   * @returns {Promise<Object>} Comprehensive analytics result
   */
  static async runComprehensiveAnalytics(transactions, envelopes = [], monthsOfData = 1) {
    try {
      logger.debug('Running comprehensive analytics', {
        transactionCount: transactions.length,
        envelopeCount: envelopes.length,
      });

      // Run both analyses in parallel
      const [paydayResult, merchantResult] = await Promise.all([
        this.predictNextPayday(transactions),
        this.analyzeMerchantPatterns(transactions, envelopes, monthsOfData),
      ]);

      return {
        success: paydayResult.success && merchantResult.success,
        payday: paydayResult,
        merchants: merchantResult,
      };
    } catch (error) {
      logger.error('Comprehensive analytics failed', error);
      return {
        success: false,
        error: error.message,
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
  }
}

/**
 * Export default as combined service
 */
export default {
  bugReport: BugReportAPIClient,
  analytics: AnalyticsAPIClient,
};
