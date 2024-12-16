/*
  Warnings:

  - Added the required column `description` to the `Prize` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Prize` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isShippingPrize" BOOLEAN NOT NULL DEFAULT false,
    "uri" TEXT NOT NULL,
    "Milestoneid" TEXT,
    CONSTRAINT "Prize_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Prize" ("Milestoneid", "id", "uri") SELECT "Milestoneid", "id", "uri" FROM "Prize";
DROP TABLE "Prize";
ALTER TABLE "new_Prize" RENAME TO "Prize";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
