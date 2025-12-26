import type { ReactNode } from "react";

import { LayoutGrid, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Topbar } from "@/components/nav/topbar";

type GeneratedShellProps = {
  appId: string;
  modules: { id: string; name: string }[];
  activeModuleId?: string;
  children: ReactNode;
};

export function GeneratedShell({
  appId,
  modules,
  activeModuleId,
  children,
}: GeneratedShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 md:grid-cols-[240px_1fr] md:p-6">
      <GlassPanel variant="sidebar" className="p-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3 shadow-inner backdrop-blur">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400/70 to-sky-400/60 text-white shadow">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {appId || "Generated app"}
            </p>
            <p className="text-xs text-slate-600">Live preview</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {modules.map((module) => {
            const active = module.id === activeModuleId;
            return (
              <button
                key={module.id}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-200 hover:text-slate-900",
                  active && "border-slate-200 bg-white text-slate-900 shadow",
                )}
              >
                <span>{module.name}</span>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    •
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-auto rounded-2xl border border-white/70 bg-white/70 p-3 text-xs text-slate-700 shadow-inner">
          Glass shell. Content stays solid white for clarity.
        </div>
      </GlassPanel>

      <div className="flex flex-col gap-4">
        <GlassPanel variant="header" className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Generated app
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                {appId || "Preview"}
              </h2>
              <p className="text-sm text-slate-600">
                Solid content area with frosted navigation.
              </p>
            </div>
            <Topbar />
          </div>
        </GlassPanel>
        <div className="flex-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-4 w-4" />
              Live module
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
