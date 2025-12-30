"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Mode = "PRIMARY" | "FIXED" | "MANAGED" | "FREE_TEXT" | "IGNORE";

type Preview = {
  headers: string[];
  rows: Array<Record<string, any>>;
};

type ExistingModel = {
  appName: string;
  primaryFieldKey: string;
  fields: Array<{
    key: string;
    mode: Mode;
    fixedOptions?: string[];
  }>;
} | null;

function uniq(values: any[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= 12) break;
  }
  return out;
}

function uniqueCount(values: any[]) {
  const seen = new Set<string>();
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s) continue;
    seen.add(s);
    if (seen.size > 200) break;
  }
  return seen.size;
}

function suggestMode(unique: number) {
  if (unique <= 8) return "FIXED" as const;      // Gender, Status, small enums
  if (unique <= 60) return "MANAGED" as const;   // Major, Class Level, Categories
  return "FREE_TEXT" as const;                   // Notes / comments / high-cardinality
}

function label(mode: Mode) {
  switch (mode) {
    case "PRIMARY":
      return "Main record name";
    case "FIXED":
      return "Fixed choices (no management screen)";
    case "MANAGED":
      return "Managed list (creates sidebar + CRUD page)";
    case "FREE_TEXT":
      return "Free text (just type it)";
    case "IGNORE":
      return "Ignore this column";
  }
}

export default function MapFieldsClient(props: {
  slug: string;
  dashboardName: string;
  sourceId: string;
  sourceName: string;
  initialPreview: Preview;
  existingModel: ExistingModel;
}) {
  const { slug, dashboardName, sourceId, initialPreview, existingModel } = props;

  const headers = initialPreview.headers ?? [];
  const rows = initialPreview.rows ?? [];

  const defaultPrimary = headers[0] ?? "";

  const [primaryFieldKey, setPrimaryFieldKey] = React.useState<string>(
    existingModel?.primaryFieldKey ?? defaultPrimary
  );

  const [fields, setFields] = React.useState<Array<{ key: string; mode: Mode }>>(() => {
    if (existingModel?.fields?.length) {
      // keep order aligned with current headers
      const byKey = new Map(existingModel.fields.map((f) => [f.key, f.mode]));
      return headers.map((h) => ({
        key: h,
        mode: h === (existingModel.primaryFieldKey ?? defaultPrimary) ? "PRIMARY" : (byKey.get(h) ?? "FREE_TEXT"),
      }));
    }

    return headers.map((h) => {
      if (h === defaultPrimary) return { key: h, mode: "PRIMARY" as const };
      const uc = uniqueCount(rows.map((r) => r[h]));
      return { key: h, mode: suggestMode(uc) as Mode };
    });
  });

  React.useEffect(() => {
    setFields((prev) =>
      prev.map((f) => ({
        ...f,
        mode: f.key === primaryFieldKey ? "PRIMARY" : (f.mode === "PRIMARY" ? suggestMode(uniqueCount(rows.map((r) => r[f.key]))) : f.mode),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryFieldKey]);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        model: {
          appName: dashboardName,
          primaryFieldKey,
          fields: fields.map((f) => ({
            key: f.key,
            mode: f.mode,
            fixedOptions:
              f.mode === "FIXED" ? uniq(rows.map((r) => r[f.key])) : undefined,
          })),
        },
      };

      const res = await fetch(
        `/api/dashboards/${encodeURIComponent(slug)}/sources/${encodeURIComponent(
          sourceId
        )}/schema`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Save failed (${res.status})`);
      }

      setSuccess("Saved! Redirecting…");
      window.location.href = `/dashboards/${encodeURIComponent(slug)}`;
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-base font-semibold text-neutral-900">
          We’ll build a management app called <span className="underline">{dashboardName}</span>
        </div>
        <div className="mt-1 text-sm text-neutral-600">
          Next, confirm what users should be able to manage from your sheet.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold text-neutral-900">
              What is the main record?
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              This becomes the main “list” page (Add / Edit / Delete).
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-neutral-700">
                Record title column
              </label>
              <select
                className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
                value={primaryFieldKey}
                onChange={(e) => setPrimaryFieldKey(e.target.value)}
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 p-4">
              <div className="text-sm font-semibold text-neutral-900">
                How should users interact with each field?
              </div>
              <div className="mt-1 text-xs text-neutral-600">
                We’ll generate sidebars, dropdowns, and CRUD pages automatically.
              </div>
            </div>

            <div className="max-h-[560px] overflow-auto">
              {fields.map((f) => {
                const samples = uniq(rows.map((r) => r[f.key]));
                const uc = uniqueCount(rows.map((r) => r[f.key]));
                const isPrimary = f.mode === "PRIMARY";

                return (
                  <div
                    key={f.key}
                    className="border-b border-neutral-100 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {f.key}
                          {isPrimary ? (
                            <span className="ml-2 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                              Main record name
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-neutral-600">
                          {uc} unique values
                        </div>

                        {samples.length ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {samples.slice(0, 6).map((s) => (
                              <span
                                key={s}
                                className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] text-neutral-700"
                              >
                                {s}
                              </span>
                            ))}
                            {uc > 6 ? (
                              <span className="text-[11px] text-neutral-500">
                                + more
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] text-neutral-500">
                            (Mostly empty in sample)
                          </div>
                        )}
                      </div>

                      <div className="min-w-[320px]">
                        <div className="grid gap-2">
                          {(
                            ["FIXED", "MANAGED", "FREE_TEXT", "IGNORE"] as Mode[]
                          ).map((m) => (
                            <label
                              key={m}
                              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                                f.mode === m
                                  ? "border-neutral-300 bg-neutral-50"
                                  : "border-neutral-200 bg-white"
                              } ${isPrimary ? "opacity-60 pointer-events-none" : ""}`}
                            >
                              <input
                                type="radio"
                                name={`mode-${f.key}`}
                                checked={f.mode === m}
                                onChange={() =>
                                  setFields((prev) =>
                                    prev.map((x) =>
                                      x.key === f.key ? { ...x, mode: m } : x
                                    )
                                  )
                                }
                              />
                              <span className="text-sm text-neutral-800">
                                {label(m)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {f.mode === "FIXED" ? (
                      <div className="mt-3 text-xs text-neutral-600">
                        Fixed choices detected:{" "}
                        <span className="font-medium text-neutral-800">
                          {samples.slice(0, 10).join(", ")}
                          {uc > 10 ? "…" : ""}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold text-neutral-900">
              What happens after this?
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              We’ll generate:
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>A main list page (CRUD)</li>
                <li>Sidebars for “Managed lists”</li>
                <li>Dropdowns for “Fixed choices”</li>
                <li>Text inputs for “Free text”</li>
              </ul>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <Button
            className="h-11 w-full"
            onClick={save}
            disabled={saving || !primaryFieldKey}
          >
            {saving ? "Saving…" : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
