/**
 * Typed Firebase Services Usage Examples
 * Demonstrates how to use the type-safe Firebase interfaces
 */

import {
  typedFirebaseSyncService,
  typedChunkedSyncService,
  enhancedFirebaseErrorHandler
} from '../types';
import type {
  TypedResponse,
  SafeUnknown,
  EnhancedFirebaseError
} from '../types';
import logger from '../../utils/common/logger';

// Example budget data structure
interface BudgetData {
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
  }>;
  envelopes: Array<{
    id: string;
    name: string;
    balance: number;
  }>;
  settings: {
    currency: string;
    budgetPeriod: 'monthly' | 'weekly';
  };
}

/**
 * Example: Type-safe Firebase sync operations
 */
export class TypedFirebaseExample {
  private budgetId: string;
  private encryptionKey: string;

  constructor(budgetId: string, encryptionKey: string) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;
  }

  /**
   * Initialize both services with type safety
   */
  async initialize(): Promise<void> {
    try {
      // Initialize basic Firebase sync
      typedFirebaseSyncService.initialize(this.budgetId, this.encryptionKey);
      
      // Initialize chunked sync for large data
      await typedChunkedSyncService.initialize(this.budgetId, this.encryptionKey);
      
      logger.info('Typed Firebase services initialized successfully');
    } catch (error) {
      const enhancedError = enhancedFirebaseErrorHandler.handleError(error, {
        operation: 'initialize',
        budgetId: this.budgetId.substring(0, 8) + '...'
      });
      
      logger.error('Failed to initialize typed Firebase services', {
        error: enhancedError.userMessage,
        canRetry: enhancedError.recoveryStrategy.canRetry
      });
      
      throw error;
    }
  }

  /**
   * Save budget data with automatic chunking decision
   */
  async saveBudgetData(budgetData: BudgetData): Promise<boolean> {
    try {
      // Get chunking information
      const chunkInfo = typedChunkedSyncService.getChunkingInfo(budgetData);
      
      logger.info('Budget data save analysis', {
        estimatedSize: chunkInfo.estimatedSize,
        wouldRequireChunking: chunkInfo.wouldRequireChunking,
        estimatedChunks: chunkInfo.estimatedChunks
      });

      let result: TypedResponse<boolean>;

      if (chunkInfo.wouldRequireChunking) {
        // Use chunked sync for large data
        const currentUser = { uid: 'user123', userName: 'Demo User' };
        result = await typedChunkedSyncService.saveToCloud(budgetData, currentUser);
      } else {
        // Use regular sync for smaller data
        result = await typedFirebaseSyncService.saveToCloud(budgetData, {
          version: '1.0',
          userAgent: navigator.userAgent,
          operation: 'budget_save'
        });
      }

      if (result.success && result.data) {
        logger.info('Budget data saved successfully', {
          chunked: chunkInfo.wouldRequireChunking,
          timestamp: result.timestamp
        });
        return true;
      } else {
        this.handleSaveError(result.error);
        return false;
      }
    } catch (error) {
      const enhancedError = enhancedFirebaseErrorHandler.handleError(error, {
        operation: 'save_budget',
        dataSize: JSON.stringify(budgetData).length
      });
      
      logger.error('Failed to save budget data', {
        error: enhancedError.userMessage,
        category: enhancedError.detailedCategory,
        canRetry: enhancedError.recoveryStrategy.canRetry
      });
      
      return false;
    }
  }

  /**
   * Load budget data with type safety
   */
  async loadBudgetData(): Promise<BudgetData | null> {
    try {
      // Try chunked sync first (handles both chunked and non-chunked data)
      const result = await typedChunkedSyncService.loadFromCloud<BudgetData>();

      if (result.success && result.data) {
        // Validate the loaded data structure
        if (this.isValidBudgetData(result.data)) {
          logger.info('Budget data loaded successfully', {
            hasTransactions: Array.isArray(result.data.transactions),
            transactionCount: result.data.transactions?.length || 0,
            hasEnvelopes: Array.isArray(result.data.envelopes),
            envelopeCount: result.data.envelopes?.length || 0
          });
          
          return result.data;
        } else {
          logger.warn('Loaded data has invalid structure');
          return null;
        }
      } else if (result.error) {
        this.handleLoadError(result.error);
        return null;
      } else {
        logger.info('No budget data found in cloud');
        return null;
      }
    } catch (error) {
      const enhancedError = enhancedFirebaseErrorHandler.handleError(error, {
        operation: 'load_budget'
      });
      
      logger.error('Failed to load budget data', {
        error: enhancedError.userMessage,
        category: enhancedError.detailedCategory
      });
      
      return null;
    }
  }

  /**
   * Setup real-time sync with type safety
   */
  setupRealTimeSync(onDataChange: (data: BudgetData | null) => void): void {
    typedFirebaseSyncService.setupRealTimeSync<BudgetData>((response) => {
      if (response.success && response.data) {
        if (this.isValidBudgetData(response.data)) {
          logger.info('Real-time data update received', {
            timestamp: response.timestamp
          });
          onDataChange(response.data);
        } else {
          logger.warn('Real-time data has invalid structure');
          onDataChange(null);
        }
      } else if (response.error) {
        logger.error('Real-time sync error', {
          error: response.error.message,
          category: response.error.category
        });
        onDataChange(null);
      }
    });
  }

  /**
   * Get service status information
   */
  getServicesStatus(): {
    firebaseSync: ReturnType<typeof typedFirebaseSyncService.getStatus>;
    chunkedSync: ReturnType<typeof typedChunkedSyncService.getStats>;
  } {
    return {
      firebaseSync: typedFirebaseSyncService.getStatus(),
      chunkedSync: typedChunkedSyncService.getStats()
    };
  }

  /**
   * Cleanup all services
   */
  cleanup(): void {
    typedFirebaseSyncService.stopRealTimeSync();
    typedFirebaseSyncService.cleanup();
    logger.info('Typed Firebase services cleaned up');
  }

  // Private helper methods
  private isValidBudgetData(data: SafeUnknown): data is BudgetData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'transactions' in data &&
      'envelopes' in data &&
      'settings' in data &&
      Array.isArray((data as any).transactions) &&
      Array.isArray((data as any).envelopes) &&
      typeof (data as any).settings === 'object'
    );
  }

  private handleSaveError(error?: EnhancedFirebaseError): void {
    if (!error) return;

    logger.error('Save operation failed', {
      message: error.userMessage,
      category: error.detailedCategory,
      canRetry: error.recoveryStrategy.canRetry,
      recoveryActions: error.recoveryStrategy.recoveryActions
    });

    // Example of automated retry for retryable errors
    if (error.recoveryStrategy.canRetry) {
      logger.info('Error is retryable, consider implementing retry logic', {
        maxRetries: error.recoveryStrategy.maxRetries,
        retryDelay: error.recoveryStrategy.retryDelay
      });
    }
  }

  private handleLoadError(error: EnhancedFirebaseError): void {
    logger.error('Load operation failed', {
      message: error.userMessage,
      category: error.detailedCategory,
      technicalDetails: error.technicalDetails,
      recoveryActions: error.recoveryStrategy.recoveryActions
    });

    // Handle specific error categories
    switch (error.detailedCategory) {
      case 'encryption_decrypt':
        logger.warn('Decryption failed - may need to check encryption key');
        break;
      case 'network_timeout':
      case 'network_connection':
        logger.info('Network issue detected - data may be available offline');
        break;
      case 'firebase_permission':
        logger.error('Permission denied - user may need to re-authenticate');
        break;
      default:
        logger.warn('Unexpected error category', { category: error.detailedCategory });
    }
  }
}

/**
 * Example usage of the typed Firebase services
 */
export async function demonstrateTypedFirebaseUsage(): Promise<void> {
  const budgetId = 'demo-budget-12345';
  const encryptionKey = 'demo-encryption-key-that-is-long-enough-for-security';
  
  const firebaseExample = new TypedFirebaseExample(budgetId, encryptionKey);

  try {
    // Initialize services
    await firebaseExample.initialize();

    // Create sample budget data
    const sampleBudgetData: BudgetData = {
      transactions: [
        {
          id: 'tx1',
          amount: -25.99,
          description: 'Coffee Shop',
          date: new Date().toISOString()
        }
      ],
      envelopes: [
        {
          id: 'env1',
          name: 'Food & Dining',
          balance: 200.00
        }
      ],
      settings: {
        currency: 'USD',
        budgetPeriod: 'monthly'
      }
    };

    // Save the data
    const saveSuccess = await firebaseExample.saveBudgetData(sampleBudgetData);
    if (saveSuccess) {
      logger.info('Demo: Budget data saved successfully');
    }

    // Load the data back
    const loadedData = await firebaseExample.loadBudgetData();
    if (loadedData) {
      logger.info('Demo: Budget data loaded successfully', {
        transactionCount: loadedData.transactions.length
      });
    }

    // Get status
    const status = firebaseExample.getServicesStatus();
    logger.info('Demo: Services status', status);

    // Setup real-time sync (commented out to avoid ongoing listeners in demo)
    // firebaseExample.setupRealTimeSync((data) => {
    //   logger.info('Demo: Real-time data update', { hasData: !!data });
    // });

  } catch (error) {
    logger.error('Demo failed', error);
  } finally {
    // Cleanup
    firebaseExample.cleanup();
  }
}