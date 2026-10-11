-- CreateTable
CREATE TABLE "profession_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "legalName" VARCHAR(120) NOT NULL,
    "region" VARCHAR(120) NOT NULL,
    "vehiclePlate" VARCHAR(30),
    "vehicleModel" VARCHAR(120),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "documentPaths" TEXT[],
    "validUntil" TIMESTAMP(3),
    "reviewNote" VARCHAR(1000),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profession_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(4000) NOT NULL,
    "region" VARCHAR(120) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "destination" VARCHAR(500),
    "phone" VARCHAR(30),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "acceptedUnlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxi_locations" (
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxi_locations_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "service_unlocks" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "feeMilli" INTEGER NOT NULL,
    "offerKurus" INTEGER NOT NULL,
    "note" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "amountMilli" BIGINT NOT NULL,
    "kind" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxi_passes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taxi_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifechat_threads" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "referenceId" TEXT,
    "title" VARCHAR(160) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lifechat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifechat_members" (
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifechat_members_pkey" PRIMARY KEY ("threadId","userId")
);

-- CreateTable
CREATE TABLE "lifechat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "clientKey" TEXT NOT NULL,
    "text" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifechat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_companies" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_departures" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "origin" VARCHAR(120) NOT NULL,
    "destination" VARCHAR(120) NOT NULL,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "priceKurus" INTEGER NOT NULL,
    "cancellationHours" INTEGER NOT NULL DEFAULT 24,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_departures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_reservations" (
    "id" TEXT NOT NULL,
    "departureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seat" INTEGER NOT NULL,
    "passengerName" VARCHAR(120) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'held',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "totalKurus" INTEGER NOT NULL,
    "commissionKurus" INTEGER NOT NULL,
    "companyKurus" INTEGER NOT NULL,
    "providerReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profession_applications_userId_profession_specialty_key" ON "profession_applications"("userId", "profession", "specialty");

-- CreateIndex
CREATE INDEX "service_requests_kind_status_createdAt_idx" ON "service_requests"("kind", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "service_unlocks_requestId_providerId_key" ON "service_unlocks"("requestId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_entries_key_key" ON "credit_entries"("key");

-- CreateIndex
CREATE INDEX "credit_entries_userId_createdAt_idx" ON "credit_entries"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "taxi_passes_userId_expiresAt_idx" ON "taxi_passes"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "lifechat_threads_key_key" ON "lifechat_threads"("key");

-- CreateIndex
CREATE INDEX "lifechat_messages_threadId_createdAt_idx" ON "lifechat_messages"("threadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "lifechat_messages_senderId_clientKey_key" ON "lifechat_messages"("senderId", "clientKey");

-- CreateIndex
CREATE INDEX "travel_departures_published_departureAt_idx" ON "travel_departures"("published", "departureAt");

-- CreateIndex
CREATE UNIQUE INDEX "travel_reservations_providerReference_key" ON "travel_reservations"("providerReference");

-- CreateIndex
CREATE INDEX "travel_reservations_departureId_seat_status_idx" ON "travel_reservations"("departureId", "seat", "status");

-- AddForeignKey
ALTER TABLE "profession_applications" ADD CONSTRAINT "profession_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxi_locations" ADD CONSTRAINT "taxi_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_unlocks" ADD CONSTRAINT "service_unlocks_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_unlocks" ADD CONSTRAINT "service_unlocks_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_entries" ADD CONSTRAINT "credit_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxi_passes" ADD CONSTRAINT "taxi_passes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifechat_members" ADD CONSTRAINT "lifechat_members_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "lifechat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifechat_members" ADD CONSTRAINT "lifechat_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifechat_messages" ADD CONSTRAINT "lifechat_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "lifechat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifechat_messages" ADD CONSTRAINT "lifechat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_companies" ADD CONSTRAINT "travel_companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_departures" ADD CONSTRAINT "travel_departures_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "travel_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_reservations" ADD CONSTRAINT "travel_reservations_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "travel_departures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_reservations" ADD CONSTRAINT "travel_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
