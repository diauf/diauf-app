"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    nomorWhatsapp: "",
    password: "",
    confirmPassword: "",
  });

  // Asesmen steps state
  const [asesmenStep, setAsesmenStep] = useState(0); // 0 = account form, 1-4 = asesmen steps
  const [usahaData, setUsahaData] = useState({
    namaUsaha: "",
    jenisUsaha: "",
    alamat: "",
    spesifikUsaha: "",
    spesifikLainnya: "",
    jumlahKaryawan: "",
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [pendampinganType, setPendampinganType] = useState<"online" | "offline" | "">("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [generatedUserId, setGeneratedUserId] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (!form.email || !form.nomorWhatsapp) {
      alert("Email dan Nomor WhatsApp wajib diisi.");
      return;
    }

    setLoading(true);

    // Simulasi validasi akun
    await new Promise((resolve) => setTimeout(resolve, 800));

    setLoading(false);
    // Pindah ke halaman asesmen step 1
    setAsesmenStep(1);
  };

  // Helper to go to next step
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setAsesmenStep(step);
    }
  };

  const handleUsahaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUsahaData(prev => ({ ...prev, [name]: value }));
  };

  const toggleModule = (module: string) => {
    setSelectedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const handleFinalSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert("Anda harus menyetujui syarat dan ketentuan.");
      return;
    }

    // Generate dummy User ID
    const userId = `USR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedUserId(userId);
    setAsesmenStep(5); // Final success screen
  };

  // Step 5: User ID success screen
  if (asesmenStep === 5) {
    return (
      <main className="min-h-screen bg-[#041833] flex items-center justify-center px-6">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              DIAUF<span className="text-emerald-400">.ID</span>
            </h1>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-2xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✅
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-slate-600 mb-6">Akun Anda telah dibuat. Berikut adalah User ID Anda:</p>

            <div className="bg-slate-100 border border-slate-300 rounded-2xl p-5 mb-4">
              <div className="text-xs text-slate-500 mb-1">USER ID ANDA</div>
              <div className="text-3xl font-mono font-bold tracking-widest text-[#0f172a] select-all">{generatedUserId}</div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedUserId);
                alert("User ID berhasil disalin ke clipboard!");
              }}
              className="w-full mb-4 rounded-xl bg-emerald-500 py-3 font-semibold text-white flex items-center justify-center gap-2 hover:bg-emerald-600"
            >
              📋 Copy User ID
            </button>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 mb-6">
              <strong>Catatan penting:</strong><br />
              Simpan informasi User ID ini untuk login ke dashboard. 
              Tim DIAUF akan segera menghubungi Anda melalui WhatsApp untuk verifikasi dan aktivasi penuh.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/login")}
                className="flex-1 rounded-xl bg-white border border-slate-300 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Ke Halaman Login
              </button>
              <button
                onClick={() => {
                  // Reset for new registration
                  setAsesmenStep(0);
                  setForm({ email: "", nomorWhatsapp: "", password: "", confirmPassword: "" });
                  setUsahaData({ namaUsaha: "", jenisUsaha: "", alamat: "", spesifikUsaha: "", spesifikLainnya: "", jumlahKaryawan: "" });
                  setSelectedModules([]);
                  setPendampinganType("");
                  setAgreedToTerms(false);
                  setGeneratedUserId("");
                }}
                className="flex-1 rounded-xl bg-slate-900 py-3 font-medium text-white hover:bg-black"
              >
                Daftar Lagi
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // If still in account registration
  if (asesmenStep === 0) {
    return (
      <main className="min-h-screen bg-[#041833] flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              DIAUF<span className="text-emerald-400">.ID</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Daftar &amp; Mulai Proses Asesmen Bisnis
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Buat Akun Baru</h2>
              <p className="mt-1 text-sm text-slate-600">
                Isi data akun Anda untuk memulai proses asesmen bisnis.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                <div className="flex">
                  <div className="flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-sm font-medium select-none">
                    +62
                  </div>
                  <input
                    type="tel"
                    name="nomorWhatsapp"
                    value={form.nomorWhatsapp}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.startsWith("0")) val = val.slice(1);
                      if (val.length > 13) val = val.slice(0, 13);
                      setForm(prev => ({ ...prev, nomorWhatsapp: val }));
                    }}
                    required
                    placeholder="81234567890"
                    className="flex-1 rounded-r-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Masukkan nomor tanpa 0 di depan</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Ulangi password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? "Memproses..." : "Lanjutkan proses asesmen"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-slate-400">
            Sudah punya akun?{" "}
            <button onClick={() => router.push("/login")} className="text-emerald-400 hover:underline">
              Masuk di sini
            </button>
          </p>
        </div>
      </main>
    );
  }

  // Asesmen Steps View (Step 1-4)
  const steps = ["Data Usaha", "Pilih Modul", "Pendampingan", "Konfirmasi"];

  return (
    <main className="min-h-screen bg-[#041833] py-8 px-6">
      <div className="max-w-[720px] mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            DIAUF<span className="text-emerald-400">.ID</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Proses Asesmen Bisnis</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-300 mb-2">
            {steps.map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = asesmenStep === stepNum;
              const isCompleted = asesmenStep > stepNum;
              return (
                <div key={idx} className={`flex-1 text-center ${isActive ? "text-emerald-400 font-medium" : ""}`}>
                  <div className={`mx-auto mb-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold
                    ${isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-emerald-400 text-[#041833]" : "bg-slate-700 text-slate-300"}`}>
                    {isCompleted ? "✓" : stepNum}
                  </div>
                  <div className="text-[10px] leading-tight">{label}</div>
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-1 bg-emerald-400 transition-all duration-300" 
              style={{ width: `${((asesmenStep - 1) / 3) * 100}%` }} 
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          {/* Step 1: Data Usaha */}
          {asesmenStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">Step 1: Data Usaha</h2>
              <p className="text-sm text-slate-600 mb-6">Isi informasi dasar usaha Anda</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Usaha</label>
                  <input
                    type="text"
                    name="namaUsaha"
                    value={usahaData.namaUsaha}
                    onChange={handleUsahaChange}
                    placeholder="PT Maju Bersama"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Usaha</label>
                  <select
                    name="jenisUsaha"
                    value={usahaData.jenisUsaha}
                    onChange={handleUsahaChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">Pilih jenis usaha</option>
                    <option value="Jasa">Jasa</option>
                    <option value="Dagang">Dagang</option>
                    <option value="Manufaktur">Manufaktur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Usaha</label>
                  <input
                    type="text"
                    name="alamat"
                    value={usahaData.alamat}
                    onChange={handleUsahaChange}
                    placeholder="Jl. Raya No. 123, Kota Anda"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Spesifik Usaha</label>
                  <select
                    name="spesifikUsaha"
                    value={usahaData.spesifikUsaha}
                    onChange={handleUsahaChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">Pilih spesifik usaha</option>
                    <option value="Cafe / Coffeeshop">Cafe / Coffeeshop</option>
                    <option value="Restoran">Restoran</option>
                    <option value="Produsen Olahan Makanan">Produsen Olahan Makanan</option>
                    <option value="Sewa Kos/Kontrakan">Sewa Kos/Kontrakan</option>
                    <option value="Rental Kendaraan">Rental Kendaraan</option>
                    <option value="Bengkel Kendaraan">Bengkel Kendaraan</option>
                    <option value="Toko Retail">Toko Retail</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {usahaData.spesifikUsaha === "Lainnya" && (
                    <input
                      type="text"
                      name="spesifikLainnya"
                      value={usahaData.spesifikLainnya}
                      onChange={handleUsahaChange}
                      placeholder="Sebutkan spesifik usaha Anda"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah Karyawan</label>
                  <input
                    type="number"
                    name="jumlahKaryawan"
                    value={usahaData.jumlahKaryawan}
                    onChange={handleUsahaChange}
                    placeholder="Misal: 12"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pilih Modul */}
          {asesmenStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">Step 2: Pilih Modul</h2>
              <p className="text-sm text-slate-600 mb-5">Pilih modul yang ingin Anda gunakan (bisa lebih dari satu)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Data Master", "CRM", "Penjualan", "Pembelian", "Kas & Bank", "Persediaan", "Produksi", "SDM", "Project", "Workshop", "Pengiriman", "Armada", "Pajak", "Laporan"].map((mod) => (
                  <label key={mod} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod)}
                      onChange={() => toggleModule(mod)}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    <span className="text-slate-800">{mod}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pendampingan */}
          {asesmenStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">Step 3: Pilihan Pendampingan</h2>
              <p className="text-sm text-slate-600 mb-5">Pilih jenis pendampingan yang Anda inginkan</p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="pendampingan"
                    value="online"
                    checked={pendampinganType === "online"}
                    onChange={(e) => setPendampinganType(e.target.value as any)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Online</div>
                    <div className="text-sm text-slate-600">Pendampingan via video call / chat</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="pendampingan"
                    value="offline"
                    checked={pendampinganType === "offline"}
                    onChange={(e) => setPendampinganType(e.target.value as any)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Offline / Visit Lokasi Usaha</div>
                    <div className="text-sm text-slate-600">Kunjungan langsung ke lokasi usaha Anda</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Konfirmasi */}
          {asesmenStep === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">Step 4: Konfirmasi</h2>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-sm text-slate-700 space-y-3">
                <p>• Dengan mengklik tombol di bawah, Anda akan mendapatkan <strong>User ID</strong> yang bisa digunakan untuk login.</p>
                <p>• Tim DIAUF akan segera menghubungi Anda melalui WhatsApp (pastikan informasi yang Anda berikan sudah sesuai).</p>
                <p>• Akun gratis hanya berlaku selama <strong>3 hari</strong>. Setelah itu Anda dapat melakukan upgrade ke paket berbayar.</p>
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-emerald-500"
                  />
                  <span>Saya setuju dan memahami syarat dan ketentuan yang berlaku.</span>
                </label>
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={!agreedToTerms}
                className="w-full rounded-xl bg-emerald-500 py-3.5 font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-emerald-600"
              >
                Submit &amp; Dapatkan User ID <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Navigation */}
          {asesmenStep >= 1 && asesmenStep <= 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => goToStep(asesmenStep - 1)}
                disabled={asesmenStep === 1}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Sebelumnya
              </button>

              {asesmenStep < 4 && (
                <button
                  type="button"
                  onClick={() => goToStep(asesmenStep + 1)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 flex items-center gap-2"
                >
                  Lanjutkan <ArrowRight size={17} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
