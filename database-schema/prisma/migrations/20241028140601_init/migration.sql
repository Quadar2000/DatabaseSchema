/*
  Warnings:

  - A unique constraint covering the columns `[userId,dbName,dbHost]` on the table `DatabasePermission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DatabasePermission_dbName_key";

-- CreateIndex
CREATE UNIQUE INDEX "DatabasePermission_userId_dbName_dbHost_key" ON "DatabasePermission"("userId", "dbName", "dbHost");
