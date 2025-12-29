"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Permission = {
  id: string;
  name: string;
  assignedTo: string[];
  createdAt: string;
};

const PERMS: Permission[] = [
  { id: "p1", name: "Management", assignedTo: ["Administrator"], createdAt: "14 Apr 2021, 8:43 PM" },
  { id: "p2", name: "Manage Billing & Roles", assignedTo: ["Administrator"], createdAt: "16 Sep 2021, 5:20 PM" },
  { id: "p3", name: "Add & Remove Users", assignedTo: ["Administrator", "Manager"], createdAt: "14 Oct 2021, 10:20 AM" },
  { id: "p4", name: "Project Planning", assignedTo: ["Administrator", "Users", "Support"], createdAt: "14 Oct 2021, 10:20 AM" },
  { id: "p5", name: "Manage Email Sequences", assignedTo: ["Administrator", "Users", "Support"], createdAt: "23 Aug 2021, 2:00 PM" },
  { id: "p6", name: "Client Communication", assignedTo: ["Administrator", "Manager"], createdAt: "15 Apr 2021, 11:30 AM" },
  { id: "p7", name: "Only View", assignedTo: ["Administrator", "Restricted-User"], createdAt: "04 Dec 2021, 8:15 PM" },
  { id: "p8", name: "Financial Management", assignedTo: ["Administrator", "Manager"], createdAt: "25 Feb 2021, 10:30 PM" },
  { id: "p9", name: "Manage Others’ Tasks", assignedTo: ["Administrator", "Support"], createdAt: "04 Nov 2021, 11:45 AM" },
];

export default function PermissionsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return PERMS;
    return PERMS.filter((p) => p.name.toLowerCase().includes(query));
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Permissions
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Assign what each role can access across dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/users/roles">
            <Button variant="outline" className="h-10">
              Back to Roles
            </Button>
          </Link>
          <Button className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            Add Permission
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-neutral-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 p-4">
          <div className="w-[280px]">
            <Input
              className="h-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Permissions"
            />
          </div>

          <Button className="h-9">Add Permission</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-4 font-medium text-neutral-900">
                    {p.name}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {p.assignedTo.map((r) => (
                        <RoleTag key={r} role={r} />
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-neutral-700">{p.createdAt}</td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="grid h-9 w-9 place-items-center rounded-md text-neutral-600 hover:bg-neutral-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-md text-neutral-600 hover:bg-neutral-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">
                    No permissions found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 p-4 text-xs text-neutral-500">
          <div>
            Showing <span className="font-semibold text-neutral-800">{rows.length}</span>{" "}
            of <span className="font-semibold text-neutral-800">{PERMS.length}</span>
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

function RoleTag({ role }: { role: string }) {
  const color = tagColor(role);
  return (
    <span className={["rounded-full px-3 py-1 text-xs font-medium", color].join(" ")}>
      {role}
    </span>
  );
}

function tagColor(role: string) {
  const r = role.toLowerCase();
  if (r.includes("admin")) return "bg-violet-50 text-violet-700";
  if (r.includes("manager")) return "bg-amber-50 text-amber-700";
  if (r.includes("support")) return "bg-sky-50 text-sky-700";
  if (r.includes("user")) return "bg-emerald-50 text-emerald-700";
  if (r.includes("restricted")) return "bg-rose-50 text-rose-700";
  return "bg-neutral-100 text-neutral-700";
}
