import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";
import {
  BIWEEKLY_MULTIPLIER,
  FREQUENCY_MULTIPLIERS,
  type FrequencyType,
} from "@/constants/frequency";
import type { Envelope, Transaction, Bill } from "@/db/types";

export type { Envelope, Transaction, Bill };

// Define types for our functions

export type EnvelopeData = Envelope & {
  totalSpent?: number;
  totalUpcoming?: number;
  totalOverdue?: number;
  allocated?: number;
  available?: number;
  committed?: number;
  utilizationRate?: number;
  health?: string;
  upcomingBills?: Bill[];
  overdueBills?: Bill[];
  transactions?: Transaction[];
  bills?: Bill[];
  accountType?: string;
  isActive?: boolean;
};

interface BillsAndTransactions {
  upcomingBills?: Bill[];
  paidTransactions?: Transaction[];
}

interface BalanceInfo {
  currentBalance?: number;
  totalSpent?: number;
  committed?: number;
}

interface FilterOptions {
  showEmpty?: boolean;
  envelopeType?: string;
}

interface StatusOrder {
  overdue: number;
  overspent: number;
  underfunded: number;
  healthy: number;
}

interface TotalsAccumulator {
  totalAllocated: number;
  totalSpent: number;
  totalBalance: number;
  totalUpcoming: number;
  totalBiweeklyNeed: number;
  billsDueCount: number;
  envelopeCount: number;
  [key: string]: unknown;
}

interface EnvelopeTotals {
  totalSpent: number;
  totalUpcoming: number;
  totalOverdue: number;
}

interface EnvelopeBalanceMetrics {
  allocated: number;
  currentBalance: number;
  committed: number;
  available: number;
}

const BILL_LOOKAHEAD_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const getEnvelopeType = (envelope: Envelope): string => {
  const record = envelope as Record<string, unknown>;
  return (
    (record.envelopeType as string) ||
    (record.type as string) ||
    AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category || "")
  );
};

const collectEnvelopeTransactions = (
  envelope: Envelope,
  transactions: Transaction[]
): Transaction[] => transactions.filter((transaction) => transaction.envelopeId === envelope.id);

const collectEnvelopeBills = (envelope: Envelope, bills: Bill[]): Bill[] =>
  bills.filter((bill) => bill.envelopeId === envelope.id);

const selectPaidTransactions = (transactions: Transaction[]): Transaction[] =>
  transactions.filter(
    (transaction) =>
      transaction.type === "expense" ||
      transaction.type === "income" ||
      transaction.type === "transfer" ||
      // Transaction type is strict union, 'bill' is not valid in unified schema.
      // Use category or other metadata? Or assume these are legacy checks.
      // For now, removing invalid checks.
      // If the intent is to find bills among transactions, we need another way if 'type' doesn't support it.
      // Assuming legacy code might be wrong about types.
      false
  );

const collectUnpaidBills = (
  _envelopeTransactions: Transaction[],
  envelopeBills: Bill[]
): Bill[] => {
  // Similarly, 'bill' is not a valid transaction type.
  // We should rely on `envelopeBills` for actual bills.
  // Converting transactions to bills seems wrong in unified schema.
  // Let's just use envelopeBills.
  const unpaidBills = [...envelopeBills.filter((bill) => !bill.isPaid)];

  const deduped = new Map<string, Bill>();
  unpaidBills.forEach((bill) => {
    const key = `${bill.name || "bill"}-${bill.dueDate}`;
    if (!deduped.has(key)) {
      deduped.set(key, bill);
    }
  });

  return Array.from(deduped.values()).sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
    return dateA.getTime() - dateB.getTime();
  });
};

const partitionBillsByDueDate = (unpaidBills: Bill[], referenceDate: Date = new Date()) => {
  const upcoming: Bill[] = [];
  const overdue: Bill[] = [];

  unpaidBills.forEach((bill) => {
    if (!bill.dueDate) {
      return;
    }
    const dueDate = new Date(bill.dueDate);
    if (dueDate > referenceDate) {
      upcoming.push(bill);
    } else if (dueDate < referenceDate) {
      overdue.push(bill);
    }
  });

  return { upcoming, overdue };
};

const calculateEnvelopeTotalsFromCollections = (
  paidTransactions: Transaction[],
  upcomingBills: Bill[],
  overdueBills: Bill[]
): EnvelopeTotals => {
  const totalSpent = paidTransactions.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0
  );
  const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + Math.abs(bill.amount || 0), 0);
  const totalOverdue = overdueBills.reduce((sum, bill) => sum + Math.abs(bill.amount || 0), 0);

  return { totalSpent, totalUpcoming, totalOverdue };
};

const calculateBalanceMetrics = (
  envelope: Envelope,
  totals: EnvelopeTotals
): EnvelopeBalanceMetrics => {
  const record = envelope as Record<string, unknown>;
  const allocated =
    (record.monthlyBudget as number) ||
    (record.monthlyAmount as number) ||
    (record.budget as number) ||
    0;
  const currentBalance = envelope.currentBalance || 0;
  const committed = totals.totalUpcoming + totals.totalOverdue;
  const available = currentBalance - committed;

  return { allocated, currentBalance, committed, available };
};

const countBillsDueWithinWindow = (
  envelope: EnvelopeData,
  windowStart: Date,
  windowEnd: Date
): number => {
  return (envelope.upcomingBills || []).reduce((count, bill) => {
    if (!bill.dueDate) {
      return count;
    }
    const dueDate = new Date(bill.dueDate);
    if (dueDate >= windowStart && dueDate <= windowEnd) {
      return count + 1;
    }
    return count;
  }, 0);
};

const calculateBiweeklyNeed = (envelope: EnvelopeData, envelopeType: string): number => {
  const record = envelope as Record<string, unknown>;
  if (envelopeType === ENVELOPE_TYPES.BILL && record.biweeklyAllocation) {
    return record.biweeklyAllocation as number;
  }

  // Try various monthly budget fields based on envelope type
  const monthlyBudget =
    (record.monthlyBudget as number) || (record.monthlyContribution as number) || 0;

  if (monthlyBudget > 0) {
    return monthlyBudget / BIWEEKLY_MULTIPLIER;
  }

  if (envelope.type === "goal" && envelope.targetAmount) {
    // If no monthly contribution set, we can't really predict biweekly need from target alone without a date
    return (record.biweeklyAllocation as number) || 0;
  }
  return 0;
};

const getEntryTimestamp = (entry: Bill | Transaction): number => {
  // Safe check for date or dueDate
  let candidate: string | Date | number | undefined;
  // Type guard manually
  if ("date" in entry) {
    candidate = entry.date;
  } else if ("dueDate" in entry) {
    candidate = (entry as Bill).dueDate;
  }

  if (!candidate) {
    return Number.MAX_SAFE_INTEGER;
  }
  return new Date(candidate).getTime();
};

const selectNextBillAmount = (
  upcomingBills: Bill[] = [],
  paidTransactions: Transaction[] = [],
  envelope: Envelope
): number => {
  if (upcomingBills.length > 0) {
    return Math.abs(upcomingBills[0].amount || 0);
  }

  const historicalEntries: Array<Bill | Transaction> = [...paidTransactions];
  if (historicalEntries.length > 0) {
    const [mostRecent] = [...historicalEntries].sort(
      (a, b) => getEntryTimestamp(a) - getEntryTimestamp(b)
    );
    return Math.abs(mostRecent?.amount || 0);
  }

  const record = envelope as Record<string, unknown>;
  if (record.biweeklyAllocation) {
    return ((record.biweeklyAllocation as number) || 0) * 2;
  }
  return 0;
};

const calculateBillEnvelopeUtilization = (
  envelope: Envelope,
  upcomingBills: Bill[],
  paidTransactions: Transaction[],
  currentBalance: number
): number => {
  const nextBillAmount = selectNextBillAmount(upcomingBills, paidTransactions, envelope);
  if (nextBillAmount <= 0) {
    return 0;
  }
  return currentBalance / nextBillAmount;
};

const calculateSavingsUtilization = (envelope: Envelope, currentBalance: number): number => {
  if (!envelope.targetAmount || envelope.targetAmount <= 0) {
    return 0;
  }
  return currentBalance / envelope.targetAmount;
};

const calculateVariableEnvelopeUtilization = (
  envelope: Envelope,
  totalSpent: number,
  committed: number
): number => {
  const record = envelope as Record<string, unknown>;
  const budgetAmount = (record.monthlyBudget as number) || (record.budget as number) || 0;
  if (budgetAmount <= 0) {
    return 0;
  }
  return (totalSpent + committed) / budgetAmount;
};

/**
 * Calculate comprehensive envelope data including transactions, bills, and metrics
 */
export const calculateEnvelopeData = (
  envelopes: Envelope[],
  transactions: Transaction[],
  bills: Bill[]
): EnvelopeData[] => {
  return envelopes.map((envelope: Envelope) => {
    const envelopeTransactions = collectEnvelopeTransactions(envelope, transactions);
    const envelopeBills = collectEnvelopeBills(envelope, bills);
    const paidTransactions = selectPaidTransactions(envelopeTransactions);
    const unpaidBills = collectUnpaidBills(envelopeTransactions, envelopeBills);
    const { upcoming: upcomingBills, overdue: overdueBills } = partitionBillsByDueDate(unpaidBills);
    const totals = calculateEnvelopeTotalsFromCollections(
      paidTransactions,
      upcomingBills,
      overdueBills
    );
    const balances = calculateBalanceMetrics(envelope, totals);

    // Calculate utilization rate based on envelope type and purpose
    const utilizationRate = calculateUtilizationRate(
      envelope,
      { upcomingBills, paidTransactions } as BillsAndTransactions,
      {
        currentBalance: balances.currentBalance,
        totalSpent: totals.totalSpent,
        committed: balances.committed,
      } as BalanceInfo
    );

    return {
      ...envelope,
      totalSpent: totals.totalSpent,
      totalUpcoming: totals.totalUpcoming,
      totalOverdue: totals.totalOverdue,
      allocated: balances.allocated,
      available: balances.available,
      committed: balances.committed,
      utilizationRate,
      upcomingBills,
      overdueBills,
      transactions: envelopeTransactions,
      bills: envelopeBills,
      isActive: "isActive" in envelope ? (envelope as { isActive: boolean }).isActive : undefined,
      accountType:
        "accountType" in envelope ? (envelope as { accountType: string }).accountType : undefined,
      health: determineEnvelopeHealth(
        totals.totalOverdue,
        balances.available,
        envelope,
        upcomingBills
      ),
    } as EnvelopeData;
  });
};

/**
 * Calculate utilization rate based on envelope type
 */
export const calculateUtilizationRate = (
  envelope: Envelope,
  billsAndTransactions: BillsAndTransactions,
  balanceInfo: BalanceInfo
): number => {
  const { upcomingBills, paidTransactions } = billsAndTransactions;
  const { currentBalance, totalSpent, committed } = balanceInfo;
  const envelopeType = getEnvelopeType(envelope);

  if (
    envelopeType === ENVELOPE_TYPES.BILL &&
    (envelope as unknown as Record<string, number>).biweeklyAllocation
  ) {
    return calculateBillEnvelopeUtilization(
      envelope,
      upcomingBills || [],
      paidTransactions || [],
      currentBalance || 0
    );
  }

  if (envelopeType === ENVELOPE_TYPES.SAVINGS && envelope.targetAmount) {
    return calculateSavingsUtilization(envelope, currentBalance || 0);
  }

  return calculateVariableEnvelopeUtilization(envelope, totalSpent || 0, committed || 0);
};

/**
 * Determine envelope health (healthy, overdue, overspent, etc.)
 */
export const determineEnvelopeHealth = (
  totalOverdue: number,
  available: number,
  envelope: Envelope,
  upcomingBills: Bill[] = []
): string => {
  let status = "healthy";
  if (totalOverdue > 0) status = "overdue";
  else if (available < 0) status = "overspent";
  else {
    const envelopeType = getEnvelopeType(envelope);
    if (envelopeType === ENVELOPE_TYPES.BILL) {
      // For bill envelopes, check if we have enough for upcoming bills
      const upcomingAmount = upcomingBills.reduce(
        (sum, bill) => sum + Math.abs(bill.amount || 0),
        0
      );
      if ((envelope.currentBalance || 0) < upcomingAmount) {
        status = "underfunded";
      }
    }
  }
  return status;
};

/**
 * Sort envelopes based on various criteria
 */
export const sortEnvelopes = (envelopeData: EnvelopeData[], sortBy: string): EnvelopeData[] => {
  let sorted = [...envelopeData];
  switch (sortBy) {
    case "usage_desc":
      sorted.sort(
        (a: EnvelopeData, b: EnvelopeData) => (b.utilizationRate || 0) - (a.utilizationRate || 0)
      );
      break;
    case "usage_asc":
      sorted.sort(
        (a: EnvelopeData, b: EnvelopeData) => (a.utilizationRate || 0) - (b.utilizationRate || 0)
      );
      break;
    case "amount_desc":
      sorted.sort((a: EnvelopeData, b: EnvelopeData) => (b.allocated || 0) - (a.allocated || 0));
      break;
    case "name":
      sorted.sort((a: EnvelopeData, b: EnvelopeData) => a.name?.localeCompare(b.name || "") || 0);
      break;
    case "status": {
      const statusOrder: StatusOrder = {
        overdue: 0,
        overspent: 1,
        underfunded: 2,
        healthy: 3,
      };
      sorted.sort((a: EnvelopeData, b: EnvelopeData) => {
        const aStatus = a.health || "healthy";
        const bStatus = b.health || "healthy";
        return (
          (statusOrder[aStatus as keyof StatusOrder] || 0) -
          (statusOrder[bStatus as keyof StatusOrder] || 0)
        );
      });
      break;
    }
  }
  return sorted;
};

/**
 * Filter envelopes by type and other criteria
 */
export const filterEnvelopes = (
  envelopeData: EnvelopeData[],
  filterOptions: FilterOptions
): EnvelopeData[] => {
  let filtered = [...envelopeData];

  if (!filterOptions.showEmpty) {
    // Filter out envelopes with zero balance (empty envelopes)
    filtered = filtered.filter((env: EnvelopeData) => (env.currentBalance || 0) > 0);
  }

  // Filter by envelope type
  if (filterOptions.envelopeType !== "all") {
    filtered = filtered.filter((env: EnvelopeData) => {
      return getEnvelopeType(env) === filterOptions.envelopeType;
    });
  }

  return filtered;
};

/**
 * Calculate totals across all envelopes
 */
export const calculateEnvelopeTotals = (envelopeData: EnvelopeData[]): TotalsAccumulator => {
  const windowStart = new Date();
  const windowEnd = new Date(windowStart.getTime() + BILL_LOOKAHEAD_WINDOW_MS);

  const initialTotals: TotalsAccumulator = {
    totalAllocated: 0,
    totalSpent: 0,
    totalBalance: 0,
    totalUpcoming: 0,
    totalBiweeklyNeed: 0,
    billsDueCount: 0,
    envelopeCount: 0,
  };

  return envelopeData.reduce((acc, env) => {
    const envelopeType = getEnvelopeType(env);

    acc.totalAllocated += env.allocated || 0;
    acc.totalSpent += env.totalSpent || 0;
    acc.totalBalance += env.currentBalance || 0;
    acc.totalUpcoming += env.totalUpcoming || 0;
    acc.billsDueCount += countBillsDueWithinWindow(env, windowStart, windowEnd);
    acc.totalBiweeklyNeed += calculateBiweeklyNeed(env, envelopeType);
    acc.envelopeCount += 1;

    return acc;
  }, initialTotals);
};

/**
 * Calculate biweekly allocation needs from bills
 */
export const calculateBiweeklyNeeds = (bills: Bill[]): number => {
  let totalBiweeklyNeed = 0;

  // Calculate total first - convert to monthly then to biweekly
  bills.forEach((bill: Bill) => {
    const amount = bill.amount || 0;
    const frequency = (bill.frequency ?? "monthly") as FrequencyType;
    const multiplier = FREQUENCY_MULTIPLIERS[frequency] ?? 12;
    const annualAmount = amount * multiplier;
    const monthlyAmount = annualAmount / 12;
    const biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER; // Simple monthly / 2
    totalBiweeklyNeed += biweeklyAmount;
  });

  return totalBiweeklyNeed;
};
