-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "handler" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "runAt" DATETIME NOT NULL,
    "lockedAt" DATETIME,
    "lockedBy" TEXT,
    "lastError" TEXT,
    "failedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
