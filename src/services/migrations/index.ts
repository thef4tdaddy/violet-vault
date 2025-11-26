/**
 * Migrations Service Index
 * Central export point for all database migration services
 */

export {
  runEnvelopeMigration,
  isMigrationNeeded,
  getMigrationStatus,
  convertSavingsGoalToEnvelope,
  convertSupplementalAccountToEnvelope,
  convertSinkingFundToSavings,
  type MigrationResult,
} from "./envelopeMigrationService";

export { default as envelopeMigrationService } from "./envelopeMigrationService";
