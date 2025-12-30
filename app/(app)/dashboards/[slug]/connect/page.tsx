// app/(app)/dashboards/[slug]/connect/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SheetsConnectClient from "./sheets-connect-client";



type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConnectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const type = String(sp?.type ?? "");

  const session = await getServerSession(authOptions);
  const userId =
    ((session as any)?.user?.id as string | undefined) ||
    ((session as any)?.token?.sub as string | undefined);

  if (!userId) redirect("/login");

  // Only handle sheets for now
  if (type !== "sheets") {
    redirect(`/dashboards/${slug}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-neutral-900">
            Connect Google Sheets
          </div>
          <div className="text-sm text-neutral-600">
            Paste a public Google Sheet link (Anyone with the link can view). We’ll preview headers + rows.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboards/${slug}`}>
            <Button variant="outline" className="h-10">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-5">
          <SheetsConnectClient slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}
