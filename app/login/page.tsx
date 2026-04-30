"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // 🔒 SAME FUNCTIONALITY (unchanged)
    document.cookie = `token=${data.token}; path=/; max-age=86400`;
    document.cookie = `role=${String(data.role).toLowerCase()}; path=/; max-age=86400; SameSite=Strict`;
    if (data.role === "DOCTOR") {
      router.push("/doctor-dashboard");
    } else if (data.role === "PATIENT") {
      router.push("/patient-dashboard");
    } else if (data.role === "DIAGNOSTIC") {
      router.push("/diagnostic-dashboard");
    } else {
      router.push("/pharmacy-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-2xl mb-4 text-2xl font-bold">
            MS
          </div>
          <h1 className="text-3xl font-semibold mb-2">Welcome to MediSync</h1>
          <p className="text-gray-500">Login to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Passwords"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/register")}
              className="text-cyan-600 font-medium"
            >
              Don’t have an account? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
