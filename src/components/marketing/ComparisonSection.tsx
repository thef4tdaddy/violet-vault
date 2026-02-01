import React from "react";
import { Link } from "react-router-dom";
import { getIcon } from "@/utils";
import Button from "@/components/ui/buttons/Button";

interface ComparisonCardProps {
  title: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
  accentColor: "fuchsia" | "cyan";
  isPrimary?: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  subtitle,
  features,
  ctaLabel,
  ctaLink,
  accentColor,
  isPrimary = false,
}) => {
  const accentClass = accentColor === "fuchsia" ? "text-fuchsia-400" : "text-cyan-400";
  const bgAccent = accentColor === "fuchsia" ? "bg-fuchsia-400" : "bg-cyan-400";

  return (
    <div
      className={`relative group flex flex-col p-8 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
        isPrimary
          ? `bg-slate-900/60 border-slate-700 hover:border-${accentColor}-500 shadow-2xl`
          : "bg-slate-900/30 border-slate-800 hover:border-slate-600"
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${bgAccent} rounded-t-sm opacity-50 group-hover:opacity-100 transition-opacity`}
      />

      <h3 className="text-3xl font-black text-slate-50 mb-2 tracking-tight">{title}</h3>
      <p className={`font-mono text-sm font-bold tracking-wider mb-6 ${accentClass}`}>{subtitle}</p>

      <ul className="flex-1 space-y-4 mb-10">
        {features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-full bg-slate-800 ${accentClass}`}>
              {React.createElement(getIcon("Check"), { className: "w-3 h-3" })}
            </div>
            <span className="text-slate-300 font-medium text-sm leading-relaxed">{feat}</span>
          </li>
        ))}
      </ul>

      <Link to={ctaLink} className="w-full">
        <Button
          variant={isPrimary ? "primary" : "outline"}
          className={`w-full py-4 font-black tracking-wide text-lg justify-center ${
            !isPrimary ? "border-slate-600 text-slate-300 hover:text-white" : ""
          }`}
        >
          {ctaLabel}
        </Button>
      </Link>
    </div>
  );
};

export const ComparisonSection: React.FC = () => {
  return (
    <div className="relative py-32 px-4 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[500px] bg-indigo-900/10 -skew-y-6 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-slate-50 tracking-tighter">
            CHOOSE YOUR <span className="text-fuchsia-500">REALITY</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Whether you need persistent, encrypted security or just want to test drive the engine at
            hyperspeed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <ComparisonCard
            title="THE VAULT"
            subtitle="PRODUCTION ENV (E2EE)"
            accentColor="fuchsia"
            isPrimary={true}
            ctaLabel="LAUNCH PRODUCTION"
            ctaLink="/vault/dashboard"
            features={[
              "End-to-End Encrypted Persistence via IndexedDB + Firestore.",
              "Multi-Device Sync using Conflict-Free Replicated Data Types.",
              "Secure authentication with Firebase & Google Identity.",
              "Permanent storage for family-scale budgeting.",
            ]}
          />

          <ComparisonCard
            title="HYPERSPEED"
            subtitle="DEV SANDBOX (IN-MEMORY)"
            accentColor="cyan"
            isPrimary={false}
            ctaLabel="ENTER THE SIMULATION"
            ctaLink="/demo"
            features={[
              "100ms Data Generation for instant component load testing.",
              "Volatile In-Memory Storage (Wipes on refresh).",
              "No Login Required - Just pure interaction speed.",
              "Experience the tech stack without committing data.",
            ]}
          />
        </div>
      </div>
    </div>
  );
};
