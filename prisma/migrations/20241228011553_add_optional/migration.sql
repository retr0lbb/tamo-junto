-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "addressInfo" TEXT,
    "stripeID" TEXT,
    "Addressid" INTEGER,
    CONSTRAINT "User_Addressid_fkey" FOREIGN KEY ("Addressid") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("Addressid", "addressInfo", "email", "id", "name", "password", "stripeID") SELECT "Addressid", "addressInfo", "email", "id", "name", "password", "stripeID" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeID_key" ON "User"("stripeID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
