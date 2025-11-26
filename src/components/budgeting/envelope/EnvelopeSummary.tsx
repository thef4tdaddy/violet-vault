import EnvelopeSummaryCards from "../EnvelopeSummaryCards";

interface EnvelopeTotals {
  totalBudget?: number;
  totalSpent?: number;
  totalAvailable?: number;
  envelopeCount?: number;
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
