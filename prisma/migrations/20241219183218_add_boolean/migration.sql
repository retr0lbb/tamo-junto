-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectiveAmmount" DECIMAL NOT NULL,
    "minDonation" DECIMAL NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "Campaingid" TEXT,
    CONSTRAINT "Milestone_Campaingid_fkey" FOREIGN KEY ("Campaingid") REFERENCES "Campaing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("Campaingid", "id", "minDonation", "objectiveAmmount") SELECT "Campaingid", "id", "minDonation", "objectiveAmmount" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
