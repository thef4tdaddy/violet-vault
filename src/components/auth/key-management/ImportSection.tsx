import React from "react";
import { getIcon } from "@/utils";
import PasswordField from "./PasswordField";

interface ImportSectionProps {
  importPassword: string;
  vaultPassword: string;
  showImportPassword: boolean;
  showVaultPassword: boolean;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpdatePassword: (field: string, value: string) => void;
  onTogglePasswordVisibility: (field: string) => void;
  onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportSection: React.FC<ImportSectionProps> = ({
  importPassword,
  vaultPassword,
  showImportPassword,
  showVaultPassword,
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
          {React.createElement(getIcon("Upload"), {
            className: "h-8 w-8 text-gray-400 mx-auto mb-3",
          })}
          <p className="text-sm text-gray-600 mb-2">Click to select your key file</p>
          <p className="text-xs text-gray-500">Supports both protected and unprotected key files</p>
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
        <p className="text-xs text-gray-500">Only required if the key file is password-protected</p>

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
        <p className="text-xs text-gray-500">Your current vault password to complete the import</p>
      </div>
    </div>
  );
};

export default ImportSection;
