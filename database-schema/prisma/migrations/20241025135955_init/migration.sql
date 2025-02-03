-- CreateTable
CREATE TABLE "DatabasePermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dbName" TEXT NOT NULL,
    "dbUser" TEXT NOT NULL,
    "dbHost" TEXT NOT NULL,
    "dbPort" TEXT NOT NULL,

    CONSTRAINT "DatabasePermission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DatabasePermission" ADD CONSTRAINT "DatabasePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
