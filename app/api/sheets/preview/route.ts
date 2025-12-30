// app/api/sheets/preview/route.ts
import { NextResponse } from "next/server";
import { previewPublicSheet } from "@/lib/googleSheetsPublic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sheetUrlOrId = String(body?.sheetUrlOrId ?? "").trim();
    const sheetName = body?.sheetName ? String(body.sheetName) : null;
    const gid = body?.gid ? String(body.gid) : null;

    if (!sheetUrlOrId) {
      return NextResponse.json(
        { ok: false, error: "sheetUrlOrId is required" },
        { status: 400 }
      );
    }

    const preview = await previewPublicSheet({
      sheetUrlOrId,
      sheetName,
      gid,
      range: "A1:Z50",
    });

    return NextResponse.json({ ok: true, preview });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Preview failed" },
      { status: 400 }
    );
  }
}
