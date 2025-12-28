import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        You are logged in. Next: build Materio-like layout here.
      </p>
    </div>
  );
}
