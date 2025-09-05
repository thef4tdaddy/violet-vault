import React from "react";
import { BookOpen, Plus, Upload } from "lucide-react";
import { formatLedgerSummary } from "../../../utils/transactions/ledgerHelpers";

const TransactionLedgerHeader = ({ 
  transactionCount, 
  netCashFlow, 
  onAddTransaction, 
  onImportTransactions 
}) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="font-black text-black text-base flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-3 rounded-2xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-lg">T</span>RANSACTION{" "}
          <span className="text-lg">L</span>EDGER
        </h2>
        <p className="text-purple-900 mt-1">
          {formatLedgerSummary(transactionCount, netCashFlow)}
        </p>
      </div>

      <div className="flex flex-row gap-3">
        <button
          onClick={onImportTransactions}
          className="btn btn-primary border-2 border-black flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import File
        </button>
        <button
          onClick={onAddTransaction}
          className="btn btn-primary border-2 border-black flex items-center"
          data-tour="add-transaction"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </button>
      </div>
    </div>
  );
};

export default TransactionLedgerHeader;