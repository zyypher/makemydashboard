import type { ReactNode } from "react";

import {
  Home,
  LayoutDashboard,
  Palette,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Topbar } from "@/components/nav/topbar";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "org", label: "Organization", icon: Users },
  { id: "create", label: "Create Dashboard", icon: LayoutDashboard },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

type BuilderShellProps = {
  children: ReactNode;
  title?: string;
};

export function BuilderShell({ children, title = "Builder" }: BuilderShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 md:grid-cols-[260px_1fr] md:p-6">
      <GlassPanel variant="sidebar" className="p-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3 shadow-inner backdrop-blur">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/70 to-indigo-400/60 text-white shadow">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              BuildYourDashboard
            </p>
            <p className="text-xs text-slate-600">Guided setup</p>
          </div>
        </div>
        <nav className="mt-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = index === 2;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-200 hover:text-slate-900",
                  active && "border-slate-200 bg-white text-slate-900 shadow",
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-slate-700 shadow-inner">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/70 bg-white/70 p-3 text-xs text-slate-700 shadow-inner">
          Stored locally. Light theme only. Glass only for containers.
        </div>
      </GlassPanel>

      <div className="flex flex-col gap-4">
        <GlassPanel variant="header" className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                BuildYourDashboard
              </p>
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-600">
                Left sidebar for guidance, top header for quick actions.
              </p>
            </div>
            <Topbar />
          </div>
        </GlassPanel>
        <div className="flex-1">
          <GlassPanel className="p-4">{children}</GlassPanel>
        </div>
      </div>
    </div>
  );
}
