/**
 * Amazon Receipt Importer Component
 * Allows users to import Amazon purchases from email receipts
 */

import React, { useState } from "react";
import { renderIcon } from "@/utils/icons";
import {
  useSearchAmazonReceipts,
  useAmazonConnectionStatus,
} from "@/hooks/amazon/useAmazonReceipts";
import type { AmazonReceipt } from "@/domain/schemas/amazon-receipt";
import AmazonConnectionMessage from "./AmazonConnectionMessage";

interface AmazonReceiptImporterProps {
  onImport: (receipts: AmazonReceipt[]) => void;
  className?: string;
}

export const AmazonReceiptImporter: React.FC<AmazonReceiptImporterProps> = ({
  onImport,
  className = "",
}) => {
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days" | "6months" | "1year">(
    "30days"
  );

  const { data: connectionStatus } = useAmazonConnectionStatus();
  const {
    mutate: searchReceipts,
    data: receipts = [],
    isPending: isSearching,
  } = useSearchAmazonReceipts();

  const handleSearch = () => {
    searchReceipts({
      dateRange,
      minAmount: 0,
      includeReturns: false,
      folders: ["INBOX"],
    });
  };

  const handleToggleReceipt = (receiptId: string) => {
    setSelectedReceipts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(receiptId)) {
        newSet.delete(receiptId);
      } else {
        newSet.add(receiptId);
      }
      return newSet;
    });
  };

  const handleImportSelected = () => {
    const selected = receipts.filter((r) => selectedReceipts.has(r.id));
    if (selected.length > 0) {
      onImport(selected);
      setSelectedReceipts(new Set());
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-orange-500 p-2 rounded-xl">
                {renderIcon("ShoppingBag", { className: "h-5 w-5 text-white" })}
              </div>
            </div>
            Amazon Receipts
          </h3>
          <p className="text-sm text-gray-600 mt-1">Import Amazon purchases from your email</p>
        </div>
      </div>

      {/* Connection Status */}
      {!connectionStatus?.isConnected && <AmazonConnectionMessage />}

      {/* Search Controls */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            disabled={!connectionStatus?.isConnected}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={!connectionStatus?.isConnected || isSearching}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
        >
          {isSearching ? (
            <>
              {renderIcon("RefreshCw", { className: "h-5 w-5 mr-2 animate-spin" })}
              Searching...
            </>
          ) : (
            <>
              {renderIcon("search", { className: "h-5 w-5 mr-2" })}
              Search Amazon Receipts
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {receipts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center">
              {renderIcon("Package", { className: "h-4 w-4 mr-2" })}
              Found {receipts.length} Receipts
            </h4>
            {selectedReceipts.size > 0 && (
              <button
                onClick={handleImportSelected}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
              >
                Import {selectedReceipts.size} Selected
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedReceipts.has(receipt.id)
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-orange-200"
                }`}
                onClick={() => handleToggleReceipt(receipt.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedReceipts.has(receipt.id)}
                      onChange={() => handleToggleReceipt(receipt.id)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-3"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-2xl mr-3">{receipt.categoryIcon}</div>
                    <div>
                      <p className="font-medium text-gray-900">Order #{receipt.orderId}</p>
                      <p className="text-sm text-gray-600">
                        {receipt.items.length} items • {receipt.primaryCategory}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(receipt.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">${receipt.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {receipts.length === 0 && !isSearching && connectionStatus?.isConnected && (
        <div className="text-center py-8 text-gray-500">
          {renderIcon("Package", { className: "h-12 w-12 mx-auto mb-3 opacity-50" })}
          <p className="font-medium">No Amazon receipts found</p>
          <p className="text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default AmazonReceiptImporter;
