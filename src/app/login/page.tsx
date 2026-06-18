"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const router = useRouter();
const handleLogin = async (
  e: FormEvent
) => {
  e.preventDefault();

  setLoading(true);

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  router.push("/dashboard");
};

  return (
    <main className="min-h-screen bg-[#041833] flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            DIAUF<span className="text-emerald-400">.ID</span>
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Sistem Manajemen Bisnis UMKM
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <form
  onSubmit={handleLogin}
  className="space-y-5"
>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
  type="email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
  type={showPassword ? "text" : "password"}
  value={password}
  onChange={(e) =>
    setPassword(e.target.value)
  }
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

<div className="flex items-center justify-between">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      className="h-4 w-4 accent-emerald-500 cursor-pointer"
    />
    <span className="text-sm text-slate-600">
      Simpan informasi login
    </span>
  </label>

  <button
    type="button"
    className="text-sm text-emerald-600 hover:text-emerald-700"
  >
    Lupa password?
  </button>
</div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              {loading
  ? "Memproses..."
  : "Masuk Dashboard"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Khusus klien DIAUF.ID
        </p>

        <div className="mt-6 text-center">
          <p className="mb-3 text-sm text-slate-400">Belum punya akun?</p>
          <button
            onClick={() => router.push('/daftar')}
            className="mx-auto block w-full max-w-[380px] border border-emerald-500/80 bg-transparent px-6 py-4 text-sm font-semibold tracking-wide text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 active:bg-emerald-500/15"
          >
            Daftar dan mulai asesmen bisnis
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Versi 1.0
        </p>
      </div>
    </main>
  );
}
