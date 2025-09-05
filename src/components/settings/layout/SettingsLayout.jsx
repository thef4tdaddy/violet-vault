import React from "react";
import { X, Settings } from "lucide-react";

const SettingsLayout = ({
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
      <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
        {/* Close Button - Top Right Corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 glassmorphism border-r-2 border-black flex-shrink-0 rounded-l-lg">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <h2 className="font-black text-black text-base flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  <span className="text-lg">S</span>ETTINGS
                </h2>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => onSectionChange(section.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors border-2 border-black ${
                        activeSection === section.id
                          ? "bg-purple-500 text-white"
                          : "bg-white/60 text-purple-900 hover:bg-white/80"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto glassmorphism rounded-r-lg">
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
