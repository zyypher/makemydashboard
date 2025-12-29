"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Users, Copy, Pencil, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Role = {
  id: string;
  name: string;
  totalUsers: number;
  sampleAvatars: string[]; // initials
};

const ROLES: Role[] = [
  { id: "r1", name: "Administrator", totalUsers: 4, sampleAvatars: ["JD", "AR", "MS"] },
  { id: "r2", name: "Editor", totalUsers: 7, sampleAvatars: ["KL", "BG", "SH"] },
  { id: "r3", name: "Users", totalUsers: 5, sampleAvatars: ["CR", "MH", "GS"] },
  { id: "r4", name: "Support", totalUsers: 6, sampleAvatars: ["MS", "JD", "AR"] },
  { id: "r5", name: "Restricted User", totalUsers: 10, sampleAvatars: ["BG", "KL", "SH"] },
];

type RoleRow = {
  id: string;
  role: string;
  users: number;
  createdAt: string;
};

const ROLE_ROWS: RoleRow[] = [
  { id: "t1", role: "Administrator", users: 4, createdAt: "14 Apr 2021, 8:43 PM" },
  { id: "t2", role: "Editor", users: 7, createdAt: "16 Sep 2021, 5:20 PM" },
  { id: "t3", role: "Users", users: 5, createdAt: "14 Oct 2021, 10:20 AM" },
  { id: "t4", role: "Support", users: 6, createdAt: "23 Aug 2021, 2:00 PM" },
  { id: "t5", role: "Restricted User", users: 10, createdAt: "04 Dec 2021, 8:15 PM" },
];

export default function RolesPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ROLE_ROWS;
    return ROLE_ROWS.filter((r) => r.role.toLowerCase().includes(query));
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Roles List
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            A role provides access to predefined menus and features.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/users">
            <Button variant="outline" className="h-10">
              Back to Users
            </Button>
          </Link>
          <Button className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((r) => (
          <Card key={r.id} className="border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-neutral-500">
                  Total {r.totalUsers} users
                </div>
                <div className="mt-2 text-base font-semibold text-neutral-900">
                  {r.name}
                </div>
                <button className="mt-1 text-sm font-medium text-violet-700 hover:underline">
                  Edit Role
                </button>
              </div>

              <div className="flex items-center gap-2">
                <AvatarStack initials={r.sampleAvatars} extra={Math.max(0, r.totalUsers - r.sampleAvatars.length)} />
                <button className="grid h-9 w-9 place-items-center rounded-md text-neutral-600 hover:bg-neutral-100">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add role card */}
        <Card className="border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">Add new role</div>
                <div className="text-sm text-neutral-500">If it doesn’t exist.</div>
              </div>
            </div>
            <Button className="h-9">Add Role</Button>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-4">
          <div className="text-lg font-semibold text-neutral-900">
            Total users with their roles
          </div>
          <div className="mt-1 text-sm text-neutral-500">
            Find all of your company’s accounts and their assigned roles.
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <div className="w-full sm:w-[320px]">
            <Input
              className="h-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Role"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-600">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Users</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-4 font-semibold text-neutral-900">{r.role}</td>
                  <td className="px-4 py-4 text-neutral-700">{r.users}</td>
                  <td className="px-4 py-4 text-neutral-700">{r.createdAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="grid h-9 w-9 place-items-center rounded-md text-neutral-600 hover:bg-neutral-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-md text-neutral-600 hover:bg-neutral-100">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">
                    No roles found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 p-4 text-xs text-neutral-500">
          <div>
            Showing <span className="font-semibold text-neutral-800">{filtered.length}</span>{" "}
            roles
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="h-8 rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-700">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AvatarStack({ initials, extra }: { initials: string[]; extra: number }) {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {initials.slice(0, 3).map((i) => (
          <div
            key={i}
            className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-neutral-100 text-[11px] font-semibold text-neutral-700"
          >
            {i}
          </div>
        ))}
      </div>
      {extra > 0 ? (
        <div className="ml-2 rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
          +{extra}
        </div>
      ) : null}
    </div>
  );
}
