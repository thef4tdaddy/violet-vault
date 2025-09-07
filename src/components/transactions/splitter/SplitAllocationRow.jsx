import React from "react";
import { getIcon } from "../../../utils/icons";

const SplitAllocationRow = ({
  split,
  index: _index,
  canRemove,
  onUpdate,
  onRemove,
  availableCategories,
  envelopes,
}) => {
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-3 px-4 bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border-2 border-black shadow-md">
      {/* Description */}
      <div className="col-span-4">
        <input
          type="text"
          value={split.description}
          onChange={(e) => onUpdate(split.id, "description", e.target.value)}
          placeholder="Description..."
          className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all font-medium"
        />
      </div>

      {/* Amount */}
      <div className="col-span-2">
        <div className="relative">
          {React.createElement(getIcon("DollarSign"), {
            className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600",
          })}
          <input
            type="number"
            step="0.01"
            min="0"
            value={split.amount}
            onChange={(e) => onUpdate(split.id, "amount", parseFloat(e.target.value) || 0)}
            className="w-full pl-10 pr-3 py-2 text-sm border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all font-bold"
          />
        </div>
      </div>

      {/* Category */}
      <div className="col-span-3">
        <div className="relative">
          {React.createElement(getIcon("Tag"), {
            className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600",
          })}
          <select
            value={split.category}
            onChange={(e) => onUpdate(split.id, "category", e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all font-medium appearance-none bg-white/60"
          >
            <option value="">Select category...</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Envelope */}
      <div className="col-span-2">
        <select
          value={split.envelopeId || ""}
          onChange={(e) => onUpdate(split.id, "envelopeId", e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all font-medium appearance-none bg-white/60"
        >
          <option value="">No envelope</option>
          {envelopes?.map((envelope) => (
            <option key={envelope.id} value={envelope.id}>
              {envelope.name}
            </option>
          ))}
        </select>
      </div>

      {/* Remove Button */}
      <div className="col-span-1 flex justify-center">
        {canRemove && (
          <button
            onClick={() => onRemove(split.id)}
            className="p-1 text-red-500 hover:text-red-700 glassmorphism backdrop-blur-sm hover:bg-red-50 rounded border-2 border-red-200 shadow-md hover:shadow-lg transition-all"
            title="Remove split"
          >
            {React.createElement(getIcon("X"), { className: "h-4 w-4" })}
          </button>
        )}
      </div>
    </div>
  );
};

export default SplitAllocationRow;
