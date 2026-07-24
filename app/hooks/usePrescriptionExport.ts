"use client";

import { useRef, useState, useCallback } from "react";
import {
  downloadPrescriptionPdf,
  getPrescriptionFilename,
  printPrescription,
} from "../lib/prescriptionExport";

export function usePrescriptionExport(prescriptionDisplayId: string) {
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = useCallback(() => {
    const element = prescriptionRef.current;
    if (!element) return;
    printPrescription(element);
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    const element = prescriptionRef.current;
    if (!element || isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadPrescriptionPdf(
        element,
        getPrescriptionFilename(prescriptionDisplayId),
      );
    } catch (error) {
      console.error("Failed to generate prescription PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [prescriptionDisplayId, isDownloading]);

  return {
    prescriptionRef,
    handlePrint,
    handleDownloadPdf,
    isDownloading,
  };
}
