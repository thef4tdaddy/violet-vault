/**
 * Test Schema Factories and Fixtures (Phase 3)
 * Centralized factories for generating valid test data that conforms to Zod schemas
 *
 * Purpose:
 * - Provide easy-to-use factory functions for all domain models
 * - Ensure test data always conforms to latest schema definitions
 * - Reduce test maintenance burden when schemas change
 * - Enable quick creation of valid test fixtures
 *
 * Usage:
 * ```typescript
 * import { createEnvelope, createBill, createTransaction } from '@/utils/core/testing/factories';
 *
 * const envelope = createEnvelope({ name: 'Test Envelope' });
 * const bill = createBill({ name: 'Electric Bill', amount: 150 });
 * const transaction = createTransaction({ amount: 50, type: 'expense' });
 * ```
 */

export * from "./domainFactories";
export * from "./apiResponseFactories";
export * from "./fixtures";
export * from "./factoryUtils";
