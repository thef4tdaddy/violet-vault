import React from "react";
import { getIcon } from "@/utils";

const LocalOnlyFooter: React.FC = () => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
      <div className="text-xs text-gray-500">
        <a
          href="https://github.com/anthropics/violet-vault/wiki/local-only-mode"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:text-gray-700"
        >
          Learn more about Local-Only Mode
          {React.createElement(getIcon("ExternalLink"), {
            className: "h-3 w-3 ml-1",
          })}
        </a>
      </div>
    </div>
  );
};

export default LocalOnlyFooter;
