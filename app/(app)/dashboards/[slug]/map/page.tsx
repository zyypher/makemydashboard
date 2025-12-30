import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { previewPublicSheet } from "@/lib/googleSheetsPublic";
import MapFieldsClient from "./map-fields-client";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const sourceId = String(sp?.sourceId ?? "").trim();

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);

  if (!userId) redirect("/login");
  if (!sourceId) redirect(`/dashboards/${slug}`);

  const dash = await prisma.dashboard.findUnique({
    where: { userId_slug: { userId, slug } },
    select: { id: true, name: true },
  });

  if (!dash) redirect("/dashboards");

  const ds = await prisma.dataSource.findFirst({
    where: { id: sourceId, dashboardId: dash.id, type: "GOOGLE_SHEETS" },
    select: { id: true, name: true, config: true },
  });

  if (!ds) redirect(`/dashboards/${slug}`);

  const cfg = (ds.config ?? {}) as Record<string, any>;
  const sheetUrlOrId =
    String(cfg.originalInput ?? cfg.sheetUrl ?? cfg.spreadsheetId ?? "").trim();
  const sheetName = cfg.sheetName ? String(cfg.sheetName) : null;
  const gid = cfg.gid ? String(cfg.gid) : null;

  const preview = await previewPublicSheet({
    sheetUrlOrId,
    sheetName,
    gid,
    range: "A1:Z200",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-neutral-900">
            What should this app let you manage?
          </div>
          <div className="text-sm text-neutral-600">
            We’ll generate pages, sidebars, and forms based on your sheet — no technical setup.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboards/${slug}`}>
            <Button variant="outline" className="h-10">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-5">
          <MapFieldsClient
            slug={slug}
            dashboardName={dash.name}
            sourceId={ds.id}
            sourceName={ds.name}
            initialPreview={preview}
            existingModel={cfg.model ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
