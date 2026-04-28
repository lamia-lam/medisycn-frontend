"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "../../types/user";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<Role | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!role) {
      alert("Please select a role");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registration failed");
      return;
    }

    alert("Registration Successful");

    router.push("/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded-xl p-8 w-[450px]"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-3 mb-4 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-3 mb-6 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <h2 className="font-semibold mb-3">Select Role</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole(Role.DOCTOR)}
            className={`p-4 border rounded-lg ${
              role === Role.DOCTOR ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Doctor
          </button>

          <button
            type="button"
            onClick={() => setRole(Role.PATIENT)}
            className={`p-4 border rounded-lg ${
              role === Role.PATIENT ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Patient
          </button>

          <button
            type="button"
            onClick={() => setRole(Role.PHARMACY)}
            className={`p-4 border rounded-lg ${
              role === Role.PHARMACY ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Pharmacy
          </button>

          <button
            type="button"
            onClick={() => setRole(Role.DIAGNOSTIC)}
            className={`p-4 border rounded-lg ${
              role === Role.DIAGNOSTIC ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Diagnostic
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg"
        >
          Register
        </button>
      </form>
    </div>
  );
}
