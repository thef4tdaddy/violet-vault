import React from "react";
import PullToRefreshIndicator from "../../mobile/PullToRefreshIndicator";
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
  containerRef,
  touchHandlers,
  pullStyles,
  className,
  isPulling,
  isRefreshing,
  pullProgress,
  isReady,
  pullRotation,
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
  containerRef: React.RefObject<HTMLDivElement>;
  touchHandlers: Record<string, unknown>;
  pullStyles: React.CSSProperties;
  className: string;
  isPulling: boolean;
  isRefreshing: boolean;
  pullProgress: number;
  isReady: boolean;
  pullRotation: number;
  totals: unknown;
  unassignedCash: number;
  filterOptions: unknown;
  setFilterOptions: (opts: unknown) => void;
  setShowCreateModal: (show: boolean) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  handleViewHistory: (env: unknown) => void;
  sortedEnvelopes: unknown[];
  handleEnvelopeSelect: (id: string) => void;
  handleEnvelopeEdit: (env: unknown) => void;
  handleQuickFund: (id: string, amount: number) => void;
  selectedEnvelopeId: string | null;
  bills: unknown[];
  children: React.ReactNode;
}) {
  return (
    <div
      ref={containerRef}
      {...touchHandlers}
      className={`space-y-6 ${className} relative`}
      style={pullStyles}
    >
      <PullToRefreshIndicator
        isVisible={isPulling}
        isRefreshing={isRefreshing}
        pullProgress={pullProgress}
        isReady={isReady}
        pullRotation={pullRotation}
      />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-black text-black text-3xl flex items-center mb-2">
          <span className="text-4xl mr-2">E</span>nvelopes
          <span className="text-4xl ml-4 mr-2">M</span>anagement
        </h1>
        <p className="text-gray-600 text-sm">
          {sortedEnvelopes.length} {sortedEnvelopes.length === 1 ? "envelope" : "envelopes"} •{" "}
          <span className="font-medium">
            $
            {(totals as Record<string, unknown>)?.totalAllocated &&
            typeof (totals as Record<string, unknown>).totalAllocated === "number"
              ? ((totals as Record<string, unknown>).totalAllocated as number).toFixed(2)
              : "0.00"}{" "}
            allocated
          </span>
        </p>
      </div>

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
        <UnassignedCashEnvelope unassignedCash={unassignedCash} onViewHistory={handleViewHistory} />
        {sortedEnvelopes.map((envelope: { id: string; [key: string]: unknown }) => (
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
