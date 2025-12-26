"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, Settings } from "lucide-react";

import { BuilderShell } from "@/components/shell/builder-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { findOrg, readUserFromStorage } from "@/lib/client-nav";

type DashboardApp = {
  id: string;
  name: string;
};

export default function OrgPage() {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const orgId = params?.orgId;

  useEffect(() => {
    const user = readUserFromStorage();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const org = useMemo(() => {
    if (!orgId) return null;
    return (
      findOrg(orgId) ?? {
        id: orgId,
        name: "Your organization",
        createdAt: 0,
      }
    );
  }, [orgId]);

  const dashboards: DashboardApp[] = useMemo(() => {
    const base = orgId || "preview";
    return [
      { id: `${base}-welcome`, name: "Welcome + setup" },
      { id: `${base}-health`, name: "Health & alerts" },
      { id: `${base}-adoption`, name: "Adoption overview" },
    ];
  }, [orgId]);

  const goToNewDashboard = () => {
    if (orgId) router.push(`/org/${orgId}/new`);
  };

  const openApp = (appId: string) => {
    router.push(`/app/${appId}`);
  };

  const openSettings = (appId: string) => {
    router.push(`/app/${appId}/settings`);
  };

  return (
    <BuilderShell title={org?.name || "Organization"}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Organization
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              {org?.name || "Your organization"}
            </h1>
            <p className="text-sm text-slate-600">
              Manage dashboards and create new guided experiences.
            </p>
          </div>
          <button
            type="button"
            onClick={goToNewDashboard}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <LayoutDashboard className="h-4 w-4" />
            Create new dashboard
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {dashboards.map((app) => (
            <GlassPanel key={app.id} variant="card" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {app.name}
                  </p>
                  <p className="text-xs text-slate-600">ID: {app.id}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openApp(app.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
                >
                  <ArrowRight className="h-3 w-3" />
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => openSettings(app.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
                >
                  <Settings className="h-3 w-3" />
                  Settings
                </button>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </BuilderShell>
  );
}
