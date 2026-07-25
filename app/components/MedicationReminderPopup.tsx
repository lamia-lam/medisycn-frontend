"use client";

import { useState, useEffect } from "react";
import {
  Pill,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Bell,
  Stethoscope,
  Sun,
  Sunset,
  Cloud,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DoseSchedule {
  morning: number;
  noon: number;
  evening: number;
}

interface Medicine {
  name?: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  daysRemaining?: number | null;
  isExpired?: boolean;
  instructions?: string;
  timesPerDay?: number;
  hasDoseNow?: boolean;
  schedule?: DoseSchedule;
}

interface ActivePrescription {
  id: number;
  diagnosis: string;
  createdAt: string;
  doctor: {
    name: string;
    specialization?: string | null;
  };
  medicines: Medicine[];
  daysElapsed: number;
  maxDuration: number;
  currentSlot: "morning" | "noon" | "evening";
}

const SESSION_KEY = "medReminderShown";

// ── Time slot visual config ──────────────────────────────────────────────────
const slotConfig = {
  morning: {
    label: "Good Morning",
    sublabel: "Time for your morning dose",
    icon: <Sun className="w-6 h-6 text-white" />,
    gradient: "from-amber-500 via-orange-400 to-yellow-300",
    badgeBg: "bg-amber-50 dark:bg-amber-900/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-700/40",
  },
  noon: {
    label: "Good Afternoon",
    sublabel: "Time for your noon dose",
    icon: <Cloud className="w-6 h-6 text-white" />,
    gradient: "from-sky-500 via-cyan-500 to-teal-400",
    badgeBg: "bg-sky-50 dark:bg-sky-900/30",
    badgeText: "text-sky-700 dark:text-sky-300",
    badgeBorder: "border-sky-200 dark:border-sky-700/40",
  },
  evening: {
    label: "Good Evening",
    sublabel: "Time for your evening dose",
    icon: <Sunset className="w-6 h-6 text-white" />,
    gradient: "from-violet-600 via-purple-500 to-indigo-400",
    badgeBg: "bg-violet-50 dark:bg-violet-900/30",
    badgeText: "text-violet-700 dark:text-violet-300",
    badgeBorder: "border-violet-200 dark:border-violet-700/40",
  },
};

function getDaysLabel(med: Medicine): {
  text: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
} {
  if (!med.durationDays || med.durationDays === 0) {
    return {
      text: "As directed",
      color: "text-gray-500",
      bg: "bg-gray-100 dark:bg-gray-700",
      icon: <Clock className="w-3 h-3" />,
    };
  }
  const remaining = med.daysRemaining ?? 0;
  if (remaining <= 1) {
    return {
      text: remaining === 1 ? "Last day!" : "Ends today",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
      icon: <AlertTriangle className="w-3 h-3" />,
    };
  }
  if (remaining <= 3) {
    return {
      text: `${remaining} days left`,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      icon: <AlertTriangle className="w-3 h-3" />,
    };
  }
  return {
    text: `${remaining} days left`,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  };
}

export function MedicationReminderPopup() {
  const router = useRouter();
  const [prescription, setPrescription] = useState<ActivePrescription | null>(null);
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Key includes today's date — resets automatically each new calendar day
    const todayKey = `${SESSION_KEY}_${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(todayKey)) return;

    // Pass the client's LOCAL hour so the server isn't confused by UTC offset
    const localHour = new Date().getHours();

    fetch(`/api/patient/prescription/active?hour=${localHour}`)
      .then((res) => res.json())
      .then((data) => {
        // API returns null if: expired, sleep hours, or no dose due now
        if (data.prescription) {
          setPrescription(data.prescription);
          setVisible(true);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setAnimateIn(true))
          );
        }
      })
      .catch(console.error);
  }, []);

  const handleClose = () => {
    setAnimateIn(false);
    const todayKey = `${SESSION_KEY}_${new Date().toISOString().slice(0, 10)}`;
    sessionStorage.setItem(todayKey, "1");
    setTimeout(() => setVisible(false), 300);
  };

  const handleViewPrescription = () => {
    handleClose();
    router.push(`/patient-dashboard/prescriptions/${prescription!.id}`);
  };

  if (!visible || !prescription) return null;

  const { medicines, diagnosis, createdAt, doctor, daysElapsed, maxDuration, currentSlot } =
    prescription;

  const slot = slotConfig[currentSlot] ?? slotConfig.morning;

  const prescriptionDate = new Date(createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Only medicines that have a dose right now (highlighted)
  const dueNow = medicines.filter((m) => m.hasDoseNow);
  // Others that are still active but not in current slot
  const others = medicines.filter((m) => !m.hasDoseNow && !m.isExpired);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(0,0,0,${animateIn ? 0.55 : 0})`,
        backdropFilter: `blur(${animateIn ? 6 : 0}px)`,
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
      onClick={handleClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: animateIn
            ? "scale(1) translateY(0)"
            : "scale(0.92) translateY(20px)",
          opacity: animateIn ? 1 : 0,
          transition:
            "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gradient header ─────────────────────────────────────────────── */}
        <div
          className={`relative bg-gradient-to-br ${slot.gradient} px-6 pt-6 pb-8 overflow-hidden`}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-8 -translate-x-6 pointer-events-none" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-50 cursor-pointer"
            aria-label="Close reminder"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title row */}
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-0.5">
                Medication Reminder
              </p>
              <h2 className="text-white text-xl font-bold leading-tight">
                {slot.label} 💊
              </h2>
              <p className="text-white/75 text-xs mt-1">
                {slot.sublabel}
                {maxDuration > 0
                  ? ` · Day ${daysElapsed + 1} of ${maxDuration}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Time icon chip */}
          <div className="relative z-10 mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            {slot.icon}
            <span className="text-white text-xs font-semibold capitalize">
              {currentSlot} dose
            </span>
          </div>
        </div>

        {/* ── Prescription info strip ─────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {doctor.name}
            </span>
            {doctor.specialization && (
              <span className="text-gray-400">· {doctor.specialization}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-auto shrink-0">
            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
            <span>{prescriptionDate}</span>
          </div>
        </div>

        {/* ── Diagnosis ───────────────────────────────────────────────────── */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
            Diagnosis
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {diagnosis}
          </p>
        </div>

        {/* ── Medicine list ────────────────────────────────────────────────── */}
        <div className="px-6 pb-2 max-h-60 overflow-y-auto">
          {/* Medicines due NOW */}
          {dueNow.length > 0 && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-3 mb-2 flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full animate-pulse ${currentSlot === "morning"
                      ? "bg-amber-400"
                      : currentSlot === "noon"
                        ? "bg-sky-400"
                        : "bg-violet-400"
                    }`}
                />
                Due now ({dueNow.length})
              </p>
              <div className="space-y-2">
                {dueNow.map((med, i) => {
                  const label = getDaysLabel(med);
                  return (
                    <div
                      key={`due-${i}`}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${slot.badgeBg} ${slot.badgeBorder}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${slot.badgeBg}`}
                      >
                        <Pill className={`w-4 h-4 ${slot.badgeText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {med.name || "Unknown Medicine"}
                          {med.dosage && (
                            <span className="ml-1.5 text-xs font-normal text-gray-500">
                              {med.dosage}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {med.frequency ||
                            (med.timesPerDay
                              ? `${med.timesPerDay}× daily`
                              : "As prescribed")}
                          {med.instructions && ` · ${med.instructions}`}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${label.bg} ${label.color}`}
                      >
                        {label.icon}
                        {label.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Other active medicines (not in current slot) */}
          {others.length > 0 && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-4 mb-2">
                Other active medicines
              </p>
              <div className="space-y-1.5">
                {others.map((med, i) => {
                  const label = getDaysLabel(med);
                  return (
                    <div
                      key={`other-${i}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50"
                    >
                      <Pill className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                        {med.name || "Unknown Medicine"}
                        {med.dosage && (
                          <span className="ml-1 text-xs text-gray-400">
                            {med.dosage}
                          </span>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${label.bg} ${label.color}`}
                      >
                        {label.icon}
                        {label.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            Got it!
          </button>
          <button
            onClick={handleViewPrescription}
            className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${slot.gradient} text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-1.5`}
          >
            View Prescription
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
