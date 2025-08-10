import React, { useState, useRef } from "react";
import {
  X,
  Shield,
  Download,
  Copy,
  QrCode,
  Upload,
  AlertTriangle,
  Key,
  FileText,
  Lock,
  Unlock,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
} from "lucide-react";
import { useKeyManagement } from "../../hooks/useKeyManagement";

const KeyManagementSettings = ({ isOpen, onClose }) => {
  const {
    loading,
    error,
    qrCodeUrl,
    clearError,
    clearQrCode,
    copyKeyToClipboard,
    downloadKeyFile,
    downloadProtectedKeyFile,
    generateQRCode,
    importAndLogin,
    getCurrentKeyFingerprint,
    validateKeyFile,
  } = useKeyManagement();

  const [activeTab, setActiveTab] = useState("export"); // export, import
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [importPassword, setImportPassword] = useState("");
  const [vaultPassword, setVaultPassword] = useState("");
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [showVaultPassword, setShowVaultPassword] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  // Load current key fingerprint on open
  React.useEffect(() => {
    if (isOpen) {
      getCurrentKeyFingerprint().then(setKeyFingerprint).catch(console.error);
    }
  }, [isOpen, getCurrentKeyFingerprint]);

  // Clear states when closing
  React.useEffect(() => {
    if (!isOpen) {
      clearError();
      clearQrCode();
      setExportPassword("");
      setImportPassword("");
      setVaultPassword("");
      setImportResult(null);
      setCopiedToClipboard(false);
    }
  }, [isOpen, clearError, clearQrCode]);

  const handleCopyToClipboard = async () => {
    try {
      await copyKeyToClipboard(30);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleDownloadUnprotected = async () => {
    try {
      await downloadKeyFile();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDownloadProtected = async () => {
    if (!exportPassword || exportPassword.length < 8) {
      alert("Export password must be at least 8 characters long");
      return;
    }

    try {
      await downloadProtectedKeyFile(exportPassword);
      setExportPassword("");
    } catch (err) {
      console.error("Protected download failed:", err);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const keyFileData = JSON.parse(fileText);

      const validation = validateKeyFile(keyFileData);
      if (!validation.valid) {
        alert(`Invalid key file: ${validation.error}`);
        return;
      }

      if (validation.type === "protected" && !importPassword) {
        alert(
          "This key file is password protected. Please enter the export password.",
        );
        return;
      }

      if (!vaultPassword) {
        alert("Please enter your vault password to complete the import.");
        return;
      }

      const result = await importAndLogin(
        keyFileData,
        validation.type === "protected" ? importPassword : null,
        vaultPassword,
      );

      setImportResult(result);
      setImportPassword("");
      setVaultPassword("");
    } catch (err) {
      console.error("Import failed:", err);
      alert(`Import failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center">
              <Key className="h-5 w-5 mr-2 text-purple-600" />
              Encryption Key Management
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Security Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">
                  Your Key, Your Vault, Your Responsibility
                </p>
                <p className="text-amber-700">
                  Without your encryption key, your data is{" "}
                  <strong>unrecoverable</strong>. Store backups securely and
                  never share your key with untrusted parties.
                </p>
              </div>
            </div>
          </div>

          {/* Current Key Info */}
          {keyFingerprint && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-600 mr-2" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium">Current Key</p>
                  <p className="text-green-700 font-mono text-xs mt-1">
                    Fingerprint: {keyFingerprint.substring(0, 16)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* Import Success */}
          {importResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium">
                    Key Import Successful
                  </p>
                  <p className="text-green-700 mt-1">
                    Successfully imported and logged in with key from{" "}
                    {importResult.importResult.deviceFingerprint}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("export")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "export"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Download className="h-4 w-4 inline mr-2" />
              Export Key
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "import"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Import Key
            </button>
          </div>

          {/* Export Tab */}
          {activeTab === "export" && (
            <div className="space-y-6">
              {/* Quick Export Options */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Quick Export</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={loading}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <Copy className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">
                      Copy to Clipboard
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Auto-clears in 30s
                    </div>
                    {copiedToClipboard && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Copied!
                      </div>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadUnprotected}
                    disabled={loading}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <FileText className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">
                      Download JSON
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Unprotected
                    </div>
                  </button>

                  <button
                    onClick={generateQRCode}
                    disabled={loading}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <QrCode className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">
                      Generate QR Code
                    </div>
                    <div className="text-xs text-gray-500 mt-1">For mobile</div>
                  </button>
                </div>
              </div>

              {/* QR Code Display */}
              {qrCodeUrl && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h5 className="font-medium text-gray-900 mb-4">QR Code</h5>
                  <img
                    src={qrCodeUrl}
                    alt="Encryption Key QR Code"
                    className="mx-auto mb-4 border rounded"
                  />
                  <div className="text-xs text-gray-500">
                    Scan this QR code on another device to import your key
                  </div>
                  <button
                    onClick={clearQrCode}
                    className="mt-3 text-sm text-purple-600 hover:text-purple-700"
                  >
                    Clear QR Code
                  </button>
                </div>
              )}

              {/* Protected Export */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Password-Protected Export
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Password
                    </label>
                    <div className="relative">
                      <input
                        type={showExportPassword ? "text" : "password"}
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        placeholder="Enter password to protect key file"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                        disabled={loading}
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowExportPassword(!showExportPassword)
                        }
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showExportPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Minimum 8 characters. This password will be required to
                      import the key file.
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadProtected}
                    disabled={
                      loading || !exportPassword || exportPassword.length < 8
                    }
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Download Protected Key File (.vaultkey)
                  </button>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Advanced Options & Security Info
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-3">
                    <div>
                      <strong>Security Details:</strong>
                      <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                        <li>Keys are exported with AES-256-GCM encryption</li>
                        <li>
                          PBKDF2 with 100,000 iterations for key derivation
                        </li>
                        <li>SHA-256 fingerprints for integrity verification</li>
                        <li>Device fingerprints track key export source</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Storage Recommendations:</strong>
                      <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                        <li>Store in secure password manager</li>
                        <li>Keep offline backup in secure location</li>
                        <li>Never store unencrypted keys in cloud storage</li>
                        <li>Consider printing protected key files</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === "import" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Import Encryption Key
                </h4>
                <div className="text-sm text-gray-600 mb-4">
                  Import a previously exported key to access your vault from
                  this device or restore from backup.
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-600 mb-3">
                    Click to select a key file (.json or .vaultkey)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.vaultkey"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={loading}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Select Key File
                  </button>
                </div>

                {/* Import Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Password (if protected)
                    </label>
                    <div className="relative">
                      <input
                        type={showImportPassword ? "text" : "password"}
                        value={importPassword}
                        onChange={(e) => setImportPassword(e.target.value)}
                        placeholder="Enter export password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowImportPassword(!showImportPassword)
                        }
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showImportPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Required for .vaultkey files
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vault Password
                    </label>
                    <div className="relative">
                      <input
                        type={showVaultPassword ? "text" : "password"}
                        value={vaultPassword}
                        onChange={(e) => setVaultPassword(e.target.value)}
                        placeholder="Enter your vault password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowVaultPassword(!showVaultPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showVaultPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Required to login after import
                    </div>
                  </div>
                </div>

                {/* Import Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Import Process</p>
                      <p>
                        Importing a key will verify its integrity, decrypt your
                        vault, and log you in automatically. Your current
                        session will be replaced.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-purple-600/20 border-t-purple-600 rounded-full mx-auto mb-3" />
                <div className="text-sm text-gray-600">Processing...</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <a
                href="https://github.com/anthropics/violet-vault/wiki/encryption"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-gray-700"
              >
                Learn more about VioletVault encryption
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
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
