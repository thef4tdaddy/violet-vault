import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { formatLedgerSummary } from "@/utils/transactions/ledgerHelpers";

interface TransactionLedgerHeaderProps {
  transactionCount: number;
  netCashFlow: number;
  onAddTransaction: () => void;
  onImportTransactions: () => void;
}

const TransactionLedgerHeader: React.FC<TransactionLedgerHeaderProps> = ({
  transactionCount,
  netCashFlow,
  onAddTransaction,
  onImportTransactions,
}) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="font-black text-black text-base flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-3 rounded-2xl">
              {React.createElement(getIcon("BookOpen"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <span className="text-lg">T</span>RANSACTION <span className="text-lg">L</span>EDGER
        </h2>
        <p className="text-purple-900 mt-1">{formatLedgerSummary(transactionCount, netCashFlow)}</p>
      </div>

      <div className="flex flex-row gap-3">
        <Button
          onClick={onImportTransactions}
          className="btn btn-primary border-2 border-black flex items-center"
        >
          {React.createElement(getIcon("Upload"), {
            className: "h-4 w-4 mr-2",
          })}
          Import File
        </Button>
        <Button
          onClick={onAddTransaction}
          className="btn btn-primary border-2 border-black flex items-center"
          data-tour="add-transaction"
        >
          {React.createElement(getIcon("Plus"), { className: "h-4 w-4 mr-2" })}
          Add Transaction
        </Button>
      </div>
    </div>
  );
};

export default TransactionLedgerHeader;
