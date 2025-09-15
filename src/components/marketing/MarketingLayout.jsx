import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getIcon } from "../../utils";

/**
 * Marketing Layout Component
 * Separate layout for marketing pages with public navigation
 */
const MarketingLayout = ({ children }) => {
  const location = useLocation();

  const marketingRoutes = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/features", label: "Features", icon: "star" },
    { path: "/pricing", label: "Pricing", icon: "dollarSign" },
    { path: "/about", label: "About", icon: "info" },
    { path: "/app", label: "Launch App", icon: "arrowRight" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Marketing Navigation Header */}
      <header className="glassmorphism border-2 border-black bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">V</span>
                </div>
                <span className="font-black text-black text-xl">
                  VIOLET VAULT
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              {marketingRoutes.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium border-2 border-black transition-colors ${
                    location.pathname === path
                      ? "bg-purple-600 text-white"
                      : "bg-white/80 text-black hover:bg-purple-100"
                  }`}
                >
                  {getIcon(icon, "w-4 h-4")}
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="border-2 border-black bg-white/80 p-2 rounded-md">
                {getIcon("menu", "w-6 h-6")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="glassmorphism border-2 border-black bg-white/90 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-purple-900">
              © 2025 Violet Vault. Built for financial freedom.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;