/*
  Warnings:

  - You are about to drop the column `commentId` on the `BlogPostReport` table. All the data in the column will be lost.
  - Added the required column `additionalExplanation` to the `BlogPostReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additionalExplanation` to the `CommentReport` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPostReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "additionalExplanation" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "blogPostId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogPostReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BlogPostReport_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogPostReport" ("blogPostId", "id", "reason", "reporterId") SELECT "blogPostId", "id", "reason", "reporterId" FROM "BlogPostReport";
DROP TABLE "BlogPostReport";
ALTER TABLE "new_BlogPostReport" RENAME TO "BlogPostReport";
CREATE TABLE "new_CommentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "additionalExplanation" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "commentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CommentReport" ("commentId", "createdAt", "id", "reason", "reporterId") SELECT "commentId", "createdAt", "id", "reason", "reporterId" FROM "CommentReport";
DROP TABLE "CommentReport";
ALTER TABLE "new_CommentReport" RENAME TO "CommentReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
