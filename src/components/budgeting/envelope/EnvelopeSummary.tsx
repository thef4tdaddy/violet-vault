import EnvelopeSummaryCards from "../EnvelopeSummaryCards";

// Type definitions
interface EnvelopeTotals {
  totalBalance?: number;
  totalAllocated?: number;
  totalTargetAmount?: number;
  [key: string]: unknown;
}

interface EnvelopeSummaryProps {
  totals: EnvelopeTotals;
}

const EnvelopeSummary = ({ totals }: EnvelopeSummaryProps) => {
  return (
    <div className="mb-6">
      <EnvelopeSummaryCards totals={totals} />
    </div>
  );
};

export default EnvelopeSummary;
