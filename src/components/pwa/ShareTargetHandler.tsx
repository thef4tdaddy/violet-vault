import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { useNavigate, useLocation } from "react-router-dom";
import { getIcon } from "@/utils";
import logger from "@/utils/common/logger";

/**
 * Shared data interface
 */
interface SharedData {
  title: string | null;
  text: string | null;
  url: string | null;
  timestamp: string;
  hasFiles: boolean;
}

/**
 * Share Target Handler
 * Handles files and data shared to the PWA via the Share Target API
 */
const ShareTargetHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSharedContent = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Check for URL parameters from share target
      const urlParams = new URLSearchParams(location.search);
      const title = urlParams.get("title");
      const text = urlParams.get("text");
      const url = urlParams.get("url");

      logger.info("Share target data received", { title, text, url });

      const data = {
        title,
        text,
        url,
        timestamp: new Date().toISOString(),
        hasFiles: false,
      };

      // Check if there are files in the form data (for POST requests)
      if (window.location.href.includes("files=")) {
        data.hasFiles = true;
      }

      setSharedData(data as SharedData);

      // Auto-redirect to appropriate section after showing preview
      setTimeout(() => {
        if (data.hasFiles || (data.text && data.text.includes("csv"))) {
          // Likely financial data file
          navigate("/app/transactions", {
            state: {
              importData: data,
              showImport: true,
            },
          });
        } else if (data.url && data.url.includes("bank")) {
          // Bank or financial URL
          navigate("/app/settings", {
            state: {
              importUrl: data.url,
            },
          });
        } else {
          // General text or other data
          navigate("/app/transactions", {
            state: {
              importText: data.text,
            },
          });
        }
      }, 3000);
    } catch (err) {
      logger.error("Failed to process shared content:", err);
      setError("Failed to process shared content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Check if this is a share target request
    if (location.pathname === "/app/import" && location.search) {
      handleSharedContent();
    }
  }, [location, handleSharedContent]);

  const handleManualNavigation = (path: string): void => {
    navigate(path, { state: { importData: sharedData } });
  };

  if (!sharedData && !isProcessing) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-white/80 backdrop-blur-sm mb-6">
            <div className="mb-4">
              {React.createElement(getIcon("AlertCircle"), {
                className: "w-12 h-12 mx-auto text-red-600 mb-4",
              })}
            </div>

            <h2 className="font-black text-black text-xl mb-3">
              <span className="text-2xl">E</span>RROR <span className="text-2xl">P</span>ROCESSING{" "}
              <span className="text-2xl">S</span>HARED <span className="text-2xl">D</span>ATA
            </h2>

            <p className="text-gray-700 mb-4 text-sm leading-relaxed">{error}</p>

            <Button
              onClick={() => navigate("/app")}
              className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-purple-700 transition-colors"
            >
              Return to App
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-xl">
            <span className="text-white font-black text-3xl">V</span>
          </div>
          <h1 className="font-black text-black text-3xl mb-2">
            <span className="text-4xl">V</span>IOLET <span className="text-4xl">V</span>AULT
          </h1>
        </div>

        {/* Processing or Preview */}
        <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-white/80 backdrop-blur-sm mb-6">
          {isProcessing ? (
            <>
              <div className="mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              </div>

              <h2 className="font-black text-black text-xl mb-3">
                <span className="text-2xl">P</span>ROCESSING <span className="text-2xl">S</span>
                HARED <span className="text-2xl">D</span>ATA
              </h2>

              <p className="text-gray-700 text-sm leading-relaxed">
                Processing the shared content...
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                {React.createElement(getIcon("Share"), {
                  className: "w-12 h-12 mx-auto text-green-600 mb-4",
                })}
              </div>

              <h2 className="font-black text-black text-xl mb-3">
                <span className="text-2xl">S</span>HARED <span className="text-2xl">D</span>ATA{" "}
                <span className="text-2xl">R</span>ECEIVED
              </h2>

              <div className="text-left text-sm space-y-2 mb-4">
                {sharedData?.title && (
                  <div>
                    <span className="font-medium text-gray-600">Title:</span>
                    <span className="ml-2 text-gray-800">{sharedData.title}</span>
                  </div>
                )}

                {sharedData?.text && (
                  <div>
                    <span className="font-medium text-gray-600">Content:</span>
                    <span className="ml-2 text-gray-800 break-words">
                      {sharedData.text.length > 100
                        ? `${sharedData.text.substring(0, 100)}...`
                        : sharedData.text}
                    </span>
                  </div>
                )}

                {sharedData?.url && (
                  <div>
                    <span className="font-medium text-gray-600">URL:</span>
                    <span className="ml-2 text-blue-600 break-all">{sharedData.url}</span>
                  </div>
                )}

                {sharedData?.hasFiles && (
                  <div className="flex items-center space-x-2">
                    {React.createElement(getIcon("File"), {
                      className: "w-4 h-4 text-purple-600",
                    })}
                    <span className="text-gray-800">Files attached</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Redirecting to the appropriate section in 3 seconds...
              </p>
            </>
          )}
        </div>

        {/* Manual Navigation */}
        {sharedData && !isProcessing && (
          <div className="space-y-3">
            <Button
              onClick={() => handleManualNavigation("/app/transactions")}
              className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              {React.createElement(getIcon("CreditCard"), {
                className: "w-4 h-4",
              })}
              <span>Import to Transactions</span>
            </Button>

            <Button
              onClick={() => handleManualNavigation("/app/settings")}
              className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              {React.createElement(getIcon("Settings"), {
                className: "w-4 h-4",
              })}
              <span>Go to Settings</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareTargetHandler;
