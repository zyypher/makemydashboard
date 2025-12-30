import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { previewPublicSheet } from "@/lib/googleSheetsPublic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GeneratePreviewClient from "./preview-client";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GeneratePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const sourceId = String(sp?.sourceId ?? "").trim();

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);

  if (!userId) redirect("/login");
  if (!sourceId) redirect(`/dashboards/${slug}`);

  const dashboard = await prisma.dashboard.findUnique({
    where: { userId_slug: { userId, slug } },
    include: { dataSources: { orderBy: { createdAt: "desc" } } },
  });

  if (!dashboard) redirect("/dashboards");

  const ds = dashboard.dataSources.find((s) => s.id === sourceId);
  if (!ds) redirect(`/dashboards/${slug}`);

  const cfg = (ds.config ?? {}) as Record<string, any>;
  const model = cfg?.model ?? null;

  if (!model?.fields?.length) {
    redirect(`/dashboards/${slug}/map?sourceId=${sourceId}`);
  }

  const sheetUrlOrId = String(
    cfg.originalInput ?? cfg.sheetUrl ?? cfg.spreadsheetId ?? ""
  ).trim();

  const sheetName = cfg.sheetName ? String(cfg.sheetName) : null;
  const gid = cfg.gid ? String(cfg.gid) : null;

  // Pull enough to compute simple KPIs + show table.
  const preview = await previewPublicSheet({
    sheetUrlOrId,
    sheetName,
    gid,
    range: "A1:Z250",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-neutral-900">
            Preview layout
          </div>
          <div className="text-sm text-neutral-600">
            This is a preview of the app we’ll generate. You can change theme + logo later.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboards/${slug}`}>
            <Button variant="outline" className="h-10">
              Back
            </Button>
          </Link>

          <Button className="h-10" disabled title="Next step (we’ll wire this next)">
            Create pages (next)
          </Button>
        </div>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-5">
          <GeneratePreviewClient
            slug={slug}
            dashboardName={dashboard.name}
            sourceId={ds.id}
            model={model}
            preview={preview}
          />
        </CardContent>
      </Card>
    </div>
  );
}
