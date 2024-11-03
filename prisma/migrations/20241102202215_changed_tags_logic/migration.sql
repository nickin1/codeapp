/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BlogPostToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "tags" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BlogPostToTag";
PRAGMA foreign_keys=on;
