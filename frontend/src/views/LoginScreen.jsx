import { motion } from "framer-motion";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Logo } from "../components/Logo.jsx";

export default function LoginScreen({ onLogin, loading }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Enter the demo work email and password to continue.");
      return;
    }

    setError("");

    try {
      await onLogin(form);
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe8_0%,#f5f7f7_48%,#edf3f2_100%)] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_460px]">
        <section className="relative hidden overflow-hidden bg-[#102227] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(232,121,60,0.28),transparent_28%),radial-gradient(circle_at_78%_14%,rgba(90,157,118,0.22),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Logo className="h-12 w-12 shrink-0 rounded-[12px] ring-1 ring-white/15" />
              <div>
                <p className="font-semibold tracking-wide">WFX AI ERP</p>
                <p className="text-sm text-slate-300">Merchandising workspace</p>
              </div>
            </div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 max-w-3xl"
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.45 }}
            >
              <h1 className="text-5xl font-semibold leading-tight">
                Fashion operations, inventory context, and product intelligence in one place.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
                Sign in to enter the workspace.
              </p>
            </motion.div>
          </div>

          <div className="relative grid gap-4 md:grid-cols-3">
            {["Orders", "Products", "AI search"].map((title) => (
              <div className="rounded-2xl border border-white/10 bg-white/7 p-4" key={title}>
                <p className="text-sm font-semibold">{title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <motion.form
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[28px] border border-[#d7dedc] bg-white/90 p-7 shadow-[0_24px_80px_rgba(16,34,39,0.10)] backdrop-blur"
            initial={{ opacity: 0, y: 16 }}
            onSubmit={handleSubmit}
            transition={{ duration: 0.35 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102227] text-white">
              <LockKeyhole aria-hidden="true" size={22} />
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-ink">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sign in to access the ERP workspace.
            </p>

            <label className="mt-7 block text-sm font-semibold text-ink" htmlFor="email">
              Work email
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfcfb] px-3 py-3 focus-within:border-[#d9773f] focus-within:ring-2 focus-within:ring-[#d9773f]/15">
              <Mail aria-hidden="true" className="text-slate-400" size={18} />
              <input
                autoComplete="username"
                className="w-full border-0 bg-transparent text-sm text-ink outline-none"
                id="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="name@company.com"
                type="email"
                value={form.email}
              />
            </div>

            <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="password">
              Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfcfb] px-3 py-3 focus-within:border-[#d9773f] focus-within:ring-2 focus-within:ring-[#d9773f]/15">
              <LockKeyhole aria-hidden="true" className="text-slate-400" size={18} />
              <input
                autoComplete="current-password"
                className="w-full border-0 bg-transparent text-sm text-ink outline-none"
                id="password"
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Enter your password"
                type="password"
                value={form.password}
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-xl bg-[#ef8f5a]/12 px-3 py-2 text-sm text-[#c75a24]">
                {error}
              </p>
            ) : null}

            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#102227] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17333a] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              <ShieldCheck aria-hidden="true" size={18} />
              {loading ? "Signing in..." : "Sign in securely"}
            </button>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
