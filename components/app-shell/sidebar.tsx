// components/app-shell/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Plug,
  Sparkles,
  FileText,
  Bell,
  Settings,
} from "lucide-react";
import Logo from "../images/logo";

const BRAND = {
  accent: "#8C57FF",
};

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboards", label: "Dashboards", icon: BarChart3 },
  { href: "/sources", label: "Data Sources", icon: Plug },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#1b1b2a_0%,#121220_100%)] text-white md:block">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3">
            <div
  className="grid h-10 w-10 place-items-center rounded-xl shadow-[0_12px_40px_-16px_rgba(140,87,255,0.9)]"
  style={{ backgroundColor: "#8C57FF", color: "white" }}
>
  <Logo className="h-6 w-6" />
</div>


            <div className="leading-tight">
              <div className="text-sm font-semibold">Make  My Dashboard</div>
              <div className="text-xs text-white/60">Console</div>
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="mt-6 px-3">
          <div className="px-3 text-[11px] font-semibold tracking-wide text-white/45">
            MAIN
          </div>

          <nav className="mt-2 space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "text-white ring-1"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                  style={
                    active
                      ? {
                          backgroundColor: "rgba(140,87,255,0.18)",
                          borderColor: "rgba(140,87,255,0.35)",
                        }
                      : undefined
                  }
                >
                  <Icon
                    className={[
                      "h-[18px] w-[18px]",
                      active ? "" : "text-white/70 group-hover:text-white",
                    ].join(" ")}
                    style={active ? { color: "#CBB6FF" } : undefined}
                  />

                  <span className="flex-1">{item.label}</span>

                  {item.label === "Dashboards" ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      5
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto px-3 pb-4">
          <div className="h-px bg-white/10" />
          <Link
            href="/settings"
            className={[
              "mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white",
              pathname.startsWith("/settings") ? "bg-white/5 text-white" : "",
            ].join(" ")}
          >
            <Settings className="h-[18px] w-[18px] text-white/70" />
            <span className="flex-1">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
