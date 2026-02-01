import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getIcon } from "@/utils";

const fetchPythonStatus = async () => {
  const res = await fetch("/api/marketing/status");
  if (!res.ok) throw new Error("Python Down");
  return res.json();
};

const fetchGoStatus = async () => {
  const res = await fetch("/api/marketing/go_status");
  if (!res.ok) throw new Error("Go Down");
  return res.json();
};

const StatusDot: React.FC<{ status: "online" | "offline" | "loading"; label: string }> = ({
  status,
  label,
}) => {
  const color =
    status === "online"
      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
      : status === "loading"
        ? "bg-yellow-500 animate-pulse"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-mono font-bold text-slate-400 uppercase">{label}</span>
    </div>
  );
};

export const MarketingFooter: React.FC = () => {
  const { status: pyStatus } = useQuery({
    queryKey: ["status", "python"],
    queryFn: fetchPythonStatus,
    retry: false,
    refetchInterval: 30000,
  });

  const { status: goStatus } = useQuery({
    queryKey: ["status", "go"],
    queryFn: fetchGoStatus,
    retry: false,
    refetchInterval: 30000,
  });

  const pyState =
    pyStatus === "success" ? "online" : pyStatus === "pending" ? "loading" : "offline";
  const goState =
    goStatus === "success" ? "online" : goStatus === "pending" ? "loading" : "offline";

  return (
    <footer className="bg-black border-t border-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <h4 className="text-slate-50 font-black tracking-tighter text-xl">
            VIOLET <span className="text-fuchsia-500">VAULT</span>
          </h4>
          <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
            Open-source, local-first financial intelligence.
            <br />
            Built for privacy, engineered for speed.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <StatusDot status={pyState} label="Python Core" />
          <StatusDot status={goState} label="Go Engine" />
        </div>

        <div className="flex items-center gap-6">
          <a href="#" className="text-slate-500 hover:text-fuchsia-400 transition-colors">
            {React.createElement(getIcon("Github"), { className: "w-5 h-5" })}
          </a>
          <a href="#" className="text-slate-500 hover:text-fuchsia-400 transition-colors">
            {React.createElement(getIcon("FileText"), { className: "w-5 h-5" })}
          </a>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs font-mono">
        © 2026 VIOLET VAULT LABS. ALL SYSTEMS NOMINAL.
      </div>
    </footer>
  );
};
