-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "goal" DECIMAL NOT NULL,
    "Userid" TEXT,
    CONSTRAINT "Campaing_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Campaing" ("Userid", "goal", "id", "name") SELECT "Userid", "goal", "id", "name" FROM "Campaing";
DROP TABLE "Campaing";
ALTER TABLE "new_Campaing" RENAME TO "Campaing";
CREATE TABLE "new_Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donationAmmount" DECIMAL NOT NULL,
    "Userid" TEXT,
    "Campaingid" TEXT,
    CONSTRAINT "Donation_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Donation_Campaingid_fkey" FOREIGN KEY ("Campaingid") REFERENCES "Campaing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Donation" ("Campaingid", "Userid", "donationAmmount", "donationDate", "id") SELECT "Campaingid", "Userid", "donationAmmount", "donationDate", "id" FROM "Donation";
DROP TABLE "Donation";
ALTER TABLE "new_Donation" RENAME TO "Donation";
CREATE TABLE "new_UserAchievedMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "achivedMilestoneAtDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Userid" TEXT,
    "Milestoneid" TEXT,
    CONSTRAINT "UserAchievedMilestone_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserAchievedMilestone_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserAchievedMilestone" ("Milestoneid", "Userid", "achivedMilestoneAtDate", "id") SELECT "Milestoneid", "Userid", "achivedMilestoneAtDate", "id" FROM "UserAchievedMilestone";
DROP TABLE "UserAchievedMilestone";
ALTER TABLE "new_UserAchievedMilestone" RENAME TO "UserAchievedMilestone";
CREATE UNIQUE INDEX "UserAchievedMilestone_Userid_Milestoneid_key" ON "UserAchievedMilestone"("Userid", "Milestoneid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
