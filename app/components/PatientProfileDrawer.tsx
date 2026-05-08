import { useState } from "react";
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
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    age: "45",
    bloodGroup: "A+",
    gender: "Male",
    address: "123 Main Street, Springfield, IL 62701",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Patient Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl relative">
              JD
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center">
                <Upload className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="text-lg mb-1">{formData.name}</h3>
              <p className="text-sm opacity-90">Patient ID: P001</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-border bg-card sticky top-[168px]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-3 ${
              activeTab === "profile"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 px-4 py-3 ${
              activeTab === "password"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Password
          </button>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Auto-filled Information
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Full Name
                    </p>
                    <p>{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p>{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Phone Number
                    </p>
                    <p>{formData.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4">Editable Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Blood Group</label>
                    <div className="relative">
                      <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bloodGroup: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
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
                    <label className="block mb-2 text-sm">Gender</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Password must be at least 8 characters long and include
                  uppercase, lowercase, numbers, and special characters.
                </p>
              </div>

              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
