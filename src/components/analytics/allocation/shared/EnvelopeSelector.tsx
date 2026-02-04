/**
 * Envelope Selector Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Multi-select envelope picker for trend chart filtering
 */

import React from "react";
import Button from "@/components/ui/buttons/Button";

export interface EnvelopeSelectorProps {
  envelopes: Array<{ id: string; name: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  className?: string;
}

/**
 * EnvelopeSelector Component
 *
 * Provides multi-select envelope filtering with max selection limit
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 *
 * return (
 *   <EnvelopeSelector
 *     envelopes={[
 *       { id: "1", name: "Groceries" },
 *       { id: "2", name: "Rent" }
 *     ]}
 *     selected={selected}
 *     onChange={setSelected}
 *     maxSelections={10}
 *   />
 * );
 * ```
 */
export const EnvelopeSelector: React.FC<EnvelopeSelectorProps> = ({
  envelopes,
  selected,
  onChange,
  maxSelections = 10,
  className = "",
}) => {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < maxSelections) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Envelopes ({selected.length}/{maxSelections})
        </span>
        {selected.length > 0 && (
          <Button
            onClick={() => onChange([])}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {envelopes.map((env) => {
          const isSelected = selected.includes(env.id);
          const isDisabled = !isSelected && selected.length >= maxSelections;

          return (
            <Button
              key={env.id}
              onClick={() => handleToggle(env.id)}
              disabled={isDisabled}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                    : isDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }
              `}
            >
              {env.name}
            </Button>
          );
        })}
      </div>

      {selected.length >= maxSelections && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Maximum {maxSelections} envelopes selected. Deselect one to choose another.
        </p>
      )}
    </div>
  );
};

export default EnvelopeSelector;
