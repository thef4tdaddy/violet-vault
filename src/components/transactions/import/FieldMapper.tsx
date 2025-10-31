import React from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";

interface FieldMapping {
  date?: string;
  description?: string;
  amount?: string;
  category?: string;
  notes?: string;
  [key: string]: string | undefined;
}

interface ImportData {
  data?: Record<string, string | number>[];
  [key: string]: unknown;
}

interface FieldMapperProps {
  importData: ImportData | Record<string, string | number>[];
  fieldMapping: FieldMapping;
  setFieldMapping: (mapping: FieldMapping) => void;
  onBack: () => void;
  onImport: () => void;
}

const FieldMapper: React.FC<FieldMapperProps> = ({
  importData,
  fieldMapping,
  setFieldMapping,
  onBack,
  onImport,
}) => {
  const isValid = fieldMapping.date && fieldMapping.description && fieldMapping.amount;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Map Your File Fields</h4>
        <p className="text-sm text-gray-600">
          Match your file columns to transaction fields. Preview shows data from your file.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Field Mapping</h5>
          <div className="space-y-4">
            {["date", "description", "amount", "category", "notes"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {["date", "description", "amount"].includes(field) && " *"}
                </label>
                <Select
                  value={fieldMapping[field] || ""}
                  onChange={(e) =>
                    setFieldMapping({
                      ...fieldMapping,
                      [field]: e.target.value,
                    })
                  }
                  className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
                >
                  <option value="">Skip this field</option>
                  {Object.keys((importData.data || importData)[0] || {}).map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-medium text-gray-900 mb-3">
            Preview ({(importData.data || importData).length} rows)
          </h5>
          <div className="glassmorphism border rounded-lg overflow-hidden border-white/20">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/50">
                  <tr>
                    {Object.keys((importData.data || importData)[0] || {})
                      .slice(0, 4)
                      .map((header) => (
                        <th key={header} className="px-3 py-2 text-left font-medium text-gray-900">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(importData.data || importData).slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row)
                        .slice(0, 4)
                        .map((value, i) => (
                          <td key={i} className="px-3 py-2 text-gray-900">
                            {String(value).substring(0, 20)}
                            {String(value).length > 20 && "..."}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </Button>
        <Button
          onClick={onImport}
          disabled={!isValid}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import Transactions
        </Button>
      </div>
    </div>
  );
};

export default FieldMapper;
