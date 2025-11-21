import React, { useState, useRef } from "react";
import { useKeyManagement } from "@/hooks/auth/useKeyManagement";
import { useKeyManagementUI, useKeyManagementOperations } from "@/hooks/auth/useKeyManagementUI";
import ModalHeader from "./key-management/ModalHeader";
import MainContent from "./key-management/MainContent";
import Footer from "./key-management/Footer";
import logger from "@/utils/common/logger";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface KeyManagementSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyManagementSettings: React.FC<KeyManagementSettingsProps> = ({ isOpen, onClose }) => {
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

  const {
    getCurrentKeyFingerprint,
    copyKeyToClipboard,
    downloadKeyFile,
    downloadProtectedKeyFile,
    validateKeyFile,
    importAndLogin,
    generateQRCode,
  } = useKeyManagement();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useModalAutoScroll(isOpen);

  // Load current key fingerprint on open
  React.useEffect(() => {
    if (isOpen) {
      getCurrentKeyFingerprint().then(setKeyFingerprint).catch(logger.error);
    }
  }, [isOpen, setKeyFingerprint, getCurrentKeyFingerprint]);

  // Clear states when closing
  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleCopyToClipboard = async () => {
    try {
      await copyKeyToClipboard(30);
      handleClipboardSuccess();
    } catch (err) {
      handleOperationError("Clipboard copy", err as Error);
    }
  };

  const handleDownloadUnprotected = async () => {
    try {
      await downloadKeyFile();
    } catch (err) {
      handleOperationError("Download", err as Error);
    }
  };

  const handleDownloadProtected = async () => {
    if (!validateExportPassword(exportPassword)) {
      return;
    }

    try {
      await downloadProtectedKeyFile(exportPassword);
      updatePassword("export", "");
    } catch (err) {
      handleOperationError("Protected download", err as Error);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const keyFileData = await handleFileRead(file);
      const validation = validateKeyFile(keyFileData);

      if (!validateImportRequirements(keyFileData, importPassword, vaultPassword, validation)) {
        return;
      }

      const result = await importAndLogin(
        keyFileData,
        validation.type === "protected" ? importPassword : null,
        vaultPassword
      );

      setImportResult(result);
      updatePassword("import", "");
      updatePassword("vault", "");
    } catch (err) {
      handleImportError(err as Error);
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      setLoading(true);
      await generateQRCode();
      // QR code display functionality can be added to the service
    } catch (err) {
      handleOperationError("QR code generation", err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black my-auto"
      >
        <ModalHeader onClose={onClose} />

        <MainContent
          activeTab={activeTab}
          showAdvanced={showAdvanced}
          exportPassword={exportPassword}
          importPassword={importPassword}
          vaultPassword={vaultPassword}
          showExportPassword={showExportPassword}
          showImportPassword={showImportPassword}
          showVaultPassword={showVaultPassword}
          keyFingerprint={keyFingerprint}
          copiedToClipboard={copiedToClipboard}
          importResult={importResult}
          loading={loading}
          fileInputRef={fileInputRef}
          onTabChange={handleTabChange}
          onToggleAdvanced={toggleAdvanced}
          onTogglePasswordVisibility={togglePasswordVisibility}
          onUpdatePassword={updatePassword}
          onCopyToClipboard={handleCopyToClipboard}
          onDownloadUnprotected={handleDownloadUnprotected}
          onDownloadProtected={handleDownloadProtected}
          onGenerateQRCode={handleGenerateQRCode}
          onFileImport={handleFileImport}
        />

        <Footer onClose={onClose} />
      </div>
    </div>
  );
};

export default KeyManagementSettings;
