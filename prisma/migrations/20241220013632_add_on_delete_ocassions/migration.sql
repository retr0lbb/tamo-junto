-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectiveAmmount" DECIMAL NOT NULL,
    "minDonation" DECIMAL NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "Campaingid" TEXT,
    CONSTRAINT "Milestone_Campaingid_fkey" FOREIGN KEY ("Campaingid") REFERENCES "Campaing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("Campaingid", "id", "isCompleted", "minDonation", "objectiveAmmount") SELECT "Campaingid", "id", "isCompleted", "minDonation", "objectiveAmmount" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
CREATE TABLE "new_Prize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isShippingPrize" BOOLEAN NOT NULL DEFAULT false,
    "uri" TEXT NOT NULL,
    "Milestoneid" TEXT,
    CONSTRAINT "Prize_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Prize" ("Milestoneid", "description", "id", "isShippingPrize", "title", "uri") SELECT "Milestoneid", "description", "id", "isShippingPrize", "title", "uri" FROM "Prize";
DROP TABLE "Prize";
ALTER TABLE "new_Prize" RENAME TO "Prize";
CREATE TABLE "new_UserAchievedMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "achivedMilestoneAtDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Userid" TEXT,
    "Milestoneid" TEXT,
    CONSTRAINT "UserAchievedMilestone_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserAchievedMilestone_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserAchievedMilestone" ("Milestoneid", "Userid", "achivedMilestoneAtDate", "id") SELECT "Milestoneid", "Userid", "achivedMilestoneAtDate", "id" FROM "UserAchievedMilestone";
DROP TABLE "UserAchievedMilestone";
ALTER TABLE "new_UserAchievedMilestone" RENAME TO "UserAchievedMilestone";
CREATE UNIQUE INDEX "UserAchievedMilestone_Userid_Milestoneid_key" ON "UserAchievedMilestone"("Userid", "Milestoneid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
