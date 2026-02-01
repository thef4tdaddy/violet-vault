import React from "react";
import Button from "@/components/ui/buttons/Button";

interface FrequencySelectorProps {
  frequency: "weekly" | "biweekly" | "monthly";
  setFrequency: (freq: "weekly" | "biweekly" | "monthly") => void;
  wasAutoDetected: boolean;
  setWasAutoDetected: (detected: boolean) => void;
  detectionMessage: string | null;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  frequency,
  setFrequency,
  wasAutoDetected,
  setWasAutoDetected,
  detectionMessage,
}) => (
  <div className="mb-6 p-4 bg-slate-50 hard-border rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <label className="block text-sm font-bold text-slate-900">PAYCHECK FREQUENCY</label>
      {wasAutoDetected && (
        <span className="px-2 py-1 bg-fuchsia-100 hard-border rounded text-xs font-bold text-fuchsia-700">
          ✨ Auto-detected
        </span>
      )}
    </div>
    <div className="flex gap-3">
      {(["weekly", "biweekly", "monthly"] as const).map((f) => (
        <Button
          key={f}
          type="button"
          onClick={() => {
            setFrequency(f);
            setWasAutoDetected(false);
          }}
          className={`px-4 py-2 hard-border rounded-lg font-bold text-sm transition-all ${
            frequency === f
              ? "bg-fuchsia-500 text-white border-fuchsia-600"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {f.toUpperCase()}
        </Button>
      ))}
    </div>
    {detectionMessage && wasAutoDetected ? (
      <p className="text-xs text-fuchsia-600 mt-2 font-semibold">💡 {detectionMessage}</p>
    ) : (
      <p className="text-xs text-slate-600 mt-2">
        Helps SPLIT EVENLY and SMART SPLIT calculate appropriate allocations
      </p>
    )}
  </div>
);

interface StrategySelectorProps {
  selectedStrategy: string | null;
  onLastSplit: () => void;
  onEvenSplit: () => void;
  onSmartSplit: () => void;
  loading: boolean;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onLastSplit,
  onEvenSplit,
  onSmartSplit,
  loading,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <StrategyButton
      icon="🔄"
      title="USE LAST SPLIT"
      desc="Same as your previous paycheck"
      colorClass="purple"
      isActive={selectedStrategy === "last_split"}
      onClick={onLastSplit}
      disabled={loading}
    />
    <StrategyButton
      icon="⚖️"
      title="SPLIT EVENLY"
      desc="Weighted by monthly targets"
      colorClass="blue"
      isActive={selectedStrategy === "even_split"}
      onClick={onEvenSplit}
      disabled={loading}
    />
    <StrategyButton
      icon="✨"
      title="SMART SPLIT"
      desc="AI-powered suggestions"
      colorClass="fuchsia"
      isActive={selectedStrategy === "smart_split"}
      onClick={onSmartSplit}
      disabled={loading}
    />
  </div>
);

interface StrategyButtonProps {
  icon: string;
  title: string;
  desc: string;
  colorClass: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const StrategyButton: React.FC<StrategyButtonProps> = ({
  icon,
  title,
  desc,
  colorClass,
  isActive,
  onClick,
  disabled,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    className={`p-6 hard-border rounded-lg transition-all text-left ${
      isActive
        ? `bg-${colorClass}-100 border-${colorClass}-500 border-2`
        : `bg-${colorClass}-50 hover:bg-${colorClass}-100`
    }`}
  >
    <div className="text-2xl mb-2">{icon}</div>
    <div className="font-black text-slate-900 mb-1">{title}</div>
    <div className="text-sm text-slate-600">{desc}</div>
  </Button>
);
