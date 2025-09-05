import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import PasswordField from "./PasswordField";

const ImportSection = ({
  importPassword,
  vaultPassword,
  showImportPassword,
  showVaultPassword,
  importResult,
  loading,
  fileInputRef,
  onUpdatePassword,
  onTogglePasswordVisibility,
  onFileImport,
}) => {
  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Import Key File</h4>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors"
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Click to select your key file
          </p>
          <p className="text-xs text-gray-500">
            Supports both protected and unprotected key files
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onFileImport}
          className="hidden"
        />
      </div>

      {/* Import Passwords */}
      <div className="space-y-4">
        <PasswordField
          label="Export Password"
          value={importPassword}
          onChange={(e) => onUpdatePassword("import", e.target.value)}
          onToggleVisibility={() => onTogglePasswordVisibility("import")}
          showPassword={showImportPassword}
          placeholder="Enter export password"
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Only required if the key file is password-protected
        </p>

        <PasswordField
          label="Vault Password"
          value={vaultPassword}
          onChange={(e) => onUpdatePassword("vault", e.target.value)}
          onToggleVisibility={() => onTogglePasswordVisibility("vault")}
          showPassword={showVaultPassword}
          placeholder="Enter your vault password"
          disabled={loading}
          required
        />
        <p className="text-xs text-gray-500">
          Your current vault password to complete the import
        </p>
      </div>

      {/* Import Result */}
      {importResult && (
        <div
          className={`p-4 rounded-lg border ${
            importResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  importResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {importResult.success ? "Import Successful!" : "Import Failed"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  importResult.success ? "text-green-700" : "text-red-700"
                }`}
              >
                {importResult.success
                  ? `Successfully imported key for user: ${importResult.user || "Unknown"}`
                  : importResult.error || "An error occurred during import"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportSection;
