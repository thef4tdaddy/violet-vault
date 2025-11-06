import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER, FREQUENCY_MULTIPLIERS } from "../../constants/frequency";

/**
 * Calculate comprehensive envelope data including transactions, bills, and metrics
 */
export const calculateEnvelopeData = (envelopes, transactions, bills) => {
  return envelopes.map((envelope) => {
    const envelopeTransactions = transactions.filter((t) => t.envelopeId === envelope.id);

    // Also get bills assigned to this envelope
    const envelopeBills = bills.filter((b) => b.envelopeId === envelope.id);

    // Include expense/income transactions and paid bills
    // Transaction types: "expense", "income", "transfer", "bill", "recurring_bill"
    const paidTransactions = envelopeTransactions.filter(
      (t) => 
        t.type === "expense" || 
        t.type === "income" || 
        t.type === "transfer" ||
        (t.type === "bill" && t.isPaid) ||
        (t.type === "recurring_bill" && t.isPaid)
    );

    // Combine bills from transactions and the bills array, removing duplicates
    const allUnpaidBills = [
      ...envelopeTransactions.filter(
        (t) => (t.type === "bill" || t.type === "recurring_bill") && !t.isPaid
      ),
      ...envelopeBills.filter((b) => !b.isPaid),
    ];

    // Deduplicate bills based on provider/name and due date to prevent showing same bill twice
    const unpaidBillsMap = new Map();
    allUnpaidBills.forEach((bill) => {
      const key = `${bill.provider || bill.name || bill.description}-${bill.dueDate}`;
      // Keep the first occurrence, or prefer bills array over transaction bills
      if (!unpaidBillsMap.has(key) || !bill.type) {
        unpaidBillsMap.set(key, bill);
      }
    });

    const unpaidBills = Array.from(unpaidBillsMap.values()).sort((a, b) => {
      // Sort by due date (earliest first)
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
      return dateA.getTime() - dateB.getTime();
    });

    const upcomingBills = unpaidBills.filter((t) => t.dueDate && new Date(t.dueDate) > new Date());

    const overdueBills = unpaidBills.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());

    const totalSpent = paidTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalUpcoming = upcomingBills.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalOverdue = overdueBills.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const allocated = envelope.budget || 0;
    const currentBalance = envelope.currentBalance || 0;
    const committed = totalUpcoming + totalOverdue;

    // Use actual current balance instead of budget allocation for availability
    const available = currentBalance - committed;

    // Calculate utilization rate based on envelope type and purpose
    const utilizationRate = calculateUtilizationRate(
      envelope,
      { upcomingBills, paidTransactions },
      { currentBalance, totalSpent, committed }
    );

    const status = determineEnvelopeStatus(totalOverdue, available, envelope);

    return {
      ...envelope,
      totalSpent,
      totalUpcoming,
      totalOverdue,
      allocated,
      available,
      committed,
      utilizationRate,
      status,
      upcomingBills,
      overdueBills,
      transactions: envelopeTransactions,
      bills: envelopeBills,
    };
  });
};

/**
 * Calculate utilization rate based on envelope type
 */
export const calculateUtilizationRate = (envelope, billsAndTransactions, balanceInfo) => {
  const { upcomingBills, paidTransactions } = billsAndTransactions;
  const { currentBalance, totalSpent, committed } = balanceInfo;
  let utilizationRate = 0;
  const envelopeType = envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

  if (envelopeType === ENVELOPE_TYPES.BILL && envelope.biweeklyAllocation) {
    // For bill envelopes, show progress toward next bill payment
    let nextBillAmount = 0;

    if (upcomingBills.length > 0) {
      // Use the actual upcoming bill amount
      nextBillAmount = Math.abs(upcomingBills[0].amount);
    } else {
      // No upcoming bills, check if there are ANY bills for this envelope
      const allEnvelopeBills = [...upcomingBills, ...paidTransactions];
      if (allEnvelopeBills.length > 0) {
        // Use the most recent bill amount as reference
        const mostRecentBill = allEnvelopeBills.sort(
          (a, b) =>
            new Date(b.date || b.dueDate).getTime() - new Date(a.date || a.dueDate).getTime()
        )[0];
        nextBillAmount = Math.abs(mostRecentBill.amount);
      } else {
        // Fallback to biweekly calculation (monthly equivalent)
        nextBillAmount = envelope.biweeklyAllocation * 2;
      }
    }

    utilizationRate = nextBillAmount > 0 ? currentBalance / nextBillAmount : 0;
  } else if (envelopeType === ENVELOPE_TYPES.SAVINGS && envelope.targetAmount) {
    // For savings envelopes, show progress toward target
    utilizationRate = envelope.targetAmount > 0 ? currentBalance / envelope.targetAmount : 0;
  } else {
    // For variable envelopes, use traditional spending-based calculation
    const budgetAmount = envelope.monthlyBudget || envelope.budget || envelope.monthlyAmount || 0;
    utilizationRate = budgetAmount > 0 ? (totalSpent + committed) / budgetAmount : 0;
  }

  return utilizationRate;
};

/**
 * Determine envelope status (healthy, overdue, overspent, etc.)
 */
export const determineEnvelopeStatus = (totalOverdue, available, envelope) => {
  let status = "healthy";
  if (totalOverdue > 0) status = "overdue";
  else if (available < 0) status = "overspent";
  else if (envelope.envelopeType === ENVELOPE_TYPES.BILL) {
    // For bill envelopes, check if we have enough for upcoming bills
    const upcomingAmount =
      envelope.upcomingBills?.reduce((sum, b) => sum + Math.abs(b.amount), 0) || 0;
    if (envelope.currentBalance < upcomingAmount) {
      status = "underfunded";
    }
  }
  return status;
};

/**
 * Sort envelopes based on various criteria
 */
export const sortEnvelopes = (envelopeData, sortBy) => {
  let sorted = [...envelopeData];
  switch (sortBy) {
    case "usage_desc":
      sorted.sort((a, b) => b.utilizationRate - a.utilizationRate);
      break;
    case "usage_asc":
      sorted.sort((a, b) => a.utilizationRate - b.utilizationRate);
      break;
    case "amount_desc":
      sorted.sort((a, b) => b.allocated - a.allocated);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "status": {
      const statusOrder = {
        overdue: 0,
        overspent: 1,
        underfunded: 2,
        healthy: 3,
      };
      sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      break;
    }
  }
  return sorted;
};

/**
 * Filter envelopes by type and other criteria
 */
export const filterEnvelopes = (envelopeData, filterOptions) => {
  let filtered = [...envelopeData];

  if (!filterOptions.showEmpty) {
    // Filter out envelopes with zero balance (empty envelopes)
    filtered = filtered.filter((env) => (env.currentBalance || 0) > 0);
  }

  // Filter by envelope type
  if (filterOptions.envelopeType !== "all") {
    filtered = filtered.filter((env) => {
      const envelopeType = env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);
      return envelopeType === filterOptions.envelopeType;
    });
  }

  return filtered;
};

/**
 * Calculate totals across all envelopes
 */
export const calculateEnvelopeTotals = (envelopeData) => {
  return envelopeData.reduce(
    (acc, env) => {
      const envelopeType = env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

      acc.totalAllocated += env.currentBalance || 0;
      acc.totalSpent += env.totalSpent || 0;
      acc.totalBalance += env.currentBalance || 0;
      acc.totalUpcoming += env.totalUpcoming || 0;

      // Count bills due within 30 days
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const billsDueWithin30Days = (env.upcomingBills || []).filter((bill) => {
        if (!bill.dueDate) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= thirtyDaysFromNow;
      });

      acc.billsDueCount += billsDueWithin30Days.length;

      // Calculate biweekly needs based on envelope type
      let biweeklyNeed = 0;
      if (envelopeType === ENVELOPE_TYPES.BILL && env.biweeklyAllocation) {
        biweeklyNeed = env.biweeklyAllocation;
      } else if (env.monthlyBudget) {
        biweeklyNeed = env.monthlyBudget / BIWEEKLY_MULTIPLIER;
      } else if (envelopeType === ENVELOPE_TYPES.SAVINGS && env.targetAmount) {
        // For savings, calculate a reasonable biweekly contribution
        const remainingToTarget = Math.max(0, env.targetAmount - env.currentBalance);
        biweeklyNeed = Math.min(remainingToTarget, env.biweeklyAllocation || 0);
      }

      acc.totalBiweeklyNeed += biweeklyNeed;
      acc.envelopeCount += 1;

      return acc;
    },
    {
      totalAllocated: 0,
      totalSpent: 0,
      totalBalance: 0,
      totalUpcoming: 0,
      totalBiweeklyNeed: 0,
      billsDueCount: 0,
      envelopeCount: 0,
    }
  );
};

/**
 * Calculate biweekly allocation needs from bills
 */
export const calculateBiweeklyNeeds = (bills) => {
  let totalBiweeklyNeed = 0;

  // Calculate total first - convert to monthly then to biweekly
  bills.forEach((bill) => {
    const multiplier = FREQUENCY_MULTIPLIERS[bill.frequency] || 12;
    const annualAmount = bill.amount * multiplier;
    const monthlyAmount = annualAmount / 12;
    const biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER; // Simple monthly / 2
    totalBiweeklyNeed += biweeklyAmount;
  });

  return totalBiweeklyNeed;
};
