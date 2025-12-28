import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  // Not logged in → login
  if (!session) {
    redirect("/login");
  }

  // Logged in → home is the dashboard
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        You are logged in. Next: build Materio-like layout here.
      </p>
    </main>
  );
}
