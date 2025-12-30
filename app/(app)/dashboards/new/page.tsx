"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, LayoutDashboard, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BRAND = { accent: "#8C57FF" } as const;

type SourceType = "google_sheets" | "postgres" | "shopify" | "ga4" | "csv";

const SOURCES: Array<{
  id: SourceType;
  name: string;
  desc: string;
}> = [
    { id: "google_sheets", name: "Google Sheets", desc: "Import a sheet & generate charts." },
    { id: "postgres", name: "Postgres", desc: "Connect a database and model metrics." },
    { id: "shopify", name: "Shopify", desc: "Sales, orders, AOV, cohorts." },
    { id: "ga4", name: "GA4", desc: "Traffic, funnels, retention." },
    { id: "csv", name: "CSV Upload", desc: "Quick start from a CSV file." },
  ];

function StepPill({ active, done, label }: { active?: boolean; done?: boolean; label: string }) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        active ? "border-neutral-300 bg-white text-neutral-900" : "border-neutral-200 bg-neutral-50 text-neutral-600",
      ].join(" ")}
    >
      {done ? (
        <CheckCircle2 className="h-4 w-4" style={{ color: BRAND.accent }} />
      ) : (
        <span
          className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: active ? "rgba(140,87,255,0.12)" : "rgba(0,0,0,0.06)",
            color: active ? BRAND.accent : "rgba(0,0,0,0.55)",
          }}
        >
          {label.startsWith("1") ? "1" : label.startsWith("2") ? "2" : "3"}
        </span>
      )}
      <span>{label.replace(/^\d\.\s*/, "")}</span>
    </div>
  );
}

export default function NewDashboardPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("google_sheets");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return Boolean(sourceType);
    return true;
  }, [step, name, sourceType]);

  async function createDashboard() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/dashboards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          sourceType,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Failed to create dashboard.");
        setLoading(false);
        return;
      }

      const slug = data?.dashboard?.slug ?? data?.slug;
      if (!slug) {
        setErr("Dashboard created but missing slug. Please refresh and try again.");
        setLoading(false);
        return;
      }

      // Redirect to the created dashboard route
      router.push(`/dashboards/${slug}`);
    } catch {
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{
              backgroundColor: "rgba(140,87,255,0.12)",
              border: "1px solid rgba(140,87,255,0.22)",
              color: BRAND.accent,
            }}
          >
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">New Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Create a dashboard in minutes — we’ll generate the layout after you connect data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboards">
            <Button variant="outline" className="h-10 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {step < 3 ? (
            <Button
              className="h-10"
              style={{ backgroundColor: BRAND.accent }}
              disabled={!canNext || loading}
              onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="h-10 gap-2"
              style={{ backgroundColor: BRAND.accent }}
              disabled={loading || !canNext}
              onClick={createDashboard}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Create Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-wrap items-center gap-2">
        <StepPill label="1. Basics" active={step === 1} done={step > 1} />
        <StepPill label="2. Data Source" active={step === 2} done={step > 2} />
        <StepPill label="3. Create" active={step === 3} />
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      {/* Step content */}
      {step === 1 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Dashboard basics</CardTitle>
            <CardDescription>Name + description (you can change later)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard name</Label>
              <Input
                id="name"
                className="h-11"
                placeholder="e.g. Sales Overview"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="text-xs text-neutral-500">Tip: keep it short — this becomes part of the URL.</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Input
                id="desc"
                className="h-11"
                placeholder="e.g. Revenue, orders, AOV, trends…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Choose a data source</CardTitle>
            <CardDescription>Pick what you’ll import first (you can add more later)</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 md:grid-cols-2">
            {SOURCES.map((s) => {
              const active = s.id === sourceType;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSourceType(s.id)}
                  className={[
                    "group flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                    active ? "bg-white" : "bg-neutral-50 hover:bg-white",
                  ].join(" ")}
                  style={
                    active
                      ? { borderColor: "rgba(140,87,255,0.35)", boxShadow: "0 12px 40px -28px rgba(140,87,255,0.45)" }
                      : { borderColor: "rgba(0,0,0,0.10)" }
                  }
                >
                  <div
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                      backgroundColor: active ? "rgba(140,87,255,0.12)" : "rgba(0,0,0,0.05)",
                      color: active ? BRAND.accent : "rgba(0,0,0,0.55)",
                      border: active ? "1px solid rgba(140,87,255,0.22)" : "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Database className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-neutral-900">{s.name}</div>
                    <div className="mt-1 text-xs text-neutral-600">{s.desc}</div>

                    {active ? (
                      <div
                        className="mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor: "rgba(140,87,255,0.12)",
                          color: BRAND.accent,
                          border: "1px solid rgba(140,87,255,0.22)",
                        }}
                      >
                        Selected
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Ready to create</CardTitle>
            <CardDescription>We’ll create the dashboard in Draft mode, then you connect the data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-700">
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span className="text-neutral-500">Name</span>
              <span className="font-semibold text-neutral-900">{name.trim() || "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span className="text-neutral-500">Source</span>
              <span className="font-semibold text-neutral-900">
                {SOURCES.find((s) => s.id === sourceType)?.name || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span className="text-neutral-500">Status</span>
              <span className="font-semibold" style={{ color: BRAND.accent }}>
                Draft
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
