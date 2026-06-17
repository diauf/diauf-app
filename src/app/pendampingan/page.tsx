"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Handshake,
  Plus,
  Search,
  Pencil,
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle,
  XCircle,
  BarChart3,
  Trash2,
} from "lucide-react";

type Pendampingan = {
  id: number;
  klienNama: string;
  jenis: "Online" | "Offline";
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:MM
  jamSelesai: string; // HH:MM
  lokasiAtauLink: string;
  agenda: string;
  konsultan: string;
  status: "Terjadwal" | "Berlangsung" | "Selesai" | "Dibatalkan";
  catatan?: string;
};

const JENIS_OPTIONS = ["Online", "Offline"] as const;
const STATUS_OPTIONS = ["Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"] as const;

// Demo klien (selaras dengan modul Konsultan untuk integrasi konseptual)
const DEMO_KLIEN = [
  "PT Maju Sejahtera",
  "CV Berkah Abadi",
  "PT Sinar Logistik",
  "PT Delta Prima",
  "CV Sentosa Makmur",
  "PT Karya Nusantara",
  "PT Harmoni Finance",
  "CV Prima Mandiri",
];

// Tim internal + konsultan
const DEMO_KONSULTAN = [
  "Rina Kusuma (Konsultan Pajak)",
  "Andi Pratama (Tim DIAUF Internal)",
  "Dewi Lestari (Konsultan Keuangan)",
  "Budi Santoso (Tim DIAUF Internal)",
  "Sinta Wijaya (Konsultan Pajak)",
];

export default function PendampinganPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "jadwal" | "klien" | "kalender" | "laporan"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "jadwal", label: "Jadwal Pendampingan" },
    { id: "klien", label: "Klien yang Didampingi" },
    { id: "kalender", label: "Kalender" },
    { id: "laporan", label: "Laporan" },
  ] as const;

  // Data
  const [jadwal, setJadwal] = useState<Pendampingan[]>([]);

  // UI
  const [searchTerm, setSearchTerm] = useState("");

  // Schedule modal (add / edit)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{
    klienNama: string;
    jenis: string;
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    lokasiAtauLink: string;
    agenda: string;
    konsultan: string;
    status: "Terjadwal" | "Berlangsung" | "Selesai" | "Dibatalkan";
    catatan: string;
  }>({
    klienNama: DEMO_KLIEN[0],
    jenis: "Online",
    tanggal: "2026-06-20",
    jamMulai: "09:00",
    jamSelesai: "10:30",
    lokasiAtauLink: "https://zoom.us/j/123456789",
    agenda: "",
    konsultan: DEMO_KONSULTAN[0],
    status: "Terjadwal",
    catatan: "",
  });

  // Load profile + data
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setProfile({ name: "Konsultan / Tim DIAUF", role: "Konsultan" });
      setLoading(false);
    };
    loadProfile();

    const saved = localStorage.getItem("pendampingan_demo_jadwal");
    if (saved) {
      setJadwal(JSON.parse(saved));
    } else {
      const demo: Pendampingan[] = [
        {
          id: 1,
          klienNama: "PT Maju Sejahtera",
          jenis: "Online",
          tanggal: "2026-06-10",
          jamMulai: "10:00",
          jamSelesai: "11:30",
          lokasiAtauLink: "https://meet.google.com/abc-defg-hij",
          agenda: "Review SPT Tahunan 2025 & strategi restitusi PPN",
          konsultan: "Rina Kusuma (Konsultan Pajak)",
          status: "Selesai",
          catatan: "Klien setuju lanjut ke pengajuan restitusi.",
        },
        {
          id: 2,
          klienNama: "CV Berkah Abadi",
          jenis: "Offline",
          tanggal: "2026-06-12",
          jamMulai: "14:00",
          jamSelesai: "15:30",
          lokasiAtauLink: "Kantor CV Berkah Abadi - Jl. Gatot Subroto No. 12, Bandung",
          agenda: "Pendampingan penyusunan SPT Masa & pelatihan staf akuntansi",
          konsultan: "Andi Pratama (Tim DIAUF Internal)",
          status: "Selesai",
        },
        {
          id: 3,
          klienNama: "PT Sinar Logistik",
          jenis: "Online",
          tanggal: "2026-06-18",
          jamMulai: "09:30",
          jamSelesai: "11:00",
          lokasiAtauLink: "https://zoom.us/j/987654321",
          agenda: "Onboarding pendampingan pajak + setup DJP Online",
          konsultan: "Dewi Lestari (Konsultan Keuangan)",
          status: "Terjadwal",
          catatan: "Klien baru, fokus pada validasi NPWP & EFIN.",
        },
        {
          id: 4,
          klienNama: "PT Delta Prima",
          jenis: "Offline",
          tanggal: "2026-06-19",
          jamMulai: "13:00",
          jamSelesai: "16:00",
          lokasiAtauLink: "Kantor PT Delta Prima - Jl. Pemuda No. 55, Semarang",
          agenda: "Workshop cashflow & perencanaan keuangan Q3",
          konsultan: "Budi Santoso (Tim DIAUF Internal)",
          status: "Terjadwal",
        },
        {
          id: 5,
          klienNama: "CV Sentosa Makmur",
          jenis: "Online",
          tanggal: "2026-06-20",
          jamMulai: "10:00",
          jamSelesai: "11:45",
          lokasiAtauLink: "https://teams.microsoft.com/l/meetup-join/xxx",
          agenda: "Dampingi pemeriksaan pajak - persiapan dokumen KPP",
          konsultan: "Sinta Wijaya (Konsultan Pajak)",
          status: "Terjadwal",
          catatan: "Siapkan berkas pemeriksaan tahun 2023-2024.",
        },
        {
          id: 6,
          klienNama: "PT Maju Sejahtera",
          jenis: "Offline",
          tanggal: "2026-06-25",
          jamMulai: "08:30",
          jamSelesai: "10:00",
          lokasiAtauLink: "Kantor PT Maju Sejahtera - Jl. Sudirman No. 88, Jakarta Pusat",
          agenda: "Site visit & review implementasi rekomendasi sebelumnya",
          konsultan: "Rina Kusuma (Konsultan Pajak)",
          status: "Terjadwal",
        },
        {
          id: 7,
          klienNama: "PT Harmoni Finance",
          jenis: "Online",
          tanggal: "2026-06-17",
          jamMulai: "15:00",
          jamSelesai: "16:00",
          lokasiAtauLink: "https://zoom.us/j/1122334455",
          agenda: "Konsultasi pajak final Q2 & perencanaan SPT",
          konsultan: "Dewi Lestari (Konsultan Keuangan)",
          status: "Berlangsung",
        },
        {
          id: 8,
          klienNama: "PT Karya Nusantara",
          jenis: "Offline",
          tanggal: "2026-05-28",
          jamMulai: "09:00",
          jamSelesai: "12:00",
          lokasiAtauLink: "Kantor PT Karya Nusantara - Jl. Asia Afrika No. 31, Jakarta",
          agenda: "Finalisasi laporan Due Diligence (sudah selesai)",
          konsultan: "Andi Pratama (Tim DIAUF Internal)",
          status: "Selesai",
        },
        {
          id: 9,
          klienNama: "CV Prima Mandiri",
          jenis: "Online",
          tanggal: "2026-06-23",
          jamMulai: "11:00",
          jamSelesai: "12:00",
          lokasiAtauLink: "https://meet.google.com/klm-nopq-rst",
          agenda: "Kick-off pendampingan laporan keuangan & setup awal",
          konsultan: "Budi Santoso (Tim DIAUF Internal)",
          status: "Terjadwal",
        },
        {
          id: 10,
          klienNama: "PT Sinar Logistik",
          jenis: "Offline",
          tanggal: "2026-06-05",
          jamMulai: "14:00",
          jamSelesai: "15:30",
          lokasiAtauLink: "Kantor CV Berkah Abadi (sementara)",
          agenda: "Pendampingan awal & penandatanganan MoU",
          konsultan: "Sinta Wijaya (Konsultan Pajak)",
          status: "Dibatalkan",
          catatan: "Dibatalkan karena konflik jadwal klien. Akan dijadwal ulang.",
        },
      ];
      setJadwal(demo);
      localStorage.setItem("pendampingan_demo_jadwal", JSON.stringify(demo));
    }
  }, []);

  // Persist
  useEffect(() => {
    if (jadwal.length > 0) {
      localStorage.setItem("pendampingan_demo_jadwal", JSON.stringify(jadwal));
    }
  }, [jadwal]);

  // Helper: hitung durasi dalam jam
  const hitungDurasiJam = (mulai: string, selesai: string): number => {
    const [h1, m1] = mulai.split(":").map(Number);
    const [h2, m2] = selesai.split(":").map(Number);
    return Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
  };

  // Filtered & computed
  const filteredJadwal = jadwal
    .filter((j) =>
      j.klienNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.konsultan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.lokasiAtauLink.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : 0));

  // Stats
  const totalSesi = jadwal.length;
  const sesiOnline = jadwal.filter((j) => j.jenis === "Online").length;
  const sesiOffline = jadwal.filter((j) => j.jenis === "Offline").length;
  const sesiSelesai = jadwal.filter((j) => j.status === "Selesai").length;
  const sesiTerjadwal = jadwal.filter((j) => j.status === "Terjadwal" || j.status === "Berlangsung").length;

  const totalJam = jadwal.reduce((sum, j) => sum + hitungDurasiJam(j.jamMulai, j.jamSelesai), 0);

  const uniqueKlien = new Set(jadwal.map((j) => j.klienNama)).size;

  const upcoming = [...jadwal]
    .filter((j) => ["Terjadwal", "Berlangsung"].includes(j.status))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(0, 5);

  // Group by klien for "Klien" tab
  const klienGroups = DEMO_KLIEN.map((nama) => {
    const sesi = jadwal.filter((j) => j.klienNama === nama);
    const totalSesiKlien = sesi.length;
    const last = sesi.length > 0 ? [...sesi].sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0] : null;
    const next = sesi.filter((s) => ["Terjadwal", "Berlangsung"].includes(s.status))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0];
    return { nama, totalSesiKlien, last, next };
  }).filter((g) => g.totalSesiKlien > 0);

  // Group by tanggal for Kalender tab
  const kalenderGroups = jadwal.reduce((acc: Record<string, Pendampingan[]>, item) => {
    if (!acc[item.tanggal]) acc[item.tanggal] = [];
    acc[item.tanggal].push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(kalenderGroups).sort();

  // Form handlers
  const openNewSchedule = (prefillKlien?: string) => {
    setEditingId(null);
    setScheduleForm({
      klienNama: prefillKlien || DEMO_KLIEN[0],
      jenis: "Online",
      tanggal: "2026-06-25",
      jamMulai: "09:00",
      jamSelesai: "10:30",
      lokasiAtauLink: "https://zoom.us/j/",
      agenda: "",
      konsultan: DEMO_KONSULTAN[0],
      status: "Terjadwal",
      catatan: "",
    });
    setShowScheduleModal(true);
  };

  const openEditSchedule = (item: Pendampingan) => {
    setEditingId(item.id);
    setScheduleForm({
      klienNama: item.klienNama,
      jenis: item.jenis,
      tanggal: item.tanggal,
      jamMulai: item.jamMulai,
      jamSelesai: item.jamSelesai,
      lokasiAtauLink: item.lokasiAtauLink,
      agenda: item.agenda,
      konsultan: item.konsultan,
      status: item.status,
      catatan: item.catatan || "",
    });
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingId(null);
  };

  const saveSchedule = () => {
    if (!scheduleForm.agenda.trim() || !scheduleForm.lokasiAtauLink.trim()) {
      alert("Agenda dan Lokasi/Link wajib diisi.");
      return;
    }

    const newItem: Pendampingan = {
      id: editingId ?? Math.max(0, ...jadwal.map((j) => j.id)) + 1,
      klienNama: scheduleForm.klienNama,
      jenis: scheduleForm.jenis as "Online" | "Offline",
      tanggal: scheduleForm.tanggal,
      jamMulai: scheduleForm.jamMulai,
      jamSelesai: scheduleForm.jamSelesai,
      lokasiAtauLink: scheduleForm.lokasiAtauLink.trim(),
      agenda: scheduleForm.agenda.trim(),
      konsultan: scheduleForm.konsultan,
      status: scheduleForm.status,
      catatan: scheduleForm.catatan.trim() || undefined,
    };

    if (editingId !== null) {
      setJadwal((prev) => prev.map((j) => (j.id === editingId ? newItem : j)));
    } else {
      setJadwal((prev) => [...prev, newItem]);
    }
    closeScheduleModal();
  };

  // Quick status update
  const updateStatus = (id: number, newStatus: Pendampingan["status"]) => {
    setJadwal((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
  };

  const deleteJadwal = (id: number) => {
    if (!confirm("Hapus jadwal pendampingan ini?")) return;
    setJadwal((prev) => prev.filter((j) => j.id !== id));
  };

  // Saat jenis berubah di form, reset contoh lokasi/link
  const handleJenisChange = (newJenis: string) => {
    const isOnline = newJenis === "Online";
    setScheduleForm((prev) => ({
      ...prev,
      jenis: newJenis,
      lokasiAtauLink: isOnline ? "https://zoom.us/j/" : "Kantor klien / Alamat lengkap",
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Pendampingan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <div className={`${collapsed ? "ml-20" : "ml-72"} transition-all duration-300 p-6`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <Handshake size={26} className="text-emerald-600" /> Modul Pendampingan
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Penjadwalan pendampingan klien (online &amp; offline) untuk Konsultan dan Tim Internal DIAUF. Terintegrasi dengan data klien dari modul Konsultan.
              </p>
            </div>
            <button
              onClick={() => openNewSchedule()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Plus size={16} /> Jadwalkan Pendampingan
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-2xl transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-700 bg-white"
                  : "border-transparent text-slate-800 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {(activeTab === "jadwal" || activeTab === "klien") && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
              <input
                type="text"
                placeholder="Cari klien, agenda, konsultan, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-sm text-slate-700 hover:text-slate-900">
                Clear
              </button>
            )}
          </div>
        )}

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Sesi Pendampingan</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalSesi}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Online vs Offline</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  {sesiOnline} / {sesiOffline}
                </div>
                <div className="text-xs text-slate-700 mt-0.5">Online / Offline</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Jam Pendampingan</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalJam.toFixed(1)} jam</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Sesi Terjadwal / Berlangsung</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">{sesiTerjadwal}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Klien Unik yang Didampingi</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{uniqueKlien}</div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Calendar size={20} /> Jadwal Mendatang (Terjadwal &amp; Berlangsung)
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-700">Tidak ada jadwal mendatang.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((j) => (
                    <div key={j.id} className="flex flex-col md:flex-row md:items-center justify-between border border-slate-200 rounded-2xl p-4 gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{j.klienNama}</div>
                        <div className="text-sm text-slate-700">{j.agenda}</div>
                        <div className="text-xs text-slate-700 mt-1 flex items-center gap-2">
                          {j.jenis === "Online" ? <Video size={14} /> : <MapPin size={14} />} {j.tanggal} • {j.jamMulai} - {j.jamSelesai} • {j.konsultan}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-0.5 rounded-full font-medium ${j.jenis === "Online" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {j.jenis}
                        </span>
                        <button onClick={() => openEditSchedule(j)} className="px-3 py-1 text-xs border border-slate-300 rounded-xl hover:bg-slate-50">Edit</button>
                        <button onClick={() => updateStatus(j.id, "Selesai")} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Tandai Selesai</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => openNewSchedule()} className="mt-4 text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
                <Plus size={14} /> Jadwalkan Pendampingan Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Catatan Penting</h3>
              <div className="text-sm text-slate-800 space-y-2">
                <p>• Modul ini digunakan oleh Konsultan (eksternal) maupun Tim Internal DIAUF untuk menjadwalkan pendampingan klien.</p>
                <p>• Pilih jenis Online (Zoom/Meet/Teams) atau Offline (kunjungan kantor klien).</p>
                <p>• Data klien diselaraskan dengan Modul Konsultan. Pendampingan juga bisa dikaitkan ke modul Project atau SDM untuk penugasan tim.</p>
                <p>• Status bisa diubah langsung dari tabel atau dari halaman detail jadwal.</p>
              </div>
            </div>
          </div>
        )}

        {/* JADWAL PENDAMPINGAN */}
        {activeTab === "jadwal" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal &amp; Jam</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Klien</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Agenda</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jenis</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Konsultan / Penanggung</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJadwal.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-800">Tidak ada jadwal ditemukan.</td>
                    </tr>
                  ) : (
                    filteredJadwal.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {new Date(j.tanggal).toLocaleDateString("id-ID", { weekday: "short", month: "short", day: "numeric" })}<br />
                          <span className="text-xs text-slate-700 font-normal">{j.jamMulai} — {j.jamSelesai}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-medium">{j.klienNama}</td>
                        <td className="px-5 py-4 text-slate-800 max-w-[280px]">{j.agenda}{j.catatan && <div className="text-xs text-slate-700 mt-0.5 italic">Catatan: {j.catatan}</div>}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium ${j.jenis === "Online" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {j.jenis === "Online" ? <Video size={14} /> : <MapPin size={14} />} {j.jenis}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-800 text-sm">{j.konsultan}</td>
                        <td className="px-5 py-4 text-center">
                          <select
                            value={j.status}
                            onChange={(e) => updateStatus(j.id, e.target.value as any)}
                            className={`text-xs px-2 py-1 rounded-full border font-medium bg-white ${
                              j.status === "Selesai" ? "text-emerald-700 border-emerald-300" :
                              j.status === "Dibatalkan" ? "text-red-700 border-red-300" :
                              j.status === "Berlangsung" ? "text-blue-700 border-blue-300" : "text-slate-700 border-slate-300"
                            }`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => openEditSchedule(j)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-700" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => updateStatus(j.id, "Selesai")} className="p-2 rounded-xl hover:bg-emerald-50 text-emerald-700" title="Tandai Selesai">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => updateStatus(j.id, "Dibatalkan")} className="p-2 rounded-xl hover:bg-red-50 text-red-600" title="Batalkan">
                              <XCircle size={16} />
                            </button>
                            <button onClick={() => deleteJadwal(j.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-600" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KLIEN YANG DIDAMPINGI */}
        {activeTab === "klien" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {klienGroups.length === 0 ? (
              <div className="col-span-full text-center text-slate-800 py-12">Belum ada klien yang didampingi.</div>
            ) : (
              klienGroups.map((g) => (
                <div key={g.nama} className="bg-white border border-slate-200 rounded-3xl p-5">
                  <div className="font-semibold text-lg text-slate-900">{g.nama}</div>
                  <div className="text-sm text-slate-700 mt-1">{g.totalSesiKlien} sesi pendampingan</div>

                  {g.next && (
                    <div className="mt-3 text-sm">
                      <span className="text-emerald-700 font-medium">Selanjutnya:</span> {g.next.tanggal} ({g.next.jamMulai})
                      <div className="text-xs text-slate-700">{g.next.agenda}</div>
                    </div>
                  )}
                  {g.last && (
                    <div className="mt-2 text-xs text-slate-700">
                      Terakhir: {g.last.tanggal} — {g.last.status}
                    </div>
                  )}

                  <button
                    onClick={() => openNewSchedule(g.nama)}
                    className="mt-4 w-full py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={15} /> Jadwalkan untuk Klien Ini
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* KALENDER */}
        {activeTab === "kalender" && (
          <div className="space-y-4">
            {sortedDates.length === 0 ? (
              <div className="text-center py-12 text-slate-800">Tidak ada jadwal.</div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="bg-white border border-slate-200 rounded-3xl p-5">
                  <div className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar size={18} /> {new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div className="space-y-2">
                    {kalenderGroups[date].map((j) => (
                      <div key={j.id} className="flex flex-col md:flex-row md:items-center justify-between border border-slate-100 rounded-2xl px-4 py-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-900">{j.jamMulai} — {j.jamSelesai}</span> • {j.klienNama} • {j.agenda}
                        </div>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full ${j.jenis === "Online" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {j.jenis}
                          </span>
                          <button onClick={() => openEditSchedule(j)} className="text-xs px-3 py-1 border rounded-xl hover:bg-slate-50">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* LAPORAN */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold mb-4 text-slate-900">Ringkasan per Jenis</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span>Online</span>
                    <span className="font-semibold text-blue-700">{sesiOnline} sesi ({(sesiOnline / Math.max(totalSesi, 1) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Offline</span>
                    <span className="font-semibold text-amber-700">{sesiOffline} sesi ({(sesiOffline / Math.max(totalSesi, 1) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Total Durasi</span>
                    <span className="font-semibold text-emerald-700">{totalJam.toFixed(1)} jam</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold mb-4 text-slate-900">Status Pendampingan</h3>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map((st) => {
                    const count = jadwal.filter((j) => j.status === st).length;
                    return (
                      <div key={st} className="border border-slate-200 rounded-2xl p-3">
                        <div className="text-xs text-slate-700">{st}</div>
                        <div className="text-2xl font-semibold text-slate-900">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-sm text-slate-800">
              <h3 className="font-semibold text-slate-900 mb-3">Integrasi &amp; Catatan</h3>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Modul ini ditujukan untuk user jenis Konsultan dan Tim Internal DIAUF.</li>
                <li>Data klien dapat diambil langsung dari Modul Konsultan (daftar klien yang aktif didampingi).</li>
                <li>Pendampingan yang selesai dapat menjadi dasar penagihan fee atau input ke modul Project / Keuangan.</li>
                <li>Untuk tim internal: gunakan field Konsultan untuk menugaskan staf DIAUF.</li>
                <li>Fitur notifikasi dan sinkronisasi kalender (Google/Outlook) akan ditambahkan kemudian.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal (Add / Edit) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">
                {editingId !== null ? "Edit Jadwal Pendampingan" : "Jadwalkan Pendampingan Baru"}
              </h3>
              <button onClick={closeScheduleModal}><X size={22} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Klien</label>
                <select
                  value={scheduleForm.klienNama}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, klienNama: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {DEMO_KLIEN.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Jenis Pendampingan</label>
                <select
                  value={scheduleForm.jenis}
                  onChange={(e) => handleJenisChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {JENIS_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={scheduleForm.tanggal}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, tanggal: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={scheduleForm.jamMulai}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, jamMulai: e.target.value })}
                    className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={scheduleForm.jamSelesai}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, jamSelesai: e.target.value })}
                    className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">
                  {scheduleForm.jenis === "Online" ? "Link Meeting (Zoom / Google Meet / Teams)" : "Lokasi / Alamat Lengkap (Offline)"}
                </label>
                <input
                  type="text"
                  value={scheduleForm.lokasiAtauLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, lokasiAtauLink: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Agenda / Topik Pendampingan</label>
                <input
                  type="text"
                  value={scheduleForm.agenda}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, agenda: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Contoh: Review SPT, Konsultasi kebijakan pajak, Site visit, dll"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Konsultan / Penanggung Jawab</label>
                <select
                  value={scheduleForm.konsultan}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, konsultan: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {DEMO_KONSULTAN.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                <select
                  value={scheduleForm.status}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Catatan Tambahan (opsional)</label>
                <textarea
                  value={scheduleForm.catatan}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, catatan: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Persiapan khusus, dokumen yang dibutuhkan, dll."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeScheduleModal} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={saveSchedule} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">
                {editingId !== null ? "Simpan Perubahan Jadwal" : "Simpan Jadwal Pendampingan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
