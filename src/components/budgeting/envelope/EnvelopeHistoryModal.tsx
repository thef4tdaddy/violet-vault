import React, { Suspense } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

// Lazy load the history viewer for better performance
const ObjectHistoryViewer = React.lazy(() => import("../../history/ObjectHistoryViewer"));

const EnvelopeHistoryModal = ({ isOpen = false, onClose, envelope }) => {
  if (!isOpen || !envelope) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-black">
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

  // Render modal at document root to avoid z-index/overflow issues
  return createPortal(modalContent, document.body);
};

export default EnvelopeHistoryModal;
