/*
  Warnings:

  - A unique constraint covering the columns `[objectiveAmmount,Campaingid]` on the table `Milestone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Milestone_objectiveAmmount_Campaingid_key" ON "Milestone"("objectiveAmmount", "Campaingid");
