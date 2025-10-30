import EnvelopeSummaryCards from "../EnvelopeSummaryCards";

const EnvelopeSummary = ({ totals }) => {
  return (
    <div className="mb-6">
      <EnvelopeSummaryCards totals={totals} />
    </div>
  );
};

export default EnvelopeSummary;
