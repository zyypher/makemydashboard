import { Search, User } from "lucide-react";

export function Topbar() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-inner backdrop-blur lg:flex-row lg:items-center lg:gap-4">
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          placeholder="Search your dashboards"
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          <User className="h-4 w-4" />
        </span>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
