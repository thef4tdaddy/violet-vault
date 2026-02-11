import PageSummaryCard from "../ui/PageSummaryCard";
import { getIcon } from "@/utils/ui/icons/index";
import { formatCurrency } from "@/utils/domain/accounts/accountHelpers";

interface SupplementalAccount {
  id: string | number;
  currentBalance: number;
  transactions?: unknown[];
  [key: string]: unknown;
}

interface AccountsSummaryCardsProps {
  accounts: SupplementalAccount[];
}

const AccountsSummaryCards = ({ accounts = [] }: AccountsSummaryCardsProps) => {
  // Calculate total accounts value
  const totalValue = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

  // Calculate spending in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const last30DaysSpending = accounts.reduce((sum, acc) => {
    const transactions = (acc.transactions || []) as Array<{ amount: number; date: string }>;
    const accountSpending = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= thirtyDaysAgo && t.amount < 0;
      })
      .reduce((total, t) => total + Math.abs(t.amount), 0);
    return sum + accountSpending;
  }, 0);

  // Estimate depletion (if spending continues at current rate)
  const monthlyBurnRate = last30DaysSpending;
  const monthsUntilDepleted = monthlyBurnRate > 0 ? totalValue / monthlyBurnRate : 0;
  const depletionEstimate =
    monthsUntilDepleted > 0 && monthsUntilDepleted < 120
      ? `~${Math.round(monthsUntilDepleted)} months`
      : monthsUntilDepleted === 0
        ? "No spending"
        : "10+ years";

  // Active accounts count
  const activeAccounts = accounts.filter((acc) => acc.currentBalance > 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Accounts */}
      <PageSummaryCard
        icon={getIcon("CreditCard")}
        label="Total Accounts"
        value={accounts.length}
        color="blue"
        subtext={`${activeAccounts} with funds`}
      />

      {/* Total Value */}
      <PageSummaryCard
        icon={getIcon("DollarSign")}
        label="Total Value"
        value={formatCurrency(totalValue)}
        color="green"
        subtext="Combined balance"
      />

      {/* 30-Day Spending */}
      <PageSummaryCard
        icon={getIcon("TrendingDown")}
        label="Last 30 Days"
        value={formatCurrency(last30DaysSpending)}
        color="orange"
        subtext="Total spending"
      />

      {/* Depletion Estimate */}
      <PageSummaryCard
        icon={getIcon("Clock")}
        label="Depletion Est."
        value={depletionEstimate}
        color="blue"
        subtext="At current rate"
      />
    </div>
  );
};

export default AccountsSummaryCards;
