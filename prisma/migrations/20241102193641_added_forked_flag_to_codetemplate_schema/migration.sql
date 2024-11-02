-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CodeTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "forked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CodeTemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CodeTemplate" ("authorId", "code", "createdAt", "description", "id", "language", "tags", "title", "updatedAt") SELECT "authorId", "code", "createdAt", "description", "id", "language", "tags", "title", "updatedAt" FROM "CodeTemplate";
DROP TABLE "CodeTemplate";
ALTER TABLE "new_CodeTemplate" RENAME TO "CodeTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
