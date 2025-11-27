import React, { useMemo } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { EnvelopeGridHeader } from "./EnvelopeGridHeader";
import EnvelopeSummary from "./EnvelopeSummary";
import EnvelopeItem from "./EnvelopeItem";
import UnassignedCashEnvelope from "./UnassignedCashEnvelope";
import EmptyStateHints from "../../onboarding/EmptyStateHints";
import { useEnvelopeGridVirtualization } from "@/hooks/budgeting/useEnvelopeGridVirtualization";

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

// Virtualized grid component
const VirtualizedEnvelopeGrid = ({
  parentRef,
  rowVirtualizer,
  envelopeRows,
  unassignedCash,
  handleViewHistory,
  viewMode,
  handleEnvelopeSelect,
  handleEnvelopeEdit,
  handleQuickFund,
  selectedEnvelopeId,
  bills,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  envelopeRows: Array<Array<{ id: string; [key: string]: unknown }>>;
  unassignedCash: number;
  handleViewHistory: (env: unknown) => void;
  viewMode: string;
  handleEnvelopeSelect: (id: string) => void;
  handleEnvelopeEdit: (env: unknown) => void;
  handleQuickFund: (id: string, amount: number) => void;
  selectedEnvelopeId: string | null;
  bills: unknown[];
}) => (
  <div ref={parentRef} className="overflow-auto" style={{ maxHeight: "70vh" }}>
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowEnvelopes = envelopeRows[virtualRow.index] || [];
        return (
          <div
            key={virtualRow.index}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {virtualRow.index === 0 && (
              <UnassignedCashEnvelope
                unassignedCash={unassignedCash}
                onViewHistory={handleViewHistory}
                viewMode={viewMode}
              />
            )}
            {rowEnvelopes.map((envelope) => (
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
        );
      })}
    </div>
  </div>
);

// Non-virtualized grid component
const StandardEnvelopeGrid = ({
  sortedEnvelopes,
  unassignedCash,
  handleViewHistory,
  viewMode,
  handleEnvelopeSelect,
  handleEnvelopeEdit,
  handleQuickFund,
  selectedEnvelopeId,
  bills,
}: {
  sortedEnvelopes: Array<{ id: string; [key: string]: unknown }>;
  unassignedCash: number;
  handleViewHistory: (env: unknown) => void;
  viewMode: string;
  handleEnvelopeSelect: (id: string) => void;
  handleEnvelopeEdit: (env: unknown) => void;
  handleQuickFund: (id: string, amount: number) => void;
  selectedEnvelopeId: string | null;
  bills: unknown[];
}) => (
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
);

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
  // Virtualization setup - only virtualize if >50 envelopes
  const { parentRef, rowVirtualizer, shouldVirtualize, getColumnsCount } =
    useEnvelopeGridVirtualization(sortedEnvelopes, 50);

  // Calculate columns count for grid layout
  const columnsCount = getColumnsCount();

  // Split envelopes into rows for virtualization
  const envelopeRows = useMemo(() => {
    if (!shouldVirtualize) return [];
    const rows: Array<Array<{ id: string; [key: string]: unknown }>> = [];
    for (let i = 0; i < sortedEnvelopes.length; i += columnsCount) {
      rows.push(sortedEnvelopes.slice(i, i + columnsCount));
    }
    return rows;
  }, [sortedEnvelopes, shouldVirtualize, columnsCount]);

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

      {/* Envelope Grid - Virtualized when >50 items */}
      {shouldVirtualize ? (
        <VirtualizedEnvelopeGrid
          parentRef={parentRef}
          rowVirtualizer={rowVirtualizer}
          envelopeRows={envelopeRows}
          unassignedCash={unassignedCash}
          handleViewHistory={handleViewHistory}
          viewMode={viewMode}
          handleEnvelopeSelect={handleEnvelopeSelect}
          handleEnvelopeEdit={handleEnvelopeEdit}
          handleQuickFund={handleQuickFund}
          selectedEnvelopeId={selectedEnvelopeId}
          bills={bills}
        />
      ) : (
        <StandardEnvelopeGrid
          sortedEnvelopes={sortedEnvelopes}
          unassignedCash={unassignedCash}
          handleViewHistory={handleViewHistory}
          viewMode={viewMode}
          handleEnvelopeSelect={handleEnvelopeSelect}
          handleEnvelopeEdit={handleEnvelopeEdit}
          handleQuickFund={handleQuickFund}
          selectedEnvelopeId={selectedEnvelopeId}
          bills={bills}
        />
      )}

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
