import React from "react";
import { GoEngineDemo } from "./components/GoEngineDemo";
import { PythonBrainDemo } from "./components/PythonBrainDemo";
import { SentinelMatchDemo } from "./components/SentinelMatchDemo";

/**
 * Demo Dashboard
 * Displays the core v2.1 features with interactive elements
 */
export const DemoDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Intro Section */}
      <section id="demo-intro" className="text-center py-12">
        <h2 className="text-5xl font-black font-mono text-white mb-4">
          WELCOME TO THE <span className="text-purple-400">POLYGLOT ENGINE</span>
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Experience the next generation of envelope budgeting powered by Go, Python, and end-to-end
          encryption.
        </p>
      </section>

      {/* Go Engine Section */}
      <section id="demo-go-speed">
        <GoEngineDemo />
      </section>

      {/* Python Analytics Section */}
      <section id="demo-python-brain">
        <PythonBrainDemo />
      </section>

      {/* SentinelShare Section */}
      <section id="demo-sentinel-match">
        <SentinelMatchDemo />
      </section>
    </div>
  );
};
