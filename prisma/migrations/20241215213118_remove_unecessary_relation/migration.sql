/*
  Warnings:

  - You are about to drop the column `userId` on the `Campaing` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Campaing" ("id", "name") SELECT "id", "name" FROM "Campaing";
DROP TABLE "Campaing";
ALTER TABLE "new_Campaing" RENAME TO "Campaing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
