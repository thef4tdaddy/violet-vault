import React from "react";
import { getIcon } from "../../utils";
import PageSummaryCard from "../ui/PageSummaryCard";

/**
 * Envelope summary cards using standardized PageSummaryCard component
 * Replaces custom gradient cards with standardized pattern
 */
const EnvelopeSummaryCards = ({ totals = {}, unassignedCash = 0 }) => {
  // Calculate derived metrics
  const overBudgetEnvelopes = totals.overBudgetCount || 0;
  const savingsGoalProgress = totals.savingsProgress || 0;

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
      key: "unassigned-cash",
      icon: getIcon("DollarSign"),
      label: "Unassigned Cash",
      value: `$${unassignedCash.toFixed(2)}`,
      color: unassignedCash < 0 ? "red" : "amber",
      subtext: unassignedCash < 0 ? "Budget deficit" : "Available to allocate",
      alert: unassignedCash < 0,
    },
    {
      key: "over-budget",
      icon: getIcon("AlertTriangle"),
      label: "Over Budget",
      value: overBudgetEnvelopes.toString(),
      color: "red",
      subtext:
        overBudgetEnvelopes > 0
          ? `${overBudgetEnvelopes} envelopes`
          : "All on track",
      alert: overBudgetEnvelopes > 0,
    },
    {
      key: "savings-progress",
      icon: getIcon("Target"),
      label: "Savings Progress",
      value: `${savingsGoalProgress.toFixed(1)}%`,
      color: "cyan",
      subtext: "Average goal completion",
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
        />
      ))}
    </div>
  );
};

export default EnvelopeSummaryCards;
