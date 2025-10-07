import React from "react";
import { Link } from "react-router-dom";
import { getIcon } from "../../../utils";

const HomePage = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="rounded-lg p-8 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
          <h1 className="font-black text-black text-6xl mb-6">
            <span className="text-7xl">T</span>AKE <span className="text-7xl">C</span>ONTROL{" "}
            <span className="text-7xl">O</span>F <span className="text-7xl">Y</span>OUR{" "}
            <span className="text-7xl">F</span>INANCES
          </h1>
          <p className="text-purple-900 text-xl mb-8 max-w-3xl mx-auto">
            Violet Vault is the secure, envelope-based budgeting app that helps you manage every
            dollar with precision. Built for individuals and families who want financial freedom
            through intentional spending.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="glassmorphism rounded-lg px-8 py-4 border-2 border-black bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition-colors"
            >
              {React.createElement(getIcon("ArrowRight"), {
                className: "w-5 h-5 inline mr-2",
              })}
              START BUDGETING FREE
            </Link>
            <Link
              to="/features"
              className="glassmorphism rounded-lg px-8 py-4 border-2 border-black bg-white/80 text-black font-bold text-lg hover:bg-purple-100 transition-colors"
            >
              {React.createElement(getIcon("Star"), {
                className: "w-5 h-5 inline mr-2",
              })}
              EXPLORE FEATURES
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: "wallet",
            title: "ENVELOPE BUDGETING",
            description:
              "Allocate every dollar to specific envelopes. See exactly where your money goes and stay within your limits.",
          },
          {
            icon: "shield",
            title: "BANK-LEVEL SECURITY",
            description:
              "Your data is encrypted locally and in the cloud. We never see your financial information.",
          },
          {
            icon: "smartphone",
            title: "WORKS EVERYWHERE",
            description:
              "Web app, PWA, and mobile-optimized. Access your budget from any device, online or offline.",
          },
        ].map(({ icon, title, description }) => (
          <div
            key={title}
            className="glassmorphism rounded-lg p-6 border-2 border-black bg-white/80 backdrop-blur-sm text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center border-2 border-black">
              {React.createElement(getIcon(icon.charAt(0).toUpperCase() + icon.slice(1)), {
                className: "w-8 h-8 text-purple-600",
              })}
            </div>
            <h3 className="font-black text-black text-base mb-3">
              <span className="text-lg">{title.charAt(0)}</span>
              {title.slice(1)}
            </h3>
            <p className="text-purple-900">{description}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-16">
        <div className="rounded-lg p-8 border-2 border-black bg-gradient-to-r from-purple-100/60 to-blue-100/60 backdrop-blur-sm">
          <h2 className="font-black text-black text-4xl mb-4">
            <span className="text-5xl">R</span>EADY <span className="text-5xl">T</span>O{" "}
            <span className="text-5xl">S</span>TART?
          </h2>
          <p className="text-purple-900 text-lg mb-6">
            Join thousands of users who have taken control of their finances with Violet Vault.
          </p>
          <Link
            to="/app"
            className="glassmorphism rounded-lg px-8 py-4 border-2 border-black bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            {React.createElement(getIcon("ArrowRight"), {
              className: "w-5 h-5 mr-2",
            })}
            LAUNCH YOUR BUDGET
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
