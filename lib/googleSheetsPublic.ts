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

  // Already an ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s) && !s.includes("/")) return s;

  const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m?.[1] ?? null;
}

function extractGid(url: string): string | null {
  const s = String(url || "");
  const m = s.match(/[?#&]gid=(\d+)/);
  return m?.[1] ?? null;
}

function parseGvizResponse(text: string): any {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Unexpected GViz response format.");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function gvizUrl(opts: {
  spreadsheetId: string;
  sheet?: string | null;
  gid?: string | null;
  range?: string;
  tq?: string;
}) {
  const { spreadsheetId, sheet, gid, range, tq } = opts;

  const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId
  )}/gviz/tq`;

  const params = new URLSearchParams();
  params.set("tqx", "out:json");
  if (sheet) params.set("sheet", sheet);
  if (gid) params.set("gid", gid);
  if (range) params.set("range", range);
  params.set("tq", tq ?? "select *");

  return `${base}?${params.toString()}`;
}

function isGenericHeader(h: string) {
  const s = String(h || "").trim();
  if (!s) return true;

  // "Column 1", "Column 2"
  if (/^Column\s+\d+$/i.test(s)) return true;

  // "A", "B", ... "Z", "AA", "AB"
  if (/^[A-Z]{1,2}$/.test(s)) return true;

  return false;
}

function isNonEmpty(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}

/**
 * Determine "effective width" of the data so we don't treat A..Z as real columns
 * when only A..F has data.
 */
function computeEffectiveWidth(rawRows: any[][], maxCols: number) {
  const sampleRows = rawRows.slice(0, 25);
  let lastNonEmptyCol = -1;

  for (let c = 0; c < maxCols; c++) {
    for (let r = 0; r < sampleRows.length; r++) {
      if (isNonEmpty(sampleRows[r]?.[c])) {
        lastNonEmptyCol = Math.max(lastNonEmptyCol, c);
        break;
      }
    }
  }

  return Math.max(0, lastNonEmptyCol + 1);
}

export async function previewPublicSheet(input: {
  sheetUrlOrId: string;
  sheetName?: string | null;
  gid?: string | null;
  range?: string;
}): Promise<SheetsPreview> {
  const sheetUrlOrId = String(input.sheetUrlOrId || "").trim();
  const spreadsheetId = extractSpreadsheetId(sheetUrlOrId);
  if (!spreadsheetId) throw new Error("Invalid Google Sheet URL / ID.");

  const gid = input.gid ?? extractGid(sheetUrlOrId);
  const sheetName = input.sheetName ?? null;
  const range = input.range ?? "A1:Z200";

  const url = gvizUrl({
    spreadsheetId,
    sheet: sheetName,
    gid,
    range,
    tq: "select *",
  });

  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "make-my-dashboard/1.0" },
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

  const headersFromCols = cols.map((c, idx) => {
    const label = String(c?.label ?? "").trim();
    if (label) return label;
    const id = String(c?.id ?? "").trim();
    if (id) return id;
    return `Column ${idx + 1}`;
  });

  const rawRowsAll: any[][] = rows.map((r) =>
    (r?.c ?? []).map((cell) => cell?.v ?? null)
  );

  // ✅ Trim to only columns that have real data (fixes A/B/C showing)
  const effectiveWidth = computeEffectiveWidth(rawRowsAll, headersFromCols.length);
  const headersTrimmed =
    effectiveWidth > 0 ? headersFromCols.slice(0, effectiveWidth) : headersFromCols;
  const rawRows =
    effectiveWidth > 0
      ? rawRowsAll.map((rr) => rr.slice(0, effectiveWidth))
      : rawRowsAll;

  const firstRow = rawRows[0] ?? [];

  const headersAreGeneric =
    headersTrimmed.length > 0 && headersTrimmed.every(isGenericHeader);

  // ✅ header row check: "most" cells non-empty strings
  const nonEmptyCells = firstRow.filter((v) => typeof v === "string" && v.trim().length > 0)
    .length;
  const looksLikeHeaderRow =
    firstRow.length > 0 && nonEmptyCells >= Math.max(1, Math.ceil(firstRow.length * 0.6));

  let headers = headersTrimmed;
  let dataRows = rawRows;

  if (headersAreGeneric && looksLikeHeaderRow) {
    headers = firstRow.map((v, i) =>
      String(v || `Column ${i + 1}`).trim() || `Column ${i + 1}`
    );
    dataRows = rawRows.slice(1);
  }

  const objects = dataRows.slice(0, 50).map((r) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = r?.[i] ?? null;
    });
    return obj;
  });

  return {
    spreadsheetId,
    gid,
    sheetName,
    headers,
    rows: objects,
    rawRows,
  };
}
