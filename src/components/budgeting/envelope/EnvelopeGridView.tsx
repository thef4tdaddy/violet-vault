import React from "react";
import { EnvelopeGridHeader } from "./EnvelopeGridHeader";
import EnvelopeSummary from "./EnvelopeSummary";
import EnvelopeItem from "./EnvelopeItem";
import UnassignedCashEnvelope from "./UnassignedCashEnvelope";
import EmptyStateHints from "../../onboarding/EmptyStateHints";

// Empty state component
const EmptyStateView = ({
  filterOptions,
  setShowCreateModal,
}: {
  filterOptions: { envelopeType: string; showEmpty: boolean };
  setShowCreateModal: (show: boolean) => void;
}) => {
  const isAllFilters = filterOptions.envelopeType === "all" && filterOptions.showEmpty;

  if (isAllFilters) {
    return (
      <EmptyStateHints
        type="envelopes"
        onAction={() => setShowCreateModal(true)}
        customMessage={undefined}
        customActions={undefined}
      />
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg">No envelopes found</div>
      <p className="text-gray-400 mt-2">Try adjusting your filters</p>
    </div>
  );
};

// Main grid view component
function EnvelopeGridView({
  className,
  totals,
  unassignedCash,
  filterOptions,
  setFilterOptions,
  setShowCreateModal,
  viewMode,
  setViewMode,
  handleViewHistory,
  sortedEnvelopes,
  handleEnvelopeSelect,
  handleEnvelopeEdit,
  handleQuickFund,
  selectedEnvelopeId,
  bills,
  children,
}: {
  className: string;
  totals: {
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
  };
  unassignedCash: number;
  filterOptions: unknown;
  setFilterOptions: (opts: unknown) => void;
  setShowCreateModal: (show: boolean) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  handleViewHistory: (env: unknown) => void;
  sortedEnvelopes: Array<{ id: string; [key: string]: unknown }>;
  handleEnvelopeSelect: (id: string) => void;
  handleEnvelopeEdit: (env: unknown) => void;
  handleQuickFund: (id: string, amount: number) => void;
  selectedEnvelopeId: string | null;
  bills: unknown[];
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Action Buttons Row */}
      <EnvelopeGridHeader
        filterOptions={
          filterOptions as {
            timeRange: string;
            showEmpty: boolean;
            sortBy: string;
            envelopeType: string;
          }
        }
        setFilterOptions={setFilterOptions}
        setShowCreateModal={setShowCreateModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Summary Cards */}
      <EnvelopeSummary totals={totals} />

      {/* Envelope Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UnassignedCashEnvelope
          unassignedCash={unassignedCash}
          onViewHistory={handleViewHistory}
          viewMode={viewMode}
        />
        {sortedEnvelopes.map((envelope) => (
          <EnvelopeItem
            key={envelope.id}
            envelope={envelope as never}
            onSelect={handleEnvelopeSelect}
            onEdit={handleEnvelopeEdit}
            onViewHistory={handleViewHistory}
            onQuickFund={(envelopeId: string) => handleQuickFund(envelopeId, 0)}
            isSelected={selectedEnvelopeId === envelope.id}
            bills={bills as never}
            unassignedCash={unassignedCash}
            viewMode={viewMode}
          />
        ))}
      </div>

      {sortedEnvelopes.length === 0 && (
        <EmptyStateView
          filterOptions={
            filterOptions as {
              envelopeType: string;
              showEmpty: boolean;
              timeRange: string;
              sortBy: string;
            }
          }
          setShowCreateModal={setShowCreateModal}
        />
      )}

      {children}
    </div>
  );
}

export default EnvelopeGridView;
