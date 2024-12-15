/*
  Warnings:

  - You are about to drop the column `campaingid` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "Userid" TEXT,
    CONSTRAINT "Campaing_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Campaing" ("id", "name") SELECT "id", "name" FROM "Campaing";
DROP TABLE "Campaing";
ALTER TABLE "new_Campaing" RENAME TO "Campaing";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "addressInfo" TEXT
);
INSERT INTO "new_User" ("addressInfo", "email", "id", "name", "password") SELECT "addressInfo", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
