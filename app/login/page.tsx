"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: { error?: string; token?: string; role?: string } = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          setError("Unexpected server response. Please try again.");
          return;
        }
      } else if (!res.ok) {
        setError("Login failed. Please try again.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (!data.role) {
        setError("Invalid login response from server.");
        return;
      }

      if (data.role === "DOCTOR") {
        router.replace("/doctor-dashboard");
      } else if (data.role === "PATIENT") {
        router.replace("/patient-dashboard");
      } else if (data.role === "DIAGNOSTIC" || data.role === "diagnostic") {
        router.replace("/diagnosis-dashboard");
      } else if (data.role === "PHARMACY" || data.role === "pharmacy") {
        router.replace("/pharmacy-dashboard");
      } else if (data.role === "ADMIN" || data.role === "admin") {
        router.replace("/admin-dashboard");
      } else {
        setError("Unknown role");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
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
                  value={email}
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
                  value={password}
                  placeholder="Password"
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
          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => router.replace("/register")}
              className="text-cyan-600 font-medium"
            >
              Don't have an account? Register
            </button>
            <div>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-700 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
