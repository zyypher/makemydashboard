// app/(app)/dashboards/new/page.tsx
import Link from "next/link";
import { ArrowLeft, Sparkles, Database, Sheet, BarChart3, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BRAND = {
  accent: "#8C57FF",
};

const sources = [
  { key: "sheets", name: "Google Sheets", desc: "Fastest for MVP / clients", icon: Sheet },
  { key: "postgres", name: "Postgres / Neon", desc: "Best for scalable data", icon: Database },
  { key: "csv", name: "CSV Upload", desc: "Quick import for tests", icon: BarChart3 },
];

export default function NewDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/dashboards"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboards
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{
                backgroundColor: "rgba(140,87,255,0.12)",
                border: "1px solid rgba(140,87,255,0.22)",
                color: BRAND.accent,
              }}
            >
              <Wand2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Create a dashboard
            </h1>
          </div>

          <p className="text-sm text-neutral-600">
            Choose a data source and tell us what you want to track. We’ll generate a clean layout.
          </p>
        </div>

        <Button variant="outline" className="h-11">
          Save draft
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Step 1 */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    Step 1 — Dashboard details
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    Name it clearly for the team (Sales, Support, Ops…).
                  </div>
                </div>

                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: "rgba(140,87,255,0.12)",
                    color: BRAND.accent,
                    border: "1px solid rgba(140,87,255,0.22)",
                  }}
                >
                  Required
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Dashboard name</Label>
                  <Input id="name" placeholder="e.g. Sales Overview" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="sales-overview" className="h-11" />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input
                    id="desc"
                    placeholder="Short description for your team"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-neutral-900">
                Step 2 — Choose data source
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Start with Sheets for MVP, then move to DB later.
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {sources.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className="group rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="grid h-10 w-10 place-items-center rounded-xl"
                          style={{
                            backgroundColor: "rgba(140,87,255,0.12)",
                            border: "1px solid rgba(140,87,255,0.22)",
                            color: BRAND.accent,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="text-[11px] font-semibold text-neutral-500">
                          Select
                        </span>
                      </div>

                      <div className="mt-3 text-sm font-semibold text-neutral-900">
                        {s.name}
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-neutral-900">
                Step 3 — What should it show?
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Add a simple prompt. Later we’ll convert this into the dashboard layout.
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Input
                  id="prompt"
                  className="h-11"
                  placeholder='e.g. "Show revenue, orders, AOV trends. Break down by region and product. Include weekly and monthly comparison."'
                />
                <p className="text-xs text-neutral-500">
                  Tip: include timeframe + dimensions (region, product, channel) + KPIs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{
                    backgroundColor: "rgba(140,87,255,0.12)",
                    border: "1px solid rgba(140,87,255,0.22)",
                    color: BRAND.accent,
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Generate</div>
                  <div className="text-xs text-neutral-600">Create a first layout</div>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  ✅ Creates sections + cards + charts structure
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  ✅ Suggests KPIs and filters
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  ✅ Gives a clean “dashboard-ready” layout
                </div>
              </div>

              <div className="mt-5">
                <Button className="h-11 w-full" style={{ backgroundColor: BRAND.accent }}>
                  Generate dashboard layout
                </Button>
                <Button variant="outline" className="mt-2 h-11 w-full">
                  Preview only
                </Button>
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                For now this is UI-only (dummy). Next we’ll connect it to your “create flow”.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-neutral-900">Next steps</div>
              <div className="mt-2 space-y-2 text-sm text-neutral-600">
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2">
                  <span>Connect source</span>
                  <span className="text-xs text-neutral-500">Soon</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2">
                  <span>Map columns</span>
                  <span className="text-xs text-neutral-500">Soon</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2">
                  <span>Share to users</span>
                  <span className="text-xs text-neutral-500">Soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
