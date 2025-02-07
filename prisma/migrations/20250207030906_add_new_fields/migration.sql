-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrizedWinnedByUsers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "achivedMilestoneAtDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedPrizeRecived" BOOLEAN NOT NULL DEFAULT false,
    "prizeArriveDate" DATETIME,
    "Userid" TEXT,
    "Milestoneid" TEXT,
    CONSTRAINT "PrizedWinnedByUsers_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrizedWinnedByUsers_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PrizedWinnedByUsers" ("Milestoneid", "Userid", "achivedMilestoneAtDate", "id") SELECT "Milestoneid", "Userid", "achivedMilestoneAtDate", "id" FROM "PrizedWinnedByUsers";
DROP TABLE "PrizedWinnedByUsers";
ALTER TABLE "new_PrizedWinnedByUsers" RENAME TO "PrizedWinnedByUsers";
CREATE UNIQUE INDEX "PrizedWinnedByUsers_Userid_Milestoneid_key" ON "PrizedWinnedByUsers"("Userid", "Milestoneid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
