// components/dashboard/stat-card.tsx
import Card from "@/components/ui-lite/card";

export default function StatCard({
  title,
  value,
  delta,
  badge,
  icon,
}: {
  title: string;
  value: string;
  delta?: string;
  badge?: string;
  icon?: React.ReactNode;
}) {
  const isNegative = (delta ?? "").trim().startsWith("-");
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-500">{title}</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-2xl font-semibold text-neutral-900">{value}</div>
            {delta ? (
              <div className={["text-sm font-semibold", isNegative ? "text-rose-500" : "text-emerald-500"].join(" ")}>
                {delta}
              </div>
            ) : null}
          </div>

          {badge ? (
            <div className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              {badge}
            </div>
          ) : null}
        </div>

        {icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 text-neutral-700">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
