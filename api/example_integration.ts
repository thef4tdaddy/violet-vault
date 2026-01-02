/**
 * Example Integration: TypeScript/React Frontend calling Python Analytics API
 * 
 * This file demonstrates how to integrate the Python Analytics Service
 * envelope integrity audit endpoint from the VioletVault frontend.
 * 
 * Place this in: src/services/analytics/integrityAudit.ts
 */

import { db } from '@/db';
import logger from '@/utils/common/logger';

/**
 * Analytics API Configuration
 * TODO: Move to environment variables
 */
const ANALYTICS_API_BASE_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8000';

/**
 * Integrity violation severity levels
 */
type ViolationSeverity = 'error' | 'warning' | 'info';

/**
 * Types of integrity violations
 */
type ViolationType = 
  | 'orphaned_transaction' 
  | 'negative_balance' 
  | 'balance_leakage' 
  | 'missing_data';

/**
 * Entity type that has a violation
 */
type EntityType = 'envelope' | 'transaction' | 'budget';

/**
 * Single integrity violation
 */
interface IntegrityViolation {
  severity: ViolationSeverity;
  type: ViolationType;
  message: string;
  entityId?: string;
  entityType?: EntityType;
  details?: Record<string, unknown>;
}

/**
 * Summary statistics for audit results
 */
interface AuditSummary {
  total: number;
  by_severity: Record<ViolationSeverity, number>;
  by_type: Record<string, number>;
}

/**
 * Complete integrity audit result
 */
interface IntegrityAuditResult {
  violations: IntegrityViolation[];
  summary: AuditSummary;
  timestamp: string;
  snapshotSize: {
    envelopes: number;
    transactions: number;
    metadata: number;
  };
}

/**
 * Budget snapshot for audit
 */
interface AuditSnapshot {
  envelopes: unknown[];
  transactions: unknown[];
  metadata: unknown;
}

/**
 * Perform envelope integrity audit
 * 
 * Calls the Python Analytics Service to analyze budget data for integrity issues:
 * - Orphaned transactions (pointing to non-existent envelopes)
 * - Negative balances (envelopes with negative currentBalance)
 * - Balance leakage (sum of envelopes + unassigned != actual balance)
 * 
 * @returns IntegrityAuditResult with all violations found
 * @throws Error if audit fails or API is unavailable
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await performEnvelopeIntegrityAudit();
 *   if (result.summary.by_severity.error > 0) {
 *     console.error('Critical integrity issues found!', result.violations);
 *   }
 * } catch (error) {
 *   console.error('Audit failed:', error);
 * }
 * ```
 */
export async function performEnvelopeIntegrityAudit(): Promise<IntegrityAuditResult> {
  try {
    // Gather snapshot data from Dexie
    logger.info('integrityAudit', 'Gathering budget snapshot for integrity audit...');
    
    const [envelopes, transactions, budgetRecords] = await Promise.all([
      db.envelopes.toArray(),
      db.transactions.toArray(),
      db.budgetRecords.toArray()
    ]);
    
    // Get main budget record (or first one if multiple exist)
    const metadata = budgetRecords.find(record => record.id === 'main') || budgetRecords[0];
    
    if (!metadata) {
      throw new Error('No budget metadata found in database');
    }
    
    const snapshot: AuditSnapshot = {
      envelopes,
      transactions,
      metadata
    };
    
    logger.info('integrityAudit', `Snapshot ready: ${envelopes.length} envelopes, ${transactions.length} transactions`);
    
    // Call Python Analytics API
    const response = await fetch(`${ANALYTICS_API_BASE_URL}/audit/envelope-integrity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snapshot),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Audit API returned ${response.status}: ${errorText}`);
    }
    
    const result: IntegrityAuditResult = await response.json();
    
    logger.info('integrityAudit', `Audit complete: ${result.summary.total} violations found`);
    
    return result;
    
  } catch (error) {
    logger.error('integrityAudit', 'Failed to perform integrity audit', error);
    throw error;
  }
}

/**
 * Check if Analytics API is available
 * 
 * @returns true if API is healthy, false otherwise
 */
export async function isAnalyticsApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE_URL}/health`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      return false;
    }
    
    const health = await response.json();
    return health.status === 'healthy';
    
  } catch (error) {
    logger.warn('integrityAudit', 'Analytics API not available', error);
    return false;
  }
}

/**
 * Example React component using the integrity audit
 */
/*
import React, { useState } from 'react';
import { performEnvelopeIntegrityAudit, IntegrityAuditResult } from '@/services/analytics/integrityAudit';

export function IntegrityAuditButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IntegrityAuditResult | null>(null);
  
  const handleAudit = async () => {
    setIsLoading(true);
    try {
      const auditResult = await performEnvelopeIntegrityAudit();
      setResult(auditResult);
      
      // Show notification based on severity
      if (auditResult.summary.by_severity.error > 0) {
        toast.error(`Found ${auditResult.summary.by_severity.error} critical issues!`);
      } else if (auditResult.summary.by_severity.warning > 0) {
        toast.warning(`Found ${auditResult.summary.by_severity.warning} warnings`);
      } else {
        toast.success('No integrity issues found!');
      }
    } catch (error) {
      toast.error('Failed to run integrity audit');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleAudit} disabled={isLoading}>
        {isLoading ? 'Running Audit...' : 'Check Data Integrity'}
      </button>
      
      {result && result.violations.length > 0 && (
        <div className="violations-list">
          <h3>Integrity Violations</h3>
          {result.violations.map((violation, index) => (
            <div key={index} className={`violation ${violation.severity}`}>
              <strong>[{violation.severity.toUpperCase()}]</strong> {violation.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
*/
