"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Bell, Moon, Search, Settings, Star, Languages, LogOut } from "lucide-react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 md:px-6">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 ring-1 ring-neutral-200">
          <Search className="h-4.5 w-4.5 text-neutral-400" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            placeholder="Search ⌘K"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <IconButton><Languages className="h-5 w-5" /></IconButton>
          <IconButton><Moon className="h-5 w-5" /></IconButton>
          <IconButton><Star className="h-5 w-5" /></IconButton>
          <IconButton><Bell className="h-5 w-5" /></IconButton>
        </div>

        {/* Profile */}
        <div className="relative" ref={wrapRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-1 grid h-10 w-10 cursor-pointer place-items-center rounded-full ring-2 ring-neutral-200 hover:ring-neutral-300"
            aria-label="Profile"
          >
            <span className="text-sm font-semibold text-neutral-700">V</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_60px_-22px_rgba(0,0,0,0.35)]">
              {/* User */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    V
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-neutral-900">
                      Vishnu
                    </div>
                    <div className="text-xs text-neutral-500">
                      Signed in
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-neutral-200" />

              {/* Actions */}
              <div className="p-2">
                <MenuItem
                  icon={<Settings className="h-4.5 w-4.5" />}
                  label="Settings"
                />

                <button
                  onClick={handleLogout}
                  className="
                    mt-2 flex w-full items-center justify-center gap-2
                    rounded-xl bg-rose-500 px-4 py-2.5
                    text-sm font-semibold text-white
                    hover:bg-rose-600 transition cursor-pointer
                  "
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800">
      {children}
    </button>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
      <span className="text-neutral-500">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
