/*
  Warnings:

  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `MessageRead` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[messageId,username]` on the table `MessageRead` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `MessageRead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "MessageRead" DROP CONSTRAINT "MessageRead_userId_fkey";

-- DropIndex
DROP INDEX "MessageRead_messageId_userId_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "senderId",
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MessageRead" DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_username_key" ON "MessageRead"("messageId", "username");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
