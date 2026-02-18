-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "orgWorkspaceId" TEXT,
    "authType" TEXT NOT NULL,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "syncIntervalSec" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastValidatedAt" DATETIME,
    "expiresAt" DATETIME,
    "lastError" TEXT,
    "credentialRef" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UsageSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "windowType" TEXT NOT NULL,
    "windowStart" DATETIME NOT NULL,
    "windowEnd" DATETIME NOT NULL,
    "usedValue" REAL NOT NULL,
    "usedUnit" TEXT NOT NULL,
    "limitValue" REAL NOT NULL,
    "limitUnit" TEXT NOT NULL,
    "remainingValue" REAL NOT NULL,
    "batteryPercent" REAL NOT NULL,
    "confidence" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "backoffMs" INTEGER NOT NULL,
    "errorType" TEXT,
    "errorMessage" TEXT,
    CONSTRAINT "SyncRun_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "lowBatteryPercent" INTEGER NOT NULL DEFAULT 20,
    "syncFailureCount" INTEGER NOT NULL DEFAULT 3,
    "pollingIntervalSec" INTEGER NOT NULL DEFAULT 120,
    "debugLogging" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_credentialRef_key" ON "Account"("credentialRef");

-- CreateIndex
CREATE INDEX "Account_provider_idx" ON "Account"("provider");

-- CreateIndex
CREATE INDEX "UsageSnapshot_accountId_fetchedAt_idx" ON "UsageSnapshot"("accountId", "fetchedAt");

-- CreateIndex
CREATE INDEX "SyncRun_accountId_startedAt_idx" ON "SyncRun"("accountId", "startedAt");
