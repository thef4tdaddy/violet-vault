import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface PreviewData {
  totalCount: number;
  totalAmount: number;
  categories: Record<string, { count: number; amount: number }>;
  dateRange: {
    earliest?: string;
    latest?: string;
  };
  cutoffDate: string;
}

interface ArchivingPreviewResultsProps {
  showPreview: boolean;
  previewData: PreviewData | null;
  onClosePreview: () => void;
}

const ArchivingPreviewResults = ({
  showPreview,
  previewData,
  onClosePreview,
}: ArchivingPreviewResultsProps) => {
  if (!showPreview || !previewData) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Archive Preview</h3>
        <Button onClick={onClosePreview} className="text-gray-400 hover:text-gray-600">
          ✕
        </Button>
      </div>

      {previewData.totalCount === 0 ? (
        <div className="text-center py-8">
          {React.createElement(getIcon("CheckCircle"), {
            className: "h-12 w-12 text-green-600 mx-auto mb-4",
          })}
          <p className="text-gray-600">
            No transactions found for archiving with the selected period.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-900">
                {previewData.totalCount.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">Transactions to Archive</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-900">
                ${Math.abs(previewData.totalAmount).toLocaleString()}
              </p>
              <p className="text-sm text-green-700">Total Amount</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-900">
                {Object.keys(previewData.categories).length}
              </p>
              <p className="text-sm text-purple-700">Categories</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-900">
                {previewData.dateRange.earliest
                  ? new Date(previewData.dateRange.earliest).getFullYear()
                  : "N/A"}{" "}
                -{" "}
                {previewData.dateRange.latest
                  ? new Date(previewData.dateRange.latest).getFullYear()
                  : "N/A"}
              </p>
              <p className="text-sm text-orange-700">Date Range</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Transactions by Category</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(previewData.categories)
                  .sort(([, a], [, b]) => {
                    const aData = a as { count: number; amount: number };
                    const bData = b as { count: number; amount: number };
                    return bData.count - aData.count;
                  })
                  .slice(0, 8)
                  .map(([category, data]) => {
                    const categoryData = data as { count: number; amount: number };
                    return (
                      <div
                        key={category}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {categoryData.count} transactions
                          </span>
                          <br />
                          <span className="text-xs text-gray-500">
                            ${Math.abs(categoryData.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {Object.keys(previewData.categories).length > 8 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  +{Object.keys(previewData.categories).length - 8} more categories
                </p>
              )}
            </div>
          </div>

          {/* Storage Impact */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              {React.createElement(getIcon("HardDrive"), {
                className: "h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0",
              })}
              <div>
                <p className="font-medium text-yellow-800">Estimated Storage Impact</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Archiving these {previewData.totalCount.toLocaleString()} transactions will reduce
                  storage usage by approximately{" "}
                  {Math.round(((previewData.totalCount * 0.35) / 1024) * 100) / 100}
                  MB while preserving all analytics data.
                </p>
              </div>
            </div>
          </div>

          {/* Cutoff Date Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              {React.createElement(getIcon("Clock"), {
                className: "h-5 w-5 text-gray-600",
              })}
              <div>
                <p className="font-medium text-gray-800">Archive Cutoff Date</p>
                <p className="text-sm text-gray-600">
                  Transactions before {new Date(previewData.cutoffDate).toLocaleDateString()} will
                  be archived
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivingPreviewResults;
