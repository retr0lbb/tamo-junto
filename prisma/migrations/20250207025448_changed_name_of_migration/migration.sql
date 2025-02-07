/*
  Warnings:

  - You are about to drop the `UserAchievedMilestone` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[prize_data]` on the table `Prize` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserAchievedMilestone";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PrizedWinnedByUsers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "achivedMilestoneAtDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Userid" TEXT,
    "Milestoneid" TEXT,
    CONSTRAINT "PrizedWinnedByUsers_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrizedWinnedByUsers_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PrizedWinnedByUsers_Userid_Milestoneid_key" ON "PrizedWinnedByUsers"("Userid", "Milestoneid");

-- CreateIndex
CREATE UNIQUE INDEX "Prize_prize_data_key" ON "Prize"("prize_data");
