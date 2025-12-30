import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export default async function AppRuntimePage({ params }: Props) {
    const { slug } = await params;

    // For MVP: public runtime. Later: auth + tenant.
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
                <div className="mt-2 text-neutral-600">
                    Go back and click “Create app”.
                </div>
            </div>
        );
    }

    const spec = layout.spec as any;

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b px-6 py-4">
                <div className="text-lg font-semibold text-neutral-900">
                    {spec?.app?.name ?? dashboard.name}
                </div>
                <div className="text-xs text-neutral-500">Runtime • v{layout.version}</div>
            </div>

            <div className="p-6">
                <div className="rounded-2xl border p-5">
                    <div className="text-sm font-semibold text-neutral-900">
                        Runtime is now driven by DB layout spec ✅
                    </div>
                    <div className="mt-2 text-sm text-neutral-600">
                        Next we’ll render the full interactive UI here (same as preview), but powered by the saved layout spec.
                    </div>

                    <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl bg-neutral-50 p-4 text-xs">
                        {JSON.stringify(spec, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
