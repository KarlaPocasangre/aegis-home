-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('BATHROOM', 'KITCHEN', 'BEDROOM', 'LIVING_ROOM', 'HALLWAY', 'STAIRS', 'ENTRANCE', 'OUTDOOR', 'OTHER');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "HazardStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AnalysisSource" AS ENUM ('LIVE', 'CACHED', 'MOCK');

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "name" VARCHAR(80),
    "language" VARCHAR(5) NOT NULL DEFAULT 'es',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "source" "AnalysisSource" NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hazard" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "aiId" VARCHAR(20) NOT NULL,
    "labelEn" VARCHAR(60) NOT NULL,
    "labelEs" VARCHAR(60) NOT NULL,
    "severity" "Severity" NOT NULL,
    "descriptionEs" VARCHAR(300) NOT NULL,
    "fixEs" VARCHAR(300) NOT NULL,
    "costEstimateUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL,
    "region" JSONB,
    "status" "HazardStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Hazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "day" TEXT NOT NULL,
    "aiCalls" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("day")
);

-- CreateIndex
CREATE UNIQUE INDEX "Household_accessToken_key" ON "Household"("accessToken");

-- CreateIndex
CREATE INDEX "Household_expiresAt_idx" ON "Household"("expiresAt");

-- CreateIndex
CREATE INDEX "Assessment_householdId_idx" ON "Assessment"("householdId");

-- CreateIndex
CREATE INDEX "Room_assessmentId_idx" ON "Room"("assessmentId");

-- CreateIndex
CREATE INDEX "Hazard_roomId_status_idx" ON "Hazard"("roomId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Hazard_roomId_aiId_key" ON "Hazard"("roomId", "aiId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hazard" ADD CONSTRAINT "Hazard_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
