import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function buildLayoutSpec(input: { slug: string; dashboardName: string; model: Model }) {
    const { slug, dashboardName, model } = input;

    const primaryKey = model.primaryFieldKey;

    const managed = model.fields.filter((f) => f.mode === "MANAGED").map((f) => f.key);
    const fixed = model.fields.filter((f) => f.mode === "FIXED").map((f) => f.key);
    const free = model.fields.filter((f) => f.mode === "FREE_TEXT").map((f) => f.key);

    // Default columns for list table: primary + first few non-ignored fields
    const listColumns = [
        primaryKey,
        ...model.fields
            .filter((f) => f.key !== primaryKey && f.mode !== "IGNORE")
            .map((f) => f.key),
    ].slice(0, 6);

    // Default form fields: primary + fixed + free text (ignore managed – those become dropdown refs later)
    const formFields = [
        primaryKey,
        ...model.fields
            .filter((f) => f.key !== primaryKey && (f.mode === "FIXED" || f.mode === "FREE_TEXT"))
            .map((f) => f.key),
    ].slice(0, 10);

    const pages = [
        { key: "overview", title: "Overview", type: "OVERVIEW" },
        { key: "main", title: dashboardName, type: "MAIN_LIST", entity: dashboardName },
        ...managed.map((m) => ({
            key: `managed:${m}`,
            title: m,
            type: "MANAGED_LIST",
            entity: m,
        })),
        { key: "settings", title: "Settings", type: "SETTINGS_PLACEHOLDER" },
    ];

    return {
        version: 1,
        app: {
            slug,
            name: dashboardName,
            logo: { mode: "AUTO_INITIAL" }, // user can upload later
            theme: { mode: "DEFAULT" }, // user can change later
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
            createForm: {
                title: `Create ${dashboardName}`,
                fields: formFields,
            },
        },
        notes: {
            generatedAt: new Date().toISOString(),
            message: "Generated layout v1. Theme/logo can be customized later.",
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
        | { sourceId?: string; activate?: boolean }
        | null;

    const sourceId = String(body?.sourceId ?? "").trim();
    const activate = Boolean(body?.activate);

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
            { ok: false, error: "Mapping not found. Please complete 'Describe data' first." },
            { status: 400 }
        );
    }

    // Determine next version
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

    // Save spec as new version
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

    return NextResponse.json({
        ok: true,
        layoutId: layout.id,
        version: layout.version,
        status: layout.status,
        appUrl: `/apps/${slug}`,
    });
}
