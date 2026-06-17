"use client";

import { useState } from "react";
import {
  Clock,
  History,
  Calendar,
  Wallet,
  LogOut,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

export default function HumanikaKaryawanDemo() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    nama: "Rina Marlina",
    kode: "EMP-042",
    departemen: "Pembelian",
    jabatan: "Staff Purchasing",
  });

  const [activeTab, setActiveTab] = useState<"absensi" | "riwayat" | "jadwal" | "gaji">("absensi");

  // Demo states
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  const [absenHistory, setAbsenHistory] = useState([
    { tanggal: "2025-01-10", jamMasuk: "08:02", jamPulang: "17:05", status: "Hadir" },
    { tanggal: "2025-01-09", jamMasuk: "08:15", jamPulang: "17:00", status: "Hadir" },
    { tanggal: "2025-01-08", jamMasuk: "08:00", jamPulang: "16:58", status: "Hadir" },
    { tanggal: "2025-01-07", jamMasuk: "-", jamPulang: "-", status: "Cuti" },
  ]);

  const [shiftSchedule] = useState([
    { tanggal: "2025-01-13", shift: "Pagi", jam: "08:00 - 17:00" },
    { tanggal: "2025-01-14", shift: "Pagi", jam: "08:00 - 17:00" },
    { tanggal: "2025-01-15", shift: "Siang", jam: "13:00 - 22:00" },
  ]);

  const [pengajuanCuti, setPengajuanCuti] = useState<any[]>([]);
  const [pengajuanTukar, setPengajuanTukar] = useState<any[]>([]);

  const [gajiHistory] = useState([
    { periode: "Desember 2024", gajiPokok: 6500000, tunjangan: 1200000, potongan: 350000, total: 7350000, tanggalBayar: "2025-01-05" },
    { periode: "November 2024", gajiPokok: 6500000, tunjangan: 1200000, potongan: 320000, total: 7380000, tanggalBayar: "2024-12-05" },
  ]);

  // Fake login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login - accept anything
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("absensi");
    setIsClockedIn(false);
    setClockInTime(null);
  };

  const toggleAbsensi = () => {
    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockInTime(now);
      // Add to history
      const today = new Date().toISOString().split("T")[0];
      setAbsenHistory((prev) => [
        { tanggal: today, jamMasuk: now, jamPulang: "-", status: "Hadir" },
        ...prev,
      ]);
    } else {
      setIsClockedIn(false);
      // Update today's entry
      const today = new Date().toISOString().split("T")[0];
      setAbsenHistory((prev) =>
        prev.map((item, index) =>
          index === 0 && item.tanggal === today
            ? { ...item, jamPulang: now }
            : item
        )
      );
      setClockInTime(null);
    }
  };

  // Demo submit pengajuan
  const submitCuti = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const tanggalMulai = (form.elements.namedItem("tanggalMulai") as HTMLInputElement).value;
    const tanggalSelesai = (form.elements.namedItem("tanggalSelesai") as HTMLInputElement).value;
    const alasan = (form.elements.namedItem("alasan") as HTMLInputElement).value;

    if (tanggalMulai && tanggalSelesai && alasan) {
      const newPengajuan = {
        id: Date.now(),
        jenis: "Cuti",
        tanggalMulai,
        tanggalSelesai,
        alasan,
        status: "Menunggu Persetujuan",
      };
      setPengajuanCuti((prev) => [newPengajuan, ...prev]);
      alert("Pengajuan cuti berhasil dikirim! (Demo)");
      form.reset();
    }
  };

  const submitTukarShift = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const tanggal = (form.elements.namedItem("tanggal") as HTMLInputElement).value;
    const shiftBaru = (form.elements.namedItem("shiftBaru") as HTMLInputElement).value;
    const alasan = (form.elements.namedItem("alasanTukar") as HTMLInputElement).value;

    if (tanggal && shiftBaru && alasan) {
      const newPengajuan = {
        id: Date.now(),
        jenis: "Tukar Shift",
        tanggal,
        shiftBaru,
        alasan,
        status: "Menunggu Persetujuan",
      };
      setPengajuanTukar((prev) => [newPengajuan, ...prev]);
      alert("Pengajuan tukar shift berhasil dikirim! (Demo)");
      form.reset();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Mobile Header */}
          <div className="bg-[#041833] px-6 py-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">DH</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">DIAUF Humanika</h1>
            <p className="text-emerald-400 text-sm mt-1">Karyawan Self Service</p>
          </div>

          <div className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Masuk</h2>
              <p className="text-sm text-slate-500 mt-1">Login untuk karyawan klien</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Karyawan / Email</label>
                <input
                  type="text"
                  defaultValue="EMP-042"
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password / PIN</label>
                <input
                  type="password"
                  defaultValue="123456"
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-sm transition mt-2"
              >
                Masuk
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Demo • Buka di HP untuk pengalaman terbaik<br />
              (Data akan hilang saat refresh)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Mobile App Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-[420px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#041833] rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">DH</span>
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">DIAUF Humanika</div>
              <div className="text-[10px] text-emerald-600 -mt-0.5">Karyawan</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </div>

      <div className="max-w-[420px] mx-auto px-4">
        {/* User Info */}
        <div className="pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-200 rounded-full flex items-center justify-center">
              <User size={22} className="text-slate-600" />
            </div>
            <div>
              <div className="font-semibold text-lg text-slate-900">{user.nama}</div>
              <div className="text-sm text-slate-500">{user.kode} • {user.departemen}</div>
            </div>
          </div>
        </div>

        {/* Content based on tab */}
        {activeTab === "absensi" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-sm text-slate-500">Hari ini</div>
                  <div className="font-semibold text-xl text-slate-900">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isClockedIn ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {isClockedIn ? "Sudah Clock In" : "Belum Clock In"}
                </div>
              </div>

              {isClockedIn && clockInTime && (
                <div className="mb-4 text-sm text-emerald-600">
                  Clock In: {clockInTime}
                </div>
              )}

              <button
                onClick={toggleAbsensi}
                className={`w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition text-base ${
                  isClockedIn 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                <Clock size={20} />
                {isClockedIn ? "Clock Out Sekarang" : "Clock In Sekarang"}
              </button>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                <Calendar size={18} /> Status Hari Ini
              </div>
              <div className="text-2xl font-semibold text-emerald-600">
                {isClockedIn ? "Sedang Bekerja" : "Belum Mulai"}
              </div>
            </div>
          </div>
        )}

        {activeTab === "riwayat" && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <History size={18} className="text-slate-600" />
              <span className="font-semibold">Riwayat Absensi</span>
            </div>
            <div className="divide-y">
              {absenHistory.map((item, index) => (
                <div key={index} className="px-5 py-3.5 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</div>
                    <div className="text-xs text-slate-500">{item.status}</div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    {item.jamMasuk} — {item.jamPulang}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "jadwal" && (
          <div className="space-y-6">
            {/* Jadwal Shift */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200">
              <div className="font-semibold mb-4 flex items-center gap-2">
                <Calendar size={18} /> Jadwal Shift Minggu Ini
              </div>
              <div className="space-y-3">
                {shiftSchedule.map((shift, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{new Date(shift.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}</div>
                      <div className="text-xs text-emerald-600">{shift.shift}</div>
                    </div>
                    <div className="font-mono text-sm text-slate-700">{shift.jam}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pengajuan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200">
              <div className="font-semibold mb-4">Pengajuan</div>

              {/* Form Cuti */}
              <div className="mb-6">
                <div className="text-sm font-medium text-slate-700 mb-2">Ajukan Cuti</div>
                <form onSubmit={submitCuti} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input name="tanggalMulai" type="date" className="border rounded-2xl px-3 py-2 text-sm" required />
                    <input name="tanggalSelesai" type="date" className="border rounded-2xl px-3 py-2 text-sm" required />
                  </div>
                  <input name="alasan" type="text" placeholder="Alasan cuti" className="w-full border rounded-2xl px-3 py-2 text-sm" required />
                  <button type="submit" className="w-full bg-[#041833] text-white py-2.5 text-sm rounded-2xl font-medium">Ajukan Cuti</button>
                </form>
              </div>

              {/* Form Tukar Shift */}
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Ajukan Tukar Shift</div>
                <form onSubmit={submitTukarShift} className="space-y-3">
                  <input name="tanggal" type="date" className="w-full border rounded-2xl px-3 py-2 text-sm" required />
                  <input name="shiftBaru" type="text" placeholder="Shift yang diinginkan" className="w-full border rounded-2xl px-3 py-2 text-sm" required />
                  <input name="alasanTukar" type="text" placeholder="Alasan tukar shift" className="w-full border rounded-2xl px-3 py-2 text-sm" required />
                  <button type="submit" className="w-full bg-[#041833] text-white py-2.5 text-sm rounded-2xl font-medium">Ajukan Tukar Shift</button>
                </form>
              </div>

              {/* List pengajuan */}
              {(pengajuanCuti.length > 0 || pengajuanTukar.length > 0) && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-xs font-medium text-slate-500 mb-2">Pengajuan Terkirim</div>
                  {[...pengajuanCuti, ...pengajuanTukar].slice(0, 3).map((p, i) => (
                    <div key={i} className="text-xs bg-slate-50 rounded-xl px-3 py-2 mb-1.5 flex justify-between">
                      <span>{p.jenis} • {p.tanggalMulai || p.tanggal}</span>
                      <span className="text-emerald-600">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "gaji" && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <Wallet size={18} className="text-slate-600" />
              <span className="font-semibold">Riwayat Gaji</span>
            </div>
            <div className="divide-y">
              {gajiHistory.map((gaji, index) => (
                <div key={index} className="px-5 py-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="font-semibold">{gaji.periode}</div>
                    <div className="text-emerald-600 font-semibold">Rp {gaji.total.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>Gaji Pokok: Rp {gaji.gajiPokok.toLocaleString("id-ID")}</div>
                    <div>Tunjangan: Rp {gaji.tunjangan.toLocaleString("id-ID")}</div>
                    <div>Potongan: Rp {gaji.potongan.toLocaleString("id-ID")}</div>
                    <div className="pt-1 text-[10px]">Dibayar: {gaji.tanggalBayar}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-[420px] mx-auto">
        <div className="grid grid-cols-4 text-xs">
          {[
            { id: "absensi", label: "Absensi", icon: Clock },
            { id: "riwayat", label: "Riwayat", icon: History },
            { id: "jadwal", label: "Jadwal & Cuti", icon: Calendar },
            { id: "gaji", label: "Gaji", icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-3 ${isActive ? "text-emerald-600" : "text-slate-500"}`}
              >
                <Icon size={18} />
                <span className="mt-1 text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
