import React from "react";
import { Shield, X } from "lucide-react";

/**
 * Shared security header component for lock screens and security settings
 * Provides consistent branding and typography across security interfaces
 *
 * @param {string} title - Main title text (will be converted to ALL CAPS pattern)
 * @param {string} subtitle - Subtitle text (uses purple-900 branding)
 * @param {Function} onClose - Optional close handler for modal-style interfaces
 * @param {string} variant - 'modal' | 'fullscreen' for different styling contexts
 */
const SecurityHeader = ({
  title = "SECURITY",
  subtitle,
  onClose,
  variant = "modal",
  className = "",
}) => {
  // Convert title to ALL CAPS pattern with larger first letters
  const formatTitle = (text) => {
    const words = text.toUpperCase().split(" ");
    return words.map((word, wordIndex) => (
      <React.Fragment key={wordIndex}>
        {wordIndex > 0 && " "}
        <span className={variant === "fullscreen" ? "text-3xl" : "text-xl"}>
          {word[0]}
        </span>
        {word.slice(1)}
      </React.Fragment>
    ));
  };

  const headerStyles =
    variant === "fullscreen"
      ? "text-2xl font-black text-white mb-2"
      : "text-lg font-black text-black";

  const subtitleStyles =
    variant === "fullscreen" ? "text-purple-200" : "text-sm text-purple-900";

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <Shield
          className={`h-6 w-6 ${variant === "fullscreen" ? "text-white" : "text-blue-600"}`}
        />
        <div>
          <h3 className={headerStyles}>{formatTitle(title)}</h3>
          {subtitle && <p className={subtitleStyles}>{subtitle}</p>}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 border-2 border-black rounded"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SecurityHeader;
