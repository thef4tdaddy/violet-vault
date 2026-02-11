import React from "react";
import { Link } from "react-router-dom";
import { getIcon } from "../../utils";

/**
 * Simple Coming Soon Landing Page
 * Basic landing with logo and app launch button
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-xl">
            <span className="text-white font-black text-4xl">V</span>
          </div>
          <h1 className="font-black text-black text-5xl mb-2">
            <span className="text-6xl">V</span>IOLET <span className="text-6xl">V</span>AULT
          </h1>
          <p className="text-purple-900 text-xl">Secure Envelope-Based Budgeting</p>
        </div>

        {/* Coming Soon Content */}
        <div className="glassmorphism rounded-lg p-8 border-2 border-black bg-white/80 backdrop-blur-sm mb-8">
          <h2 className="font-black text-black text-3xl mb-4">
            <span className="text-4xl">C</span>OMING <span className="text-4xl">S</span>OON
          </h2>
          <p className="text-purple-900 text-lg mb-6">
            We're building something amazing for your financial freedom. In the meantime, you can
            access the full budgeting app below.
          </p>

          {/* App Launch Button */}
          <Link
            to="/app"
            className="glassmorphism rounded-lg px-8 py-4 border-2 border-black bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            {React.createElement(getIcon("ArrowRight"), {
              className: "w-5 h-5 mr-2",
            })}
            LAUNCH BUDGETING APP
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[
            {
              icon: "wallet",
              title: "ENVELOPE BUDGETING",
              description: "Every dollar has a purpose",
            },
            {
              icon: "shield",
              title: "BANK-LEVEL SECURITY",
              description: "Your data stays private",
            },
            {
              icon: "smartphone",
              title: "WORKS EVERYWHERE",
              description: "Web, mobile, offline ready",
            },
          ].map(({ icon, title, description }) => (
            <div
              key={title}
              className="glassmorphism rounded-lg p-4 border-2 border-black bg-white/60 backdrop-blur-sm"
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center border-2 border-black">
                {React.createElement(getIcon(icon.charAt(0).toUpperCase() + icon.slice(1)), {
                  className: "w-6 h-6 text-purple-600",
                })}
              </div>
              <h3 className="font-black text-black text-sm mb-1">
                <span className="text-base">{title.charAt(0)}</span>
                {title.slice(1)}
              </h3>
              <p className="text-purple-900 text-xs">{description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-900 text-sm">
          © 2025 Violet Vault. Built for financial freedom.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
