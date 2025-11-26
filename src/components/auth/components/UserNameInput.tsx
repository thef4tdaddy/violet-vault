interface UserNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * User Name Input Component
 * Name input field with proper labeling and validation
 * Extracted from UserSetup with UI standards compliance
 */
const UserNameInput = ({
  value,
  onChange,
  disabled = false,
  placeholder = "e.g., Sarah, John, etc.",
}: UserNameInputProps) => {
  return (
    <div>
      <label className="block text-base font-black text-black mb-3 uppercase tracking-wider">
        <span className="text-lg">Y</span>OUR <span className="text-lg">N</span>
        AME
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 bg-white/90"
        disabled={disabled}
        required
      />
    </div>
  );
};

export default UserNameInput;
