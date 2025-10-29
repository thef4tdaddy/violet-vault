import EnvelopeSummaryCards from "../EnvelopeSummaryCards";

const EnvelopeSummary = ({ totals, unassignedCash = 0 }) => {
  return (
    <div className="mb-6">
      <EnvelopeSummaryCards totals={totals} {...({ unassignedCash } as unknown)} />
    </div>
  );
};

export default EnvelopeSummary;
