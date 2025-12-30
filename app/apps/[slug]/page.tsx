import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppRuntimeClient from "./runtime-client";

type Props = { params: Promise<{ slug: string }> };

export default async function AppRuntimePage({ params }: Props) {
  const { slug } = await params;

  const dashboard = await prisma.dashboard.findFirst({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!dashboard) redirect("/dashboards");

  const layout = await prisma.dashboardLayout.findFirst({
    where: { dashboardId: dashboard.id, status: "ACTIVE" },
    orderBy: { version: "desc" },
    select: { spec: true, version: true },
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

  return (
    <AppRuntimeClient
      slug={slug}
      appName={spec?.app?.name ?? dashboard.name}
      version={layout.version}
      spec={spec}
    />
  );
}
