export interface LockDocument {
  id?: string;
  recordType?: string;
  recordId?: string;
  budgetId?: string;
  userId?: string;
  userName?: string;
  acquiredAt?: unknown;
  expiresAt?: Date | number | { toDate: () => Date };
  lastActivity?: unknown;
  lockId?: string;
}
