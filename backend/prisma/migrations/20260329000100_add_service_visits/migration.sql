-- CreateTable
CREATE TABLE "ServiceVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mileageKm" INTEGER NOT NULL,
    "workCost" INTEGER NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePart" (
    "id" TEXT NOT NULL,
    "serviceVisitId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isOriginal" BOOLEAN NOT NULL,
    "unitCost" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceVisit_userId_date_idx" ON "ServiceVisit"("userId", "date");

-- CreateIndex
CREATE INDEX "ServicePart_serviceVisitId_position_idx" ON "ServicePart"("serviceVisitId", "position");

-- AddForeignKey
ALTER TABLE "ServiceVisit" ADD CONSTRAINT "ServiceVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePart" ADD CONSTRAINT "ServicePart_serviceVisitId_fkey" FOREIGN KEY ("serviceVisitId") REFERENCES "ServiceVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;