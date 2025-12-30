// app/(app)/dashboards/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Plus,
  LayoutDashboard,
  Calendar,
  Database,
  ExternalLink,
  Sparkles,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const BRAND = {
  accent: "#8C57FF",
};

type DashboardItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  source: "Google Sheets" | "Postgres" | "Shopify" | "GA4" | "CSV" | "Unknown";
  updatedAt: string;
  status: "Live" | "Draft";
  insights: number;
};

function formatUpdatedAt(date: Date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapSource(type?: string | null): DashboardItem["source"] {
  switch (type) {
    case "GOOGLE_SHEETS":
      return "Google Sheets";
    case "POSTGRES":
    case "postgres":
      return "Postgres";
    case "SHOPIFY":
      return "Shopify";
    case "GA4":
      return "GA4";
    case "CSV":
      return "CSV";
    default:
      return "Unknown";
  }
}

function StatusPill({ status }: { status: DashboardItem["status"] }) {
  const isLive = status === "Live";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: isLive ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.12)",
        color: isLive ? "rgb(22,163,74)" : "rgb(79,70,229)",
        border: `1px solid ${isLive ? "rgba(34,197,94,0.22)" : "rgba(99,102,241,0.22)"}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isLive ? "rgb(22,163,74)" : "rgb(79,70,229)" }}
      />
      {status}
    </span>
  );
}

function SourcePill({ source }: { source: DashboardItem["source"] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700">
      <Database className="h-3.5 w-3.5 text-neutral-500" />
      {source}
    </span>
  );
}

function InsightPill({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: "rgba(140,87,255,0.12)",
        color: BRAND.accent,
        border: "1px solid rgba(140,87,255,0.22)",
      }}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {count} insights
    </span>
  );
}

export default async function DashboardsPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  const dashboardsData = user
    ? await prisma.dashboard.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          status: true,
          updatedAt: true,
          dataSources: { select: { type: true }, take: 1 },
        },
      })
    : [];

  const dashboards: DashboardItem[] = dashboardsData.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    description: d.description ?? "No description",
    source: mapSource(d.dataSources?.[0]?.type),
    updatedAt: formatUpdatedAt(d.updatedAt),
    status: d.status === "ACTIVE" ? "Live" : "Draft",
    insights: 0,
  }));

  const hasDashboards = dashboards.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{
                backgroundColor: "rgba(140,87,255,0.12)",
                border: "1px solid rgba(140,87,255,0.22)",
                color: BRAND.accent,
              }}
            >
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Dashboards
            </h1>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Create, manage, and share dashboards for teams and clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboards/new">
            <Button className="gap-2" style={{ backgroundColor: BRAND.accent }}>
              <Plus className="h-4 w-4" />
              New Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-xl">
              <Input
                placeholder="Search dashboards (name, source, status)…"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11">
              All
            </Button>
            <Button variant="outline" className="h-11">
              Live
            </Button>
            <Button variant="outline" className="h-11">
              Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {hasDashboards ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboards.map((d) => (
            <Card
              key={d.id}
              className="group border-neutral-200 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-neutral-900">
                      {d.name}
                    </div>
                    <div className="text-sm text-neutral-600">{d.description}</div>
                  </div>

                  <Link
                    href={`/dashboards/${d.id}`}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-white text-neutral-700 opacity-90 transition hover:opacity-100"
                    aria-label="Open dashboard"
                  >
                    <ExternalLink className="h-4.5 w-4.5" />
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusPill status={d.status} />
                  <SourcePill source={d.source} />
                  <InsightPill count={d.insights} />
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-neutral-500">
                  <div className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Updated {d.updatedAt}
                  </div>

                  <div className="inline-flex items-center gap-1.5">
                    <Activity className="h-4 w-4" />
                    Health: Good
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Link href={`/dashboards/${d.id}`} className="flex-1">
                    <Button variant="outline" className="h-10 w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    className="h-10"
                    style={{
                      backgroundColor: "rgba(140,87,255,0.12)",
                      color: BRAND.accent,
                      border: "1px solid rgba(140,87,255,0.22)",
                    }}
                  >
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-10">
            <div className="mx-auto max-w-xl text-center">
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
                style={{
                  backgroundColor: "rgba(140,87,255,0.12)",
                  border: "1px solid rgba(140,87,255,0.22)",
                  color: BRAND.accent,
                }}
              >
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900">
                Create your first dashboard
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Connect a data source, pick metrics, and we’ll generate a clean dashboard layout.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2">
                <Link href="/dashboards/new">
                  <Button className="gap-2" style={{ backgroundColor: BRAND.accent }}>
                    <Plus className="h-4 w-4" />
                    New Dashboard
                  </Button>
                </Link>
                <Button variant="outline">View docs</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
