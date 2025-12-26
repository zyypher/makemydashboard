"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity, BarChart3, Sparkles } from "lucide-react";

import { GeneratedShell } from "@/components/shell/generated-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  findApp,
  readRecords,
  readUserFromStorage,
  type GeneratedApp,
} from "@/lib/client-nav";

export default function AppOverviewPage() {
  const router = useRouter();
  const params = useParams<{ appId: string }>();
  const appId = params?.appId;

  const app: GeneratedApp | null = useMemo(
    () => (appId ? findApp(appId) : null),
    [appId],
  );

  useEffect(() => {
    const user = readUserFromStorage();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const visibleModules = useMemo(
    () => app?.modules.filter((m) => !m.hidden) || [],
    [app],
  );

  const totalRecords = useMemo(() => {
    if (!app) return 0;
    return visibleModules.reduce(
      (count, mod) => count + readRecords(app.id, mod.id).length,
      0,
    );
  }, [app, visibleModules]);

  if (!app) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm">
          We could not find that dashboard.
        </div>
      </div>
    );
  }

  return (
    <GeneratedShell
      appId={app.name}
      modules={visibleModules.map((m) => ({ id: m.id, name: m.name }))}
      activeModuleId="overview"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassPanel variant="card" className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-slate-700" />
            Live clarity
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {visibleModules.length}
          </p>
          <p className="text-sm text-slate-600">
            Modules ready in this dashboard.
          </p>
        </GlassPanel>
        <GlassPanel variant="card" className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Activity className="h-4 w-4 text-slate-700" />
            Recent activity
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totalRecords}
          </p>
          <p className="text-sm text-slate-600">
            Records across modules (stored locally).
          </p>
        </GlassPanel>
        <GlassPanel variant="card" className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BarChart3 className="h-4 w-4 text-slate-700" />
            Created
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {new Date(app.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-600">Generated from your draft.</p>
        </GlassPanel>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              Recent records (placeholder)
            </p>
            <p className="text-sm text-slate-600">
              Solid white table to keep details easy to scan.
            </p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Overview
          </span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Owner
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  You can add records in each module
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">Any</td>
                <td className="px-4 py-3 text-sm text-slate-700">Unassigned</td>
                <td className="px-4 py-3 text-right text-sm text-slate-700">
                  Today
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </GeneratedShell>
  );
}
