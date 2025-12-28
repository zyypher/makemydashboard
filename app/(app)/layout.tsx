// app/(app)/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AppShell from "@/components/app-shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
