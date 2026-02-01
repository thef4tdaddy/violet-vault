import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/buttons/Button";

import { motion, Variants } from "framer-motion";

import { useGitHubStats } from "@/hooks/marketing/useGitHubStats";
import { getIcon } from "@/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const GitHubStatsBadge: React.FC = () => {
  const { data, isLoading, isError } = useGitHubStats();

  if (isLoading || isError || !data) return null;

  return (
    <motion.div
      variants={itemVariants}
      className="inline-flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm mb-6 max-w-fit mx-auto"
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        {React.createElement(getIcon("Github"), { className: "w-4 h-4" })}
        <span className="text-xs font-mono font-bold">{data.stargazers_count} Stars</span>
      </div>
      <div className="w-px h-3 bg-slate-800" />
      <div className="flex items-center gap-1.5 text-slate-400">
        {React.createElement(getIcon("GitBranch"), { className: "w-4 h-4" })}
        <span className="text-xs font-mono font-bold">{data.forks_count} Forks</span>
      </div>
    </motion.div>
  );
};

export const HeroSection: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 pt-16">
      {/* Background Gradients */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none"
      />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/30 backdrop-blur-sm mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-fuchsia-300 tracking-wider">
            V2.1 POLYGLOT ARCHITECTURE
          </span>
        </motion.div>

        {/* GitHub Stats Badge */}
        <GitHubStatsBadge />

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-50 leading-[0.9]"
        >
          YOUR MONEY.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
            YOUR PRIVACY.
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 drop-shadow-[0_0_30px_rgba(192,38,211,0.3)]">
            YOUR VAULT.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          The open-source, local-first financial supervisor. Powered by Go for precision and Python
          for intelligence. Zero data leaves your device unencrypted.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link to="/vault/dashboard">
            <Button className="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-lg tracking-wide rounded-lg hard-border shadow-[4px_4px_0px_0px_#000000] transition-transform active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000000]">
              LAUNCH VAULT
            </Button>
          </Link>
          <Link to="/demo">
            <Button className="px-8 py-4 bg-transparent hover:bg-white/5 text-slate-200 font-bold text-lg tracking-wide rounded-lg border-2 border-slate-700 hover:border-slate-50 transition-colors">
              HYPERSPEED DEMO
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Visual Abstract - Glassmorphic Cards */}
      <div className="relative mt-20 w-full max-w-6xl mx-auto perspective-[2000px]">
        <motion.div
          initial={{ opacity: 0, rotateX: 20, y: 100 }}
          animate={{ opacity: 1, rotateX: 12, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="relative transform rotate-x-12 translate-y-10 opacity-80 hover:opacity-100 transition-opacity duration-700 ease-out"
        >
          {/* Main App Window Preview mockup */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-t-2xl shadow-2xl p-4 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 text-center">
                <div className="inline-block w-40 h-2 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="h-32 rounded-lg bg-white/5 border border-white/5" />
                <div className="h-20 rounded-lg bg-white/5 border border-white/5" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="h-64 rounded-lg bg-white/5 border border-white/5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
