import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type FieldMode = "PRIMARY" | "FIXED" | "MANAGED" | "FREE_TEXT" | "IGNORE";

type ModelPayload = {
  model: {
    appName: string; // dashboard name
    primaryFieldKey: string; // e.g. "Student Name"
    fields: Array<{
      key: string; // column header
      mode: FieldMode;
      fixedOptions?: string[];
    }>;
  };
};

type SchemaPayload = {
  schema: {
    fields: Array<{
      key: string;
      name: string;
      type: "string" | "number" | "date" | "boolean";
      enabled: boolean;
    }>;
    dateFieldKey?: string | null;
  };
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; sourceId: string }> }
) {
  const { slug, sourceId } = await params;

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | (SchemaPayload & Partial<ModelPayload>)
    | (ModelPayload & Partial<SchemaPayload>)
    | null;

  const hasModel = Boolean((body as any)?.model?.fields?.length);
  const hasSchema = Boolean((body as any)?.schema?.fields?.length);

  if (!hasModel && !hasSchema) {
    return NextResponse.json(
      { ok: false, error: "Either model.fields or schema.fields is required" },
      { status: 400 }
    );
  }

  const dash = await prisma.dashboard.findUnique({
    where: { userId_slug: { userId, slug } },
    select: { id: true },
  });

  if (!dash) {
    return NextResponse.json({ ok: false, error: "Dashboard not found" }, { status: 404 });
  }

  const ds = await prisma.dataSource.findFirst({
    where: { id: sourceId, dashboardId: dash.id, type: "GOOGLE_SHEETS" },
    select: { id: true, config: true },
  });

  if (!ds) {
    return NextResponse.json({ ok: false, error: "DataSource not found" }, { status: 404 });
  }

  const existingConfig = (ds.config ?? {}) as Record<string, any>;
  const nextConfig: Record<string, any> = { ...existingConfig };

  if (hasSchema) {
    nextConfig.schema = (body as any).schema;
    nextConfig.schemaUpdatedAt = new Date().toISOString();
  }

  if (hasModel) {
    nextConfig.model = (body as any).model;
    nextConfig.modelUpdatedAt = new Date().toISOString();
  }

  await prisma.dataSource.update({
    where: { id: ds.id },
    data: { config: nextConfig },
  });

  return NextResponse.json({ ok: true });
}
