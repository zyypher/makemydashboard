"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  User as UserIcon,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "Editor" | "Author" | "Maintainer" | "Subscriber";
  plan: "Enterprise" | "Team" | "Company";
  status: "Active" | "Pending" | "Inactive";
};

const USERS: UserRow[] = [
  {
    id: "u1",
    name: "Galen Slixby",
    username: "gslixby0",
    email: "gslixby0@abc.net.au",
    role: "Editor",
    plan: "Enterprise",
    status: "Inactive",
  },
  {
    id: "u2",
    name: "Halsey Redmore",
    username: "hredmore1",
    email: "hredmore1@imgur.com",
    role: "Author",
    plan: "Team",
    status: "Pending",
  },
  {
    id: "u3",
    name: "Marjory Sicely",
    username: "msicely2",
    email: "msicely2@who.int",
    role: "Maintainer",
    plan: "Enterprise",
    status: "Active",
  },
  {
    id: "u4",
    name: "Cyrill Risby",
    username: "crisby3",
    email: "crisby3@wordpress.com",
    role: "Maintainer",
    plan: "Team",
    status: "Inactive",
  },
  {
    id: "u5",
    name: "Maggy Hurran",
    username: "mhurran4",
    email: "mhurran4@yahoo.co.jp",
    role: "Subscriber",
    plan: "Enterprise",
    status: "Pending",
  },
  {
    id: "u6",
    name: "Silvain Halstead",
    username: "shalstead5",
    email: "shalstead5@shinystat.com",
    role: "Author",
    plan: "Company",
    status: "Active",
  },
  {
    id: "u7",
    name: "Breena Gallemore",
    username: "bgallemore6",
    email: "bgallemore6@boston.com",
    role: "Subscriber",
    plan: "Company",
    status: "Pending",
  },
  {
    id: "u8",
    name: "Kathryne Liger",
    username: "kliger7",
    email: "kliger7@vinaora.com",
    role: "Author",
    plan: "Enterprise",
    status: "Pending",
  },
];

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"All" | UserRow["role"]>("All");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return USERS.filter((u) => {
      const matchesQ =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);
      const matchesRole = role === "All" ? true : u.role === role;
      return matchesQ && matchesRole;
    });
  }, [q, role]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage who can access dashboards and what they can do.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/users/roles">
            <Button variant="outline" className="h-10 gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </Button>
          </Link>
          <Link href="/users/permissions">
            <Button variant="outline" className="h-10 gap-2">
              <UserIcon className="h-4 w-4" />
              Permissions
            </Button>
          </Link>
          <Button className="h-10">Add User</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total users"
          value={`${USERS.length}`}
          sub="Across all dashboards"
        />
        <StatCard
          title="Active"
          value={`${USERS.filter((u) => u.status === "Active").length}`}
          sub="Currently can access"
        />
        <StatCard
          title="Pending"
          value={`${USERS.filter((u) => u.status === "Pending").length}`}
          sub="Invited / awaiting"
        />
      </div>

      {/* Table card */}
      <Card className="overflow-hidden border-neutral-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-[260px]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search User"
                className="h-9"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="All">Select Role</option>
              <option value="Editor">Editor</option>
              <option value="Author">Author</option>
              <option value="Maintainer">Maintainer</option>
              <option value="Subscriber">Subscriber</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-600">
              <tr>
                <th className="w-[48px] px-4 py-3">
                  <input type="checkbox" className="h-4 w-4" />
                </th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="h-4 w-4" />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div className="leading-tight">
                        <div className="font-semibold text-neutral-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {u.username}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-neutral-700">{u.email}</td>

                  <td className="px-4 py-4">
                    <RoleChip role={u.role} />
                  </td>

                  <td className="px-4 py-4 text-neutral-700">{u.plan}</td>

                  <td className="px-4 py-4">
                    <StatusPill status={u.status} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2 text-neutral-600">
                      <IconAction title="View">
                        <Eye className="h-4 w-4" />
                      </IconAction>
                      <IconAction title="Edit">
                        <Pencil className="h-4 w-4" />
                      </IconAction>
                      <IconAction title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </IconAction>
                      <IconAction title="More">
                        <MoreVertical className="h-4 w-4" />
                      </IconAction>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-neutral-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 p-4 text-xs text-neutral-500">
          <div>
            Showing <span className="font-semibold text-neutral-800">{rows.length}</span> of{" "}
            <span className="font-semibold text-neutral-800">{USERS.length}</span>
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

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-neutral-600">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </div>
      <div className="mt-1 text-sm text-neutral-500">{sub}</div>
    </Card>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
      {initials || "U"}
    </div>
  );
}

function RoleChip({ role }: { role: UserRow["role"] }) {
  const map: Record<UserRow["role"], { bg: string; fg: string }> = {
    Editor: { bg: "bg-indigo-50", fg: "text-indigo-700" },
    Author: { bg: "bg-amber-50", fg: "text-amber-700" },
    Maintainer: { bg: "bg-emerald-50", fg: "text-emerald-700" },
    Subscriber: { bg: "bg-violet-50", fg: "text-violet-700" },
  };

  const s = map[role];
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        s.bg,
        s.fg,
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {role}
    </span>
  );
}

function StatusPill({ status }: { status: UserRow["status"] }) {
  const map: Record<UserRow["status"], { bg: string; fg: string }> = {
    Active: { bg: "bg-emerald-50", fg: "text-emerald-700" },
    Pending: { bg: "bg-amber-50", fg: "text-amber-700" },
    Inactive: { bg: "bg-neutral-100", fg: "text-neutral-600" },
  };

  const s = map[status];
  return (
    <span className={["rounded-full px-3 py-1 text-xs font-medium", s.bg, s.fg].join(" ")}>
      {status}
    </span>
  );
}

function IconAction({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-9 w-9 place-items-center rounded-md hover:bg-neutral-100"
    >
      {children}
    </button>
  );
}
