-- CreateTable
CREATE TABLE "UserAchievedMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "achivedMilestoneAtDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Userid" TEXT,
    "Milestoneid" TEXT,
    CONSTRAINT "UserAchievedMilestone_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserAchievedMilestone_Milestoneid_fkey" FOREIGN KEY ("Milestoneid") REFERENCES "Milestone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
