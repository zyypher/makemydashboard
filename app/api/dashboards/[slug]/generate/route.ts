import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { previewPublicSheet } from "@/lib/googleSheetsPublic";

type Mode = "PRIMARY" | "FIXED" | "MANAGED" | "FREE_TEXT" | "IGNORE";

type Model = {
    appName: string;
    primaryFieldKey: string;
    fields: Array<{
        key: string;
        mode: Mode;
        fixedOptions?: string[];
    }>;
};

function buildLayoutSpec(input: {
    slug: string;
    dashboardName: string;
    model: Model;
}) {
    const { slug, dashboardName, model } = input;

    const primaryKey = model.primaryFieldKey;

    const managed = model.fields.filter((f) => f.mode === "MANAGED").map((f) => f.key);
    const fixed = model.fields.filter((f) => f.mode === "FIXED").map((f) => f.key);
    const free = model.fields.filter((f) => f.mode === "FREE_TEXT").map((f) => f.key);

    const listColumns = [
        primaryKey,
        ...model.fields
            .filter((f) => f.key !== primaryKey && f.mode !== "IGNORE")
            .map((f) => f.key),
    ].slice(0, 6);

    const formFields = [
        primaryKey,
        ...model.fields
            .filter(
                (f) =>
                    f.key !== primaryKey &&
                    (f.mode === "FIXED" || f.mode === "FREE_TEXT" || f.mode === "MANAGED")
            )
            .map((f) => f.key),
    ].slice(0, 12);

    const pages = [
        { key: "overview", title: "Overview", type: "OVERVIEW" },
        { key: "main", title: dashboardName, type: "MAIN_LIST", entity: dashboardName },
        ...managed.map((m) => ({
            key: `managed:${m}`,
            title: m,
            type: "MANAGED_LIST",
            entity: m,
        })),
    ];

    return {
        version: 1,
        app: {
            slug,
            name: dashboardName,
            logo: { mode: "AUTO_INITIAL" },
            theme: { mode: "DEFAULT" },
        },
        model: {
            primaryFieldKey: primaryKey,
            managed,
            fixed,
            freeText: free,
        },
        ui: {
            sidebar: pages.map((p) => ({ key: p.key, label: p.title })),
            pages,
            mainList: {
                title: dashboardName,
                columns: listColumns,
                primaryKey,
                searchKey: primaryKey,
            },
            form: {
                title: `Create ${dashboardName}`,
                fields: formFields,
            },
        },
        notes: {
            generatedAt: new Date().toISOString(),
            message: "Generated layout v1 (DB mirror).",
        },
    };
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const session = await getServerSession(authOptions);
    const userId =
        ((session as any)?.user?.id as string | undefined) ||
        ((session as any)?.token?.sub as string | undefined);

    if (!userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
        | { sourceId?: string; activate?: boolean; importRows?: boolean }
        | null;

    const sourceId = String(body?.sourceId ?? "").trim();
    const activate = Boolean(body?.activate);
    const importRows = body?.importRows !== false; // default true

    if (!sourceId) {
        return NextResponse.json({ ok: false, error: "sourceId is required" }, { status: 400 });
    }

    const dashboard = await prisma.dashboard.findUnique({
        where: { userId_slug: { userId, slug } },
        include: { dataSources: true },
    });

    if (!dashboard) {
        return NextResponse.json({ ok: false, error: "Dashboard not found" }, { status: 404 });
    }

    const ds = dashboard.dataSources.find((d) => d.id === sourceId);
    if (!ds) {
        return NextResponse.json({ ok: false, error: "DataSource not found" }, { status: 404 });
    }

    const cfg = (ds.config ?? {}) as Record<string, any>;
    const model = cfg?.model as Model | undefined;

    if (!model?.fields?.length || !model?.primaryFieldKey) {
        return NextResponse.json(
            { ok: false, error: "Mapping not found. Please complete Map fields first." },
            { status: 400 }
        );
    }

    const last = await prisma.dashboardLayout.findFirst({
        where: { dashboardId: dashboard.id },
        orderBy: { version: "desc" },
        select: { version: true },
    });

    const nextVersion = (last?.version ?? 0) + 1;

    const spec = buildLayoutSpec({
        slug,
        dashboardName: dashboard.name,
        model,
    });

    // Create layout (this layoutId becomes the import batch scope)
    const layout = await prisma.dashboardLayout.create({
        data: {
            dashboardId: dashboard.id,
            sourceId: ds.id,
            version: nextVersion,
            status: activate ? "ACTIVE" : "DRAFT",
            spec,
        },
        select: { id: true, version: true, status: true },
    });

    // Import sheet rows -> AppRecord (DB mirror)
    // IMPORTANT: Use createMany instead of upsert/transaction to avoid tx timeout (P2028)
    if (importRows) {
        const sheetUrlOrId = String(cfg.originalInput ?? cfg.sheetUrl ?? cfg.spreadsheetId ?? "").trim();

        const sheetName = cfg.sheetName ? String(cfg.sheetName) : null;
        const gid = cfg.gid ? String(cfg.gid) : null;

        const preview = await previewPublicSheet({
            sheetUrlOrId,
            sheetName,
            gid,
            range: "A1:Z500",
        });

        const rows = (preview.rows ?? []).filter((r: any) => r && typeof r === "object");

        // fresh layoutId => no need to upsert. bulk insert is fastest.
        const data = rows.map((r: any, i: number) => ({
            dashboardId: dashboard.id,
            layoutId: layout.id,
            sourceRow: i + 2, // row 2..N (row 1 header)
            data: r,
        }));

        // Create in chunks to keep payload size sane
        const chunkSize = 200;
        for (let i = 0; i < data.length; i += chunkSize) {
            // eslint-disable-next-line no-await-in-loop
            await prisma.appRecord.createMany({
                data: data.slice(i, i + chunkSize),
                skipDuplicates: true,
            });
        }
    }

    return NextResponse.json({
        ok: true,
        layoutId: layout.id,
        version: layout.version,
        status: layout.status,
        appUrl: `/apps/${slug}`,
    });
}
