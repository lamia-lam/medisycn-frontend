import React, { forwardRef } from "react";
import { CheckCircle2, Phone, Globe, MapPin } from "lucide-react";

export interface PrescriptionData {
  id: string;
  date: string;
  patient: {
    name: string;
    id?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    address?: string;
    bloodGroup?: string;
  };
  doctor: {
    name: string;
    designation?: string;
    department?: string;
    qualifications?: string;
    specialization?: string;
    license?: string;
    phone?: string;
  };
  hospital: {
    name: string;
    address: string;
    phone?: string;
    website?: string;
  };
  diagnosis: string;
  symptoms?: string;
  medicines: Array<{
    name?: string;
    strength?: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    duration?: string;
    durationDays?: number | string;
    instructions?: string;
  }>;
  tests: Array<{
    name?: string;
    type?: string;
    urgency?: string;
    instructions?: string;
  }>;
  notes?: string;
  followUp?: string;
}

export const PrescriptionDocument = forwardRef<
  HTMLDivElement,
  { rx: PrescriptionData }
>(function PrescriptionDocument({ rx }, ref) {
  const formatMedicineDuration = (med: any) => {
    if (med.duration) return med.duration;
    if (med.durationDays) return `${med.durationDays} Days`;
    return null;
  };

  const formatMedicineSubtitle = (med: any) => {
    const parts: string[] = [];
    if (med.dosage) parts.push(med.dosage);
    if (med.frequency) parts.push(med.frequency);
    if (med.timing) parts.push(med.timing);
    return parts.join(" · ");
  };

  return (
    <div
      ref={ref}
      id="prescription-card"
      className="bg-white border border-gray-300 shadow-sm overflow-hidden relative mx-auto font-sans"
      style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#ffffff" }}
    >
      {/* Top Graphic Border */}
      <svg
        viewBox="0 0 1000 30"
        className="w-full h-[30px]"
        preserveAspectRatio="none"
      >
        <polygon points="0,0 150,0 110,30 0,30" fill="#1b8c85" />
        <polygon points="150,0 850,0 810,30 110,30" fill="#0d7870" />
        <polygon points="850,0 1000,0 1000,30 810,30" fill="#114b47" />
      </svg>

      {/* Header */}
      <div className="px-10 py-8 flex items-start justify-between">
        {/* Left: Doctor Info */}
        <div className="w-[40%]">
          <h1 className="text-3xl font-bold text-[#0d7870] leading-tight">
            {rx.doctor.name}
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-[0.2em] mt-1 font-medium">
            {rx.doctor.specialization || "QUALIFICATION"}
          </p>
          <div className="text-[11px] text-gray-500 mt-3 leading-relaxed pr-4 font-medium">
            {rx.doctor.designation && <p>{rx.doctor.designation}</p>}
            {rx.doctor.department && <p>{rx.doctor.department}</p>}
            {rx.doctor.qualifications && <p>{rx.doctor.qualifications}</p>}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center justify-center pt-2">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#0d7870" }}
          >
            <span className="text-white font-bold text-2xl tracking-wide select-none">
              MS
            </span>
          </div>
        </div>

        {/* Right: Hospital Info */}
        <div className="w-[40%] text-right">
          <h1 className="text-3xl font-bold text-[#0d7870] leading-tight uppercase">
            {rx.hospital.name.split(" ")[0] || "HOSPITAL"}
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-[0.2em] mt-1 font-medium">
            {rx.hospital.name.substring(rx.hospital.name.indexOf(" ") + 1) ||
              "SLOGAN HERE"}
          </p>
          <p className="text-[10px] text-gray-500 mt-4 leading-relaxed pl-4">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
          </p>
        </div>
      </div>

      {/* Patient Info Row */}
      <div
        className="prescription-patient-row mx-10 border-t-2 border-b-2 border-gray-300 flex items-center
             divide-x-2 divide-gray-300 py-1.5 mt-2"
      >
        <div className="w-[19%] px-2 text-center flex gap-1 justify-center items-center font-bold">
          <span className="text-[#0d7870] font-medium-bold text-xs whitespace-nowrap">
            Date:
          </span>
          <span className="text-gray-700 text-xs whitespace-nowrap">{rx.date}</span>
        </div>

        <div className="w-[32%] px-2 flex gap-1 justify-center items-center min-w-0 font-bold">
          <span className="text-[#0d7870] font-medium-bold text-xs whitespace-nowrap">
            Patient Name:
          </span>
          <span className="text-gray-700 text-xs whitespace-nowrap">
            {rx.patient.name}
          </span>
        </div>

        <div className="w-[14%] px-2 text-center flex gap-1 justify-center items-center font-bold">
          <span className="text-[#0d7870] font-medium-bold text-xs whitespace-nowrap">
            Age:
          </span>
          <span className="text-gray-700 text-xs whitespace-nowrap">{rx.patient.age || "—"}</span>
        </div>

        <div className="w-[16%] px-2 text-center flex gap-1 justify-center items-center font-bold">
          <span className="text-[#0d7870] font-medium-bold text-xs whitespace-nowrap">
            Gender:
          </span>
          <span className="text-gray-700 text-xs whitespace-nowrap">
            {rx.patient.gender || "—"}
          </span>
        </div>

        <div className="w-[19%] px-2 text-center flex gap-1 justify-center items-center font-bold">
          <span className="text-[#0d7870] font-medium-bold text-xs whitespace-nowrap">
            Blood Group:
          </span>
          <span className="text-gray-700 text-xs whitespace-nowrap">
            {rx.patient.bloodGroup || "—"}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div
        className="flex px-10 relative"
        style={{ minHeight: "calc(100% - 280px)" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 mt-20">
          <svg
            viewBox="0 0 500 500"
            className="w-[500px] h-[500px] opacity-[0.03] text-[#0d7870]"
          >
            {/* Outer circle */}
            <circle
              cx="250"
              cy="250"
              r="235"
              stroke="currentColor"
              strokeWidth="15"
              fill="none"
            />
            {/* Inner circle */}
            <circle
              cx="250"
              cy="250"
              r="190"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
            />
            {/* Cross (plus sign) */}
            <rect
              x="202"
              y="90"
              width="96"
              height="320"
              rx="8"
              fill="currentColor"
            />
            <rect
              x="90"
              y="202"
              width="320"
              height="96"
              rx="8"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Left Panel — Symptoms & Tests (Inv:) */}
        <div className="w-[38%] border-r-2 border-gray-300 pt-8 pb-28 pr-6 z-10 text-gray-800 space-y-5">
          {/* Symptoms */}
          {rx.symptoms && (
            <div>
              <span className="font-bold text-[#0d7870] text-sm">
                Symptoms :{" "}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed mt-1">
                {rx.symptoms}
              </p>
            </div>
          )}

          {/* Investigations / Tests */}
          {rx.tests && rx.tests.length > 0 && (
            <div>
              <h3 className="font-bold text-[#0d7870] text-sm mb-2">Tests:</h3>
              <ul className="space-y-1.5 pl-1">
                {rx.tests.map((test, idx) => (
                  <li
                    key={idx}
                    className="text-gray-700 text-sm flex items-start gap-2"
                  >
                    <span className="text-[#0d7870] font-bold mt-0.5">•</span>
                    <div>
                      <span className="font-medium">{test.name}</span>
                      {test.urgency && (
                        <span className="ml-2 text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          {test.urgency}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes & Follow up */}
          {(rx.notes || rx.followUp) && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {rx.notes && (
                <div>
                  <span className="font-bold text-[#0d7870] text-sm">
                    Advice:
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{rx.notes}</p>
                </div>
              )}
              {rx.followUp && (
                <div>
                  <span className="font-bold text-[#0d7870] text-sm">
                    Follow-up:
                  </span>
                  <span className="text-sm text-gray-700 ml-2">
                    {rx.followUp}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel — Diagnosis (Dx:) & Medicines (Rx:) */}
        <div className="flex-1 pt-8 pb-28 pl-6 z-10 text-gray-800 space-y-6">
          {/* Diagnosis */}
          <div>
            <span className="font-bold text-[#0d7870] text-sm">
              Diagnosis:{" "}
            </span>
            <span className="font-medium text-gray-800">{rx.diagnosis}</span>
          </div>

          {/* Medicines */}
          {rx.medicines && rx.medicines.length > 0 && (
            <div>
              <h3 className="font-bold text-[#0d7870] text-sm mb-3">
                Medications:
              </h3>
              <div className="space-y-4">
                {rx.medicines.map((med, idx) => {
                  const subtitle = formatMedicineSubtitle(med);
                  const duration = formatMedicineDuration(med);
                  return (
                    <div key={idx}>
                      <p className="font-bold text-gray-800 leading-6" style={{ lineHeight: "1.4" }}>
                        {idx + 1}. {med.name}{" "}
                        <span className="font-normal text-[#0d7870]">
                          {med.strength}
                        </span>
                      </p>
                      {subtitle && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 pl-4 mt-0.5">
                          <span>{subtitle}</span>
                          {duration && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {duration}
                            </span>
                          )}
                        </div>
                      )}
                      {med.instructions && (
                        <p className="text-sm text-gray-500 pl-4 mt-0.5 flex items-center gap-1" style={{ lineHeight: "1.4" }}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0d7870] shrink-0" />
                          <span>{med.instructions}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Contact Info */}
      <div className="absolute bottom-[30px] left-10 right-10 flex justify-between items-center text-[10px] text-gray-500 border-t-2 border-gray-300 pt-3 px-10 pb-4 bg-white z-20">
        <div className="flex flex-col items-center">
          <div className="border border-[#0d7870] rounded p-1 mb-1">
            <Phone className="w-3 h-3 text-[#0d7870]" />
          </div>
          <span>{rx.hospital.phone || "000-123-456-789"}</span>
          <span>{rx.hospital.phone || "000-123-456-789"}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="border border-[#0d7870] rounded p-1 mb-1">
            <Globe className="w-3 h-3 text-[#0d7870]" />
          </div>
          <span>{rx.hospital.website || "www. your name @ here"}</span>
          <span>your web name here</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="border border-[#0d7870] rounded p-1 mb-1">
            <MapPin className="w-3 h-3 text-[#0d7870]" />
          </div>
          <span>{rx.hospital.address || "10 Street Address Here"}</span>
          <span>Country Name Here 6789</span>
        </div>
      </div>

      {/* Bottom Graphic Border */}
      <svg
        viewBox="0 0 1000 30"
        className="absolute bottom-0 left-0 w-full h-[30px] z-20"
        preserveAspectRatio="none"
      >
        <polygon points="0,0 240,0 220,30 0,30" fill="#1b8c85" />
        <polygon points="240,0 740,0 720,30 220,30" fill="#0d7870" />
        <polygon points="740,0 1000,0 1000,30 720,30" fill="#114b47" />
      </svg>
    </div>
  );
});
