import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function HomePage() {
  const session = await getServerSession();

  // If logged in, go dashboard. Else login.
  if (session) redirect("/dashboard");
  redirect("/login");
}
