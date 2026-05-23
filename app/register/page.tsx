"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Empty field validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.role
    ) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Password match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // ✅ Password strength
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role.toUpperCase(), // IMPORTANT
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Registration Successful");
      router.replace("/login");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 rounded-2xl mb-4">
            <span className="text-white font-semibold text-2xl">MS</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
          <p className="text-gray-500">Join MediSync healthcare platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full pl-10 p-3 border rounded"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full pl-10 p-3 border rounded"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone"
                  pattern="[0-9]{10,15}"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full pl-10 p-3 border rounded"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block mb-2">Select Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                    })
                  }
                  className="w-full pl-10 p-3 border rounded"
                  required
                >
                  <option value="">Choose role</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="diagnostic">Diagnostic</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full pl-10 p-3 border rounded"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 p-3 border rounded"
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.replace("/login")}
              className="text-cyan-600 font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
