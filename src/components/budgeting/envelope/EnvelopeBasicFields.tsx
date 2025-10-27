import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getEnvelopeCategories } from "../../../constants/categories";

interface EnvelopeBasicFieldsProps {
  formData: {
    name?: string;
    category?: string;
    description?: string;
  };
  onUpdateField: (field: string, value: string) => void;
  errors?: {
    name?: string;
    category?: string;
    description?: string;
  };
  canEdit?: boolean;
}

const EnvelopeBasicFields = ({ formData, onUpdateField, errors = {}, canEdit = true }: EnvelopeBasicFieldsProps) => {
  const categories = getEnvelopeCategories();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center">
        {React.createElement(getIcon("Tag"), {
          className: "h-4 w-4 mr-2 text-blue-600",
        })}
        Basic Information
      </h3>

      {/* Envelope Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Envelope Name *</label>
        <input
          type="text"
          value={formData.name || ""}
          onChange={(e) => onUpdateField("name", e.target.value)}
          disabled={!canEdit}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
          } ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder="e.g., Groceries, Gas, Entertainment"
          maxLength={50}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-3 w-3 mr-1",
            })}
            {errors.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
        <Select
          value={formData.category || ""}
          onChange={(e) => onUpdateField("category", e.target.value)}
          disabled={!canEdit}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? "border-red-300 bg-red-50" : "border-gray-300"
          } ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-3 w-3 mr-1",
            })}
            {errors.category}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => onUpdateField("description", e.target.value)}
          disabled={!canEdit}
          rows={2}
          maxLength={500}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder="Optional notes about this envelope..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-3 w-3 mr-1",
            })}
            {errors.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default EnvelopeBasicFields;
