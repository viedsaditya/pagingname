"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
 

const LoginPage = () => {  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if(data.logged_in === "1") {
        //jika berhasil login maka buat cookie dan redirect ke halaman crud
        Cookies.set("logged_in", "1", { expires: 1 });
        router.push("/crud");
      } else { // error ketika salah username atau password
        setError("Username atau Password Anda Salah");
      }

    } catch (error) {
      console.error("Login error:", error);
      setError("Ada kesalah ketika login");
    }
  }

  return (
    <div className="relative min-h-screen w-full text-white flex items-center justify-center px-4 overflow-hidden">
      {/* Background to match the rest of the app */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/airport_building.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-slate-900/65"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(15,23,42,0.6)_100%)]"></div>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

          {error && (
            <div className="mb-4 w-full rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-center text-sm font-medium text-red-100">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/80">Username</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 opacity-90">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0 1 12 0"/></svg>
                </span>
                <input
                  type="text"
                  id="username"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  className="w-full rounded-lg border border-white/10 bg-transparent py-3 pl-10 pr-4 text-white placeholder-white/50 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/40"
                  required
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 opacity-90">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full rounded-lg border border-white/10 bg-transparent py-3 pl-10 pr-10 text-white placeholder-white/50 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/40"
                  required
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-blue-300 opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18"/><path d="M10.58 10.58a2 2 0 0 0 2.84 2.84"/><path d="M16.1 16.1A10.94 10.94 0 0 1 12 18c-5 0-9-4-10-6a11.54 11.54 0 0 1 5-5"/><path d="M14.12 5.12A10.94 10.94 0 0 1 22 12c-1 2-5 6-10 6a10.93 10.93 0 0 1-2-.18"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* <div className="flex items-center justify-between text-sm text-white/80">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-500" /> Ingat saya
              </label>
              <a href="#" className="text-blue-300 hover:underline">Lupa password?</a>
            </div> */}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-900 py-3 font-semibold text-white transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
  
export default LoginPage;