import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);

  const q = String(searchParams.get("q") ?? "").trim().toLowerCase();
  const take = Math.min(100, Math.max(1, Number(searchParams.get("take") ?? 50)));
  const skip = Math.max(0, Number(searchParams.get("skip") ?? 0));

  const dashboard = await prisma.dashboard.findFirst({
    where: { slug },
    select: { id: true },
  });
  if (!dashboard) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const layout = await prisma.dashboardLayout.findFirst({
    where: { dashboardId: dashboard.id, status: "ACTIVE" },
    orderBy: { version: "desc" },
    select: { id: true, spec: true },
  });
  if (!layout) return NextResponse.json({ ok: false, error: "Layout not found" }, { status: 404 });

  const primaryKey = String((layout.spec as any)?.ui?.mainList?.primaryKey ?? "").trim();

  const all = await prisma.appRecord.findMany({
    where: { layoutId: layout.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const filtered = q && primaryKey
    ? all.filter((r) => String((r.data as any)?.[primaryKey] ?? "").toLowerCase().includes(q))
    : all;

  const page = filtered.slice(skip, skip + take).map((r) => ({
    id: r.id,
    data: r.data,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return NextResponse.json({
    ok: true,
    primaryKey,
    total: filtered.length,
    records: page,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Mutations require auth (since runtime is on same domain, your session cookie works)
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

  const rec = await prisma.appRecord.create({
    data: {
      dashboardId: dashboard.id,
      layoutId: layout.id,
      data,
    },
    select: { id: true, data: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, record: rec }, { status: 201 });
}
