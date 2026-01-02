/**
 * Activity formatting utilities
 * Extracted from ActivityFeed.jsx for better maintainability and ESLint compliance
 */
import { ACTIVITY_TYPES } from "@/services/logging/activityLogger";

interface ActivityDetails {
  name?: string;
  amount?: number;
  description?: string;
  count?: number;
  payerName?: string;
  creditor?: string;
  itemsChanged?: number;
  userName?: string;
  [key: string]: unknown;
}

interface Activity {
  action: string;
  entityType: string;
  details?: ActivityDetails;
  userName?: string;
}

/**
 * Format envelope-related activity descriptions
 */
export const formatEnvelopeActivity = (
  action: string,
  userName: string,
  details?: ActivityDetails
): string | null => {
  switch (action) {
    case ACTIVITY_TYPES.ENVELOPE_CREATED:
      return `${userName} created envelope "${details?.name}"`;
    case ACTIVITY_TYPES.ENVELOPE_UPDATED:
      return `${userName} updated envelope "${details?.name}"`;
    case ACTIVITY_TYPES.ENVELOPE_DELETED:
      return `${userName} deleted envelope "${details?.name}"`;
    case ACTIVITY_TYPES.ENVELOPE_FUNDED:
      return `${userName} funded envelope with $${details?.amount?.toFixed(2)}`;
    default:
      return null;
  }
};

/**
 * Format transaction-related activity descriptions
 */
export const formatTransactionActivity = (
  action: string,
  userName: string,
  details?: ActivityDetails
): string | null => {
  switch (action) {
    case ACTIVITY_TYPES.TRANSACTION_ADDED:
      return `${userName} added transaction "${details?.description}" ($${details?.amount?.toFixed(2)})`;
    case ACTIVITY_TYPES.TRANSACTION_UPDATED:
      return `${userName} updated transaction "${details?.description}"`;
    case ACTIVITY_TYPES.TRANSACTION_DELETED:
      return `${userName} deleted transaction "${details?.description}"`;
    case ACTIVITY_TYPES.TRANSACTIONS_IMPORTED:
      return `${userName} imported ${details?.count} transactions`;
    default:
      return null;
  }
};

/**
 * Format bill-related activity descriptions
 */
export const formatBillActivity = (
  action: string,
  userName: string,
  details?: ActivityDetails
): string | null => {
  switch (action) {
    case ACTIVITY_TYPES.BILL_CREATED:
      return `${userName} created bill "${details?.name}" ($${details?.amount?.toFixed(2)})`;
    case ACTIVITY_TYPES.BILL_UPDATED:
      return `${userName} updated bill "${details?.name}"`;
    case ACTIVITY_TYPES.BILL_PAID:
      return `${userName} paid bill "${details?.name}" ($${details?.amount?.toFixed(2)})`;
    default:
      return null;
  }
};

/**
 * Format paycheck-related activity descriptions
 */
export const formatPaycheckActivity = (
  action: string,
  userName: string,
  details?: ActivityDetails
): string | null => {
  switch (action) {
    case ACTIVITY_TYPES.PAYCHECK_PROCESSED:
      return `${userName} processed paycheck from ${details?.payerName} ($${details?.amount?.toFixed(2)})`;
    case ACTIVITY_TYPES.PAYCHECK_DELETED:
      return `${userName} deleted paycheck from ${details?.payerName}`;
    default:
      return null;
  }
};

/**
 * Format debt-related activity descriptions
 */
export const formatDebtActivity = (
  action: string,
  userName: string,
  details?: ActivityDetails
): string | null => {
  switch (action) {
    case ACTIVITY_TYPES.DEBT_CREATED:
      return `${userName} created debt "${details?.name}" with ${details?.creditor}`;
    case ACTIVITY_TYPES.DEBT_UPDATED:
      return `${userName} updated debt "${details?.name}"`;
    default:
      return null;
  }
};

/**
 * Format sync-related activity descriptions
 */
export const formatSyncActivity = (
  action: string,
  userName: string,
  details?: ActivityDetails
): string | null => {
  switch (action) {
    case ACTIVITY_TYPES.SYNC_COMPLETED:
      return `${userName} completed data sync (${details?.itemsChanged} items)`;
    default:
      return null;
  }
};

/**
 * Main activity description formatter
 */
export const formatActivityDescription = (activity: Activity): string => {
  const { action, entityType, details } = activity;
  const userName = details?.userName || activity.userName || "Someone";

  // Try each specific formatter
  const formatters = [
    formatEnvelopeActivity,
    formatTransactionActivity,
    formatBillActivity,
    formatPaycheckActivity,
    formatDebtActivity,
    formatSyncActivity,
  ];

  for (const formatter of formatters) {
    const result = formatter(action, userName, details);
    if (result) return result;
  }

  // Default fallback
  return `${userName} performed ${action.replace(/_/g, " ")} on ${entityType}`;
};
