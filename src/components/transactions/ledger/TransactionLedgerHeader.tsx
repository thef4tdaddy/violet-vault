import React from "react";
import { Button, StylizedButtonText } from "@/components/ui";
import { getIcon } from "../../../utils";
import { formatLedgerSummary } from "../../../utils/transactions/ledgerHelpers";

const TransactionLedgerHeader = ({
  transactionCount,
  netCashFlow,
  onAddTransaction,
  onImportTransactions,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="font-black text-black text-xl flex items-center tracking-wide">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-3 rounded-2xl">
              {React.createElement(getIcon("BookOpen"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <StylizedButtonText firstLetterClassName="text-2xl" restClassName="text-xl">
            TRANSACTION LEDGER
          </StylizedButtonText>
        </h2>
        <p className="text-purple-900 mt-2 ml-16">
          {formatLedgerSummary(transactionCount, netCashFlow)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:justify-end">
        <Button
          onClick={onImportTransactions}
          className="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg border-2 border-black shadow-lg transition-colors"
        >
          {React.createElement(getIcon("Upload"), {
            className: "h-4 w-4 mr-2",
          })}
          Import File
        </Button>
        <Button
          onClick={onAddTransaction}
          className="btn btn-primary border-2 border-black flex items-center justify-center shadow-lg"
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
