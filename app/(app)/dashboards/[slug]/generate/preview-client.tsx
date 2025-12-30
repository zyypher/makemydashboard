"use client";

import * as React from "react";
import {
    LayoutDashboard,
    List,
    Settings,
    Plus,
    Search,
    ChevronRight,
    Sparkles,
    Loader2,
} from "lucide-react";

type Mode = "PRIMARY" | "FIXED" | "MANAGED" | "FREE_TEXT" | "IGNORE";

type Model = {
    appName: string;
    primaryFieldKey: string;
    fields: Array<{
        key: string;
        mode: Mode;
        fixedOptions?: string[];
    }>;
};

type Preview = {
    headers: string[];
    rows: Array<Record<string, any>>;
};

function uniq(values: any[]) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const v of values) {
        const s = String(v ?? "").trim();
        if (!s) continue;
        if (seen.has(s)) continue;
        seen.add(s);
        out.push(s);
        if (out.length >= 10) break;
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

type PageKey = "overview" | "main" | `managed:${string}` | "settings";

export default function GeneratePreviewClient(props: {
    slug: string;
    dashboardName: string;
    sourceId: string;
    model: Model;
    preview: Preview;
}) {
    const { slug, dashboardName, sourceId, model, preview } = props;

    const rows = React.useMemo(() => preview.rows ?? [], [preview.rows]);

    const primaryKey = model.primaryFieldKey;
    const mainEntityName = dashboardName;

    const managedFields = model.fields
        .filter((f) => f.mode === "MANAGED")
        .map((f) => f.key);

    const fixedFields = model.fields
        .filter((f) => f.mode === "FIXED")
        .map((f) => ({
            key: f.key,
            options: f.fixedOptions ?? uniq(rows.map((r) => r[f.key])),
        }));

    const formFields = model.fields.filter(
        (f) => f.mode === "FIXED" || f.mode === "FREE_TEXT"
    );

    const [active, setActive] = React.useState<PageKey>("overview");
    const [query, setQuery] = React.useState("");

    const [creating, setCreating] = React.useState(false);
    const [createError, setCreateError] = React.useState("");

    const filteredRows = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;

        return rows.filter((r) => {
            const pv = String(r?.[primaryKey] ?? "").toLowerCase();
            return pv.includes(q);
        });
    }, [rows, query, primaryKey]);

    const visibleTableFields = React.useMemo(() => {
        const others = model.fields
            .filter((f) => f.key !== primaryKey && f.mode !== "IGNORE")
            .map((f) => f.key);

        return [primaryKey, ...others].slice(0, 6);
    }, [model.fields, primaryKey]);

    const kpis = React.useMemo(() => {
        const total = rows.length;
        const managedCounts = managedFields.slice(0, 3).map((k) => ({
            key: k,
            value: countUnique(rows, k),
        }));
        const fixedCounts = fixedFields.slice(0, 2).map((f) => ({
            key: f.key,
            value: countUnique(rows, f.key),
        }));
        return { total, managedCounts, fixedCounts };
    }, [rows, managedFields, fixedFields]);

    const sidebarItems = React.useMemo(() => {
        const items: Array<{ key: PageKey; label: string; icon: React.ReactNode }> =
            [
                {
                    key: "overview",
                    label: "Overview",
                    icon: <LayoutDashboard className="h-4 w-4" />,
                },
                { key: "main", label: mainEntityName, icon: <List className="h-4 w-4" /> },
            ];

        for (const m of managedFields) {
            items.push({
                key: `managed:${m}`,
                label: m,
                icon: <ChevronRight className="h-4 w-4" />,
            });
        }

        items.push({
            key: "settings",
            label: "Settings (later)",
            icon: <Settings className="h-4 w-4" />,
        });

        return items;
    }, [managedFields, mainEntityName]);

    const managedKey =
        typeof active === "string" && active.startsWith("managed:")
            ? active.slice("managed:".length)
            : null;

    const managedValues = React.useMemo(() => {
        if (!managedKey) return [];
        return uniq(rows.map((r) => r[managedKey]));
    }, [managedKey, rows]);

    async function createApp() {
        setCreateError("");
        setCreating(true);

        try {
            const res = await fetch(`/api/dashboards/${encodeURIComponent(slug)}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceId, activate: true }),
            });

            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.ok) {
                throw new Error(json?.error || `Create failed (${res.status})`);
            }

            const url = String(json?.appUrl || `/apps/${slug}`);
            window.location.href = url;
        } catch (e: any) {
            setCreateError(e?.message || "Create failed");
            setCreating(false);
        }
    }

    return (
        <div className="space-y-4 relative">
            {/* Loader overlay */}
            {creating ? (
                <div className="absolute inset-0 z-50 grid place-items-center rounded-2xl bg-white/80 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-900 text-white">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-neutral-900">
                                    Creating your app…
                                </div>
                                <div className="text-xs text-neutral-600">
                                    Saving layout, preparing pages, finalizing.
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-neutral-700">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                                Saving layout v1
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                                Preparing runtime view
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                                Redirecting
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Top actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                    <span className="font-semibold">Preview only:</span> Theme + logo can be customized later.
                </div>

                <button
                    type="button"
                    onClick={createApp}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:opacity-95"
                >
                    <Sparkles className="h-4 w-4" />
                    Create app
                </button>
            </div>

            {createError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {createError}
                </div>
            ) : null}

            {/* App preview frame */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {/* Top bar inside preview */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white text-sm font-bold">
                            {String(dashboardName || "A").slice(0, 1).toUpperCase()}
                        </div>

                        <div className="leading-tight">
                            <div className="text-sm font-semibold text-neutral-900">{dashboardName}</div>
                            <div className="text-xs text-neutral-500">Logo + theme can be updated later</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
                            <Search className="h-4 w-4 text-neutral-500" />
                            <span className="text-neutral-400">Search</span>
                        </div>
                        <button
                            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
                            type="button"
                            onClick={() => setActive("main")}
                            title="Preview action"
                        >
                            <Plus className="h-4 w-4" />
                            New {mainEntityName}
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-12">
                    {/* Sidebar */}
                    <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-neutral-200 bg-white">
                        <div className="p-3">
                            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                Navigation
                            </div>
                        </div>

                        <div className="px-2 pb-3">
                            {sidebarItems.map((it) => {
                                const selected = it.key === active;
                                return (
                                    <button
                                        key={String(it.key)}
                                        type="button"
                                        onClick={() => setActive(it.key)}
                                        className={`w-full rounded-xl px-3 py-2 text-left text-sm flex items-center gap-2 ${selected
                                                ? "bg-neutral-900 text-white"
                                                : "hover:bg-neutral-50 text-neutral-800"
                                            }`}
                                    >
                                        {it.icon}
                                        <span className="truncate">{it.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border-t border-neutral-200 p-3">
                            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                Generated from sheet
                            </div>
                            <div className="mt-2 space-y-1 text-xs text-neutral-600">
                                <div>
                                    Main record: <span className="font-semibold">{mainEntityName}</span>
                                </div>
                                <div>
                                    Record title: <span className="font-semibold">{primaryKey}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-9 p-4">
                        {active === "overview" ? (
                            <Overview
                                total={kpis.total}
                                managedCounts={kpis.managedCounts}
                                fixedCounts={kpis.fixedCounts}
                                mainEntityName={mainEntityName}
                                primaryKey={primaryKey}
                                sampleRow={rows[0] ?? null}
                            />
                        ) : active === "main" ? (
                            <MainList
                                title={mainEntityName}
                                primaryKey={primaryKey}
                                query={query}
                                setQuery={setQuery}
                                fields={visibleTableFields}
                                rows={filteredRows}
                            />
                        ) : managedKey ? (
                            <ManagedList title={managedKey} values={managedValues} />
                        ) : (
                            <div className="text-sm text-neutral-600">Settings preview will be added later.</div>
                        )}

                        {/* Create form preview */}
                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
                            <div className="border-b border-neutral-200 p-4">
                                <div className="text-sm font-semibold text-neutral-900">
                                    Create {mainEntityName} (preview)
                                </div>
                                <div className="mt-1 text-xs text-neutral-600">
                                    Fixed choices become dropdowns.
                                </div>
                            </div>

                            <div className="grid gap-3 p-4 md:grid-cols-2">
                                <FieldBox label={primaryKey}>
                                    <input
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
                                        placeholder={`Enter ${primaryKey}`}
                                        disabled
                                    />
                                </FieldBox>

                                {formFields
                                    .filter((f) => f.key !== primaryKey && f.mode !== "IGNORE")
                                    .slice(0, 5)
                                    .map((f) => {
                                        if (f.mode === "FIXED") {
                                            const opts =
                                                fixedFields.find((x) => x.key === f.key)?.options ?? [];
                                            return (
                                                <FieldBox key={f.key} label={f.key}>
                                                    <select
                                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
                                                        disabled
                                                    >
                                                        <option>Select…</option>
                                                        {opts.slice(0, 8).map((o) => (
                                                            <option key={o}>{o}</option>
                                                        ))}
                                                    </select>
                                                </FieldBox>
                                            );
                                        }

                                        return (
                                            <FieldBox key={f.key} label={f.key}>
                                                <input
                                                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
                                                    placeholder={`Enter ${f.key}`}
                                                    disabled
                                                />
                                            </FieldBox>
                                        );
                                    })}
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
                            After clicking “Create app”, we’ll render the real runtime at <span className="font-mono">/apps/{slug}</span>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- Subcomponents ---------- */

function FieldBox(props: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <div className="text-xs font-medium text-neutral-700">{props.label}</div>
            {props.children}
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
    total: number;
    managedCounts: Array<{ key: string; value: number }>;
    fixedCounts: Array<{ key: string; value: number }>;
    mainEntityName: string;
    primaryKey: string;
    sampleRow: Record<string, any> | null;
}) {
    const { total, managedCounts, fixedCounts, mainEntityName, primaryKey, sampleRow } = props;

    return (
        <div className="space-y-4">
            <div>
                <div className="text-lg font-semibold text-neutral-900">Overview</div>
                <div className="text-sm text-neutral-600">Quick summary based on your sheet sample.</div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <StatCard label={`Total ${mainEntityName}`} value={total} />
                {managedCounts[0] ? (
                    <StatCard label={`Unique ${managedCounts[0].key}`} value={managedCounts[0].value} />
                ) : (
                    <StatCard label="Generated pages" value="—" />
                )}
                {fixedCounts[0] ? (
                    <StatCard label={`${fixedCounts[0].key} options`} value={fixedCounts[0].value} />
                ) : (
                    <StatCard label="Fixed options" value="—" />
                )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="text-sm font-semibold text-neutral-900">Sample record</div>
                <div className="mt-1 text-xs text-neutral-600">
                    This is how a single record card could look.
                </div>

                <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="text-base font-semibold text-neutral-900">
                        {sampleRow ? String(sampleRow?.[primaryKey] ?? "—") : "—"}
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
    fields: string[];
    rows: Array<Record<string, any>>;
}) {
    const { title, primaryKey, query, setQuery, fields, rows } = props;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold text-neutral-900">{title}</div>
                    <div className="text-sm text-neutral-600">List preview (CRUD will be generated next).</div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
                        <Search className="h-4 w-4 text-neutral-500" />
                        <input
                            className="w-44 bg-transparent outline-none"
                            placeholder={`Search ${primaryKey}…`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
                        disabled
                        title="Preview only"
                    >
                        <Plus className="mr-2 inline-block h-4 w-4" />
                        Add
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="max-h-[320px] overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-neutral-50">
                            <tr>
                                {fields.map((f) => (
                                    <th
                                        key={f}
                                        className="whitespace-nowrap border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold text-neutral-700"
                                    >
                                        {f}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(0, 20).map((r, idx) => (
                                <tr key={idx} className="odd:bg-white even:bg-neutral-50">
                                    {fields.map((f) => (
                                        <td
                                            key={f}
                                            className="whitespace-nowrap border-b border-neutral-100 px-3 py-2 text-xs text-neutral-800"
                                        >
                                            {String(r?.[f] ?? "")}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {rows.length === 0 ? (
                                <tr>
                                    <td className="px-3 py-6 text-sm text-neutral-500" colSpan={fields.length}>
                                        No rows match your search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-600">
                    Showing {Math.min(20, rows.length)} of {rows.length} rows (preview).
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
                <div className="text-sm text-neutral-600">
                    Managed list preview (we’ll generate CRUD for this list).
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 p-4 text-sm font-semibold text-neutral-900">
                    Existing values (sample)
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
                            <div className="text-sm text-neutral-500">No values found in sample.</div>
                        )}
                    </div>

                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                        In the real generated app, users can add/edit/delete these items.
                    </div>
                </div>
            </div>
        </div>
    );
}
