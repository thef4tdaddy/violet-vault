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
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="rounded-none sm:rounded-lg border-2 border-black bg-purple-100/40 backdrop-blur-sm w-full sm:max-w-4xl max-h-screen sm:max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden">
        {/* Close Button - Top Right Corner */}
        <Button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white hover:text-white bg-red-600 hover:bg-red-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
        >
          {React.createElement(getIcon("X"), { className: "h-4 w-4 sm:h-5 sm:w-5" })}
        </Button>

        {/* Mobile Section Selector - Shows at top on mobile */}
        <div className="sm:hidden bg-white border-b-2 border-black p-3">
          <Button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-purple-500 text-white border-2 border-black"
          >
            <div className="flex items-center">
              {React.createElement(getIcon(sections.find((s) => s.id === activeSection)?.icon || "Settings"), {
                className: "h-5 w-5 mr-2",
              })}
              <span className="font-semibold">{sections.find((s) => s.id === activeSection)?.label}</span>
            </div>
            {React.createElement(getIcon(showMobileMenu ? "ChevronUp" : "ChevronDown"), {
              className: "h-5 w-5",
            })}
          </Button>

          {/* Mobile Dropdown Menu */}
          {showMobileMenu && (
            <div className="mt-2 space-y-1 bg-white rounded-lg border-2 border-black p-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors border-2 border-black ${
                    activeSection === section.id
                      ? "bg-purple-500 text-white"
                      : "bg-purple-100 text-black hover:bg-purple-200"
                  }`}
                >
                  {React.createElement(getIcon(section.icon), {
                    className: "h-4 w-4 mr-3",
                  })}
                  {section.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden sm:block w-64 bg-white border-r-2 border-black flex-shrink-0">
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
                          : "bg-purple-100 text-black hover:bg-purple-200"
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
            <div className="p-4 sm:p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
