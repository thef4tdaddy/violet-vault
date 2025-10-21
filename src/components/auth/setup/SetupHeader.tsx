import React from "react";
import logoOnly from "@/assets/icon-512x512.png";

const SetupHeader: React.FC = () => (
  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/20">
    <div className="flex items-center justify-center mb-4">
      <img src={logoOnly} alt="VioletVault" className="h-16 w-16 mr-4" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Local-Only Mode</h1>
        <p className="text-gray-600">Privacy-first budgeting without cloud sync</p>
      </div>
    </div>
  </div>
);

export default SetupHeader;
