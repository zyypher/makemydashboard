import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { previewPublicSheet } from "@/lib/googleSheetsPublic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

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

    // 1) Find dashboard (using your @@unique([userId, slug]))
    const dashboard = await prisma.dashboard.findUnique({
      where: { userId_slug: { userId, slug } },
      select: { id: true, name: true },
    });

    if (!dashboard) {
      return NextResponse.json(
        { ok: false, error: "Dashboard not found" },
        { status: 404 }
      );
    }

    // 2) Validate sheet is readable (public) + extract spreadsheetId
    const preview = await previewPublicSheet({
      sheetUrlOrId,
      sheetName,
      gid,
      range: "A1:Z10",
    });

    // 3) Upsert a DataSource for this dashboard + sheet
    // We don't have a unique constraint for (dashboardId, type, name),
    // so we "findFirst then update/create" (safe & simple).
    const existing = await prisma.dataSource.findFirst({
      where: {
        dashboardId: dashboard.id,
        type: "GOOGLE_SHEETS",
      },
      select: { id: true },
    });

    const dsName =
      sheetName?.trim() ||
      (gid ? `Google Sheet (gid:${gid})` : "Google Sheet");

    const config = {
      spreadsheetId: preview.spreadsheetId,
      sheetName: preview.sheetName,
      gid: preview.gid,
      originalInput: sheetUrlOrId,
    };

    const dataSource = existing
      ? await prisma.dataSource.update({
          where: { id: existing.id },
          data: {
            name: dsName,
            config,
          },
        })
      : await prisma.dataSource.create({
          data: {
            dashboardId: dashboard.id,
            type: "GOOGLE_SHEETS",
            name: dsName,
            config,
          },
        });

    return NextResponse.json({
      ok: true,
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Connect failed" },
      { status: 400 }
    );
  }
}
