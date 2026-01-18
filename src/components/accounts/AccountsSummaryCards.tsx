import { MetricCard } from "../primitives/cards/MetricCard";

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
      <MetricCard
        icon="CreditCard"
        title="Total Accounts"
        value={accounts.length}
        variant="info"
        subtitle={`${activeAccounts} with funds`}
      />

      {/* Total Value */}
      <MetricCard
        icon="DollarSign"
        title="Total Value"
        value={totalValue}
        variant="success"
        format="currency"
        subtitle="Combined balance"
      />

      {/* 30-Day Spending */}
      <MetricCard
        icon="TrendingDown"
        title="Last 30 Days"
        value={last30DaysSpending}
        variant="warning"
        format="currency"
        subtitle="Total spending"
      />

      {/* Depletion Estimate */}
      <MetricCard
        icon="Clock"
        title="Depletion Est."
        value={depletionEstimate}
        variant="info"
        format="custom"
        customFormatter={(val) => String(val)}
        subtitle="At current rate"
      />
    </div>
  );
};

export default AccountsSummaryCards;
