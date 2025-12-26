"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { readUserFromStorage } from "@/lib/client-nav";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = readUserFromStorage();
    const next = user ? "/org/new" : "/login";
    router.replace(next);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-800">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm">
        Redirecting you to the right spot...
      </div>
    </div>
  );
}
