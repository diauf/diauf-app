"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Briefcase,
  Plus,
  Search,
  Pencil,
  X,
  Calendar,
  Eye,
  FileText,
  Trash2,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
} from "lucide-react";

type Klien = {
  id: number;
  namaPerusahaan: string;
  npwp: string;
  alamat: string;
  pic: string;
  telepon: string;
  email: string;
  jenisLayanan: string;
  status: "Aktif" | "Onboarding" | "Selesai" | "Pending";
  tanggalMulai: string;
  estimasiFee: number; // Rp per bulan / proyek (demo)
  catatan?: string;
  dokumen?: Array<{ nama: string; tanggal: string }>;
};

type Aktivitas = {
  id: number;
  klienId: number;
  tanggal: string;
  deskripsi: string;
};

const JENIS_LAYANAN = [
  "Konsultan Pajak",
  "Konsultan Keuangan",
  "Penyusunan SPT",
  "Restitusi Pajak",
  "Pemeriksaan Pajak",
  "Laporan Keuangan",
  "Due Diligence",
  "Lainnya",
] as const;

const KLIEN_STATUSES = ["Aktif", "Onboarding", "Selesai", "Pending"] as const;

export default function KonsultanPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "daftar-klien" | "aktivitas" | "laporan"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "daftar-klien", label: "Daftar Klien" },
    { id: "aktivitas", label: "Aktivitas & Tugas" },
    { id: "laporan", label: "Laporan" },
  ] as const;

  // Main data
  const [kliens, setKliens] = useState<Klien[]>([]);
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");

  // Klien modal (add/edit)
  const [showKlienModal, setShowKlienModal] = useState(false);
  const [editingKlienId, setEditingKlienId] = useState<number | null>(null);
  const [klienForm, setKlienForm] = useState<{
    namaPerusahaan: string;
    npwp: string;
    alamat: string;
    pic: string;
    telepon: string;
    email: string;
    jenisLayanan: string;
    status: "Aktif" | "Onboarding" | "Selesai" | "Pending";
    tanggalMulai: string;
    estimasiFee: number;
    catatan: string;
  }>({
    namaPerusahaan: "",
    npwp: "",
    alamat: "",
    pic: "",
    telepon: "",
    email: "",
    jenisLayanan: JENIS_LAYANAN[0],
    status: "Aktif",
    tanggalMulai: "2025-03-01",
    estimasiFee: 8500000,
    catatan: "",
  });

  // Portal modal state
  const [selectedPortalKlien, setSelectedPortalKlien] = useState<Klien | null>(null);
  const [portalDocInput, setPortalDocInput] = useState("");
  const [portalAktivitasInput, setPortalAktivitasInput] = useState("");

  // Load profile + demo data (localStorage)
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setProfile({ name: "Konsultan Demo", role: "Konsultan Pajak" });
      setLoading(false);
    };
    loadProfile();

    const savedKliens = localStorage.getItem("konsultan_demo_kliens");
    const savedAktivitas = localStorage.getItem("konsultan_demo_aktivitas");

    if (savedKliens) {
      setKliens(JSON.parse(savedKliens));
    } else {
      const demoKliens: Klien[] = [
        {
          id: 1,
          namaPerusahaan: "PT Maju Sejahtera",
          npwp: "02.345.678.9-012.000",
          alamat: "Jl. Sudirman No. 88, Jakarta Pusat",
          pic: "Rina Kusuma",
          telepon: "021-555-8821",
          email: "finance@majusejahtera.id",
          jenisLayanan: "Konsultan Pajak",
          status: "Aktif",
          tanggalMulai: "2024-09-12",
          estimasiFee: 12500000,
          catatan: "Klien prioritas - restitusi PPN Q1 sedang diproses.",
          dokumen: [
            { nama: "SPT Tahunan 2025", tanggal: "2026-03-20" },
            { nama: "Laporan Keuangan Audited 2025", tanggal: "2026-04-10" },
          ],
        },
        {
          id: 2,
          namaPerusahaan: "CV Berkah Abadi",
          npwp: "91.234.567.8-045.000",
          alamat: "Jl. Gatot Subroto No. 12, Bandung",
          pic: "Andi Pratama",
          telepon: "022-444-1199",
          email: "admin@berkahabadi.co.id",
          jenisLayanan: "Penyusunan SPT",
          status: "Aktif",
          tanggalMulai: "2025-01-20",
          estimasiFee: 4750000,
          dokumen: [
            { nama: "SPT Masa PPN Mei 2026", tanggal: "2026-06-10" },
          ],
        },
        {
          id: 3,
          namaPerusahaan: "PT Sinar Logistik",
          npwp: "73.112.233.4-078.000",
          alamat: "Kawasan Industri Cikarang Blok D7",
          pic: "Dewi Lestari",
          telepon: "021-897-3344",
          email: "tax@sinarlogistik.com",
          jenisLayanan: "Restitusi Pajak",
          status: "Onboarding",
          tanggalMulai: "2026-05-05",
          estimasiFee: 9500000,
          catatan: "Onboarding baru. NPWP & EFIN sudah divalidasi.",
          dokumen: [
            { nama: "Surat Kuasa Pajak", tanggal: "2026-05-07" },
            { nama: "Laporan Keuangan 2025", tanggal: "2026-05-15" },
          ],
        },
        {
          id: 4,
          namaPerusahaan: "PT Delta Prima",
          npwp: "12.998.776.5-021.000",
          alamat: "Jl. Pemuda No. 55, Semarang",
          pic: "Budi Santoso",
          telepon: "024-356-7788",
          email: "keuangan@deltaprima.co.id",
          jenisLayanan: "Konsultan Keuangan",
          status: "Aktif",
          tanggalMulai: "2024-11-01",
          estimasiFee: 7800000,
          dokumen: [
            { nama: "Cashflow Forecast Q2 2026", tanggal: "2026-05-28" },
          ],
        },
        {
          id: 5,
          namaPerusahaan: "CV Sentosa Makmur",
          npwp: "45.667.889.1-034.000",
          alamat: "Jl. Braga No. 9, Bandung",
          pic: "Sinta Wijaya",
          telepon: "022-421-0099",
          email: "owner@sentosamakmur.id",
          jenisLayanan: "Pemeriksaan Pajak",
          status: "Aktif",
          tanggalMulai: "2025-08-18",
          estimasiFee: 15500000,
          catatan: "Sedang mendampingi pemeriksaan KPP Pratama.",
          dokumen: [
            { nama: "SPT 2024 Lengkap", tanggal: "2025-12-10" },
            { nama: "Berkas Pemeriksaan", tanggal: "2026-04-02" },
          ],
        },
        {
          id: 6,
          namaPerusahaan: "PT Karya Nusantara",
          npwp: "88.554.321.7-056.000",
          alamat: "Jl. Asia Afrika No. 31, Jakarta",
          pic: "Hendra Wijaya",
          telepon: "021-234-5511",
          email: "legal@karyanusantara.id",
          jenisLayanan: "Due Diligence",
          status: "Selesai",
          tanggalMulai: "2025-02-10",
          estimasiFee: 22000000,
          dokumen: [
            { nama: "Laporan Due Diligence", tanggal: "2025-06-30" },
          ],
        },
        {
          id: 7,
          namaPerusahaan: "PT Harmoni Finance",
          npwp: "31.776.554.2-019.000",
          alamat: "Menara Kuningan Lt. 18, Jakarta",
          pic: "Larasati Putri",
          telepon: "021-579-8822",
          email: "compliance@harmonifinance.id",
          jenisLayanan: "Konsultan Pajak",
          status: "Aktif",
          tanggalMulai: "2025-10-03",
          estimasiFee: 11200000,
          dokumen: [
            { nama: "SPT PPh Badan 2025", tanggal: "2026-04-25" },
          ],
        },
        {
          id: 8,
          namaPerusahaan: "CV Prima Mandiri",
          npwp: "67.223.445.9-066.000",
          alamat: "Jl. Merdeka No. 42, Surabaya",
          pic: "Agus Salim",
          telepon: "031-566-7788",
          email: "info@primamandiri.id",
          jenisLayanan: "Laporan Keuangan",
          status: "Pending",
          tanggalMulai: "2026-06-01",
          estimasiFee: 5500000,
          catatan: "Menunggu kontrak & data awal dari klien.",
        },
      ];
      setKliens(demoKliens);
      localStorage.setItem("konsultan_demo_kliens", JSON.stringify(demoKliens));
    }

    if (savedAktivitas) {
      setAktivitas(JSON.parse(savedAktivitas));
    } else {
      const demoAktivitas: Aktivitas[] = [
        { id: 201, klienId: 1, tanggal: "2026-06-10", deskripsi: "Review draft SPT Tahunan & kirim koreksi ke klien" },
        { id: 202, klienId: 3, tanggal: "2026-06-12", deskripsi: "Onboarding meeting + validasi EFIN & NPWP" },
        { id: 203, klienId: 5, tanggal: "2026-06-05", deskripsi: "Dampingi pemeriksaan pajak di KPP - hari ke-2" },
        { id: 204, klienId: 2, tanggal: "2026-06-08", deskripsi: "Finalisasi SPT Masa PPN Mei & upload ke DJP Online" },
        { id: 205, klienId: 7, tanggal: "2026-06-14", deskripsi: "Konsultasi perencanaan pajak Q3 2026" },
        { id: 206, klienId: 4, tanggal: "2026-05-30", deskripsi: "Presentasi cashflow forecast & rekomendasi efisiensi" },
        { id: 207, klienId: 1, tanggal: "2026-05-22", deskripsi: "Pengajuan restitusi PPN periode Jan-Mar 2026" },
      ];
      setAktivitas(demoAktivitas);
      localStorage.setItem("konsultan_demo_aktivitas", JSON.stringify(demoAktivitas));
    }
  }, []);

  // Persist
  useEffect(() => {
    if (kliens.length > 0) localStorage.setItem("konsultan_demo_kliens", JSON.stringify(kliens));
  }, [kliens]);

  useEffect(() => {
    if (aktivitas.length > 0) localStorage.setItem("konsultan_demo_aktivitas", JSON.stringify(aktivitas));
  }, [aktivitas]);

  // Computed lists
  const filteredKliens = kliens
    .filter((k) =>
      k.namaPerusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.npwp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.jenisLayanan.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.namaPerusahaan > b.namaPerusahaan ? 1 : -1));

  const filteredAktivitas = aktivitas
    .map((a) => {
      const k = kliens.find((kk) => kk.id === a.klienId);
      return { ...a, namaKlien: k?.namaPerusahaan || "Klien Dihapus" };
    })
    .filter((a) =>
      a.namaKlien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));

  // Stats
  const totalKlien = kliens.length;
  const aktifKlien = kliens.filter((k) => k.status === "Aktif").length;
  const totalFee = kliens.reduce((sum, k) => sum + k.estimasiFee, 0);
  const onboardingCount = kliens.filter((k) => k.status === "Onboarding").length;

  // By jenis layanan for laporan
  const byLayanan = JENIS_LAYANAN.map((lay) => {
    const list = kliens.filter((k) => k.jenisLayanan === lay);
    return {
      layanan: lay,
      jumlah: list.length,
      fee: list.reduce((s, k) => s + k.estimasiFee, 0),
    };
  }).filter((x) => x.jumlah > 0);

  // By status
  const statusCounts = KLIEN_STATUSES.map((st) => ({
    status: st,
    jumlah: kliens.filter((k) => k.status === st).length,
  }));

  // Handlers - Klien
  const openAddKlien = () => {
    setEditingKlienId(null);
    setKlienForm({
      namaPerusahaan: "",
      npwp: "00.000.000.0-000.000",
      alamat: "",
      pic: "",
      telepon: "",
      email: "",
      jenisLayanan: JENIS_LAYANAN[0],
      status: "Onboarding",
      tanggalMulai: "2026-06-01",
      estimasiFee: 6500000,
      catatan: "",
    });
    setShowKlienModal(true);
  };

  const openEditKlien = (k: Klien) => {
    setEditingKlienId(k.id);
    setKlienForm({
      namaPerusahaan: k.namaPerusahaan,
      npwp: k.npwp,
      alamat: k.alamat,
      pic: k.pic,
      telepon: k.telepon,
      email: k.email,
      jenisLayanan: k.jenisLayanan,
      status: k.status,
      tanggalMulai: k.tanggalMulai,
      estimasiFee: k.estimasiFee,
      catatan: k.catatan || "",
    });
    setShowKlienModal(true);
  };

  const closeKlienModal = () => {
    setShowKlienModal(false);
    setEditingKlienId(null);
  };

  const saveKlien = () => {
    if (!klienForm.namaPerusahaan.trim() || !klienForm.pic.trim()) {
      alert("Nama Perusahaan dan PIC wajib diisi.");
      return;
    }
    if (editingKlienId !== null) {
      setKliens((prev) =>
        prev.map((k) =>
          k.id === editingKlienId
            ? {
                ...k,
                namaPerusahaan: klienForm.namaPerusahaan.trim(),
                npwp: klienForm.npwp.trim(),
                alamat: klienForm.alamat.trim(),
                pic: klienForm.pic.trim(),
                telepon: klienForm.telepon.trim(),
                email: klienForm.email.trim(),
                jenisLayanan: klienForm.jenisLayanan,
                status: klienForm.status,
                tanggalMulai: klienForm.tanggalMulai,
                estimasiFee: klienForm.estimasiFee,
                catatan: klienForm.catatan.trim() || undefined,
              }
            : k
        )
      );
    } else {
      const newId = Math.max(0, ...kliens.map((k) => k.id)) + 1;
      const newKlien: Klien = {
        id: newId,
        namaPerusahaan: klienForm.namaPerusahaan.trim(),
        npwp: klienForm.npwp.trim(),
        alamat: klienForm.alamat.trim(),
        pic: klienForm.pic.trim(),
        telepon: klienForm.telepon.trim(),
        email: klienForm.email.trim(),
        jenisLayanan: klienForm.jenisLayanan,
        status: klienForm.status,
        tanggalMulai: klienForm.tanggalMulai,
        estimasiFee: klienForm.estimasiFee,
        catatan: klienForm.catatan.trim() || undefined,
        dokumen: [],
      };
      setKliens((prev) => [...prev, newKlien]);
    }
    closeKlienModal();
  };

  const deleteKlien = (id: number) => {
    if (!confirm("Hapus klien ini? Semua aktivitas terkait akan ikut terhapus.")) return;
    setKliens((prev) => prev.filter((k) => k.id !== id));
    setAktivitas((prev) => prev.filter((a) => a.klienId !== id));
    // close portal if it was open for this klien
    if (selectedPortalKlien && selectedPortalKlien.id === id) {
      closePortal();
    }
  };

  // Aktivitas
  const addAktivitas = (klienId: number, deskripsi: string) => {
    if (!deskripsi.trim()) return;
    const newId = Math.max(0, ...aktivitas.map((a) => a.id)) + 1;
    const newAct: Aktivitas = {
      id: newId,
      klienId,
      tanggal: "2026-06-16",
      deskripsi: deskripsi.trim(),
    };
    setAktivitas((prev) => [newAct, ...prev]);
  };

  const openAddGlobalAktivitas = () => {
    if (kliens.length === 0) {
      alert("Belum ada klien. Tambahkan klien terlebih dahulu.");
      return;
    }
    const first = kliens[0];
    const desc = prompt("Deskripsi aktivitas / tugas untuk " + first.namaPerusahaan + ":");
    if (desc) addAktivitas(first.id, desc);
  };

  // Portal functions
  const openPortal = (k: Klien) => {
    setSelectedPortalKlien({ ...k }); // copy
    setPortalDocInput("");
    setPortalAktivitasInput("");
  };

  const closePortal = () => {
    setSelectedPortalKlien(null);
    setPortalDocInput("");
    setPortalAktivitasInput("");
  };

  // Update klien from portal actions
  const updateKlienFromPortal = (updated: Partial<Klien>) => {
    if (!selectedPortalKlien) return;
    setKliens((prev) =>
      prev.map((k) =>
        k.id === selectedPortalKlien.id ? { ...k, ...updated } : k
      )
    );
    // refresh the portal view
    setSelectedPortalKlien((prev) => (prev ? { ...prev, ...updated } : null));
  };

  // Add document inside portal (persists to main kliens)
  const addDocumentToPortal = () => {
    if (!selectedPortalKlien || !portalDocInput.trim()) return;
    const newDoc = { nama: portalDocInput.trim(), tanggal: "2026-06-16" };
    const currentDocs = selectedPortalKlien.dokumen || [];
    const updatedDocs = [...currentDocs, newDoc];

    updateKlienFromPortal({ dokumen: updatedDocs });
    setPortalDocInput("");
  };

  // Add aktivitas from portal
  const addAktivitasFromPortal = () => {
    if (!selectedPortalKlien || !portalAktivitasInput.trim()) return;
    addAktivitas(selectedPortalKlien.id, portalAktivitasInput);
    setPortalAktivitasInput("");
  };

  // Quick status change from portal
  const changeStatusFromPortal = (newStatus: Klien["status"]) => {
    if (!selectedPortalKlien) return;
    updateKlienFromPortal({ status: newStatus });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Konsultan...</div>
      </div>
    );
  }

  const currentKlienInPortal = selectedPortalKlien;

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <div className={`${collapsed ? "ml-20" : "ml-72"} transition-all duration-300 p-6`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <Briefcase size={26} className="text-emerald-600" /> Modul Konsultan
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Portal &amp; Dashboard terpusat untuk Konsultan Pajak dan Keuangan. Kelola daftar klien, akses data klien secara detail, catat aktivitas, dan berikan layanan dalam satu tempat.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openAddKlien}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
              >
                <Plus size={16} /> Tambah Klien
              </button>
              <button
                onClick={openAddGlobalAktivitas}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-4 py-2 text-sm font-medium rounded-2xl transition"
              >
                <Calendar size={16} /> Catat Aktivitas
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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
        {(activeTab === "daftar-klien" || activeTab === "aktivitas") && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
              <input
                type="text"
                placeholder="Cari nama perusahaan, NPWP, PIC, atau aktivitas..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Klien Dikelola</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalKlien}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Klien Aktif</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{aktifKlien}</div>
                <div className="text-xs text-slate-700 mt-0.5">{onboardingCount} sedang onboarding</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Estimasi Fee (bulan/proyek)</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalFee / 1000000).toFixed(0)}jt
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Klien Baru / Onboarding</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">{onboardingCount}</div>
              </div>
            </div>

            {/* Akses Cepat Portal */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Eye size={20} /> Akses Cepat Portal Klien
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {kliens.slice(0, 8).map((k) => (
                  <div
                    key={k.id}
                    className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-300 transition cursor-pointer"
                    onClick={() => openPortal(k)}
                  >
                    <div className="font-semibold text-slate-900 text-sm leading-tight mb-1 pr-6">{k.namaPerusahaan}</div>
                    <div className="text-xs text-slate-700 mb-2">{k.jenisLayanan}</div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          k.status === "Aktif"
                            ? "bg-emerald-100 text-emerald-700"
                            : k.status === "Onboarding"
                            ? "bg-blue-100 text-blue-700"
                            : k.status === "Selesai"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {k.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPortal(k);
                        }}
                        className="text-xs flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                      >
                        Buka Portal <Eye size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-700 mt-3">Klik kartu untuk membuka portal lengkap klien (status pajak, dokumen, aktivitas).</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Catatan Penting</h3>
              <div className="text-sm text-slate-800 space-y-2">
                <p>• Modul ini dibuat khusus untuk target market konsultan pajak dan konsultan keuangan.</p>
                <p>• Setiap klien memiliki portal sendiri yang bisa diakses oleh konsultan untuk melihat status kewajiban, dokumen, dan mencatat aktivitas pendampingan.</p>
                <p>• Data klien di sini dapat disinkronkan ke modul Pajak (pelaporan massal) dan CRM (pipeline prospek).</p>
                <p>• Estimasi fee bersifat ilustrasi dan bisa disesuaikan per klien.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Reset semua data konsultan & klien ke demo awal?")) {
                    localStorage.removeItem("konsultan_demo_kliens");
                    localStorage.removeItem("konsultan_demo_aktivitas");
                    window.location.reload();
                  }
                }}
                className="mt-4 text-xs text-slate-700 hover:text-red-600 underline"
              >
                Reset data demo
              </button>
            </div>
          </div>
        )}

        {/* DAFTAR KLIEN */}
        {activeTab === "daftar-klien" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Perusahaan / Klien</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">NPWP</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis Layanan</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Estimasi Fee</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Mulai</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKliens.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-800">Tidak ada klien ditemukan.</td>
                    </tr>
                  ) : (
                    filteredKliens.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">{k.namaPerusahaan}</div>
                          <div className="text-xs text-slate-700">{k.pic} • {k.email}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-mono text-xs">{k.npwp}</td>
                        <td className="px-5 py-4 text-slate-800">{k.jenisLayanan}</td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${
                              k.status === "Aktif"
                                ? "bg-emerald-100 text-emerald-700"
                                : k.status === "Onboarding"
                                ? "bg-blue-100 text-blue-700"
                                : k.status === "Selesai"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {k.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                          Rp {k.estimasiFee.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-800">
                          {new Date(k.tanggalMulai).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openPortal(k)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                              title="Buka Portal Klien"
                            >
                              <Eye size={14} /> Portal
                            </button>
                            <button
                              onClick={() => openEditKlien(k)}
                              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteKlien(k.id)}
                              className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                              title="Hapus"
                            >
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
            <div className="p-3 text-xs text-slate-700 bg-slate-50 border-t">Klik tombol Portal untuk membuka dashboard lengkap klien tersebut.</div>
          </div>
        )}

        {/* AKTIVITAS & TUGAS */}
        {activeTab === "aktivitas" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="font-semibold text-slate-900">Riwayat Aktivitas &amp; Tugas</div>
              <button onClick={openAddGlobalAktivitas} className="text-xs flex items-center gap-1 text-emerald-700 hover:text-emerald-800">
                <Plus size={14} /> Tambah Aktivitas Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Klien</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Aktivitas / Tugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAktivitas.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center text-slate-800">Belum ada aktivitas.</td>
                    </tr>
                  ) : (
                    filteredAktivitas.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 text-slate-800 w-32">{new Date(a.tanggal).toLocaleDateString("id-ID")}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{a.namaKlien}</td>
                        <td className="px-5 py-4 text-slate-800">{a.deskripsi}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LAPORAN */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} /> Ringkasan per Jenis Layanan
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis Layanan</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jumlah Klien</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Total Estimasi Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {byLayanan.length === 0 ? (
                      <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-800">Tidak ada data.</td></tr>
                    ) : (
                      byLayanan.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">{row.layanan}</td>
                          <td className="px-5 py-4 text-center text-slate-800">{row.jumlah}</td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {row.fee.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold">
                    <tr>
                      <td className="px-5 py-3.5 text-slate-900">TOTAL</td>
                      <td className="px-5 py-3.5 text-center text-slate-900">{totalKlien}</td>
                      <td className="px-5 py-3.5 text-right text-emerald-700">Rp {totalFee.toLocaleString("id-ID")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Distribusi Status Klien</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {statusCounts.map((s, i) => (
                  <div key={i} className="border border-slate-200 rounded-2xl p-4">
                    <div className="text-slate-700">{s.status}</div>
                    <div className="text-2xl font-semibold text-slate-900 mt-1">{s.jumlah}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-sm text-slate-800">
              <h3 className="font-semibold text-slate-900 mb-3">Integrasi &amp; Catatan Laporan</h3>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Data klien konsultan dapat diekspor ke modul Pajak untuk pelaporan SPT massal atau rekonsiliasi.</li>
                <li>Sinkronisasi otomatis dengan CRM untuk mengubah status prospek menjadi klien aktif.</li>
                <li>Portal klien ini memberikan visibilitas penuh kepada konsultan tanpa perlu login terpisah per klien.</li>
                <li>Disarankan review fee dan status setiap akhir bulan.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Klien Add/Edit Modal */}
      {showKlienModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">
                {editingKlienId !== null ? "Edit Klien" : "Tambah Klien Baru"}
              </h3>
              <button onClick={closeKlienModal}><X size={22} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Perusahaan / Klien</label>
                <input
                  type="text"
                  value={klienForm.namaPerusahaan}
                  onChange={(e) => setKlienForm({ ...klienForm, namaPerusahaan: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="PT / CV Nama Perusahaan"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">NPWP</label>
                <input
                  type="text"
                  value={klienForm.npwp}
                  onChange={(e) => setKlienForm({ ...klienForm, npwp: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Jenis Layanan</label>
                <select
                  value={klienForm.jenisLayanan}
                  onChange={(e) => setKlienForm({ ...klienForm, jenisLayanan: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {JENIS_LAYANAN.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">PIC / Penanggung Jawab</label>
                <input
                  type="text"
                  value={klienForm.pic}
                  onChange={(e) => setKlienForm({ ...klienForm, pic: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Telepon</label>
                <input
                  type="text"
                  value={klienForm.telepon}
                  onChange={(e) => setKlienForm({ ...klienForm, telepon: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Email</label>
                <input
                  type="email"
                  value={klienForm.email}
                  onChange={(e) => setKlienForm({ ...klienForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Alamat</label>
                <input
                  type="text"
                  value={klienForm.alamat}
                  onChange={(e) => setKlienForm({ ...klienForm, alamat: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Mulai Kerja Sama</label>
                <input
                  type="date"
                  value={klienForm.tanggalMulai}
                  onChange={(e) => setKlienForm({ ...klienForm, tanggalMulai: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Estimasi Fee (Rp)</label>
                <input
                  type="number"
                  value={klienForm.estimasiFee}
                  onChange={(e) => setKlienForm({ ...klienForm, estimasiFee: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                <select
                  value={klienForm.status}
                  onChange={(e) => setKlienForm({ ...klienForm, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {KLIEN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Catatan Internal</label>
                <textarea
                  value={klienForm.catatan}
                  onChange={(e) => setKlienForm({ ...klienForm, catatan: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Catatan khusus untuk tim konsultan..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeKlienModal} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={saveKlien} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">
                {editingKlienId !== null ? "Simpan Perubahan" : "Tambah Klien"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL KLIEN MODAL (Rich Client Dashboard) */}
      {currentKlienInPortal && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 p-4 pt-8 overflow-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden">
            {/* Portal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-xl text-slate-900">{currentKlienInPortal.namaPerusahaan}</div>
                  <span
                    className={`text-xs px-3 py-0.5 rounded-full font-medium ${
                      currentKlienInPortal.status === "Aktif"
                        ? "bg-emerald-100 text-emerald-700"
                        : currentKlienInPortal.status === "Onboarding"
                        ? "bg-blue-100 text-blue-700"
                        : currentKlienInPortal.status === "Selesai"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {currentKlienInPortal.status}
                  </span>
                </div>
                <div className="text-sm text-slate-700 mt-0.5">{currentKlienInPortal.npwp} • {currentKlienInPortal.jenisLayanan}</div>
              </div>
              <button onClick={closePortal} className="text-slate-700 hover:text-slate-900"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Info + Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs text-slate-700">PIC</div>
                  <div className="font-semibold text-slate-900">{currentKlienInPortal.pic}</div>
                  <div className="text-xs text-slate-700 mt-0.5">{currentKlienInPortal.telepon}</div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs text-slate-700">Email</div>
                  <div className="font-semibold text-slate-900 break-all">{currentKlienInPortal.email}</div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs text-slate-700">Estimasi Fee</div>
                  <div className="text-xl font-semibold text-emerald-700">Rp {currentKlienInPortal.estimasiFee.toLocaleString("id-ID")}</div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs text-slate-700">Mulai Kerja Sama</div>
                  <div className="font-semibold text-slate-900">{new Date(currentKlienInPortal.tanggalMulai).toLocaleDateString("id-ID")}</div>
                  <div className="text-xs text-emerald-700 mt-1 cursor-pointer hover:underline" onClick={() => openEditKlien(currentKlienInPortal)}>Edit detail lengkap →</div>
                </div>
              </div>

              {/* Status Pelaporan (demo) */}
              <div>
                <div className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} /> Status Pelaporan &amp; Kewajiban Pajak (Demo)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "SPT Masa PPN - Mei 2026", status: "Lunas", color: "emerald" },
                    { label: "SPT Tahunan PPh Badan 2025", status: "Lunas", color: "emerald" },
                    { label: "PPh 21 Masa Juni 2026", status: "Jatuh Tempo 30 Jun", color: "amber" },
                    { label: "Restitusi PPN Q1 2026", status: "Diproses", color: "blue" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-200 rounded-2xl px-4 py-3">
                      <div className="text-slate-800">{item.label}</div>
                      <span className={`text-xs px-3 py-0.5 rounded-full font-medium bg-${item.color}-100 text-${item.color}-700`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-700 mt-2">Data ini adalah simulasi. Di produksi akan ditarik dari modul Pajak &amp; DJP Online.</p>
              </div>

              {/* Dokumen Klien */}
              <div>
                <div className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText size={18} /> Dokumen Klien
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  {(currentKlienInPortal.dokumen && currentKlienInPortal.dokumen.length > 0) ? (
                    <ul className="text-sm divide-y divide-slate-100 mb-3">
                      {currentKlienInPortal.dokumen.map((d, i) => (
                        <li key={i} className="py-1.5 flex justify-between text-slate-800">
                          <span>{d.nama}</span>
                          <span className="text-xs text-slate-700">{new Date(d.tanggal).toLocaleDateString("id-ID")}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-slate-700 mb-3">Belum ada dokumen tersimpan.</div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={portalDocInput}
                      onChange={(e) => setPortalDocInput(e.target.value)}
                      placeholder="Nama dokumen baru (contoh: SPT Masa Juni 2026)"
                      className="flex-1 border border-slate-300 rounded-2xl px-4 py-2 text-sm text-slate-900"
                    />
                    <button
                      onClick={addDocumentToPortal}
                      className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-medium"
                    >
                      Upload Demo
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-700 mt-1">Upload demo hanya tersimpan di sesi ini untuk keperluan demonstrasi.</div>
                </div>
              </div>

              {/* Aktivitas & Catatan dari Portal */}
              <div>
                <div className="font-semibold text-slate-900 mb-2">Aktivitas &amp; Catatan Internal</div>
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  {/* Existing activities for this client */}
                  <div className="max-h-36 overflow-auto text-sm space-y-1.5 mb-2">
                    {aktivitas
                      .filter((a) => a.klienId === currentKlienInPortal.id)
                      .sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1))
                      .map((a) => (
                        <div key={a.id} className="flex gap-3 border-b border-slate-100 pb-1 text-slate-800">
                          <div className="w-20 text-xs text-slate-700 shrink-0">{new Date(a.tanggal).toLocaleDateString("id-ID")}</div>
                          <div>{a.deskripsi}</div>
                        </div>
                      ))}
                    {aktivitas.filter((a) => a.klienId === currentKlienInPortal.id).length === 0 && (
                      <div className="text-xs text-slate-700">Belum ada aktivitas tercatat untuk klien ini.</div>
                    )}
                  </div>

                  {/* Add new activity */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={portalAktivitasInput}
                      onChange={(e) => setPortalAktivitasInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addAktivitasFromPortal(); }}
                      placeholder="Tambah catatan / tugas baru (contoh: Kirim draft laporan ke klien)"
                      className="flex-1 border border-slate-300 rounded-2xl px-4 py-2 text-sm text-slate-900"
                    />
                    <button onClick={addAktivitasFromPortal} className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-medium">
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => changeStatusFromPortal("Aktif")} className="px-3 py-1.5 text-xs border border-emerald-300 text-emerald-700 rounded-2xl hover:bg-emerald-50">Tandai Aktif</button>
                <button onClick={() => changeStatusFromPortal("Onboarding")} className="px-3 py-1.5 text-xs border border-blue-300 text-blue-700 rounded-2xl hover:bg-blue-50">Tandai Onboarding</button>
                <button onClick={() => changeStatusFromPortal("Selesai")} className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50">Tandai Selesai</button>
                <button onClick={() => { closePortal(); openEditKlien(currentKlienInPortal); }} className="ml-auto px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 flex items-center gap-1"><Pencil size={14} /> Edit Lengkap</button>
                <button onClick={() => { alert("Undangan portal dikirim ke email klien (simulasi)."); }} className="px-3 py-1.5 text-xs bg-white border border-emerald-300 text-emerald-700 rounded-2xl hover:bg-emerald-50">Kirim Undangan Portal</button>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-slate-50 text-right">
              <button onClick={closePortal} className="px-6 py-2 text-sm border border-slate-300 rounded-2xl text-slate-800 hover:bg-white">Tutup Portal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
