// This file is maintained for backward compatibility during TypeScript migration
// All implementation has been moved to budgetDb.ts with proper typing
// TODO: Remove this file once all imports are updated to use budgetDb.ts

export {
  VioletVaultDB,
  budgetDb,
  getEncryptedData,
  setEncryptedData,
  getBudgetMetadata,
  setBudgetMetadata,
  setUnassignedCash,
  setActualBalance,
  getUnassignedCash,
  getActualBalance,
  clearData,
  migrateData,
  queryHelpers,
} from "./budgetDb.ts";
