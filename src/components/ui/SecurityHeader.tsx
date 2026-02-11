import React from "react";
import { getIcon } from "../../utils";

interface SecurityHeaderProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  variant?: "modal" | "fullscreen";
  className?: string;
}

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
}: SecurityHeaderProps) => {
  // Convert title to ALL CAPS pattern with larger first letters
  const formatTitle = (text: string): React.ReactNode => {
    const words = text.toUpperCase().split(" ");
    return words.map((word: string, wordIndex: number) => (
      <React.Fragment key={wordIndex}>
        {wordIndex > 0 && " "}
        <span className={variant === "fullscreen" ? "text-3xl" : "text-xl"}>{word[0]}</span>
        {word.slice(1)}
      </React.Fragment>
    ));
  };

  const headerStyles =
    variant === "fullscreen"
      ? "text-2xl font-black text-white mb-2"
      : "text-lg font-black text-black";

  const subtitleStyles = variant === "fullscreen" ? "text-purple-200" : "text-sm text-purple-900";

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {React.createElement(getIcon("Shield"), {
          className: `h-6 w-6 ${variant === "fullscreen" ? "text-white" : "text-blue-600"}`,
        })}
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
          {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
        </button>
      )}
    </div>
  );
};

export default SecurityHeader;
