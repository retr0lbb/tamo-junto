/*
  Warnings:

  - Added the required column `stripePaymentId` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donationAmmount" DECIMAL NOT NULL,
    "taxfeeOfDonation" DECIMAL,
    "stripePaymentId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "Userid" TEXT,
    "Campaingid" TEXT,
    CONSTRAINT "Donation_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Donation_Campaingid_fkey" FOREIGN KEY ("Campaingid") REFERENCES "Campaing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Donation" ("Campaingid", "Userid", "donationAmmount", "donationDate", "id", "status", "taxfeeOfDonation") SELECT "Campaingid", "Userid", "donationAmmount", "donationDate", "id", "status", "taxfeeOfDonation" FROM "Donation";
DROP TABLE "Donation";
ALTER TABLE "new_Donation" RENAME TO "Donation";
CREATE UNIQUE INDEX "Donation_stripePaymentId_key" ON "Donation"("stripePaymentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
