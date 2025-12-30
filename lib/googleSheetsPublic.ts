// lib/googleSheetsPublic.ts

export type SheetsPreview = {
  spreadsheetId: string;
  gid?: string | null;
  sheetName?: string | null;
  headers: string[];
  rows: Array<Record<string, any>>;
  rawRows: any[][];
};

function extractSpreadsheetId(urlOrId: string): string | null {
  const s = String(urlOrId || "").trim();
  if (!s) return null;

  // If it's already an ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s) && !s.includes("/")) return s;

  // Typical URL: https://docs.google.com/spreadsheets/d/{ID}/edit#gid=0
  const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m?.[1] ?? null;
}

function extractGid(url: string): string | null {
  const s = String(url || "");
  const m = s.match(/[?#&]gid=(\d+)/);
  return m?.[1] ?? null;
}

/**
 * Google "gviz/tq" returns JS like:
 *   google.visualization.Query.setResponse({...});
 * We strip it to get JSON.
 */
function parseGvizResponse(text: string): any {
  const trimmed = text.trim();

  // Find first "{" after setResponse(
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Unexpected GViz response format.");
  }

  const jsonStr = trimmed.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

function gvizUrl(opts: {
  spreadsheetId: string;
  sheet?: string | null;
  gid?: string | null;
  range?: string;
  tq?: string; // query language
}) {
  const { spreadsheetId, sheet, gid, range, tq } = opts;

  const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId
  )}/gviz/tq`;

  const params = new URLSearchParams();
  // Ask for JSON
  params.set("tqx", "out:json");

  if (sheet) params.set("sheet", sheet);
  if (gid) params.set("gid", gid);

  // If range not provided, GViz returns whole sheet; we’ll usually provide a range
  if (range) params.set("range", range);

  // Default: select everything
  params.set("tq", tq ?? "select *");

  return `${base}?${params.toString()}`;
}

export async function previewPublicSheet(input: {
  sheetUrlOrId: string;
  sheetName?: string | null;
  gid?: string | null;
  range?: string; // e.g. A1:Z50
}): Promise<SheetsPreview> {
  const sheetUrlOrId = String(input.sheetUrlOrId || "").trim();
  const spreadsheetId = extractSpreadsheetId(sheetUrlOrId);
  if (!spreadsheetId) throw new Error("Invalid Google Sheet URL / ID.");

  const gid = input.gid ?? extractGid(sheetUrlOrId);
  const sheetName = input.sheetName ?? null;
  const range = input.range ?? "A1:Z50";

  const url = gvizUrl({
    spreadsheetId,
    sheet: sheetName,
    gid,
    range,
    tq: "select *",
  });

  const res = await fetch(url, {
    // GViz sometimes blocks weird caching; keep it simple
    cache: "no-store",
    headers: {
      "User-Agent": "make-my-dashboard/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet (HTTP ${res.status}). Is it public?`);
  }

  const text = await res.text();
  const json = parseGvizResponse(text);

  if (json?.status !== "ok") {
    throw new Error(
      json?.errors?.[0]?.detailed_message ||
        json?.errors?.[0]?.message ||
        "GViz query failed. Is the sheet shared as 'Anyone with the link can view'?"
    );
  }

  const table = json?.table;
  const cols = (table?.cols ?? []) as Array<{ label?: string; id?: string }>;
  const rows = (table?.rows ?? []) as Array<{ c?: Array<{ v?: any }> }>;

  const headers = cols.map((c, idx) => {
    const label = String(c?.label ?? "").trim();
    if (label) return label;
    const id = String(c?.id ?? "").trim();
    if (id) return id;
    return `Column ${idx + 1}`;
  });

  const rawRows: any[][] = rows.map((r) =>
    (r?.c ?? []).map((cell) => cell?.v ?? null)
  );

  // Assume first row is headers if it looks like strings and headers are generic
  // (Common with GViz + range that includes row 1 headers)
  const firstRow = rawRows[0] ?? [];
  const looksLikeHeaderRow =
    firstRow.length > 0 &&
    firstRow.every((v) => typeof v === "string" && String(v).trim().length > 0);

  let effectiveHeaders = headers;
  let dataRows = rawRows;

  // If GViz cols are generic but row1 is real headers, prefer row1 as headers
  const headersAreGeneric = headers.every((h) => /^Column \d+$/.test(h));
  if (headersAreGeneric && looksLikeHeaderRow) {
    effectiveHeaders = firstRow.map((v, i) => String(v || `Column ${i + 1}`));
    dataRows = rawRows.slice(1);
  }

  const objects = dataRows.slice(0, 25).map((r) => {
    const obj: Record<string, any> = {};
    effectiveHeaders.forEach((h, i) => {
      obj[h] = r?.[i] ?? null;
    });
    return obj;
  });

  return {
    spreadsheetId,
    gid,
    sheetName,
    headers: effectiveHeaders,
    rows: objects,
    rawRows,
  };
}
