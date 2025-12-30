"use client";

import * as React from "react";
import {
  LayoutDashboard,
  List,
  ChevronRight,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type RecordRow = {
  id: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

type PageKey = string;

function uniq(values: any[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= 50) break;
  }
  return out;
}

function countUnique(rows: RecordRow[], key: string) {
  const set = new Set<string>();
  for (const r of rows) {
    const v = String(r?.data?.[key] ?? "").trim();
    if (!v) continue;
    set.add(v);
  }
  return set.size;
}

function safeArray(v: any): string[] {
  return Array.isArray(v) ? v.filter(Boolean).map(String) : [];
}

export default function AppRuntimeClient(props: {
  slug: string;
  appName: string;
  version: number;
  spec: any;
}) {
  const { slug, appName, version, spec } = props;

  const sidebarRaw = (spec?.ui?.sidebar ?? []) as Array<{ key: string; label: string }>;
  const pages = (spec?.ui?.pages ?? []) as Array<any>;
  const mainList = spec?.ui?.mainList ?? {};
  const model = spec?.model ?? {};

  const primaryKey = String(mainList?.primaryKey ?? model?.primaryFieldKey ?? "").trim();
  const mainTitle = String(mainList?.title ?? appName).trim();

  // Columns: spec-driven first; if missing, we’ll infer from first record later.
  const specColumns = safeArray(mainList?.columns);

  // IMPORTANT: field fallback to avoid blank modal
  const specFormFields =
    safeArray(spec?.ui?.form?.fields) ||
    safeArray(spec?.ui?.createForm?.fields);

  const [active, setActive] = React.useState<PageKey>(sidebarRaw?.[0]?.key ?? "overview");
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<RecordRow[]>([]);
  const [total, setTotal] = React.useState(0);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RecordRow | null>(null);
  const [form, setForm] = React.useState<Record<string, any>>({});
  const [saving, setSaving] = React.useState(false);

  const activePage = pages.find((p) => p.key === active);

  const managedKey =
    typeof active === "string" && active.startsWith("managed:")
      ? active.slice("managed:".length)
      : null;

  const runtimeSidebar = sidebarRaw.filter((s) => s.key !== "settings"); // remove settings

  const inferredColumns = React.useMemo(() => {
    if (specColumns.length) return specColumns;
    const first = rows?.[0]?.data;
    if (!first) return primaryKey ? [primaryKey] : [];
    const keys = Object.keys(first);
    // keep primaryKey first
    const ordered = primaryKey ? [primaryKey, ...keys.filter((k) => k !== primaryKey)] : keys;
    return ordered.slice(0, 6);
  }, [specColumns, rows, primaryKey]);

  const formFields = React.useMemo(() => {
    if (specFormFields.length) return specFormFields;
    if (inferredColumns.length) return inferredColumns;
    // last resort: use primaryKey only so modal is never empty
    return primaryKey ? [primaryKey] : [];
  }, [specFormFields, inferredColumns, primaryKey]);

  async function fetchRecords(nextQ: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/apps/${encodeURIComponent(slug)}/records?q=${encodeURIComponent(nextQ)}&take=100`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Failed");
      setRows(json.records ?? []);
      setTotal(Number(json.total ?? 0));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchRecords("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => fetchRecords(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const managedValues = React.useMemo(() => {
    if (!managedKey) return [];
    return uniq(rows.map((r) => r.data?.[managedKey]));
  }, [managedKey, rows]);

  const kpis = React.useMemo(() => {
    const managed = safeArray(model?.managed);
    const fixed = safeArray(model?.fixed);
    return {
      total,
      managed1: managed[0] ? { key: managed[0], value: countUnique(rows, managed[0]) } : null,
      fixed1: fixed[0] ? { key: fixed[0], value: countUnique(rows, fixed[0]) } : null,
    };
  }, [rows, total, model]);

  function openCreate() {
    setEditing(null);
    const initial: Record<string, any> = {};
    for (const f of formFields) initial[f] = "";
    setForm(initial);
    setModalOpen(true);
  }

  function openEdit(r: RecordRow) {
    setEditing(r);
    const merged: Record<string, any> = { ...(r.data ?? {}) };
    // ensure all form fields exist
    for (const f of formFields) if (!(f in merged)) merged[f] = "";
    setForm(merged);
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(
          `/api/apps/${encodeURIComponent(slug)}/records/${encodeURIComponent(editing.id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: form }),
          }
        );
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || "Update failed");
      } else {
        const res = await fetch(`/api/apps/${encodeURIComponent(slug)}/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: form }),
        });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || "Create failed");
      }

      setModalOpen(false);
      setEditing(null);
      await fetchRecords(q);
    } catch (e: any) {
      alert(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(r: RecordRow) {
    if (!confirm("Delete this record?")) return;
    const res = await fetch(
      `/api/apps/${encodeURIComponent(slug)}/records/${encodeURIComponent(r.id)}`,
      { method: "DELETE" }
    );
    const json = await res.json().catch(() => null);
    if (!json?.ok) alert(json?.error || "Delete failed");
    await fetchRecords(q);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl border border-neutral-200 bg-white text-sm font-bold">
            {String(appName || "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-neutral-900">{appName}</div>
            <div className="text-xs text-neutral-500">Runtime • v{version}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            className="w-56 bg-transparent outline-none"
            placeholder={`Search ${primaryKey || "records"}…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-54px)] grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="border-b md:border-b-0 md:border-r border-neutral-200 bg-white">
          <div className="p-3">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
              Navigation
            </div>
          </div>

          <div className="px-2 pb-3">
            {runtimeSidebar.map((it) => {
              const selected = it.key === active;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => setActive(it.key)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm flex items-center gap-2 ${selected
                      ? "bg-neutral-900 text-white"
                      : "hover:bg-neutral-50 text-neutral-800"
                    }`}
                >
                  {it.key === "overview" ? (
                    <LayoutDashboard className="h-4 w-4" />
                  ) : it.key === "main" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="truncate">{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {active === "overview" ? (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-neutral-900">Overview</div>
                <div className="text-sm text-neutral-600">
                  DB-backed runtime (no sheet preview).
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Stat label={`Total ${mainTitle}`} value={kpis.total} />
                <Stat
                  label={kpis.managed1 ? `Unique ${kpis.managed1.key}` : "Managed"}
                  value={kpis.managed1?.value ?? "—"}
                />
                <Stat
                  label={kpis.fixed1 ? `${kpis.fixed1.key} options` : "Fixed"}
                  value={kpis.fixed1?.value ?? "—"}
                />
              </div>
            </div>
          ) : active === "main" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-neutral-900">{mainTitle}</div>
                  <div className="text-sm text-neutral-600">
                    Add / Edit / Delete is live (DB mirror).
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="max-h-[640px] overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-50">
                      <tr>
                        {inferredColumns.filter(Boolean).map((c) => (
                          <th
                            key={c}
                            className="whitespace-nowrap border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold text-neutral-700"
                          >
                            {c}
                          </th>
                        ))}
                        <th className="border-b border-neutral-200 px-3 py-2 text-right text-xs font-semibold text-neutral-700">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td className="px-3 py-8 text-sm text-neutral-500" colSpan={999}>
                            Loading…
                          </td>
                        </tr>
                      ) : rows.length === 0 ? (
                        <tr>
                          <td className="px-3 py-8 text-sm text-neutral-500" colSpan={999}>
                            No records (you probably need to “Create app” again to import rows).
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => (
                          <tr key={r.id} className="odd:bg-white even:bg-neutral-50">
                            {inferredColumns.filter(Boolean).map((c) => (
                              <td
                                key={c}
                                className="whitespace-nowrap border-b border-neutral-100 px-3 py-2 text-xs text-neutral-800"
                              >
                                {String(r.data?.[c] ?? "")}
                              </td>
                            ))}
                            <td className="whitespace-nowrap border-b border-neutral-100 px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-800 hover:bg-white"
                                  onClick={() => openEdit(r)}
                                >
                                  <Pencil className="mr-1 inline-block h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-800 hover:bg-white"
                                  onClick={() => del(r)}
                                >
                                  <Trash2 className="mr-1 inline-block h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-600">
                  Total: {total}
                </div>
              </div>
            </div>
          ) : managedKey ? (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-neutral-900">{managedKey}</div>
                <div className="text-sm text-neutral-600">
                  Values derived from DB records.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap gap-2">
                  {managedValues.length ? (
                    managedValues.map((v) => (
                      <span
                        key={v}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-800"
                      >
                        {v}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-neutral-500">
                      No values found (likely no records imported yet).
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-600">
              {String(activePage?.title ?? "Page")} (coming soon)
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <div className="text-sm font-semibold text-neutral-900">
                {editing ? `Edit ${mainTitle}` : `Add ${mainTitle}`}
              </div>
              <button
                type="button"
                className="rounded-lg border border-neutral-200 p-2"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2">
              {formFields.map((f) => (
                <div key={f} className="space-y-1">
                  <div className="text-xs font-medium text-neutral-700">{f}</div>
                  <input
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    value={String(form?.[f] ?? "")}
                    onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                    placeholder={`Enter ${f}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4">
              <button
                type="button"
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat(props: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {props.label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">
        {String(props.value)}
      </div>
    </div>
  );
}
