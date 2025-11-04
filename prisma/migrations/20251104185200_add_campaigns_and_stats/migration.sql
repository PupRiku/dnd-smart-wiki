/*
  Warnings:

  - A unique constraint covering the columns `[name,campaignId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,campaignId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,campaignId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,campaignId]` on the table `Lore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,campaignId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionNumber,campaignId]` on the table `SessionSummary` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `Lore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `SessionSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Character_name_key";

-- DropIndex
DROP INDEX "public"."Item_name_key";

-- DropIndex
DROP INDEX "public"."Location_name_key";

-- DropIndex
DROP INDEX "public"."Lore_title_key";

-- DropIndex
DROP INDEX "public"."Organization_name_key";

-- DropIndex
DROP INDEX "public"."SessionSummary_sessionNumber_key";

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "charisma" INTEGER,
ADD COLUMN     "constitution" INTEGER,
ADD COLUMN     "dexterity" INTEGER,
ADD COLUMN     "intelligence" INTEGER,
ADD COLUMN     "spells" JSONB,
ADD COLUMN     "strength" INTEGER,
ADD COLUMN     "weapons" JSONB,
ADD COLUMN     "wisdom" INTEGER;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lore" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SessionSummary" ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "chapterTitle" TEXT;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_name_key" ON "Campaign"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_campaignId_key" ON "Character"("name", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_campaignId_key" ON "Item"("name", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_campaignId_key" ON "Location"("name", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Lore_title_campaignId_key" ON "Lore"("title", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_campaignId_key" ON "Organization"("name", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionSummary_sessionNumber_campaignId_key" ON "SessionSummary"("sessionNumber", "campaignId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lore" ADD CONSTRAINT "Lore_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSummary" ADD CONSTRAINT "SessionSummary_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
