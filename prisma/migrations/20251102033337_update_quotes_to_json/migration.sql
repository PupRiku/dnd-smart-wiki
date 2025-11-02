/*
  Warnings:

  - The `notableQuotes` column on the `SessionSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SessionSummary" DROP COLUMN "notableQuotes",
ADD COLUMN     "notableQuotes" JSONB;
