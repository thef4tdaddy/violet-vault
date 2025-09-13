import React, { useState, useRef } from "react";
import { getIcon } from "../../utils";
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor to use hooks instead of direct service calls
import { keyManagementService } from "../../services/keys/keyManagementService";
import {
  useKeyManagementUI,
  useKeyManagementOperations,
} from "../../hooks/auth/useKeyManagementUI";
import TabNavigation from "./key-management/TabNavigation";
import ExportSection from "./key-management/ExportSection";
import ImportSection from "./key-management/ImportSection";
import AdvancedSection from "./key-management/AdvancedSection";
import logger from "../../utils/common/logger";

const KeyManagementSettings = ({ isOpen, onClose }) => {
  // Use extracted UI hooks
  const {
    activeTab,
    showAdvanced,
    exportPassword,
    importPassword,
    vaultPassword,
    showExportPassword,
    showImportPassword,
    showVaultPassword,
    keyFingerprint,
    copiedToClipboard,
    importResult,
    handleTabChange,
    toggleAdvanced,
    togglePasswordVisibility,
    updatePassword,
    setKeyFingerprint,
    setImportResult,
    resetState,
    handleClipboardSuccess,
  } = useKeyManagementUI();

  const {
    validateExportPassword,
    validateImportRequirements,
    handleFileRead,
    handleImportError,
    handleOperationError,
  } = useKeyManagementOperations();

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Load current key fingerprint on open
  React.useEffect(() => {
    if (isOpen) {
      keyManagementService.getCurrentKeyFingerprint().then(setKeyFingerprint).catch(logger.error);
    }
  }, [isOpen, setKeyFingerprint]);

  // Clear states when closing
  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleCopyToClipboard = async () => {
    try {
      await keyManagementService.copyKeyToClipboard(30);
      handleClipboardSuccess();
    } catch (err) {
      handleOperationError("Clipboard copy", err);
    }
  };

  const handleDownloadUnprotected = async () => {
    try {
      await keyManagementService.downloadKeyFile();
    } catch (err) {
      handleOperationError("Download", err);
    }
  };

  const handleDownloadProtected = async () => {
    if (!validateExportPassword(exportPassword)) {
      return;
    }

    try {
      await keyManagementService.downloadProtectedKeyFile(exportPassword);
      updatePassword("export", "");
    } catch (err) {
      handleOperationError("Protected download", err);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const keyFileData = await handleFileRead(file);
      const validation = keyManagementService.validateKeyFile(keyFileData);

      if (!validateImportRequirements(keyFileData, importPassword, vaultPassword, validation)) {
        return;
      }

      const result = await keyManagementService.importAndLogin(
        keyFileData,
        validation.type === "protected" ? importPassword : null,
        vaultPassword
      );

      setImportResult(result);
      updatePassword("import", "");
      updatePassword("vault", "");
    } catch (err) {
      handleImportError(err);
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      setLoading(true);
      await keyManagementService.generateQRCode();
      // QR code display functionality can be added to the service
    } catch (err) {
      handleOperationError("QR code generation", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {React.createElement(getIcon("Shield"), {
                className: "h-6 w-6 text-purple-600 mr-3",
              })}
              <h2 className="text-xl font-semibold text-gray-900">Key Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {React.createElement(getIcon("X"), {
                className: "h-6 w-6",
              })}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Security Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0",
              })}
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">Critical Security Information</p>
                <p className="text-amber-700">
                  Without your encryption key, your data is <strong>unrecoverable</strong>. Store
                  backups securely and never share your key with untrusted parties.
                </p>
              </div>
            </div>
          </div>

          {/* Current Key Info */}
          {keyFingerprint && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                {React.createElement(getIcon("Shield"), {
                  className: "h-4 w-4 text-green-600 mr-2",
                })}
                <div className="text-sm">
                  <p className="text-green-800 font-medium">Current Key</p>
                  <p className="text-green-700 font-mono text-xs mt-1">
                    Fingerprint: {keyFingerprint.substring(0, 16)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Import Success */}
          {importResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                {React.createElement(getIcon("CheckCircle"), {
                  className: "h-4 w-4 text-green-600 mr-2 mt-0.5",
                })}
                <div className="text-sm">
                  <p className="text-green-800 font-medium">Key Import Successful</p>
                  <p className="text-green-700 mt-1">
                    Successfully imported and logged in with key from{" "}
                    {importResult.user || "unknown user"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Export Tab */}
          {activeTab === "export" && (
            <ExportSection
              exportPassword={exportPassword}
              showExportPassword={showExportPassword}
              copiedToClipboard={copiedToClipboard}
              loading={loading}
              onUpdatePassword={updatePassword}
              onTogglePasswordVisibility={togglePasswordVisibility}
              onCopyToClipboard={handleCopyToClipboard}
              onDownloadUnprotected={handleDownloadUnprotected}
              onDownloadProtected={handleDownloadProtected}
              onGenerateQRCode={handleGenerateQRCode}
            />
          )}

          {/* Import Tab */}
          {activeTab === "import" && (
            <ImportSection
              importPassword={importPassword}
              vaultPassword={vaultPassword}
              showImportPassword={showImportPassword}
              showVaultPassword={showVaultPassword}
              importResult={importResult}
              loading={loading}
              fileInputRef={fileInputRef}
              onUpdatePassword={updatePassword}
              onTogglePasswordVisibility={togglePasswordVisibility}
              onFileImport={handleFileImport}
            />
          )}

          {/* Advanced Options */}
          <AdvancedSection
            showAdvanced={showAdvanced}
            keyFingerprint={keyFingerprint}
            onToggleAdvanced={toggleAdvanced}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center hover:text-gray-700"
              >
                Learn more about VioletVault encryption
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagementSettings;
