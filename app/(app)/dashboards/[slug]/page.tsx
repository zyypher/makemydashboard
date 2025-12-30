import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) redirect("/login");

  const d = await prisma.dashboard.findFirst({
    where: { userId, slug: params.slug },
  });

  if (!d) redirect("/dashboards");

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-neutral-900">{d.name}</h1>
      <p className="text-sm text-neutral-600">{d.description || "No description"}</p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        Next: “Connect data source” step will go here.
      </div>
    </div>
  );
}
