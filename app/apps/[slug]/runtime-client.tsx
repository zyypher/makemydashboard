"use client";

import * as React from "react";
import {
  LayoutDashboard,
  List,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";

type Preview = {
  headers: string[];
  rows: Array<Record<string, any>>;
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
    if (out.length >= 20) break;
  }
  return out;
}

function countUnique(rows: Array<Record<string, any>>, key: string) {
  const set = new Set<string>();
  for (const r of rows) {
    const v = String(r?.[key] ?? "").trim();
    if (!v) continue;
    set.add(v);
  }
  return set.size;
}

export default function AppRuntimeClient(props: {
  appName: string;
  version: number;
  spec: any;
  preview: Preview;
}) {
  const { appName, version, spec, preview } = props;

  const rows = React.useMemo(() => preview.rows ?? [], [preview.rows]);

  const sidebar = (spec?.ui?.sidebar ?? []) as Array<{ key: string; label: string }>;
  const pages = (spec?.ui?.pages ?? []) as Array<any>;
  const mainList = spec?.ui?.mainList ?? {};
  const createForm = spec?.ui?.createForm ?? {};
  const model = spec?.model ?? {};

  const primaryKey = String(mainList?.primaryKey ?? model?.primaryFieldKey ?? "").trim();
  const mainTitle = String(mainList?.title ?? appName).trim();

  const [active, setActive] = React.useState<PageKey>(sidebar?.[0]?.key ?? "overview");
  const [query, setQuery] = React.useState("");

  const activePage = pages.find((p) => p.key === active);

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !primaryKey) return rows;
    return rows.filter((r) => String(r?.[primaryKey] ?? "").toLowerCase().includes(q));
  }, [rows, query, primaryKey]);

  const columns: string[] = React.useMemo(() => {
    const cols = (mainList?.columns ?? []) as string[];
    if (Array.isArray(cols) && cols.length) return cols;
    return preview.headers.slice(0, 6);
  }, [mainList?.columns, preview.headers]);

  const managedKey =
    typeof active === "string" && active.startsWith("managed:")
      ? active.slice("managed:".length)
      : null;

  const managedValues = React.useMemo(() => {
    if (!managedKey) return [];
    return uniq(rows.map((r) => r?.[managedKey]));
  }, [managedKey, rows]);

  const kpis = React.useMemo(() => {
    const total = rows.length;
    const managed = (model?.managed ?? []) as string[];
    const fixed = (model?.fixed ?? []) as string[];
    return {
      total,
      managed1: managed[0] ? { key: managed[0], value: countUnique(rows, managed[0]) } : null,
      fixed1: fixed[0] ? { key: fixed[0], value: countUnique(rows, fixed[0]) } : null,
    };
  }, [rows, model]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white text-sm font-bold">
            {String(appName || "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-neutral-900">{appName}</div>
            <div className="text-xs text-neutral-500">Runtime • v{version}</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
          <Search className="h-4 w-4 text-neutral-500" />
          <span className="text-neutral-400">Search</span>
        </div>
      </div>

      {/* Body */}
      <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-neutral-200 bg-white">
          <div className="p-3">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Navigation
            </div>
          </div>

          <div className="px-2 pb-3">
            {sidebar.map((it) => {
              const selected = it.key === active;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => setActive(it.key)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm flex items-center gap-2 ${
                    selected ? "bg-neutral-900 text-white" : "hover:bg-neutral-50 text-neutral-800"
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
        <div className="md:col-span-9 p-6">
          {active === "overview" ? (
            <Overview
              appName={appName}
              total={kpis.total}
              managed1={kpis.managed1}
              fixed1={kpis.fixed1}
              primaryKey={primaryKey}
              sampleRow={rows[0] ?? null}
              mainTitle={mainTitle}
            />
          ) : active === "main" ? (
            <MainList
              title={mainTitle}
              primaryKey={primaryKey}
              query={query}
              setQuery={setQuery}
              columns={columns}
              rows={filteredRows}
            />
          ) : managedKey ? (
            <ManagedList title={managedKey} values={managedValues} />
          ) : (
            <div className="text-sm text-neutral-600">
              {String(activePage?.title ?? "Page")} (coming soon)
            </div>
          )}

          {/* Simple form preview from spec */}
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 p-4">
              <div className="text-sm font-semibold text-neutral-900">
                {createForm?.title ?? `Create ${mainTitle}`} (preview)
              </div>
              <div className="mt-1 text-xs text-neutral-600">
                CRUD wiring is next. This shows the generated shape.
              </div>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2">
              {((createForm?.fields ?? []) as string[]).slice(0, 8).map((f) => (
                <div key={f} className="space-y-1">
                  <div className="text-xs font-medium text-neutral-700">{f}</div>
                  <input
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none"
                    placeholder={`Enter ${f}`}
                    disabled
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4">
              <button
                type="button"
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800"
                disabled
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
                disabled
              >
                Save
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-neutral-500">
            Next: wire real CRUD + managed list pages (write back to Google Sheet or DB mirror).
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard(props: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {props.label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">{props.value}</div>
    </div>
  );
}

function Overview(props: {
  appName: string;
  total: number;
  managed1: { key: string; value: number } | null;
  fixed1: { key: string; value: number } | null;
  primaryKey: string;
  sampleRow: Record<string, any> | null;
  mainTitle: string;
}) {
  const { total, managed1, fixed1, primaryKey, sampleRow, mainTitle } = props;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-neutral-900">Overview</div>
        <div className="text-sm text-neutral-600">
          Generated from your sheet (read-only runtime for now).
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label={`Total ${mainTitle}`} value={total} />
        {managed1 ? (
          <StatCard label={`Unique ${managed1.key}`} value={managed1.value} />
        ) : (
          <StatCard label="Managed lists" value="—" />
        )}
        {fixed1 ? (
          <StatCard label={`${fixed1.key} options`} value={fixed1.value} />
        ) : (
          <StatCard label="Fixed options" value="—" />
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-semibold text-neutral-900">Sample record</div>
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-base font-semibold text-neutral-900">
            {sampleRow && primaryKey ? String(sampleRow?.[primaryKey] ?? "—") : "—"}
          </div>
          <div className="mt-2 text-sm text-neutral-700">
            {sampleRow
              ? Object.entries(sampleRow)
                  .filter(([k]) => k !== primaryKey)
                  .slice(0, 3)
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <span className="text-neutral-500">{k}</span>
                      <span className="font-medium text-neutral-900">{String(v ?? "—")}</span>
                    </div>
                  ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainList(props: {
  title: string;
  primaryKey: string;
  query: string;
  setQuery: (v: string) => void;
  columns: string[];
  rows: Array<Record<string, any>>;
}) {
  const { title, primaryKey, query, setQuery, columns, rows } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-neutral-900">{title}</div>
          <div className="text-sm text-neutral-600">List view (read-only for now).</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              className="w-52 bg-transparent outline-none"
              placeholder={`Search ${primaryKey}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
            disabled
          >
            <Plus className="mr-2 inline-block h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-neutral-50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold text-neutral-700"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-neutral-50">
                  {columns.map((c) => (
                    <td
                      key={c}
                      className="whitespace-nowrap border-b border-neutral-100 px-3 py-2 text-xs text-neutral-800"
                    >
                      {String(r?.[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-sm text-neutral-500" colSpan={columns.length}>
                    No rows found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-600">
          Showing {Math.min(50, rows.length)} of {rows.length} rows.
        </div>
      </div>
    </div>
  );
}

function ManagedList(props: { title: string; values: string[] }) {
  const { title, values } = props;
  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-neutral-900">{title}</div>
        <div className="text-sm text-neutral-600">Managed list (read-only for now).</div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4 text-sm font-semibold text-neutral-900">
          Values (sample)
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {values.length ? (
              values.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-800"
                >
                  {v}
                </span>
              ))
            ) : (
              <div className="text-sm text-neutral-500">No values found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
