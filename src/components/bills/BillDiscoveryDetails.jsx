import React from "react";

/**
 * Discovery details section for bills
 * Shows sample transactions and amount ranges
 */
const BillDiscoveryDetails = ({ discoveryData }) => {
  if (!discoveryData) return null;

  return (
    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
      <p>
        <strong>Sample transactions:</strong>
        {discoveryData.sampleTransactions.map((txn, i) => (
          <span key={i}>
            {i > 0 && ", "}${Math.abs(txn.amount).toFixed(2)} on{" "}
            {new Date(txn.date).toLocaleDateString()}
          </span>
        ))}
      </p>
      {discoveryData.amountRange && (
        <p className="mt-1">
          <strong>Amount range:</strong> $
          {Math.abs(discoveryData.amountRange[0]).toFixed(2)} - $
          {Math.abs(discoveryData.amountRange[1]).toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default BillDiscoveryDetails;