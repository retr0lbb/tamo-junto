/*
  Warnings:

  - You are about to drop the column `isShippingPrize` on the `Prize` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Prize` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `Prize` table. All the data in the column will be lost.
  - Added the required column `name` to the `Prize` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prize_data" TEXT,
    "Milestoneid" TEXT,
    CONSTRAINT "Prize_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Prize" ("Milestoneid", "description", "id") SELECT "Milestoneid", "description", "id" FROM "Prize";
DROP TABLE "Prize";
ALTER TABLE "new_Prize" RENAME TO "Prize";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
