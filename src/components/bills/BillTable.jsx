import React from "react";

const BillTable = ({ bills, activeTab }) => {
  const currentBills = bills[activeTab] || [];

  if (currentBills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {activeTab === "monthly" ? "monthly" : "longer term"} bills added yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-medium text-gray-700">Account</th>
            <th className="text-left p-3 font-medium text-gray-700">Amount</th>
            <th className="text-left p-3 font-medium text-gray-700">Frequency</th>
          </tr>
        </thead>
        <tbody>
          {currentBills.map((bill) => (
            <tr key={bill.id} className="border-t border-gray-200">
              <td className="p-3 font-medium">
                <div className="flex items-center gap-2">
                  {/* Color indicator */}
                  {bill.color && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bill.color }}
                      title={`Color: ${bill.color}`}
                    />
                  )}
                  {bill.name}
                </div>
              </td>
              <td className="p-3">${bill.amount?.toFixed(2) || "0.00"}</td>
              <td className="p-3">{bill.frequency || "Monthly"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillTable;
