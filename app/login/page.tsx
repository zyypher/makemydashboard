"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

import { GlassPanel } from "@/components/ui/glass-panel";
import {
  USER_STORAGE_KEY,
  readUserFromStorage,
  type AuthUser,
} from "@/lib/client-nav";

const mockUser: AuthUser = {
  id: "mock-user-1",
  name: "Ava Reyes",
  email: "ava.reyes@example.com",
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const user = readUserFromStorage();
    if (user) {
      router.replace("/org/new");
    }
  }, [router]);

  const handleLogin = () => {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    router.replace("/org/new");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-10 text-slate-900">
      <GlassPanel variant="modal" className="w-full max-w-md p-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              BuildYourDashboard
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm text-slate-600">
              We keep it simple—sign in with Google to continue.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs text-slate-600 shadow-inner">
            We save a mock user to your browser only. No external auth is
            triggered.
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
