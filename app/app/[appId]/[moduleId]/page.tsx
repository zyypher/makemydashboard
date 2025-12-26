"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";

import { GeneratedShell } from "@/components/shell/generated-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  findApp,
  readRecords,
  readUserFromStorage,
  saveRecord,
  type GeneratedApp,
  type Module,
  type ModuleRecord,
} from "@/lib/client-nav";

export default function ModulePage() {
  const router = useRouter();
  const params = useParams<{ appId: string; moduleId: string }>();
  const appId = params?.appId;
  const moduleId = params?.moduleId;

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

  const currentModule: Module | undefined = useMemo(
    () => app?.modules.find((m) => m.id === moduleId),
    [app, moduleId],
  );

  const [showModal, setShowModal] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!currentModule) return {};
    const initial: Record<string, string> = {};
    currentModule.fields.forEach((field) => {
      initial[field.id] = "";
    });
    return initial;
  });
  const [records, setRecords] = useState<ModuleRecord[]>(() =>
    app && currentModule ? readRecords(app.id, currentModule.id) : [],
  );

  if (!app || !currentModule || currentModule.hidden) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm">
          We could not find that module.
        </div>
      </div>
    );
  }

  const visibleModules = app.modules.filter((m) => !m.hidden);

  const handleSave = () => {
    if (!app || !currentModule) return;
    const saved = saveRecord({
      appId: app.id,
      moduleId: currentModule.id,
      values,
    });
    if (saved) {
      setRecords((prev) => [...prev, saved]);
    }
    setShowModal(false);
    setValues((prev) => {
      const cleared: Record<string, string> = {};
      Object.keys(prev).forEach((key) => {
        cleared[key] = "";
      });
      return cleared;
    });
  };

  return (
    <GeneratedShell
      appId={app.name}
      modules={visibleModules.map((m) => ({ id: m.id, name: m.name }))}
      activeModuleId={currentModule.id}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {app.name}
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            {currentModule.name}
          </h1>
          <p className="text-sm text-slate-600">
            Solid table keeps details clear; add records with the button.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add record
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {currentModule.fields.map((field) => (
                <th
                  key={field.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {field.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Added
              </th>
            </tr>
          </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentModule.fields.length + 1}
                    className="px-4 py-4 text-sm text-slate-600"
                  >
                    No records yet. Add the first one to share progress.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    {currentModule.fields.map((field) => (
                      <td
                        key={field.id}
                        className="px-4 py-3 text-sm text-slate-800"
                      >
                      {record.values[field.id] || "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm text-slate-700">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
          <GlassPanel variant="modal" className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Add record
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentModule.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {currentModule.fields.map((field) => (
                <label key={field.id} className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {field.label}
                  </span>
                  <input
                    value={values[field.id] || ""}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Stored locally, never leaves your browser.
              </p>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </GlassPanel>
        </div>
      ) : null}
    </GeneratedShell>
  );
}
