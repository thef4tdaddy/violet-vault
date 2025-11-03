import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface Section {
  id: string;
  label: string;
  icon: string;
}

interface SettingsLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  sections: Section[];
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  isOpen,
  onClose,
  activeSection,
  sections,
  onSectionChange,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="rounded-lg border-2 border-black bg-purple-100/40 backdrop-blur-sm w-full max-w-4xl max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden">
        {/* Close Button - Top Right Corner */}
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-white bg-red-600 hover:bg-red-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
        >
          {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
        </Button>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r-2 border-black flex-shrink-0">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <h2 className="font-black text-black text-base flex items-center">
                  {React.createElement(getIcon("Settings"), {
                    className: "h-5 w-5 mr-2",
                  })}
                  <span className="text-lg">S</span>ETTINGS
                </h2>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => {
                  // Dynamic icon rendering
                  return (
                    <Button
                      key={section.id}
                      onClick={() => onSectionChange(section.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors border-2 border-black ${
                        activeSection === section.id
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                      }`}
                    >
                      {React.createElement(getIcon(section.icon), {
                        className: "h-4 w-4 mr-3",
                      })}
                      {section.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-white min-h-0">
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
