// app/api/dashboards/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; slug?: string; description?: string | null }
    | null;

  const name = body?.name?.trim();
  const description = body?.description?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const baseSlug = slugify(body?.slug?.trim() || name);
  if (!baseSlug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure unique per user
  let slug = baseSlug;
  for (let i = 0; i < 50; i++) {
    const exists = await prisma.dashboard.findFirst({
      where: { userId: user.id, slug },
      select: { id: true },
    });

    if (!exists) break;
    slug = `${baseSlug}-${i + 2}`;
  }

  const dashboard = await prisma.dashboard.create({
    data: {
      userId: user.id,
      name,
      slug,
      description,
      status: "DRAFT",
    },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ dashboard }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ dashboards: [] });
  }

  const dashboards = await prisma.dashboard.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      updatedAt: true,
      dataSources: { select: { type: true } },
    },
  });

  return NextResponse.json({ dashboards });
}
