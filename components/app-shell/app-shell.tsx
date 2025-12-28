// components/app-shell/app-shell.tsx
"use client";

import Sidebar from "./sidebar";
import Topbar from "./topbar";



export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
