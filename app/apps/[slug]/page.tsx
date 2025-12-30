// app/apps/[slug]/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { previewPublicSheet } from "@/lib/googleSheetsPublic";
import AppRuntimeClient from "./runtime-client";

type Props = { params: Promise<{ slug: string }> };

export default async function AppRuntimePage({ params }: Props) {
  const { slug } = await params;

  const dashboard = await prisma.dashboard.findFirst({
    where: { slug },
    select: { id: true, name: true, dataSources: true },
  });

  if (!dashboard) redirect("/dashboards");

  const layout = await prisma.dashboardLayout.findFirst({
    where: { dashboardId: dashboard.id, status: "ACTIVE" },
    orderBy: { version: "desc" },
    select: { spec: true, version: true, sourceId: true },
  });

  if (!layout) {
    return (
      <div className="p-10">
        <div className="text-2xl font-semibold">App not created yet</div>
        <div className="mt-2 text-neutral-600">Go back and click “Create app”.</div>
      </div>
    );
  }

  const spec = layout.spec as any;

  const source = dashboard.dataSources.find((s: any) => s.id === layout.sourceId);
  if (!source) {
    return (
      <div className="p-10">
        <div className="text-2xl font-semibold">Data source missing</div>
        <div className="mt-2 text-neutral-600">
          The connected Google Sheet source was not found.
        </div>
      </div>
    );
  }

  const cfg = (source.config ?? {}) as Record<string, any>;
  const sheetUrlOrId = String(
    cfg.originalInput ?? cfg.sheetUrl ?? cfg.spreadsheetId ?? ""
  ).trim();

  const sheetName = cfg.sheetName ? String(cfg.sheetName) : null;
  const gid = cfg.gid ? String(cfg.gid) : null;

  const preview = await previewPublicSheet({
    sheetUrlOrId,
    sheetName,
    gid,
    range: "A1:Z500",
  });

  return (
    <AppRuntimeClient
      appName={spec?.app?.name ?? dashboard.name}
      version={layout.version}
      spec={spec}
      preview={preview}
    />
  );
}
