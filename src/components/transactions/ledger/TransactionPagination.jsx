import React from "react";

const TransactionPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        className="btn btn-secondary border-2 border-black"
        disabled={currentPage === 1}
        onClick={() => onPageChange("prev")}
      >
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="btn btn-secondary border-2 border-black"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange("next")}
      >
        Next
      </button>
    </div>
  );
};

export default TransactionPagination;