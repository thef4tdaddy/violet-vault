import { Button } from "@/components/ui";

const TransactionPagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        className="btn btn-secondary border-2 border-black"
        disabled={currentPage === 1}
        onClick={() => onPageChange("prev")}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        className="btn btn-secondary border-2 border-black"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default TransactionPagination;
