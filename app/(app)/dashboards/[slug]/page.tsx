// app/(app)/dashboards/[slug]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Database,
  ExternalLink,
  Info,
  Sparkles,
  Wand2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BRAND = { accent: "#8C57FF" };

// Next 16: params can be a Promise (Turbopack / sync dynamic APIs warning)
type Props = {
  params: Promise<{ slug: string }>;
};

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "brand";
}) {
  const style =
    tone === "success"
      ? {
          backgroundColor: "rgba(34,197,94,0.12)",
          color: "rgb(22,163,74)",
          border: "1px solid rgba(34,197,94,0.22)",
        }
      : tone === "brand"
      ? {
          backgroundColor: "rgba(140,87,255,0.12)",
          color: BRAND.accent,
          border: "1px solid rgba(140,87,255,0.22)",
        }
      : {
          backgroundColor: "rgba(0,0,0,0.04)",
          color: "rgb(64,64,64)",
          border: "1px solid rgba(0,0,0,0.08)",
        };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={style}
    >
      {children}
    </span>
  );
}

export default async function DashboardDetailPage({ params }: Props) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);

  if (!userId) redirect("/login");

  const d = await prisma.dashboard.findFirst({
    where: { userId, slug },
  });

  if (!d) redirect("/dashboards");

  // Fix: description not showing (supports either `description` or older `desc`)
  const descriptionRaw =
    (d as any)?.description ?? (d as any)?.desc ?? (d as any)?.about ?? "";
  const description = String(descriptionRaw || "").trim();

  const updatedAt =
    (d as any)?.updatedAt instanceof Date
      ? (d as any).updatedAt
      : (d as any)?.updatedAt
      ? new Date((d as any).updatedAt)
      : null;

  // If you have these fields in your Dashboard model, they’ll show automatically.
  const sourceType = (d as any)?.sourceType as string | undefined;
  const isConnected = Boolean((d as any)?.dataSourceId || (d as any)?.sourceConnected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{
                backgroundColor: "rgba(140,87,255,0.12)",
                border: "1px solid rgba(140,87,255,0.22)",
                color: BRAND.accent,
              }}
            >
              <Database className="h-5 w-5" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {(d as any)?.name ?? "Dashboard"}
            </h1>

            <Pill tone={isConnected ? "success" : "brand"}>
              {isConnected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              {isConnected ? "Connected" : "Not connected"}
            </Pill>

            {sourceType ? <Pill>{sourceType}</Pill> : null}
          </div>

          <p className="text-sm text-neutral-600">
            {description.length ? description : "No description"}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {updatedAt ? `Updated ${updatedAt.toLocaleString()}` : "Updated recently"}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              Slug: <span className="font-mono text-neutral-700">{slug}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboards">
            <Button variant="outline" className="h-10">
              Back to list
            </Button>
          </Link>

          <Link href={`/dashboards/${slug}/preview`} aria-disabled>
            <Button
              className="h-10 gap-2"
              style={{ backgroundColor: BRAND.accent }}
              // preview page may not exist yet; keep it visually ready
              disabled
              title="Preview step will be added next"
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                1. Created
              </Pill>
              <span className="text-neutral-300">→</span>
              <Pill tone={isConnected ? "success" : "brand"}>
                {isConnected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
                2. Connect data
              </Pill>
              <span className="text-neutral-300">→</span>
              <Pill>3. Map fields</Pill>
              <span className="text-neutral-300">→</span>
              <Pill>4. Generate layout</Pill>
              <span className="text-neutral-300">→</span>
              <Pill>5. Publish</Pill>
            </div>

            <div className="text-xs text-neutral-500">
              We’ll keep this flow inside this page as a wizard (next step: connect).
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connect Data Source */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-base font-semibold text-neutral-900">
                Connect a data source
              </div>
              <div className="text-sm text-neutral-600">
                Choose where your data lives. We’ll validate and build a schema for dashboard generation.
              </div>
            </div>

            <Pill tone="brand">
              <Sparkles className="h-3.5 w-3.5" />
              Next step
            </Pill>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SourceCard
              title="Google Sheets"
              desc="Paste a sheet URL → pick tab → we read headers + sample rows."
              cta="Connect"
              href={`/dashboards/${slug}/connect?type=sheets`}
              enabled
            />
            <SourceCard
              title="Postgres"
              desc="Connect via read-only credentials and select tables/views."
              cta="Coming soon"
              href="#"
              enabled={false}
            />
            <SourceCard
              title="CSV Upload"
              desc="Upload a CSV (or multiple) and we’ll infer types + relationships."
              cta="Coming soon"
              href="#"
              enabled={false}
            />
            <SourceCard
              title="GA4"
              desc="Connect GA4 property and generate marketing analytics dashboards."
              cta="Coming soon"
              href="#"
              enabled={false}
            />
            <SourceCard
              title="Shopify"
              desc="Connect Shopify store and generate sales + customer dashboards."
              cta="Coming soon"
              href="#"
              enabled={false}
            />
            <SourceCard
              title="Manual"
              desc="Define fields manually (fastest for prototyping)."
              cta="Coming soon"
              href="#"
              enabled={false}
            />
          </div>

          <div
            className="mt-5 rounded-xl p-4 text-sm"
            style={{
              backgroundColor: "rgba(140,87,255,0.08)",
              border: "1px solid rgba(140,87,255,0.16)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg"
                style={{ backgroundColor: "rgba(140,87,255,0.14)", color: BRAND.accent }}
              >
                <Wand2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900">What happens next?</div>
                <div className="mt-1 text-neutral-700">
                  After you connect, we’ll show a field-mapping screen (metrics, dimensions, date column),
                  then generate the dashboard layout + preview.
                </div>
                <div className="mt-3">
                  <Link href={`/dashboards/${slug}/connect?type=sheets`}>
                    <Button className="h-10 gap-2" style={{ backgroundColor: BRAND.accent }}>
                      Continue to connect
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SourceCard({
  title,
  desc,
  cta,
  href,
  enabled,
}: {
  title: string;
  desc: string;
  cta: string;
  href: string;
  enabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-1 text-sm text-neutral-600">{desc}</div>

      <div className="mt-4">
        {enabled ? (
          <Link href={href}>
            <Button
              className="h-10 w-full gap-2"
              style={{ backgroundColor: BRAND.accent, cursor: "pointer" }}
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            className="h-10 w-full"
            disabled
            style={{ cursor: "not-allowed" }}
          >
            {cta}
          </Button>
        )}
      </div>
    </div>
  );
}
