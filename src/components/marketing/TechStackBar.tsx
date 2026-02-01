import React from "react";
import { getIcon } from "@/utils";
import { motion } from "framer-motion";

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
  const items = (
    <>
      <TechItem label="React 19" icon="Zap" color="text-cyan-400" />
      <TechItem label="TypeScript" icon="Code" color="text-blue-400" />
      <TechItem label="Python 3.12" icon="Activity" color="text-yellow-400" />
      <TechItem label="Go 1.22" icon="Server" color="text-teal-400" />
      <TechItem label="Firebase" icon="Database" color="text-orange-400" />
      <TechItem label="Tailwind" icon="Layout" color="text-sky-400" />
    </>
  );

  return (
    <div className="w-full bg-slate-950 border border-white/20 ring-1 ring-gray-800/10 overflow-hidden">
      <div className="flex py-4 bg-slate-900/20 backdrop-blur-sm">
        {/* Infinite Marquee Container */}
        <div className="flex relative overflow-hidden w-full mask-linear-fade">
          {/* Mask Gradients for fade effect on edges */}
          {/* Left Fade */}
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-linear-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          {/* Right Fade */}
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-linear-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-0 whitespace-nowrap"
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            }}
            style={{ width: "max-content" }}
          >
            {/* We render two blocks of items. The animation moves from 0% to -50%.
                When it hits -50%, the second block is exactly where the first block was,
                so it loops seamlessly back to 0. 
                
                Block 1: [A, B, C, D]
                Block 2: [A, B, C, D]
                
                Start: [A, B, C, D] [A, B, C, D]
                       ^ Viewport
                
                End:   [A, B, C, D] [A, B, C, D]
                                    ^ Viewport (Looks identical to Start)
             */}
            <div className="flex shrink-0">
              {items}
              {/* Add spacing between repeats if needed, but handled by TechItem padding */}
            </div>
            <div className="flex shrink-0">{items}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
