import React from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const TransactionFilters = ({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  envelopeFilter,
  setEnvelopeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  envelopes = [],
}) => {
  return (
    <div className="glassmorphism rounded-xl p-6 border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glassmorphism w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg"
              placeholder="Search transactions..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Filter
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Envelope
          </label>
          <select
            value={envelopeFilter}
            onChange={(e) => setEnvelopeFilter(e.target.value)}
            className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
          >
            <option value="all">All Envelopes</option>
            <option value="">Unassigned</option>
            {envelopes.map((envelope) => (
              <option key={envelope.id} value={envelope.id}>
                {envelope.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glassmorphism flex-1 px-3 py-2 border border-white/20 rounded-lg"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="description">Description</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="glassmorphism px-3 py-2 border border-white/20 rounded-lg hover:shadow-lg"
            >
              {sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
