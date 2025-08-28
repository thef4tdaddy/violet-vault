import React from "react";
import { X, CheckCircle, Sparkles } from "lucide-react";

/**
 * Shared component for displaying connected entity relationships in modals
 * Provides consistent styling and behavior across debt, envelope, and bill modals
 */
const ConnectionDisplay = ({
  title = "Connected",
  icon: IconComponent,
  onDisconnect,
  children,
  isVisible = true,
  className = "",
  theme = "purple", // Default to purple theme for violet branding
}) => {
  if (!isVisible) return null;

  // Theme configurations for different contexts
  const themes = {
    purple: {
      container: "bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-300",
      titleText: "text-purple-800",
      iconColor: "text-purple-600",
    },
    green: {
      container: "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300",
      titleText: "text-green-800",
      iconColor: "text-green-600",
    },
    yellow: {
      container: "bg-yellow-50 border border-yellow-200",
      titleText: "text-yellow-800",
      iconColor: "text-yellow-600",
    },
  };

  const currentTheme = themes[theme] || themes.purple;

  return (
    <div className={`${currentTheme.container} rounded-xl p-6 mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <label className={`block text-lg font-bold ${currentTheme.titleText} flex items-center`}>
          {IconComponent && <IconComponent className={`h-6 w-6 mr-3 ${currentTheme.iconColor}`} />}
          🔗 {title}
        </label>
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Disconnect
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

/**
 * Sub-component for displaying individual connection items
 */
export const ConnectionItem = ({
  icon: IconComponent,
  title,
  details,
  badge,
  badgeColor = "purple",
  theme = "purple",
}) => {
  const badgeColors = {
    green: "text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full",
    blue: "text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full",
    purple: "text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full",
    yellow: "text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full",
  };

  const themes = {
    purple: {
      border: "border-purple-200",
      iconColor: "text-purple-600",
      titleColor: "text-purple-800",
      detailColor: "text-purple-700",
    },
    green: {
      border: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      detailColor: "text-green-700",
    },
    yellow: {
      border: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      detailColor: "text-yellow-700",
    },
  };

  const currentTheme = themes[theme] || themes.purple;

  return (
    <div className={`flex items-center p-3 bg-white rounded-lg border ${currentTheme.border}`}>
      {IconComponent && <IconComponent className={`h-5 w-5 mr-3 ${currentTheme.iconColor}`} />}
      <div className="flex-1">
        <div className={`font-medium ${currentTheme.titleColor}`}>{title}</div>
        {details && <div className={`text-sm ${currentTheme.detailColor}`}>{details}</div>}
      </div>
      {badge && <div className={badgeColors[badgeColor] || badgeColors.purple}>{badge}</div>}
    </div>
  );
};

/**
 * Sub-component for connection info/help text
 */
export const ConnectionInfo = ({ children, className = "", theme = "purple" }) => {
  const themes = {
    purple: "bg-purple-100 border border-purple-300 text-purple-700",
    green: "bg-green-100 border border-green-300 text-green-700",
    yellow: "bg-yellow-100 border border-yellow-300 text-yellow-700",
  };

  const themeClasses = themes[theme] || themes.purple;

  return (
    <div className={`mt-3 p-3 ${themeClasses} rounded-lg ${className}`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};

/**
 * Bill Connection Component - handles both selection and display
 * Shows dropdown when no connection, shows display when connected
 */
export const BillConnectionSelector = ({
  selectedBillId,
  onBillSelection,
  onDisconnect,
  allBills = [],
  currentEnvelopeId,
  canEdit = true,
  theme = "purple",
}) => {
  const connectedBill = selectedBillId ? allBills.find((bill) => bill.id === selectedBillId) : null;

  return (
    <ConnectionDisplay title="Connect to Existing Bill" icon={Sparkles} theme={theme}>
      {/* Show display-only when connected, dropdown when not connected */}
      {selectedBillId && connectedBill ? (
        /* Display current connection */
        <div className="w-full px-4 py-4 border-2 border-purple-400 rounded-xl bg-purple-50 text-base">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-3 text-purple-600" />
              <div>
                <div className="font-medium text-purple-800">
                  {`${connectedBill.name || connectedBill.provider} - $${parseFloat(connectedBill.amount || 0).toFixed(2)} (${connectedBill.frequency || "monthly"})`}
                </div>
                <div className="text-xs text-purple-600 mt-1">Connected to bill</div>
              </div>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={onDisconnect}
                className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-lg transition-colors flex items-center"
                title="Disconnect from bill"
              >
                <X className="h-3 w-3 mr-1" />
                Disconnect
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Show dropdown when not connected */
        <select
          value={selectedBillId || ""}
          onChange={(e) => onBillSelection(e.target.value)}
          disabled={!canEdit}
          className={`w-full px-4 py-4 border-2 border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-md text-base ${
            !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        >
          <option value="">
            {allBills && allBills.length > 0
              ? "Choose a bill to auto-populate settings..."
              : `No bills available (${allBills ? allBills.length : "undefined"} found)`}
          </option>
          {allBills &&
            allBills
              .filter((bill) => !bill.envelopeId || bill.envelopeId === currentEnvelopeId)
              .map((bill) => (
                <option key={bill.id} value={bill.id}>
                  {bill.name || bill.provider} - ${parseFloat(bill.amount || 0).toFixed(2)} (
                  {bill.frequency || "monthly"})
                </option>
              ))}
        </select>
      )}

      <p className="text-sm text-purple-700 mt-3 font-medium">
        📝 <strong>Tip:</strong> Connect a bill to automatically fill envelope details like name,
        amount, and category. Works for all envelope types.
      </p>

      {(!allBills || allBills.length === 0) && (
        <p className="text-sm text-red-600 mt-3 font-medium">
          ⚠️ No bills found. Create bills first to connect them to envelopes.
        </p>
      )}
    </ConnectionDisplay>
  );
};

export default ConnectionDisplay;
