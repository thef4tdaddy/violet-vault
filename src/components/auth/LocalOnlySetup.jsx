import React, { useState } from "react";
import {
  Shield,
  ShieldOff,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Palette,
  User,
} from "lucide-react";
import { useLocalOnlyMode } from "../../hooks/useLocalOnlyMode";
import logoOnly from "../../assets/icon-512x512.png";

const LocalOnlySetup = ({ onModeSelected, onSwitchToAuth }) => {
  const {
    loading,
    error,
    clearError,
    enterLocalOnlyMode,
    importData,
    validateImportFile,
    isLocalOnlyModeSupported,
  } = useLocalOnlyMode();

  const [step, setStep] = useState("welcome"); // welcome, customize, import
  const [userName, setUserName] = useState("Local User");
  const [userColor, setUserColor] = useState("#a855f7");
  const [importFile, setImportFile] = useState(null);
  const [_showAdvanced, _setShowAdvanced] = useState(false);

  const colors = [
    { name: "Purple", value: "#a855f7" },
    { name: "Emerald", value: "#10b981" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
  ];

  const support = isLocalOnlyModeSupported();

  const handleStartLocalOnly = async () => {
    try {
      clearError();
      await enterLocalOnlyMode({
        userName: userName.trim(),
        userColor,
      });
      onModeSelected("local-only");
    } catch (err) {
      console.error("Failed to start local-only mode:", err);
    }
  };

  const handleImportAndStart = async () => {
    if (!importFile) {
      alert("Please select a file to import");
      return;
    }

    try {
      clearError();
      const fileText = await importFile.text();
      const fileData = JSON.parse(fileText);

      const validation = validateImportFile(fileData);
      if (!validation.valid) {
        alert(`Invalid import file: ${validation.error}`);
        return;
      }

      await importData(fileData);
      await enterLocalOnlyMode(fileData.user);
      onModeSelected("local-only");
    } catch (err) {
      console.error("Failed to import and start:", err);
      alert(`Import failed: ${err.message}`);
    }
  };

  if (!support.supported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glassmorphism rounded-2xl p-8 w-full max-w-md text-center border border-white/30 shadow-2xl">
          <ShieldOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Local-Only Mode Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support the features required for local-only
            mode.
          </p>
          <button
            onClick={onSwitchToAuth}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Use Standard Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl border border-white/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/20">
          <div className="flex items-center justify-center mb-4">
            <img src={logoOnly} alt="VioletVault" className="h-16 w-16 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Local-Only Mode
              </h1>
              <p className="text-gray-600">
                Privacy-first budgeting without cloud sync
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* Welcome Step */}
          {step === "welcome" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-900 font-medium mb-2">
                      Complete Privacy
                    </p>
                    <ul className="text-blue-800 space-y-1 text-sm">
                      <li>• No cloud sync or account required</li>
                      <li>• All data stored locally on your device</li>
                      <li>• Works completely offline</li>
                      <li>• You control all data export and deletion</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-900 font-medium mb-2">
                      Important Limitations
                    </p>
                    <ul className="text-amber-800 space-y-1 text-sm">
                      <li>• Data is not backed up automatically</li>
                      <li>• Clearing browser data will delete your budget</li>
                      <li>• Cannot sync between multiple devices</li>
                      <li>• No password protection (device security only)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep("customize")}
                  disabled={loading}
                  className="p-4 border border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 text-left"
                >
                  <User className="h-6 w-6 text-purple-600 mb-2" />
                  <div className="font-medium text-gray-900">Start Fresh</div>
                  <div className="text-sm text-gray-600">
                    Create a new local-only budget
                  </div>
                </button>

                <button
                  onClick={() => setStep("import")}
                  disabled={loading}
                  className="p-4 border border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 text-left"
                >
                  <Upload className="h-6 w-6 text-green-600 mb-2" />
                  <div className="font-medium text-gray-900">Import Data</div>
                  <div className="text-sm text-gray-600">
                    Restore from previous export
                  </div>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={onSwitchToAuth}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Use standard mode with cloud sync instead
                </button>
              </div>
            </div>
          )}

          {/* Customize Step */}
          {step === "customize" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customize Your Profile
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Palette className="h-4 w-4 inline mr-1" />
                      Profile Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setUserColor(color.value)}
                          className={`w-12 h-12 rounded-xl border-2 transition-all ${
                            userColor === color.value
                              ? "border-gray-900 scale-110 shadow-lg ring-2 ring-purple-200"
                              : "border-gray-200 hover:border-gray-400 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      PREVIEW
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: userColor }}
                      />
                      <span className="font-semibold text-gray-900">
                        {userName.trim() || "Your Name"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("welcome")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartLocalOnly}
                  disabled={loading || !userName.trim()}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Start Local-Only Mode"}
                </button>
              </div>
            </div>
          )}

          {/* Import Step */}
          {step === "import" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Import Previous Data
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-600 mb-3">
                    Select a previously exported VioletVault local-only backup
                    file
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="hidden"
                    id="importFile"
                  />
                  <label
                    htmlFor="importFile"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    Select File
                  </label>
                  {importFile && (
                    <div className="mt-3 text-sm text-green-600">
                      ✓ {importFile.name} selected
                    </div>
                  )}
                </div>

                {importFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Import Process</p>
                      <p>
                        This will restore your envelopes, transactions, and
                        settings from the backup file. Your existing local data
                        (if any) will be replaced.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("welcome")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImportAndStart}
                  disabled={loading || !importFile}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Importing..." : "Import & Start"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalOnlySetup;
