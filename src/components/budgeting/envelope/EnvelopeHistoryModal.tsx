import React, { Suspense } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

// Type definitions
interface Envelope {
  id: string | number;
  name: string;
}

interface EnvelopeHistoryModalProps {
  isOpen?: boolean;
  onClose: () => void;
  envelope: Envelope | null;
}

// Lazy load the history viewer for better performance
const ObjectHistoryViewer = React.lazy(() => import("../../history/ObjectHistoryViewer"));

const EnvelopeHistoryModal = ({ isOpen = false, onClose, envelope }: EnvelopeHistoryModalProps) => {
  if (!isOpen || !envelope) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            {React.createElement(getIcon("History"), {
              className: "h-5 w-5 mr-2 text-purple-600",
            })}
            Envelope History: {envelope.name}
          </h2>
          <Button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
          </Button>
        </div>

        <div className="p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading history...</span>
              </div>
            }
          >
            <ObjectHistoryViewer
              objectType="envelope"
              objectId={envelope.id}
              objectName={envelope.name}
              onClose={onClose}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeHistoryModal;
