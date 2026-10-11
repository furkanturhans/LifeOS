-- CreateTable
CREATE TABLE "explore_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "explore_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explore_posts" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "text" VARCHAR(2000) NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'post',
    "mediaPath" TEXT,
    "mediaType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "explore_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explore_likes" (
    "postId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "explore_likes_pkey" PRIMARY KEY ("postId","profileId")
);

-- CreateTable
CREATE TABLE "explore_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "explore_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "explore_profiles_userId_slot_key" ON "explore_profiles"("userId", "slot");

-- CreateIndex
CREATE INDEX "explore_posts_createdAt_id_idx" ON "explore_posts"("createdAt", "id");

-- CreateIndex
CREATE INDEX "explore_comments_postId_createdAt_idx" ON "explore_comments"("postId", "createdAt");

-- AddForeignKey
ALTER TABLE "explore_profiles" ADD CONSTRAINT "explore_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explore_posts" ADD CONSTRAINT "explore_posts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "explore_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explore_likes" ADD CONSTRAINT "explore_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "explore_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explore_likes" ADD CONSTRAINT "explore_likes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "explore_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explore_comments" ADD CONSTRAINT "explore_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "explore_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explore_comments" ADD CONSTRAINT "explore_comments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "explore_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
