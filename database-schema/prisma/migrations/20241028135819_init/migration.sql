/*
  Warnings:

  - A unique constraint covering the columns `[dbName]` on the table `DatabasePermission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DatabasePermission_dbName_key" ON "DatabasePermission"("dbName");
