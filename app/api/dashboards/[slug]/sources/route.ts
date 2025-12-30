// app/api/dashboards/[slug]/sources/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        type?: "GOOGLE_SHEETS";
        name?: string;
        sheetUrl?: string;
      }
    | null;

  const type = body?.type;
  const name = body?.name?.trim();
  const sheetUrl = body?.sheetUrl?.trim();

  if (type !== "GOOGLE_SHEETS") {
    return NextResponse.json(
      { error: "Only GOOGLE_SHEETS supported for now" },
      { status: 400 }
    );
  }

  if (!name || !sheetUrl) {
    return NextResponse.json(
      { error: "name and sheetUrl are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const dash = await prisma.dashboard.findUnique({
    where: { userId_slug: { userId: user.id, slug } },
    select: { id: true },
  });
  if (!dash) {
    return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
  }

  const ds = await prisma.dataSource.create({
    data: {
      dashboardId: dash.id,
      type: "GOOGLE_SHEETS",
      name,
      config: { sheetUrl },
    },
    select: { id: true, type: true, name: true },
  });

  return NextResponse.json({ dataSource: ds }, { status: 201 });
}
