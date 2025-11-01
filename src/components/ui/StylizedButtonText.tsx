import React from "react";

/**
 * StylizedButtonText Component
 * 
 * Renders text with larger first letter on each word for button labels
 * Handles spacing correctly so "CHANGE PROFILE" looks natural
 * 
 * Usage:
 *   <StylizedButtonText>CHANGE PROFILE</StylizedButtonText>
 *   <StylizedButtonText>START FRESH</StylizedButtonText>
 */

interface StylizedButtonTextProps {
  children: string;
  firstLetterClassName?: string;
  restClassName?: string;
}

const StylizedButtonText: React.FC<StylizedButtonTextProps> = ({
  children,
  firstLetterClassName = "text-base",
  restClassName = "text-sm",
}) => {
  // Split into words
  const words = children.split(" ");

  return (
    <span className="inline-flex items-baseline gap-[0.3em]">
      {words.map((word, wordIndex) => {
        if (!word) return null;

        const firstLetter = word[0];
        const restOfWord = word.slice(1);

        return (
          <span key={wordIndex} className="inline-flex items-baseline whitespace-nowrap">
            <span className={firstLetterClassName}>{firstLetter}</span>
            <span className={restClassName}>{restOfWord}</span>
          </span>
        );
      })}
    </span>
  );
};

export default StylizedButtonText;

