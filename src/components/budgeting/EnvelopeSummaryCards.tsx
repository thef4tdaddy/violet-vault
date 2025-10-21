import React from "react";
import { getIcon } from "../../utils";
import PageSummaryCard from "../ui/PageSummaryCard";

/**
 * Envelope summary cards using standardized PageSummaryCard component
 * Restored to original format matching user requirements
 */
const EnvelopeSummaryCards = ({ totals = {}, _unassignedCash = 0 }) => {
  // Calculate balance after bills
  const balanceAfterBills = (totals.totalBalance || 0) - (totals.totalUpcoming || 0);

  const cards = [
    {
      key: "total-allocated",
      icon: getIcon("Wallet"),
      label: "Total Allocated",
      value: `$${(totals.totalAllocated || 0).toFixed(2)}`,
      color: "emerald",
      subtext: `${totals.envelopeCount || 0} envelopes`,
    },
    {
      key: "balance-after-bills",
      icon: getIcon("DollarSign"),
      label: "Balance / After Bills",
      value: `$${(totals.totalBalance || 0).toFixed(2)}`,
      color: balanceAfterBills < 0 ? "red" : "emerald",
      subtext: `$${balanceAfterBills.toFixed(2)} after bills`,
      alert: balanceAfterBills < 0,
    },
    {
      key: "total-spent",
      icon: getIcon("CreditCard"),
      label: "Total Spent",
      value: `$${(totals.totalSpent || 0).toFixed(2)}`,
      color: "blue",
      subtext: "All envelope spending",
    },
    {
      key: "biweekly-need",
      icon: getIcon("Calendar"),
      label: "Biweekly Need",
      value: `$${(totals.totalBiweeklyNeed || 0).toFixed(2)}`,
      color: "purple",
      subtext: `${totals.billsDueCount || 0} bills due`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <PageSummaryCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={card.value}
          subtext={card.subtext}
          color={card.color}
          alert={card.alert}
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default EnvelopeSummaryCards;
