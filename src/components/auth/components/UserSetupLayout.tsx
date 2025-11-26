import React from "react";

/**
 * User Setup Layout Component
 * Main layout structure with background pattern and container styling
 * Extracted from UserSetup for better organization and ESLint compliance
 */

interface UserSetupLayoutProps {
  children: React.ReactNode;
}

const UserSetupLayout = ({ children }: UserSetupLayoutProps) => {
  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)",
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="glassmorphism rounded-lg p-6 w-full max-w-md border-2 border-black bg-purple-100/40 backdrop-blur-sm relative">
        {children}

        <div className="text-center mt-6">
          <p className="text-xs text-black font-medium uppercase tracking-wider">
            <span className="text-sm">Y</span>OUR DATA IS ENCRYPTED CLIENT-SIDE FOR MAXIMUM SECURITY
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSetupLayout;
