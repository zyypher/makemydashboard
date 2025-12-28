// app/(app)/page.tsx
import StatCard from "@/components/dashboard/stat-card";
import Card from "@/components/ui-lite/card";
import { Activity, BarChart3, DollarSign, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Top row - compact KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Ratings"
          value="13k"
          delta="+15.6%"
          badge="Year of 2025"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Sessions"
          value="24.5k"
          delta="-20%"
          badge="Last Week"
          icon={<Users className="h-5 w-5" />}
        />
        <Card className="p-5 md:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-neutral-500">Transactions</div>
              <div className="mt-1 text-xs text-neutral-500">Total 48.5% Growth 😎 this month</div>
            </div>
            <button className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100">
              ⋮
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniMetric icon={<DollarSign className="h-5 w-5" />} label="Sales" value="245k" />
            <MiniMetric icon={<Users className="h-5 w-5" />} label="Users" value="12.5k" />
            <MiniMetric icon={<BarChart3 className="h-5 w-5" />} label="Product" value="1.54k" />
          </div>
        </Card>
      </div>

      {/* Main widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Total Sales */}
        <Card className="p-5 lg:col-span-4">
          <Header title="Total Sales" subtitle="$21,845" />
          <div className="mt-4 h-44 rounded-xl bg-gradient-to-b from-emerald-50 to-white ring-1 ring-neutral-100">
            {/* Placeholder chart */}
            <div className="h-full w-full rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.20),transparent_45%),radial-gradient(circle_at_60%_70%,rgba(16,185,129,0.14),transparent_55%)]" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-neutral-400">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </Card>

        {/* Revenue Report */}
        <Card className="p-5 lg:col-span-4">
          <Header title="Revenue Report" />
          <div className="mt-5 h-44 rounded-xl ring-1 ring-neutral-100 bg-white p-4">
            <div className="flex h-full items-end gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="w-full rounded-md bg-emerald-400/80"
                    style={{ height: `${18 + ((i * 11) % 70)}%` }}
                  />
                  <div className="mt-2 w-full rounded-md bg-neutral-300/70" style={{ height: `${14 + ((i * 9) % 45)}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Earning
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-neutral-400" /> Expense
              </span>
            </div>
          </div>
        </Card>

        {/* Sales Overview */}
        <Card className="p-5 lg:col-span-4">
          <Header title="Sales Overview" />
          <div className="mt-4 grid grid-cols-12 gap-4">
            <div className="col-span-6 flex items-center justify-center">
              <div className="relative h-44 w-44">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,rgba(99,102,241,0.0)_0deg,rgba(99,102,241,0.9)_130deg,rgba(167,139,250,0.85)_240deg,rgba(99,102,241,0.15)_360deg)]" />
                <div className="absolute inset-3 rounded-full bg-white ring-1 ring-neutral-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-neutral-900">100k</div>
                    <div className="text-xs text-neutral-500">Weekly Sales</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-6 space-y-3">
              <div className="rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-100">
                <div className="text-xs text-neutral-500">Number of Sales</div>
                <div className="mt-1 text-lg font-semibold">$86,400</div>
              </div>

              <div className="space-y-2 text-sm">
                <LegendDot label="Apparel" value="$12,150" />
                <LegendDot label="Electronics" value="$24,900" />
                <LegendDot label="FMCG" value="$12,750" />
                <LegendDot label="Other Sales" value="$50,200" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Lower row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-8">
          <Header title="Activity Timeline" />
          <div className="mt-4 space-y-4">
            <TimelineItem title="12 Invoices have been paid" subtitle="Invoices have been paid to the company" time="12 min ago" />
            <TimelineItem title="New project created" subtitle="6 team members in a project" time="2 days ago" />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-4">
          <Header title="Total Growth" subtitle="42.5k" />
          <div className="mt-4 h-40 rounded-xl bg-gradient-to-b from-rose-50 to-white ring-1 ring-neutral-100">
            <div className="h-full w-full rounded-xl bg-[radial-gradient(circle_at_25%_35%,rgba(244,63,94,0.16),transparent_55%),radial-gradient(circle_at_70%_65%,rgba(34,197,94,0.16),transparent_55%)]" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-neutral-500">{subtitle}</div> : null}
      </div>
      <button className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100">⋮</button>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-neutral-100">
        {icon}
      </div>
      <div>
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="text-sm font-semibold text-neutral-900">{value}</div>
      </div>
    </div>
  );
}

function LegendDot({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2 text-neutral-700">
        <span className="h-2 w-2 rounded-full bg-indigo-500" />
        {label}
      </div>
      <div className="text-neutral-700">{value}</div>
    </div>
  );
}

function TimelineItem({ title, subtitle, time }: { title: string; subtitle: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-neutral-900">{title}</div>
          <div className="text-xs text-neutral-400">{time}</div>
        </div>
        <div className="mt-1 text-sm text-neutral-500">{subtitle}</div>
      </div>
    </div>
  );
}
