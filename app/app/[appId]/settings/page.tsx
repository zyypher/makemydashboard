"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Settings as SettingsIcon } from "lucide-react";

import { GeneratedShell } from "@/components/shell/generated-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  findApp,
  readUserFromStorage,
  saveApp,
  type GeneratedApp,
  type Module,
} from "@/lib/client-nav";

export default function AppSettingsPage() {
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

  const [name, setName] = useState(app?.name ?? "Dashboard");
  const [modules, setModules] = useState<Module[]>(app?.modules ?? []);

  if (!app) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm">
          Dashboard not found.
        </div>
      </div>
    );
  }

  const visibleModules = modules.filter((m) => !m.hidden);

  const handleSave = () => {
    saveApp({
      ...app,
      name,
      modules,
    });
    router.push(`/app/${app.id}`);
  };

  const updateModule = (id: string, updater: (mod: Module) => Module) => {
    setModules((prev) => prev.map((mod) => (mod.id === id ? updater(mod) : mod)));
  };

  return (
    <GeneratedShell
      appId={name}
      modules={visibleModules.map((m) => ({ id: m.id, name: m.name }))}
      activeModuleId="settings"
    >
      <div className="space-y-4">
        <GlassPanel variant="card" className="p-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-slate-700" />
            <p className="text-sm font-semibold text-slate-900">
              Dashboard settings
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Dashboard name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <p className="text-sm text-slate-600">
              Shown in the sidebar and header of your generated app.
            </p>
          </div>
        </GlassPanel>

        <GlassPanel variant="card" className="p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">Modules</p>
          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <input
                    value={mod.name}
                    onChange={(event) =>
                      updateModule(mod.id, (current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 md:max-w-xs"
                  />
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={!mod.hidden}
                      onChange={(event) =>
                        updateModule(mod.id, (current) => ({
                          ...current,
                          hidden: !event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                    />
                    Show in sidebar
                  </label>
                </div>
                <p className="text-xs text-slate-600">
                  Keep modules visible to guide your team.
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel variant="card" className="flex items-center justify-between p-4">
          <div className="text-sm text-slate-700">
            Changes stay in your browser until you share.
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </GlassPanel>
      </div>
    </GeneratedShell>
  );
}
