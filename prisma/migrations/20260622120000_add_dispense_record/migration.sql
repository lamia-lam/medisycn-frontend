-- CreateTable
CREATE TABLE "DispenseRecord" (
    "id" SERIAL NOT NULL,
    "prescriptionId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medicinesDispensed" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dispensedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispenseRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DispenseRecord" ADD CONSTRAINT "DispenseRecord_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispenseRecord" ADD CONSTRAINT "DispenseRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
