import React from "react";
import { Filter, Plus } from "lucide-react";
import { ENVELOPE_TYPES } from "../../../constants/categories";

const EnvelopeHeader = ({
  filterOptions,
  setFilterOptions,
  setShowCreateModal,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-purple-500 p-3 rounded-2xl">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          Budget Envelopes
        </h2>
        <p className="text-gray-600 mt-1">Organize your money into spending categories</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterOptions.envelopeType}
            onChange={(e) =>
              setFilterOptions((prev) => ({
                ...prev,
                envelopeType: e.target.value,
              }))
            }
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="all">All Types</option>
            <option value={ENVELOPE_TYPES.BILL}>Bills</option>
            <option value={ENVELOPE_TYPES.VARIABLE}>Variable</option>
          </select>

          <select
            value={filterOptions.sortBy}
            onChange={(e) =>
              setFilterOptions((prev) => ({
                ...prev,
                sortBy: e.target.value,
              }))
            }
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="usage_desc">Usage High → Low</option>
            <option value="usage_asc">Usage Low → High</option>
            <option value="amount_desc">Amount High → Low</option>
            <option value="name">Name A → Z</option>
            <option value="status">Status (Issues First)</option>
          </select>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
            title="Choose how much information to show for each envelope"
          >
            <option value="overview">Compact Cards</option>
            <option value="detailed">Expanded Cards</option>
          </select>

          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={filterOptions.showEmpty}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  showEmpty: e.target.checked,
                }))
              }
              className="mr-1"
            />
            Show Empty
          </label>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm"
          data-tour="add-envelope"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Envelope
        </button>
      </div>
    </div>
  );
};

export default EnvelopeHeader;
