import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../utils";
import { useConnectionManager } from "../../hooks/common/useConnectionManager";

type ThemeName = "purple" | "green" | "yellow" | "red";

interface ThemeConfig {
  container: string;
  titleText: string;
  iconColor: string;
}

interface ConnectionDisplayProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onDisconnect?: (() => void) | undefined | null;
  children: React.ReactNode;
  isVisible?: boolean;
  className?: string;
  theme?: ThemeName;
}

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
}: ConnectionDisplayProps) => {
  if (!isVisible) return null;

  // Theme configurations for different contexts
  const themes: Record<ThemeName, ThemeConfig> = {
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
    red: {
      container: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300",
      titleText: "text-red-800",
      iconColor: "text-red-600",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div className={`${currentTheme.container} rounded-xl p-6 mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <label className={`block text-lg font-bold ${currentTheme.titleText} flex items-center`}>
          {IconComponent &&
            React.createElement(IconComponent, {
              className: `h-6 w-6 mr-3 ${currentTheme.iconColor}`,
            })}
          🔗 {title}
        </label>
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors flex items-center"
          >
            {React.createElement(getIcon("X"), { className: "h-3 w-3 mr-1" })}
            Disconnect
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

type BadgeColor = "green" | "blue" | "purple" | "yellow";

interface ConnectionItemThemeConfig {
  border: string;
  iconColor: string;
  titleColor: string;
  detailColor: string;
}

interface ConnectionItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  details?: string;
  badge?: string;
  badgeColor?: BadgeColor;
  theme?: ThemeName;
}

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
}: ConnectionItemProps) => {
  const badgeColors: Record<BadgeColor, string> = {
    green: "text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full",
    blue: "text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full",
    purple: "text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full",
    yellow: "text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full",
  };

  const themes: Record<ThemeName, ConnectionItemThemeConfig> = {
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
    red: {
      border: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      detailColor: "text-red-700",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div className={`flex items-center p-3 bg-white rounded-lg border ${currentTheme.border}`}>
      {IconComponent &&
        React.createElement(IconComponent, {
          className: `h-5 w-5 mr-3 ${currentTheme.iconColor}`,
        })}
      <div className="flex-1">
        <div className={`font-medium ${currentTheme.titleColor}`}>{title}</div>
        {details && <div className={`text-sm ${currentTheme.detailColor}`}>{details}</div>}
      </div>
      {badge && <div className={badgeColors[badgeColor]}>{badge}</div>}
    </div>
  );
};

interface ConnectionInfoProps {
  children: React.ReactNode;
  className?: string;
  theme?: ThemeName;
}

/**
 * Sub-component for connection info/help text
 */
export const ConnectionInfo = ({
  children,
  className = "",
  theme = "purple",
}: ConnectionInfoProps) => {
  const themes: Record<ThemeName, string> = {
    purple: "bg-purple-100 border border-purple-300 text-purple-700",
    green: "bg-green-100 border border-green-300 text-green-700",
    yellow: "bg-yellow-100 border border-yellow-300 text-yellow-700",
    red: "bg-red-100 border border-red-300 text-red-700",
  };

  const themeClasses = themes[theme];

  return (
    <div className={`mt-3 p-3 ${themeClasses} rounded-lg ${className}`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};

interface Connection {
  id: string;
  name?: string;
  provider?: string;
  amount?: string | number;
  frequency?: string;
  description?: string;
  category?: string;
}

const formatConnectionDetails = (connection: Connection): string => {
  if (connection.amount) {
    return `$${parseFloat(String(connection.amount)).toFixed(2)} (${connection.frequency || "monthly"})`;
  }
  return connection.description || "";
};

const getConnectionIcon = (entityType: string): React.ComponentType<{ className?: string }> => {
  return entityType === "envelope" ? getIcon("Receipt") : getIcon("Target");
};

const shouldShowSelector = (
  showSelector: boolean,
  hasConnections: boolean,
  entityType: string
): boolean => {
  return showSelector && (!hasConnections || entityType === "envelope");
};

interface UniversalConnectionManagerProps {
  entityType: string;
  entityId: string | null;
  canEdit?: boolean;
  theme?: ThemeName;
  showSelector?: boolean;
}

/**
 * Universal Connection Manager Component
 * Pure UI component that uses useConnectionManager hook for all logic
 * Context-aware: shows appropriate relationships and options
 */
export const UniversalConnectionManager = ({
  entityType,
  entityId,
  canEdit = true,
  theme = "purple",
  showSelector = true,
}: UniversalConnectionManagerProps) => {
  const managerProps = useConnectionManager(
    entityType as "bill" | "envelope" | "debt",
    entityId ?? ""
  ) as unknown as ConnectionManagerProps;
  const config = managerProps.getConnectionConfig();

  // Don't render if no entityId provided
  if (!entityId) return null;

  return (
    <div className="space-y-4">
      {managerProps.hasConnections && (
        <ExistingConnections
          config={config}
          entityType={entityType}
          theme={theme}
          canEdit={canEdit}
          connections={managerProps.currentConnections}
          onDisconnect={managerProps.handleDisconnect}
        />
      )}
      {shouldShowSelector(showSelector, managerProps.hasConnections, entityType) && (
        <ConnectionSelector
          config={config}
          theme={theme}
          canEdit={canEdit}
          managerProps={managerProps}
        />
      )}
    </div>
  );
};

interface ConnectionConfig {
  displayTitle: string;
  selectTitle: string;
  selectPrompt: string;
  connectionType: string;
  tip: string;
}

interface ExistingConnectionsProps {
  config: ConnectionConfig;
  entityType: string;
  theme: ThemeName;
  canEdit: boolean;
  connections: Connection[] | unknown[];
  onDisconnect?: () => void;
}

const ExistingConnections = ({
  config,
  entityType,
  theme,
  canEdit,
  connections,
  onDisconnect,
}: ExistingConnectionsProps) => (
  <ConnectionDisplay
    title={config.displayTitle}
    icon={getConnectionIcon(entityType)}
    theme={theme}
    onDisconnect={canEdit ? onDisconnect : undefined}
  >
    <div className="space-y-2">
      {(connections as Connection[]).map((connection: Connection) => (
        <ConnectionItem
          key={connection.id}
          icon={getIcon("CheckCircle")}
          title={connection.name || connection.provider || "Unnamed"}
          details={formatConnectionDetails(connection)}
          badge={connection.category}
          theme={theme}
        />
      ))}
    </div>
  </ConnectionDisplay>
);

interface ConnectionManagerProps {
  currentConnections: Connection[] | unknown[];
  availableOptions: Connection[] | unknown[];
  selectedConnectionId: string | null;
  hasConnections: boolean;
  hasAvailableOptions: boolean;
  canConnect: boolean;
  isConnecting: boolean;
  getConnectionConfig: () => ConnectionConfig;
  handleConnect: () => void;
  handleDisconnect: () => void;
  handleSelectionChange: (value: string) => void;
}

interface ConnectionSelectorProps {
  config: ConnectionConfig;
  theme: ThemeName;
  canEdit: boolean;
  managerProps: ConnectionManagerProps;
}

const ConnectionSelector = ({ config, theme, canEdit, managerProps }: ConnectionSelectorProps) => (
  <ConnectionDisplay title={config.selectTitle} icon={getIcon("Sparkles")} theme={theme}>
    <ConnectionDropdown config={config} canEdit={canEdit} managerProps={managerProps} />
    {managerProps.selectedConnectionId && (
      <ConnectButton
        onClick={managerProps.handleConnect}
        canConnect={managerProps.canConnect}
        isConnecting={managerProps.isConnecting}
      />
    )}
    <ConnectionInfo theme={theme}>
      📝 <strong>Tip:</strong> {config.tip}
    </ConnectionInfo>
    {!managerProps.hasAvailableOptions && (
      <ConnectionInfo theme="yellow">
        ⚠️ No {config.connectionType}s found. Create {config.connectionType}s first to connect them.
      </ConnectionInfo>
    )}
  </ConnectionDisplay>
);

interface ConnectionDropdownProps {
  config: ConnectionConfig;
  canEdit: boolean;
  managerProps: ConnectionManagerProps;
}

const ConnectionDropdown = ({ config, canEdit, managerProps }: ConnectionDropdownProps) => {
  const options = [
    {
      value: "",
      label: managerProps.hasAvailableOptions
        ? config.selectPrompt
        : `No ${config.connectionType}s available`,
    },
    ...(managerProps.availableOptions as Connection[]).map((option: Connection) => ({
      value: option.id,
      label: `${option.name || option.provider} - $${parseFloat(String(option.amount || 0)).toFixed(2)} (${option.frequency || "monthly"})`,
    })),
  ];

  return (
    <Select
      value={managerProps.selectedConnectionId || ""}
      onChange={(e) => managerProps.handleSelectionChange(e.target.value)}
      disabled={!canEdit || managerProps.isConnecting}
      options={options}
      className={`w-full px-4 py-4 border-2 border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-md text-base ${
        !canEdit || managerProps.isConnecting ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  );
};

interface ConnectButtonProps {
  onClick: () => void;
  canConnect: boolean;
  isConnecting: boolean;
}

const ConnectButton = ({ onClick, canConnect, isConnecting }: ConnectButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!canConnect || isConnecting}
    className={`mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
      canConnect && !isConnecting
        ? "bg-purple-600 hover:bg-purple-700 text-white"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
  >
    {isConnecting ? "Connecting..." : "Connect"}
  </button>
);

export default ConnectionDisplay;
