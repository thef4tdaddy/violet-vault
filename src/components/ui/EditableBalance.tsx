import React, { useState, useRef, useEffect } from "react";
import { getIcon } from "@/utils";

// Format number as currency
const formatNumber = (num: number | undefined, formatCurrency: boolean): string => {
  if (!formatCurrency) return num?.toFixed(2) || "0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num || 0);
};

interface ConfirmationViewProps {
  value: number;
  pendingValue: number;
  bgClass: string;
  className: string;
  formatCurrency: boolean;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

// Confirmation view for large balance changes
const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  value,
  pendingValue,
  bgClass,
  className,
  formatCurrency,
  onConfirm,
  onCancel,
}) => {
  const currentValue = value || 0;
  const changeAmount = pendingValue - currentValue;
  const isIncrease = changeAmount > 0;

  return (
    <div className={`${bgClass} rounded-lg p-6 border-2 border-yellow-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-yellow-800 flex items-center gap-2">
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-5 w-5",
          })}
          Confirm Large Change
        </h3>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-yellow-700">
          <p>You're about to {isIncrease ? "increase" : "decrease"} your balance by:</p>
          <p className="font-bold text-lg">
            {isIncrease ? "+" : ""}
            {formatNumber(changeAmount, formatCurrency)}
          </p>
          <p className="mt-2">
            From: {formatNumber(currentValue, formatCurrency)} → To:{" "}
            {formatNumber(pendingValue, formatCurrency)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(pendingValue)}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            {React.createElement(getIcon("Check"), { className: "h-4 w-4" })}
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            {React.createElement(getIcon("X"), { className: "h-4 w-4" })}
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditViewProps {
  title: string;
  isManuallySet: boolean;
  editValue: string;
  bgClass: string;
  className: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

// Edit mode view
const EditView: React.FC<EditViewProps> = ({
  title,
  isManuallySet,
  editValue,
  bgClass,
  className,
  inputRef,
  onInputChange,
  onKeyPress,
  onSave,
  onCancel,
}) => (
  <div className={`${bgClass} rounded-lg p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-medium text-gray-700">
        {title} {isManuallySet && <span className="text-xs text-gray-500">(Manual)</span>}
      </h3>
    </div>

    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={onInputChange}
          onKeyDown={onKeyPress}
          className="flex-1 text-2xl font-bold bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
        <div className="flex gap-1">
          <button
            onClick={onSave}
            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            title="Save"
          >
            {React.createElement(getIcon("Check"), {
              className: "h-4 w-4",
            })}
          </button>
          <button
            onClick={onCancel}
            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            title="Cancel"
          >
            {React.createElement(getIcon("X"), { className: "h-4 w-4" })}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Enter amount and press Enter to save, or Escape to cancel
      </p>
    </div>
  </div>
);

interface DisplayViewProps {
  title: string;
  isManuallySet: boolean;
  value: number;
  subtitle: string;
  bgClass: string;
  hoverClass: string;
  className: string;
  colorClass: string;
  formatCurrency: boolean;
  onClick: () => void;
}

// Display mode view
const DisplayView: React.FC<DisplayViewProps> = ({
  title,
  isManuallySet,
  value,
  subtitle,
  bgClass,
  hoverClass,
  className,
  colorClass,
  formatCurrency,
  onClick,
}) => (
  <div
    className={`${bgClass} rounded-lg p-6 cursor-pointer transition-colors ${hoverClass} group ${className}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-medium text-gray-700 flex items-center gap-2">
        {title}
        {isManuallySet && <span className="text-xs text-gray-500">(Manual)</span>}
        {React.createElement(getIcon("Edit3"), {
          className: "h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity",
        })}
      </h3>
    </div>

    <div className="space-y-3">
      <div className={`text-2xl font-bold ${colorClass} flex items-center justify-between`}>
        {formatNumber(value, formatCurrency)}
        <div className="opacity-0 group-hover:opacity-50 transition-opacity">
          {React.createElement(getIcon("Edit3"), { className: "h-5 w-5" })}
        </div>
      </div>
      <p className="text-sm text-gray-600 group-hover:text-gray-800">{subtitle}</p>
    </div>
  </div>
);

interface EditableBalanceProps {
  value: number;
  onChange: (value: number) => void;
  title?: string;
  subtitle?: string;
  className?: string;
  colorClass?: string;
  bgClass?: string;
  hoverClass?: string;
  isManuallySet?: boolean;
  confirmThreshold?: number;
  formatCurrency?: boolean;
}

const EditableBalance = ({
  value,
  onChange,
  title = "Balance",
  subtitle = "Click to edit",
  className = "",
  colorClass = "text-blue-900",
  bgClass = "bg-blue-50",
  hoverClass = "hover:bg-blue-100",
  isManuallySet = false,
  confirmThreshold = 1000,
  formatCurrency = true,
}: EditableBalanceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "0");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value?.toString() || "0");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(String(value || 0));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value?.toString() || "0");
    setShowConfirmation(false);
    setPendingValue(null);
  };

  const confirmSave = (newValue: number) => {
    onChange(newValue);
    setIsEditing(false);
    setShowConfirmation(false);
    setPendingValue(null);
  };

  const handleSave = () => {
    const newValue = parseFloat(editValue) || 0;
    const currentValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    const changeMagnitude = Math.abs(newValue - currentValue);

    if (changeMagnitude >= confirmThreshold) {
      setPendingValue(newValue);
      setShowConfirmation(true);
      return;
    }

    confirmSave(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
      setEditValue(inputValue);
    }
  };

  if (showConfirmation && pendingValue !== null) {
    return (
      <ConfirmationView
        value={value}
        pendingValue={pendingValue}
        bgClass={bgClass}
        className={className}
        formatCurrency={formatCurrency}
        onConfirm={confirmSave}
        onCancel={handleCancel}
      />
    );
  }

  if (isEditing) {
    return (
      <EditView
        title={title}
        isManuallySet={isManuallySet}
        editValue={editValue}
        bgClass={bgClass}
        className={className}
        inputRef={inputRef}
        onInputChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <DisplayView
      title={title}
      isManuallySet={isManuallySet}
      value={value}
      subtitle={subtitle}
      bgClass={bgClass}
      hoverClass={hoverClass}
      className={className}
      colorClass={colorClass}
      formatCurrency={formatCurrency}
      onClick={handleStartEdit}
    />
  );
};

export default EditableBalance;
