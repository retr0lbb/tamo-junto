/*
  Warnings:

  - Added the required column `name` to the `Milestone` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donationAmmount" DECIMAL NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "Userid" TEXT,
    "Campaingid" TEXT,
    CONSTRAINT "Donation_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Donation_Campaingid_fkey" FOREIGN KEY ("Campaingid") REFERENCES "Campaing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Donation" ("Campaingid", "Userid", "donationAmmount", "donationDate", "id") SELECT "Campaingid", "Userid", "donationAmmount", "donationDate", "id" FROM "Donation";
DROP TABLE "Donation";
ALTER TABLE "new_Donation" RENAME TO "Donation";
CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objectiveAmmount" DECIMAL NOT NULL,
    "minDonation" DECIMAL NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "Campaingid" TEXT,
    CONSTRAINT "Milestone_Campaingid_fkey" FOREIGN KEY ("Campaingid") REFERENCES "Campaing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("Campaingid", "id", "isCompleted", "minDonation", "objectiveAmmount") SELECT "Campaingid", "id", "isCompleted", "minDonation", "objectiveAmmount" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
