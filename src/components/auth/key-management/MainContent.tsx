import React from "react";
import TabNavigation from "./TabNavigation";
import ExportSection from "./ExportSection";
import ImportSection from "./ImportSection";
import AdvancedSection from "./AdvancedSection";
import SecurityWarning from "./SecurityWarning";
import CurrentKeyInfo from "./CurrentKeyInfo";
import ImportSuccess from "./ImportSuccess";

interface MainContentProps {
  activeTab: string;
  showAdvanced: boolean;
  exportPassword: string;
  importPassword: string;
  vaultPassword: string;
  showExportPassword: boolean;
  showImportPassword: boolean;
  showVaultPassword: boolean;
  keyFingerprint: string | null;
  copiedToClipboard: boolean;
  importResult: {
    success: boolean;
    importResult: {
      budgetId: string;
      fingerprint: string;
      exportedAt?: string;
      deviceFingerprint?: string;
    };
    loginResult: {
      success: boolean;
      error?: string;
      suggestion?: string;
      code?: string;
      canCreateNew?: boolean;
      data?: unknown;
    };
  } | null;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onTabChange: (tab: string) => void;
  onToggleAdvanced: () => void;
  onTogglePasswordVisibility: (type: string) => void;
  onUpdatePassword: (type: string, value: string) => void;
  onCopyToClipboard: () => void;
  onDownloadUnprotected: () => void;
  onDownloadProtected: () => void;
  onGenerateQRCode: () => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MainContent: React.FC<MainContentProps> = ({
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
  loading,
  fileInputRef,
  onTabChange,
  onToggleAdvanced,
  onTogglePasswordVisibility,
  onUpdatePassword,
  onCopyToClipboard,
  onDownloadUnprotected,
  onDownloadProtected,
  onGenerateQRCode,
  onFileImport,
}) => {
  return (
    <div className="p-6 space-y-6">
      <SecurityWarning />

      <CurrentKeyInfo keyFingerprint={keyFingerprint} />

      <ImportSuccess importResult={importResult} />

      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "export" && (
        <ExportSection
          exportPassword={exportPassword}
          showExportPassword={showExportPassword}
          copiedToClipboard={copiedToClipboard}
          loading={loading}
          onUpdatePassword={onUpdatePassword}
          onTogglePasswordVisibility={onTogglePasswordVisibility}
          onCopyToClipboard={onCopyToClipboard}
          onDownloadUnprotected={onDownloadUnprotected}
          onDownloadProtected={onDownloadProtected}
          onGenerateQRCode={onGenerateQRCode}
        />
      )}

      {activeTab === "import" && (
        <ImportSection
          importPassword={importPassword}
          vaultPassword={vaultPassword}
          showImportPassword={showImportPassword}
          showVaultPassword={showVaultPassword}
          loading={loading}
          fileInputRef={fileInputRef}
          onUpdatePassword={onUpdatePassword}
          onTogglePasswordVisibility={onTogglePasswordVisibility}
          onFileImport={onFileImport}
        />
      )}

      <AdvancedSection
        showAdvanced={showAdvanced}
        keyFingerprint={keyFingerprint}
        onToggleAdvanced={onToggleAdvanced}
      />
    </div>
  );
};

export default MainContent;
