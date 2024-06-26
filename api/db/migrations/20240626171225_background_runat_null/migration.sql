-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BackgroundJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "handler" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "runAt" DATETIME,
    "lockedAt" DATETIME,
    "lockedBy" TEXT,
    "lastError" TEXT,
    "failedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BackgroundJob" ("attempts", "createdAt", "failedAt", "handler", "id", "lastError", "lockedAt", "lockedBy", "priority", "queue", "runAt", "updatedAt") SELECT "attempts", "createdAt", "failedAt", "handler", "id", "lastError", "lockedAt", "lockedBy", "priority", "queue", "runAt", "updatedAt" FROM "BackgroundJob";
DROP TABLE "BackgroundJob";
ALTER TABLE "new_BackgroundJob" RENAME TO "BackgroundJob";
PRAGMA foreign_key_check("BackgroundJob");
PRAGMA foreign_keys=ON;
