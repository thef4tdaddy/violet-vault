import React from "react";
import { getIcon } from "@/utils";

const TechItem: React.FC<{ label: string; icon: string; color: string }> = ({
  label,
  icon,
  color,
}) => (
  <div className="flex items-center gap-2 px-6 py-2 border-r border-slate-800/50 last:border-r-0">
    <div className={`p-1.5 rounded bg-slate-900 border border-slate-700 ${color}`}>
      {React.createElement(getIcon(icon), { className: "w-4 h-4" })}
    </div>
    <span className="font-mono font-bold text-sm tracking-widest text-slate-400 uppercase">
      {label}
    </span>
  </div>
);

export const TechStackBar: React.FC = () => {
  return (
    <div className="w-full bg-slate-950 border-y border-slate-900 overflow-hidden">
      <div className="flex items-center justify-center py-4 bg-slate-900/20 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-0 opacity-70 hover:opacity-100 transition-opacity">
          <TechItem label="React 19" icon="Zap" color="text-cyan-400" />
          <TechItem label="TypeScript" icon="Code" color="text-blue-400" />
          <TechItem label="Python 3.12" icon="Activity" color="text-yellow-400" />
          <TechItem label="Go 1.22" icon="Server" color="text-teal-400" />
          <TechItem label="Firebase" icon="Database" color="text-orange-400" />
          <TechItem label="Tailwind" icon="Layout" color="text-sky-400" />
        </div>
      </div>
    </div>
  );
};
