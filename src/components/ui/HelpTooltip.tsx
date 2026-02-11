import React, { useState } from "react";
import { getIcon } from "../../utils";

type PositionType = "top" | "right" | "bottom" | "left";

interface HelpTooltipProps {
  content: React.ReactNode;
  title?: string;
  position?: PositionType;
}

const HelpTooltip = ({ content, title, position = "top" }: HelpTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses: Record<PositionType, string> = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  const arrowClasses: Record<PositionType, string> = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800",
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:text-gray-600"
        aria-label="Help information"
        type="button"
      >
        {React.createElement(getIcon("HelpCircle"), { className: "h-4 w-4" })}
      </button>

      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}>
          <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg">
            {title && <div className="font-medium mb-1 text-gray-100">{title}</div>}
            <div className="text-gray-200 leading-relaxed">{content}</div>
          </div>
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
