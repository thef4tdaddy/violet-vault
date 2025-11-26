import EnvelopeSummaryCards from "../EnvelopeSummaryCards";

interface EnvelopeTotals {
  totalBalance: number;
  totalUpcoming: number;
  totalAllocated: number;
  envelopeCount: number;
  totalSpent: number;
  totalBiweeklyNeed: number;
  billsDueCount: number;
  totalBudget?: number;
  totalAvailable?: number;
  [key: string]: unknown;
}

const EnvelopeSummary = ({ totals }: { totals: EnvelopeTotals }) => {
  return (
    <div className="mb-6">
      <EnvelopeSummaryCards totals={totals} />
    </div>
  );
};

export default EnvelopeSummary;
