"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";
import {
  UserCircle2,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AkunSayaPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingAkun, setSavingAkun] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [akunForm, setAkunForm] = useState({ full_name: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 4500);
  };

  // Load profile and auth user
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setAuthUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id, full_name, role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setAkunForm({ full_name: profileData.full_name || '' });
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSaveAkun = async () => {
    if (!profile?.id) return;
    if (!akunForm.full_name.trim()) {
      setMessage({ type: 'error', text: 'Nama lengkap tidak boleh kosong.' });
      clearMessage();
      return;
    }
    setSavingAkun(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: akunForm.full_name.trim() })
        .eq('id', profile.id);
      if (error) throw error;
      setProfile({ ...profile, full_name: akunForm.full_name.trim() });
      setMessage({ type: 'success', text: 'Nama berhasil diperbarui.' });
      clearMessage();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui nama.' });
      clearMessage();
    } finally {
      setSavingAkun(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      clearMessage();
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      clearMessage();
      return;
    }
    setSavingPassword(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password berhasil diubah. Silakan login ulang jika diperlukan.' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      clearMessage();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah password.' });
      clearMessage();
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />
        <main
          className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}
        >
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <main
        className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Akun Saya</h1>
            <p className="text-sm text-slate-500">Rincian dan status akun pribadi Anda</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <UserCircle2 size={22} className="text-[#041833]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Akun Saya</h2>
                <p className="text-sm text-slate-500">Kelola informasi akun pribadi Anda</p>
              </div>
            </div>

            {authUser && (
              <div className="space-y-6">
                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Email</div>
                    <div className="font-medium text-slate-900 break-all">{authUser.email}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Role</div>
                    <div className="font-medium text-slate-900">{profile?.role || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Status Akun</div>
                    <div className="font-medium text-emerald-600">Aktif</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Terdaftar Sejak</div>
                    <div className="font-medium text-slate-900">
                      {authUser.created_at ? new Date(authUser.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Login Terakhir</div>
                    <div className="font-medium text-slate-900">
                      {authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('id-ID') : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Nama Lengkap</div>
                    <div className="font-medium text-slate-900">{profile?.full_name || '-'}</div>
                  </div>
                </div>

                {/* Edit Full Name */}
                <div className="border-t border-slate-100 pt-6">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={akunForm.full_name}
                      onChange={(e) => setAkunForm({ full_name: e.target.value })}
                      className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Nama lengkap Anda"
                    />
                    <button
                      onClick={handleSaveAkun}
                      disabled={savingAkun || !akunForm.full_name.trim()}
                      className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-emerald-300 transition"
                    >
                      {savingAkun ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>

                {/* Change Password */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Ubah Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Password Baru</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="Ulangi password baru"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword || passwordForm.newPassword.length < 6}
                      className="w-full md:w-auto rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-emerald-300 transition"
                    >
                      {savingPassword ? 'Memproses...' : 'Ubah Password'}
                    </button>
                    <p className="text-xs text-slate-400">Password minimal 6 karakter. Setelah diubah, Anda mungkin perlu login ulang di perangkat lain.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
