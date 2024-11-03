-- CreateTable
CREATE TABLE "UserVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "blogPostId" TEXT,
    "commentId" TEXT,
    "type" INTEGER NOT NULL,
    CONSTRAINT "UserVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserVote_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
