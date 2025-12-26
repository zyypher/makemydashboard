"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Layout, LayoutDashboard, List, Waypoints } from "lucide-react";

import { BuilderShell } from "@/components/shell/builder-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  createGeneratedAppFromDraft,
  findDraft,
  readUserFromStorage,
  type GeneratedApp,
} from "@/lib/client-nav";

const screens = [
  { id: "highlights", title: "Highlights", detail: "Glass cards with your proof points." },
  { id: "checklist", title: "Next steps", detail: "Solid list that keeps the rollout calm." },
  { id: "touchpoints", title: "Touchpoints", detail: "Table that stays crisp white for clarity." },
];

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const searchParams = useSearchParams();
  const orgId = params?.orgId;
  const draftId = searchParams.get("draftId");

  const draft = useMemo(
    () => (draftId ? findDraft(draftId) : null),
    [draftId],
  );
  const [name, setName] = useState(
    draft?.content?.slice(0, 28) || "New dashboard",
  );

  useEffect(() => {
    const user = readUserFromStorage();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const sidebarItems = useMemo(() => {
    return [
      { id: "overview", label: "Overview" },
      ...screens.map((s) => ({ id: s.id, label: s.title })),
    ];
  }, []);

  const handleCreate = () => {
    if (!draft || !orgId) return;
    const app: GeneratedApp = createGeneratedAppFromDraft({
      draft,
      name: name.trim() || "New dashboard",
    });
    router.push(`/app/${app.id}`);
  };

  return (
    <BuilderShell title="Preview your dashboard">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-4">
          <GlassPanel variant="card" className="p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dashboard name
            </p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
            <p className="text-sm text-slate-600">
              This shows in your generated app sidebar and header.
            </p>
          </GlassPanel>

          <GlassPanel variant="card" className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-slate-700" />
              <p className="text-sm font-semibold text-slate-900">
                We will create these screens
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {screens.map((screen) => (
                <GlassPanel key={screen.id} variant="card" className="p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    {screen.title}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{screen.detail}</p>
                </GlassPanel>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel variant="card" className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Waypoints className="h-4 w-4 text-slate-700" />
              <p className="text-sm font-semibold text-slate-900">
                How they connect
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>Overview gently introduces the promise.</li>
              <li>Highlights show recent wins with glass cards.</li>
              <li>Next steps keep the rollout simple and human.</li>
              <li>Touchpoints stay solid white so details stay readable.</li>
            </ul>
          </GlassPanel>

          <GlassPanel variant="card" className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <List className="h-4 w-4" />
              Calm, guided screens are ready to generate.
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Create Dashboard
            </button>
          </GlassPanel>
        </div>

        <GlassPanel variant="sidebar" className="p-4">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preview sidebar
              </p>
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-600">
                Light glass shell, solid content panels.
              </p>
            </div>
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                    index === 0
                      ? "border-slate-200 bg-white text-slate-900"
                      : "border-white/70 bg-white/70 text-slate-800"
                  }`}
                >
                  <Layout className="h-4 w-4" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>
    </BuilderShell>
  );
}
