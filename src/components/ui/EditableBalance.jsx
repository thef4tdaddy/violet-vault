import React, { useState, useRef, useEffect } from "react";
import { Edit3, Check, X, AlertTriangle } from "lucide-react";

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
  confirmThreshold = 1000, // Show confirmation for changes > $1000
  formatCurrency = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "0");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value?.toString() || "0");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatNumber = (num) => {
    if (!formatCurrency) return num?.toFixed(2) || "0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num || 0);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(value?.toString() || "0");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value?.toString() || "0");
    setShowConfirmation(false);
    setPendingValue(null);
  };

  const handleSave = () => {
    const newValue = parseFloat(editValue) || 0;
    const currentValue = parseFloat(value) || 0;
    const changeMagnitude = Math.abs(newValue - currentValue);

    // Show confirmation for large changes
    if (changeMagnitude >= confirmThreshold) {
      setPendingValue(newValue);
      setShowConfirmation(true);
      return;
    }

    // Direct save for small changes
    confirmSave(newValue);
  };

  const confirmSave = (newValue) => {
    onChange(newValue);
    setIsEditing(false);
    setShowConfirmation(false);
    setPendingValue(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    // Allow numbers, decimal point, and negative sign
    if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
      setEditValue(inputValue);
    }
  };

  if (showConfirmation) {
    const currentValue = parseFloat(value) || 0;
    const changeAmount = pendingValue - currentValue;
    const isIncrease = changeAmount > 0;

    return (
      <div className={`${bgClass} rounded-lg p-6 border-2 border-yellow-300 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Confirm Large Change
          </h3>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-yellow-700">
            <p>You're about to {isIncrease ? "increase" : "decrease"} your balance by:</p>
            <p className="font-bold text-lg">
              {isIncrease ? "+" : ""}
              {formatNumber(changeAmount)}
            </p>
            <p className="mt-2">
              From: {formatNumber(currentValue)} → To: {formatNumber(pendingValue)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => confirmSave(pendingValue)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Check className="h-4 w-4" />
              Confirm
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
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
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="flex-1 text-2xl font-bold bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                title="Save"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Enter amount and press Enter to save, or Escape to cancel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgClass} rounded-lg p-6 cursor-pointer transition-colors ${hoverClass} group ${className}`}
      onClick={handleStartEdit}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700 flex items-center gap-2">
          {title}
          {isManuallySet && <span className="text-xs text-gray-500">(Manual)</span>}
          <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
        </h3>
      </div>

      <div className="space-y-3">
        <div className={`text-2xl font-bold ${colorClass} flex items-center justify-between`}>
          {formatNumber(value)}
          <div className="opacity-0 group-hover:opacity-50 transition-opacity">
            <Edit3 className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm text-gray-600 group-hover:text-gray-800">{subtitle}</p>
      </div>
    </div>
  );
};

export default EditableBalance;
