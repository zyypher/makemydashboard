"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BuilderShell } from "@/components/shell/builder-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { readUserFromStorage, saveOrg, type Org } from "@/lib/client-nav";

export default function NewOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = readUserFromStorage();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setError("Please add an organization name.");
      return;
    }
    const org: Org = {
      id: crypto.randomUUID(),
      name: value,
      createdAt: Date.now(),
    };
    saveOrg(org);
    router.replace(`/org/${org.id}`);
  };

  return (
    <BuilderShell title="Create organization">
      <div className="mx-auto max-w-2xl">
        <GlassPanel variant="card" className="p-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Organization setup
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Name your workspace
            </h1>
            <p className="text-sm text-slate-600">
              Keep it friendly—everyone sees this in the builder and preview.
            </p>
          </div>
          <form className="mt-5 space-y-4" onSubmit={handleCreate}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">
                Organization name
              </span>
              <input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="e.g. Calm Launch Team"
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            {error ? (
              <p className="text-sm font-semibold text-amber-700">{error}</p>
            ) : null}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Create
              </button>
              <p className="text-sm text-slate-600">
                You can add dashboards after creating the org.
              </p>
            </div>
          </form>
        </GlassPanel>
      </div>
    </BuilderShell>
  );
}
