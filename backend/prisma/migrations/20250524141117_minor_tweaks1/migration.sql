/*
  Warnings:

  - You are about to drop the column `userId` on the `Participant` table. All the data in the column will be lost.
  - Added the required column `username` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_userId_fkey";

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
