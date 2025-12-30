"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const DEMO_SHEET =
  "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0";

type Preview = {
  spreadsheetId: string;
  gid?: string | null;
  sheetName?: string | null;
  headers: string[];
  rows: Array<Record<string, any>>;
};

export default function SheetsConnectClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [sheetUrlOrId, setSheetUrlOrId] = React.useState(DEMO_SHEET);
  const [sheetName, setSheetName] = React.useState<string>("");
  const [gid, setGid] = React.useState<string>("0");

  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const [loadingConnect, setLoadingConnect] = React.useState(false);

  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");

  const [preview, setPreview] = React.useState<Preview | null>(null);

  async function runPreview() {
    setError("");
    setSuccess("");
    setPreview(null);
    setLoadingPreview(true);

    try {
      const res = await fetch("/api/sheets/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetUrlOrId,
          sheetName: sheetName.trim() || null,
          gid: gid.trim() || null,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Preview failed (${res.status})`);
      }

      setPreview(json.preview);
    } catch (e: any) {
      setError(e?.message || "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function connect(e?: React.MouseEvent) {
    e?.preventDefault?.(); // defensive (in case this ends up in a <form>)
    setError("");
    setSuccess("");
    setLoadingConnect(true);

    try {
      const res = await fetch(`/api/dashboards/${encodeURIComponent(slug)}/connect/sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetUrlOrId,
          sheetName: sheetName.trim() || null,
          gid: gid.trim() || null,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Connect failed (${res.status})`);
      }

      // Show confirmation so user knows something happened
      setSuccess("Connected! Redirecting…");

      // Use router (Next-safe) and force refresh server components
      router.replace(`/dashboards/${encodeURIComponent(slug)}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Connect failed");
    } finally {
      setLoadingConnect(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-8">
          <label className="text-sm font-medium text-neutral-900">
            Google Sheet URL (public)
          </label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
            value={sheetUrlOrId}
            onChange={(e) => setSheetUrlOrId(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/...."
          />
          <div className="mt-2 text-xs text-neutral-500">
            Tip: Set sharing to “Anyone with the link can view” for MVP.
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-neutral-900">
            Sheet name (optional)
          </label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="e.g. Sheet1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-neutral-900">
            gid (optional)
          </label>
          <input
            className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300"
            value={gid}
            onChange={(e) => setGid(e.target.value)}
            placeholder="e.g. 0"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="h-10"
          onClick={() => {
            setSheetUrlOrId(DEMO_SHEET);
            setSheetName("");
            setGid("0");
            setPreview(null);
            setError("");
            setSuccess("");
          }}
          variant="outline"
        >
          Use demo sheet
        </Button>

        <Button
          type="button"
          className="h-10"
          onClick={runPreview}
          disabled={loadingPreview}
        >
          {loadingPreview ? "Previewing..." : "Preview"}
        </Button>

        <Button
          type="button"
          className="h-10"
          onClick={connect}
          disabled={loadingConnect || !preview}
        >
          {loadingConnect ? "Connecting..." : "Connect"}
        </Button>

        {!preview ? (
          <span className="text-xs text-neutral-500">
            Run preview first to enable Connect.
          </span>
        ) : null}
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

      {preview ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <div className="text-sm font-semibold text-neutral-900">Preview</div>
            <div className="mt-1 text-xs text-neutral-600">
              Spreadsheet ID:{" "}
              <span className="font-mono">{preview.spreadsheetId}</span>
              {preview.gid ? (
                <>
                  {" "}
                  • gid: <span className="font-mono">{preview.gid}</span>
                </>
              ) : null}
              {preview.sheetName ? (
                <>
                  {" "}
                  • sheet: <span className="font-mono">{preview.sheetName}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <div className="max-h-[360px] overflow-auto bg-white">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-neutral-50">
                  <tr>
                    {preview.headers.map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold text-neutral-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-neutral-50">
                      {preview.headers.map((h) => (
                        <td
                          key={h}
                          className="whitespace-nowrap border-b border-neutral-100 px-3 py-2 text-xs text-neutral-700"
                        >
                          {row?.[h] == null ? "" : String(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              Showing up to 10 rows for preview.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
