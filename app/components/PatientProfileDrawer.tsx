import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Save,
  MapPin,
  Droplet,
} from "lucide-react";

interface PatientProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientProfileDrawer({
  isOpen,
  onClose,
}: PatientProfileDrawerProps) {
  const [formData, setFormData] = useState({
    name: "Loading...",
    email: "Loading...",
    phone: "Loading...",
    age: "",
    bloodGroup: "A+",
    gender: "Male",
    dateOfBirth: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [patientId, setPatientId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/patient/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.user) {
            setFormData((prev) => ({
              ...prev,
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              age: data.age ? String(data.age) : "",
              bloodGroup: data.bloodGroup || "A+",
              gender: data.gender || "Male",
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : "",
              address: data.address || "",
            }));
            setPatientId(data.id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSaveProfile = async () => {
    if (!formData.age || !formData.age.trim()) {
      alert("Age is required");
      return;
    }
    if (!formData.gender || !formData.gender.trim()) {
      alert("Gender is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: formData.age,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth || null,
        }),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  if (!isOpen) return null;

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400 transition-colors";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-[70] overflow-y-auto flex flex-col transition-transform transform translate-x-0">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-700 to-cyan-500 text-white p-6 border-b border-gray-200 dark:border-gray-700 z-10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Patient Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl font-semibold relative overflow-hidden">
              {formData.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "?"}
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                <Upload className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-0.5">{formData.name}</h3>
              <p className="text-sm text-white/90">
                Patient ID: #P{String(patientId || 0).padStart(4, "0")}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-[152px] z-10 shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
              activeTab === "password"
                ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            Security &amp; Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-white dark:bg-gray-800">
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Auto-filled info */}
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    className={`${inputClass} pl-10 bg-gray-100 dark:bg-gray-900/50 cursor-not-allowed text-gray-500`}
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Sourced from your login credentials
                </p>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    className={`${inputClass} pl-10 bg-gray-100 dark:bg-gray-900/50 cursor-not-allowed text-gray-500`}
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Sourced from your login credentials
                </p>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    className={`${inputClass} pl-10 bg-gray-100 dark:bg-gray-900/50 cursor-not-allowed text-gray-500`}
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Sourced from your login credentials
                </p>
              </div>

              {/* Editable info */}
              <div>
                <label className={labelClass}>Age <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Blood Group</label>
                <div className="relative">
                  <Droplet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value })
                    }
                    className={`${inputClass} pl-10 appearance-none`}
                  >
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className={`${inputClass} pl-10 appearance-none`}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className={`${inputClass} pl-10 resize-none`}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <span className="font-semibold block mb-1">
                    Password Requirements:
                  </span>
                  Must be at least 8 characters long and include uppercase,
                  lowercase, numbers, and special characters.
                </p>
              </div>

              <div className="pt-2">
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <Lock className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
