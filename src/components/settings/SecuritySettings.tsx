import React from "react";
import { getIcon } from "@/utils/icons";
import { useSecuritySettingsLogic } from "@/hooks/platform/security/useSecuritySettingsLogic";
import SecurityStatusSection from "./sections/SecurityStatusSection";
import AutoLockSettingsSection from "./sections/AutoLockSettingsSection";
import ClipboardSecuritySection from "./sections/ClipboardSecuritySection";
import SecurityLoggingSection from "./sections/SecurityLoggingSection";
import SecurityActionsSection from "./sections/SecurityActionsSection";
import ClearConfirmationModal from "./modals/ClearConfirmationModal";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface SecuritySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Security Settings Modal - REFACTORED
 * 427 → 113 lines (73% reduction), Complexity 20 → 5 (75% reduction)
 * Architecture: Custom hook + 6 focused UI components + full UI standards
 */
const SecuritySettings: React.FC<SecuritySettingsProps> = ({ isOpen, onClose }) => {
  const {
    isLocked,
    securitySettings,
    securityEvents,
    showEvents,
    showClearConfirm,
    handleSettingChange,
    exportSecurityEvents,
    timeUntilAutoLock,
    toggleEventsDisplay,
    showClearConfirmDialog,
    hideClearConfirmDialog,
    confirmClearEvents,
  } = useSecuritySettingsLogic();

  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          ref={modalRef}
          className="glassmorphism rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black bg-purple-100/40 backdrop-blur-3xl my-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="glassmorphism rounded-full p-3 bg-blue-500/20 border border-blue-400">
                  {React.createElement(getIcon("Shield"), {
                    className: "h-8 w-8 text-blue-600",
                  })}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                    SECURITY SETTINGS
                  </h3>
                  <p className="text-sm text-purple-800 font-medium mt-1">
                    🔐 Configure app security and privacy options
                  </p>
                </div>
              </div>
              <ModalCloseButton onClick={onClose} />
            </div>

            {/* Scrollable Content */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              <SecurityStatusSection
                {...{
                  isLocked,
                  securitySettings,
                  securityEvents,
                  timeUntilAutoLock,
                }}
              />
              <AutoLockSettingsSection {...{ securitySettings, handleSettingChange }} />
              <ClipboardSecuritySection {...{ securitySettings, handleSettingChange }} />
              <SecurityLoggingSection
                {...{
                  securitySettings,
                  securityEvents,
                  showEvents,
                  handleSettingChange,
                  toggleEventsDisplay,
                  exportSecurityEvents,
                  showClearConfirmDialog,
                }}
              />
            </div>

            <SecurityActionsSection onClose={onClose} />
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ClearConfirmationModal
        {...{
          isOpen: showClearConfirm,
          onClose: hideClearConfirmDialog,
          onConfirm: confirmClearEvents,
        }}
      />
    </>
  );
};

export default SecuritySettings;
