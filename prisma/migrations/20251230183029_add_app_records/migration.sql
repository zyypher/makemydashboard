-- CreateTable
CREATE TABLE "AppRecord" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "layoutId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "sourceRow" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppRecord_dashboardId_idx" ON "AppRecord"("dashboardId");

-- CreateIndex
CREATE INDEX "AppRecord_layoutId_idx" ON "AppRecord"("layoutId");

-- CreateIndex
CREATE INDEX "AppRecord_deletedAt_idx" ON "AppRecord"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppRecord_layoutId_sourceRow_key" ON "AppRecord"("layoutId", "sourceRow");

-- AddForeignKey
ALTER TABLE "AppRecord" ADD CONSTRAINT "AppRecord_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppRecord" ADD CONSTRAINT "AppRecord_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "DashboardLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
