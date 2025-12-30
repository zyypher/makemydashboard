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
  Wand2,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BRAND = { accent: "#8C57FF" };

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

  const dashboard = await prisma.dashboard.findUnique({
    where: { userId_slug: { userId, slug } },
    include: {
      dataSources: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!dashboard) redirect("/dashboards");

  const sheetSource = dashboard.dataSources.find(
    (s) => s.type === "GOOGLE_SHEETS"
  );

  const isConnected = Boolean(sheetSource);

  const cfg = (sheetSource?.config ?? {}) as Record<string, any>;
  const hasModel = Boolean(cfg?.model?.fields?.length); // new “product mapping”
  const isMapped = isConnected && hasModel;

  const updatedAt =
    dashboard.updatedAt instanceof Date
      ? dashboard.updatedAt
      : new Date(dashboard.updatedAt);

  // Step tones
  const step2Tone: "success" | "brand" = isConnected ? "success" : "brand";
  const step3Tone: "success" | "brand" | "neutral" = isMapped
    ? "success"
    : isConnected
    ? "brand"
    : "neutral";
  const step4Tone: "brand" | "neutral" = isMapped ? "brand" : "neutral";

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
              {dashboard.name}
            </h1>

            <Pill tone={isConnected ? "success" : "brand"}>
              {isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Info className="h-3.5 w-3.5" />
              )}
              {isConnected ? "Connected" : "Not connected"}
            </Pill>

            {isMapped ? (
              <Pill tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mapped
              </Pill>
            ) : null}

            {sheetSource ? <Pill>Google Sheets</Pill> : null}
          </div>

          <p className="text-sm text-neutral-600">
            {dashboard.description || "No description"}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Updated {updatedAt.toLocaleString()}
            </span>
            <span className="text-neutral-300">•</span>
            <span>
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

          <Button
            className="h-10 gap-2"
            style={{ backgroundColor: BRAND.accent }}
            disabled={!isMapped}
            title={!isMapped ? "Finish mapping first" : undefined}
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="success">1. Created</Pill>
            <span className="text-neutral-300">→</span>
            <Pill tone={step2Tone}>2. Connect data</Pill>
            <span className="text-neutral-300">→</span>
            <Pill tone={step3Tone}>3. Describe data</Pill>
            <span className="text-neutral-300">→</span>
            <Pill tone={step4Tone}>4. Generate layout</Pill>
            <span className="text-neutral-300">→</span>
            <Pill>5. Publish</Pill>
          </div>
        </CardContent>
      </Card>

      {/* Main CTA */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-5">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="text-base font-semibold text-neutral-900">
                Connect a data source
              </div>

              <Link href={`/dashboards/${slug}/connect?type=sheets`}>
                <Button
                  className="h-10 gap-2"
                  style={{ backgroundColor: BRAND.accent }}
                >
                  Connect Google Sheets
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Google Sheets connected
              </div>

              <div className="text-sm text-neutral-600">
                Source: <span className="font-mono">{sheetSource?.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isMapped ? (
                  <Link
                    href={`/dashboards/${slug}/map?sourceId=${sheetSource?.id}`}
                  >
                    <Button
                      className="h-10 gap-2"
                      style={{ backgroundColor: BRAND.accent }}
                    >
                      Describe your data
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/dashboards/${slug}/generate?sourceId=${sheetSource?.id}`}>
                    <Button
                      className="h-10 gap-2"
                      style={{ backgroundColor: BRAND.accent }}
                    >
                      Generate layout
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                <Link href={`/dashboards/${slug}/connect?type=sheets`}>
                  <Button variant="outline" className="h-10">
                    Change source
                  </Button>
                </Link>
              </div>

              {isMapped ? (
                <div className="text-xs text-neutral-500">
                  Mapping saved. Next step is generating pages + sidebar based on your sheet.
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  Next: tell us which fields are fixed choices vs managed lists vs free text.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
