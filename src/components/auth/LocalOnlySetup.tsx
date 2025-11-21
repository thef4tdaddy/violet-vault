import React, { useState } from "react";
import { globalToast } from "@/stores/ui/toastStore";
import { useLocalOnlyMode } from "@/hooks/common/useLocalOnlyMode";
import UnsupportedBrowserView from "./setup/UnsupportedBrowserView";
import SetupHeader from "./setup/SetupHeader";
import WelcomeStep from "./setup/WelcomeStep";
import CustomizeStep from "./setup/CustomizeStep";
import ImportStep from "./setup/ImportStep";
import ErrorDisplay from "./local-only/ErrorDisplay";
import logger from "@/utils/common/logger";

interface LocalOnlySetupProps {
  onModeSelected: (mode: string) => void;
  onSwitchToAuth: () => void;
}

// Custom hook for setup logic
const useSetupLogic = (
  onModeSelected: (mode: string) => void,
  clearError: () => void,
  enterLocalOnlyMode: (userData: {
    userName: string;
    userColor: string;
  }) => Promise<{ success: boolean; error: string }>,
  importData: (data: unknown) => Promise<{ success: boolean; error: string }>,
  validateImportFile: (data: unknown) => { valid: boolean; error?: string }
) => {
  const handleStartLocalOnly = async (userName: string, userColor: string) => {
    try {
      clearError();
      await enterLocalOnlyMode({
        userName: userName.trim(),
        userColor,
      });
      onModeSelected("local-only");
    } catch (err) {
      logger.error("Failed to start local-only mode:", err);
    }
  };

  const handleImportAndStart = async (importFile: File | null) => {
    if (!importFile) {
      globalToast.showError("Please select a file to import", "File Required", 8000);
      return;
    }

    try {
      clearError();
      const fileText = await importFile.text();
      const fileData = JSON.parse(fileText);

      const validation = validateImportFile(fileData);
      if (!validation.valid) {
        globalToast.showError(`Invalid import file: ${validation.error}`, "Invalid File", 8000);
        return;
      }

      await importData(fileData);
      await enterLocalOnlyMode(fileData.user);
      onModeSelected("local-only");
    } catch (err: unknown) {
      logger.error("Failed to import and start:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      globalToast.showError(`Import failed: ${errorMessage}`, "Import Failed", 8000);
    }
  };

  return { handleStartLocalOnly, handleImportAndStart };
};

const LocalOnlySetup: React.FC<LocalOnlySetupProps> = ({ onModeSelected, onSwitchToAuth }) => {
  const {
    loading,
    error,
    clearError,
    enterLocalOnlyMode,
    importData,
    validateImportFile,
    isLocalOnlyModeSupported,
  } = useLocalOnlyMode();

  const [step, setStep] = useState("welcome");
  const [userName, setUserName] = useState("Local User");
  const [userColor, setUserColor] = useState("#a855f7");
  const [importFile, setImportFile] = useState<File | null>(null);

  const { handleStartLocalOnly, handleImportAndStart } = useSetupLogic(
    onModeSelected,
    clearError,
    enterLocalOnlyMode,
    importData,
    validateImportFile
  );

  const support = isLocalOnlyModeSupported();

  if (!support.supported) {
    return <UnsupportedBrowserView onSwitchToAuth={onSwitchToAuth} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl border border-white/30 shadow-2xl overflow-hidden">
        <SetupHeader />

        <div className="p-6">
          <ErrorDisplay error={error} />

          {step === "welcome" && (
            <WelcomeStep
              loading={loading}
              onStartFresh={() => setStep("customize")}
              onStartImport={() => setStep("import")}
              onSwitchToAuth={onSwitchToAuth}
            />
          )}

          {step === "customize" && (
            <CustomizeStep
              userName={userName}
              userColor={userColor}
              loading={loading}
              onUserNameChange={setUserName}
              onUserColorChange={setUserColor}
              onBack={() => setStep("welcome")}
              onStart={() => handleStartLocalOnly(userName, userColor)}
            />
          )}

          {step === "import" && (
            <ImportStep
              importFile={importFile}
              loading={loading}
              onFileChange={setImportFile}
              onBack={() => setStep("welcome")}
              onImport={handleImportAndStart}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalOnlySetup;
