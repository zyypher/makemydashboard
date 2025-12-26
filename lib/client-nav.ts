export const USER_STORAGE_KEY = "build-your-dashboard-user";
export const ORG_STORAGE_KEY = "build-your-dashboard-orgs";
export const DRAFT_STORAGE_KEY = "build-your-dashboard-drafts";
export const APPS_STORAGE_KEY = "build-your-dashboard-apps";
export const RECORDS_KEY_PREFIX = "records";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type Org = {
  id: string;
  name: string;
  createdAt: number;
};

export type DashboardDraft = {
  id: string;
  orgId: string;
  method: "describe" | "voice" | "upload";
  content: string;
  createdAt: number;
};

export type ModuleField = {
  id: string;
  label: string;
};

export type Module = {
  id: string;
  name: string;
  hidden?: boolean;
  fields: ModuleField[];
};

export type GeneratedApp = {
  id: string;
  orgId: string;
  name: string;
  sourceDraftId: string;
  createdAt: number;
  modules: Module[];
};

export type ModuleRecord = {
  id: string;
  createdAt: number;
  values: Record<string, string>;
};

export function readUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.error("Failed to parse user from storage", error);
    return null;
  }
}

export function readOrgsFromStorage(): Org[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ORG_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Org[];
  } catch (error) {
    console.error("Failed to parse orgs from storage", error);
    return [];
  }
}

export function saveOrg(org: Org) {
  if (typeof window === "undefined") return;
  const current = readOrgsFromStorage().filter((item) => item.id !== org.id);
  window.localStorage.setItem(
    ORG_STORAGE_KEY,
    JSON.stringify([...current, org]),
  );
}

export function findOrg(orgId: string): Org | null {
  const orgs = readOrgsFromStorage();
  return orgs.find((org) => org.id === orgId) ?? null;
}

export function readDrafts(): DashboardDraft[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DashboardDraft[];
  } catch (error) {
    console.error("Failed to parse drafts", error);
    return [];
  }
}

export function saveDraft(draft: DashboardDraft) {
  if (typeof window === "undefined") return;
  const current = readDrafts().filter((item) => item.id !== draft.id);
  window.localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify([...current, draft]),
  );
}

export function readApps(): GeneratedApp[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(APPS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as GeneratedApp[];
  } catch (error) {
    console.error("Failed to parse apps", error);
    return [];
  }
}

export function saveApp(app: GeneratedApp) {
  if (typeof window === "undefined") return;
  const current = readApps().filter((item) => item.id !== app.id);
  window.localStorage.setItem(
    APPS_STORAGE_KEY,
    JSON.stringify([...current, app]),
  );
}

export function findDraft(draftId: string): DashboardDraft | null {
  const drafts = readDrafts();
  return drafts.find((draft) => draft.id === draftId) ?? null;
}

export function findApp(appId: string): GeneratedApp | null {
  const apps = readApps();
  const found = apps.find((app) => app.id === appId);
  if (!found) return null;
  if (!found.modules || found.modules.length === 0) {
    const updated = { ...found, modules: defaultModules() };
    saveApp(updated);
    return updated;
  }
  return found;
}

export function createGeneratedAppFromDraft({
  draft,
  name,
}: {
  draft: DashboardDraft;
  name: string;
}): GeneratedApp {
  const app: GeneratedApp = {
    id: crypto.randomUUID(),
    orgId: draft.orgId,
    name,
    sourceDraftId: draft.id,
    createdAt: Date.now(),
    modules: defaultModules(),
  };
  saveApp(app);
  return app;
}

function defaultModules(): Module[] {
  return [
    {
      id: "overview",
      name: "Overview",
      fields: [
        { id: "title", label: "Title" },
        { id: "owner", label: "Owner" },
      ],
    },
    {
      id: "highlights",
      name: "Highlights",
      fields: [
        { id: "headline", label: "Headline" },
        { id: "note", label: "Note" },
      ],
    },
    {
      id: "checklist",
      name: "Next steps",
      fields: [
        { id: "task", label: "Task" },
        { id: "owner", label: "Owner" },
      ],
    },
  ];
}

function recordKey(appId: string, moduleId: string) {
  return `${RECORDS_KEY_PREFIX}_${appId}_${moduleId}`;
}

export function readRecords(appId: string, moduleId: string): ModuleRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(recordKey(appId, moduleId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ModuleRecord[];
  } catch (error) {
    console.error("Failed to parse records", error);
    return [];
  }
}

export function saveRecord({
  appId,
  moduleId,
  values,
}: {
  appId: string;
  moduleId: string;
  values: Record<string, string>;
}): ModuleRecord | null {
  if (typeof window === "undefined") return null;
  const next: ModuleRecord = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    values,
  };
  const existing = readRecords(appId, moduleId);
  window.localStorage.setItem(
    recordKey(appId, moduleId),
    JSON.stringify([...existing, next]),
  );
  return next;
}
