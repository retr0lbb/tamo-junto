/*
  Warnings:

  - Added the required column `goal` to the `Campaing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "goal" DECIMAL NOT NULL,
    "Userid" TEXT,
    CONSTRAINT "Campaing_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Campaing" ("Userid", "id", "name") SELECT "Userid", "id", "name" FROM "Campaing";
DROP TABLE "Campaing";
ALTER TABLE "new_Campaing" RENAME TO "Campaing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
