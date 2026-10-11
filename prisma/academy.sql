-- CreateTable
CREATE TABLE "academy_classes" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "subject" VARCHAR(80) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'online',
    "location" VARCHAR(250) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 24,
    "dailyMilli" INTEGER NOT NULL,
    "monthlyMilli" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "meetingId" TEXT,
    "attendeePassword" TEXT,
    "moderatorPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_members" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seat" INTEGER,
    "plan" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "physicalRegistration" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_accounts" (
    "userId" TEXT NOT NULL,
    "balanceMilli" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_accounts_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "academy_charges" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "grossMilli" INTEGER NOT NULL,
    "teacherMilli" INTEGER NOT NULL,
    "commissionMilli" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "baseKurus" INTEGER NOT NULL,
    "commissionKurus" INTEGER NOT NULL,
    "totalKurus" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "providerReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT,
    "title" VARCHAR(120) NOT NULL,
    "content" VARCHAR(20000) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "classId" TEXT,
    "kind" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'all',
    "title" VARCHAR(120) NOT NULL,
    "content" VARCHAR(20000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_replies" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_exams" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_attempts" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER,

    CONSTRAINT "academy_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academy_classes_archived_createdAt_idx" ON "academy_classes"("archived", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "academy_members_classId_userId_key" ON "academy_members"("classId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_members_classId_seat_key" ON "academy_members"("classId", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "academy_charges_key_key" ON "academy_charges"("key");

-- CreateIndex
CREATE INDEX "academy_charges_studentId_createdAt_idx" ON "academy_charges"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "academy_charges_teacherId_createdAt_idx" ON "academy_charges"("teacherId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_providerReference_key" ON "credit_purchases"("providerReference");

-- CreateIndex
CREATE INDEX "academy_notes_userId_updatedAt_idx" ON "academy_notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "academy_posts_kind_createdAt_idx" ON "academy_posts"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "academy_replies_postId_createdAt_idx" ON "academy_replies"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "academy_exams_classId_opensAt_idx" ON "academy_exams"("classId", "opensAt");

-- CreateIndex
CREATE UNIQUE INDEX "academy_attempts_examId_userId_key" ON "academy_attempts"("examId", "userId");

-- AddForeignKey
ALTER TABLE "academy_classes" ADD CONSTRAINT "academy_classes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_members" ADD CONSTRAINT "academy_members_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academy_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_members" ADD CONSTRAINT "academy_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_accounts" ADD CONSTRAINT "credit_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_charges" ADD CONSTRAINT "academy_charges_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academy_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_notes" ADD CONSTRAINT "academy_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_notes" ADD CONSTRAINT "academy_notes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academy_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_posts" ADD CONSTRAINT "academy_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_posts" ADD CONSTRAINT "academy_posts_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academy_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_replies" ADD CONSTRAINT "academy_replies_postId_fkey" FOREIGN KEY ("postId") REFERENCES "academy_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_replies" ADD CONSTRAINT "academy_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_exams" ADD CONSTRAINT "academy_exams_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academy_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_attempts" ADD CONSTRAINT "academy_attempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "academy_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_attempts" ADD CONSTRAINT "academy_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Accounting invariants: application transactions and database constraints agree.
ALTER TABLE "credit_accounts" ADD CONSTRAINT "credit_account_nonnegative" CHECK ("balanceMilli" >= 0);
ALTER TABLE "academy_classes" ADD CONSTRAINT "academy_class_amounts" CHECK ("dailyMilli" >= 0 AND "monthlyMilli" >= 0 AND "capacity" BETWEEN 1 AND 70);
ALTER TABLE "academy_charges" ADD CONSTRAINT "academy_charge_balanced" CHECK ("grossMilli" >= 0 AND "teacherMilli" >= 0 AND "commissionMilli" >= 0 AND "grossMilli" = "teacherMilli" + "commissionMilli" AND "studentId" <> "teacherId");
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchase_balanced" CHECK ("credits" > 0 AND "baseKurus" > 0 AND "commissionKurus" >= 0 AND "totalKurus" = "baseKurus" + "commissionKurus");
ALTER TABLE "academy_members" ADD CONSTRAINT "academy_member_seat" CHECK ("seat" IS NULL OR "seat" BETWEEN 1 AND 70);
