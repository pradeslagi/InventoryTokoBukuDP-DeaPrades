"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fungsi untuk set cookie user (role) agar bisa dibaca middleware
  function setUserCookie(user) {
    document.cookie = `user=${JSON.stringify({ role: user.role })}; path=/;`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          _id: data.user._id,
          nama_lengkap: data.user.nama_lengkap,
          username: data.user.username,
          role: data.user.role,
          dibuat: data.user.dibuat
        }));

        // Set cookie user agar bisa dibaca middleware
        setUserCookie(data.user);

        // Role-based routing
        if (data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else if (data.user.role === "manager") {
          router.push("/dashboard/manager");
        } else {
          setError("Role tidak valid");
        }
      } else {
        setError(data.message || "Username atau password salah");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login");
    }
  };

  // ...existing code...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-8 border-2 border-pink-200">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/image/file_00000000cae86230a06fa67671abba98-removebg-preview.png"
            alt="Logo DP"
            width={120}
            height={120}
            priority
            className="mb-4"
          />
          <h1 className="text-3xl font-extrabold text-center text-pink-600 font-sans tracking-tight">
            Login Inventory Buku DP
          </h1>
          <div className="mt-3 text-xs text-pink-700 text-center font-mono bg-pink-50 rounded-lg px-3 py-2 leading-relaxed shadow-sm border border-pink-200">
            <div className="mb-1 font-semibold text-pink-500">Username / Password</div>
            <div>
              <span className="font-semibold text-pink-600">prades</span> <span className="text-pink-300">/</span> <span className="font-semibold text-pink-600">prades29</span>
            </div>
            <div>
              <span className="font-semibold text-pink-600">manager</span> <span className="text-pink-300">/</span> <span className="font-semibold text-pink-600">manager123</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-pink-700 text-xs text-center bg-pink-100 border border-pink-200 p-2 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-pink-700 mb-1 font-sans">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none text-gray-900 bg-pink-50 placeholder:text-pink-300 text-sm"
              placeholder="prades"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-pink-700 mb-1 font-sans">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none pr-10 text-gray-900 bg-pink-50 placeholder:text-pink-300 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-xs text-pink-500 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

                   <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition text-sm shadow"
          >
            Masuk
          </button>
        </form>
        <p className="mt-6 text-xs text-center text-pink-400 font-sans">
          &copy; 2025 Sistem Inventory Buku DP
        </p>
      </div>
    </div>
  );
}