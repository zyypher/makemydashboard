"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  File,
  Mic,
  MicOff,
  MousePointerClick,
  ScrollText,
  UploadCloud,
} from "lucide-react";

import { BuilderShell } from "@/components/shell/builder-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  readUserFromStorage,
  saveDraft,
  type DashboardDraft,
} from "@/lib/client-nav";

type Method = "describe" | "voice" | "upload";

const methodCards: Array<{
  id: Method;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "describe",
    title: "Describe it",
    description: "Type what your dashboard should feel like.",
    icon: ScrollText,
  },
  {
    id: "voice",
    title: "Talk it out",
    description: "Hit record, share the vibe, we turn it into a plan.",
    icon: Mic,
  },
  {
    id: "upload",
    title: "Upload inspiration",
    description: "Attach a doc or deck—we'll pull the themes for you.",
    icon: UploadCloud,
  },
];

export default function NewDashboardChooser() {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const orgId = params?.orgId;

  const [method, setMethod] = useState<Method>("describe");
  const [description, setDescription] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number }>();
  const [error, setError] = useState("");

  useEffect(() => {
    const user = readUserFromStorage();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const panel = useMemo(() => {
    if (method === "voice") {
      return (
        <GlassPanel variant="card" className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVoiceActive((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              {voiceActive ? (
                <MicOff className="h-4 w-4 text-rose-600" />
              ) : (
                <Mic className="h-4 w-4 text-emerald-600" />
              )}
              {voiceActive ? "Stop mock recording" : "Record voice (mock)"}
            </button>
            <p className="text-sm text-slate-600">
              Talk freely—this is just for your preview.
            </p>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Transcript (auto-fills after you talk)
            </span>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="“Welcome your team, highlight the calm path to first value...”"
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </GlassPanel>
      );
    }

    if (method === "upload") {
      return (
        <GlassPanel variant="card" className="p-4 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Upload a file
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileMeta({ name: file.name, size: file.size });
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          {fileMeta ? (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-sm text-slate-800 shadow-inner">
              <p className="font-semibold">{fileMeta.name}</p>
              <p className="text-xs text-slate-600">
                {(fileMeta.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              PDFs, docs, notes—anything that explains the vibe.
            </p>
          )}
        </GlassPanel>
      );
    }

    return (
      <GlassPanel variant="card" className="p-4 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Describe what you want
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="“A calm hub that shows new signups, activation steps, and gentle nudges.”"
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            "Welcome teams calmly",
            "Highlight progress without jargon",
            "Show next steps clearly",
            "Keep tone friendly",
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() =>
                setDescription((prev) =>
                  prev.includes(chip) ? prev : `${prev} ${chip}`.trim(),
                )
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              {chip}
            </button>
          ))}
        </div>
      </GlassPanel>
    );
  }, [method, description, transcript, voiceActive, fileMeta]);

  const handleContinue = () => {
    if (!orgId) return;
    const draft: DashboardDraft = {
      id: crypto.randomUUID(),
      orgId,
      method,
      content:
        method === "describe"
          ? description
          : method === "voice"
            ? transcript
            : fileMeta?.name || "",
      createdAt: Date.now(),
    };
    if (
      (method === "describe" && !draft.content.trim()) ||
      (method === "voice" && !draft.content.trim()) ||
      (method === "upload" && !fileMeta)
    ) {
      setError("Add a little detail so we can shape your preview.");
      return;
    }
    saveDraft(draft);
    router.push(`/org/${orgId}/new/preview?draftId=${draft.id}`);
  };

  return (
    <BuilderShell title="Create a dashboard">
      <div className="space-y-4">
        <GlassPanel variant="card" className="p-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Start guided
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              How do you want to share your idea?
            </h1>
            <p className="text-sm text-slate-600">
              Choose what feels easiest. We keep everything in your browser.
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {methodCards.map((card) => {
              const Icon = card.icon;
              const active = method === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setMethod(card.id);
                    setError("");
                  }}
                  className={`flex h-full flex-col items-start gap-3 rounded-3xl border bg-white/80 p-4 text-left shadow-sm transition hover:border-slate-200 ${active ? "border-slate-300 shadow" : "border-white/70"}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {card.title}
                    </p>
                    <p className="text-sm text-slate-600">{card.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassPanel>

        {panel}

        {error ? (
          <p className="text-sm font-semibold text-amber-700">{error}</p>
        ) : null}

        <GlassPanel variant="card" className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <MousePointerClick className="h-4 w-4" />
            Ready when you are. Nothing leaves your browser.
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Continue
            <File className="h-4 w-4" />
          </button>
        </GlassPanel>
      </div>
    </BuilderShell>
  );
}
