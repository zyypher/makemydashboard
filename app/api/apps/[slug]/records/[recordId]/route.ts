import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string; recordId: string }> }
) {
  const { slug, recordId } = await params;

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { data?: any } | null;
  const data = body?.data ?? null;
  if (!data || typeof data !== "object") {
    return NextResponse.json({ ok: false, error: "data is required" }, { status: 400 });
  }

  const dashboard = await prisma.dashboard.findFirst({
    where: { slug },
    select: { id: true },
  });
  if (!dashboard) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const layout = await prisma.dashboardLayout.findFirst({
    where: { dashboardId: dashboard.id, status: "ACTIVE" },
    orderBy: { version: "desc" },
    select: { id: true },
  });
  if (!layout) return NextResponse.json({ ok: false, error: "Layout not found" }, { status: 404 });

  const updated = await prisma.appRecord.update({
    where: { id: recordId },
    data: { data },
    select: { id: true, data: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, record: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; recordId: string }> }
) {
  const { slug, recordId } = await params;

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const dashboard = await prisma.dashboard.findFirst({
    where: { slug },
    select: { id: true },
  });
  if (!dashboard) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // soft delete
  await prisma.appRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
