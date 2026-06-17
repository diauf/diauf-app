"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Wrench,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Package,
  AlertTriangle,
  Users,
} from "lucide-react";

type WorkshopJob = {
  id: string;
  no_wo: string;
  tanggalMasuk: string;
  customer: string;
  kendaraan: string;
  noPolisi: string;
  keluhan: string;
  status: string; // Open, In Progress, Waiting Parts, Completed, Cancelled
  assignedTo: string;
  estimasiJam: number;
  actualJam: number;
  estimasiBiaya: number;
  actualBiaya: number;
};

type Penugasan = {
  id: string;
  woId: string;
  noWo: string;
  teknisi: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai?: string;
  pekerjaan: string;
  status: string;
};

type PenggunaanSparepart = {
  id: string;
  woId: string;
  noWo: string;
  itemNama: string;
  qty: number;
  harga: number;
  tanggal: string;
};

export default function WorkshopPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "daftar" | "penugasan" | "sparepart" | "penyelesaian"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "daftar", label: "Daftar Workshop" },
    { id: "penugasan", label: "Penugasan Teknisi" },
    { id: "sparepart", label: "Penggunaan Sparepart" },
    { id: "penyelesaian", label: "Penyelesaian" },
  ] as const;

  // Demo data
  const [jobList, setJobList] = useState<WorkshopJob[]>([
    {
      id: "w1",
      no_wo: "WO-2026-0145",
      tanggalMasuk: "2026-06-10",
      customer: "PT Maju Jaya",
      kendaraan: "Truk Hino 500",
      noPolisi: "B 1234 XYZ",
      keluhan: "Rem blong, bunyi aneh di mesin",
      status: "In Progress",
      assignedTo: "Teknisi Andi",
      estimasiJam: 8,
      actualJam: 5,
      estimasiBiaya: 12500000,
      actualBiaya: 8750000,
    },
    {
      id: "w2",
      no_wo: "WO-2026-0144",
      tanggalMasuk: "2026-06-12",
      customer: "CV Sukses Mandiri",
      kendaraan: "Mitsubishi Fuso",
      noPolisi: "B 5678 ABC",
      keluhan: "AC tidak dingin, lampu depan mati",
      status: "Waiting Parts",
      assignedTo: "Teknisi Budi",
      estimasiJam: 6,
      actualJam: 2,
      estimasiBiaya: 6500000,
      actualBiaya: 2100000,
    },
    {
      id: "w3",
      no_wo: "WO-2026-0143",
      tanggalMasuk: "2026-06-08",
      customer: "UD Berkah",
      kendaraan: "Isuzu Elf",
      noPolisi: "B 9012 DEF",
      keluhan: "Servis berkala + ganti ban",
      status: "Completed",
      assignedTo: "Teknisi Siti",
      estimasiJam: 4,
      actualJam: 4,
      estimasiBiaya: 4500000,
      actualBiaya: 4200000,
    },
  ]);

  const [penugasanList, setPenugasanList] = useState<Penugasan[]>([
    {
      id: "pg1",
      woId: "w1",
      noWo: "WO-2026-0145",
      teknisi: "Andi Pratama",
      tanggal: "2026-06-11",
      jamMulai: "08:00",
      jamSelesai: "12:00",
      pekerjaan: "Periksa sistem rem",
      status: "Selesai",
    },
    {
      id: "pg2",
      woId: "w1",
      noWo: "WO-2026-0145",
      teknisi: "Andi Pratama",
      tanggal: "2026-06-11",
      jamMulai: "13:00",
      pekerjaan: "Diagnosis mesin",
      status: "In Progress",
    },
    {
      id: "pg3",
      woId: "w2",
      noWo: "WO-2026-0144",
      teknisi: "Budi Santoso",
      tanggal: "2026-06-13",
      jamMulai: "09:00",
      pekerjaan: "Ganti kompresor AC",
      status: "Menunggu Sparepart",
    },
  ]);

  const [sparepartList, setSparepartList] = useState<PenggunaanSparepart[]>([
    {
      id: "sp1",
      woId: "w1",
      noWo: "WO-2026-0145",
      itemNama: "Kampas Rem Depan",
      qty: 2,
      harga: 850000,
      tanggal: "2026-06-11",
    },
    {
      id: "sp2",
      woId: "w2",
      noWo: "WO-2026-0144",
      itemNama: "Kompresor AC",
      qty: 1,
      harga: 3200000,
      tanggal: "2026-06-13",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showPenugasanModal, setShowPenugasanModal] = useState(false);
  const [showSparepartModal, setShowSparepartModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [jobForm, setJobForm] = useState({
    tanggalMasuk: new Date().toISOString().split("T")[0],
    customer: "",
    kendaraan: "",
    noPolisi: "",
    keluhan: "",
    assignedTo: "Teknisi Andi",
    estimasiJam: 4,
    estimasiBiaya: 5000000,
  });

  const [penugasanForm, setPenugasanForm] = useState({
    woId: "",
    noWo: "",
    teknisi: "",
    tanggal: new Date().toISOString().split("T")[0],
    jamMulai: "08:00",
    jamSelesai: "",
    pekerjaan: "",
  });

  const [sparepartForm, setSparepartForm] = useState({
    woId: "",
    noWo: "",
    itemNama: "",
    qty: 1,
    harga: 0,
  });

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        setProfile({ name: "Admin Demo", role: "Workshop Manager" });
      } catch (err) {
        setProfile({ name: "Admin Demo", role: "Workshop Manager" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Filtered
  const filteredJobs = jobList.filter((j) => {
    const matchSearch = (j.no_wo + j.customer + j.kendaraan + j.noPolisi).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPenugasan = penugasanList.filter((p) =>
    (p.noWo + p.teknisi + p.pekerjaan).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSparepart = sparepartList.filter((s) =>
    (s.noWo + s.itemNama).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalJobs = jobList.length;
  const activeJobs = jobList.filter((j) => j.status === "In Progress" || j.status === "Open").length;
  const completedJobs = jobList.filter((j) => j.status === "Completed").length;
  const totalRevenue = jobList.reduce((sum, j) => sum + j.actualBiaya, 0);
  const pendingParts = penugasanList.filter((p) => p.status === "Menunggu Sparepart").length;

  // Handlers
  const openAddJobModal = () => {
    setJobForm({
      tanggalMasuk: new Date().toISOString().split("T")[0],
      customer: "",
      kendaraan: "",
      noPolisi: "",
      keluhan: "",
      assignedTo: "Teknisi Andi",
      estimasiJam: 4,
      estimasiBiaya: 5000000,
    });
    setEditingJobId(null);
    setShowJobModal(true);
  };

  const saveJob = () => {
    if (!jobForm.customer || !jobForm.kendaraan || !jobForm.keluhan) return;

    if (editingJobId) {
      setJobList((prev) =>
        prev.map((j) =>
          j.id === editingJobId
            ? { ...j, ...jobForm, actualBiaya: j.actualBiaya }
            : j
        )
      );
    } else {
      const newJob: WorkshopJob = {
        id: "w" + Date.now(),
        no_wo: `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        ...jobForm,
        status: "Open",
        actualJam: 0,
        actualBiaya: 0,
      };
      setJobList((prev) => [newJob, ...prev]);
    }
    setShowJobModal(false);
    setEditingJobId(null);
  };

  const updateJobStatus = (id: string, newStatus: string) => {
    setJobList((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
  };

  const deleteJob = (id: string) => {
    if (!confirm("Hapus work order ini?")) return;
    setJobList((prev) => prev.filter((j) => j.id !== id));
    setPenugasanList((prev) => prev.filter((p) => p.woId !== id));
    setSparepartList((prev) => prev.filter((s) => s.woId !== id));
  };

  const openAddPenugasanModal = () => {
    const openJob = jobList.find((j) => j.status === "In Progress" || j.status === "Open");
    setPenugasanForm({
      woId: openJob?.id || "",
      noWo: openJob?.no_wo || "",
      teknisi: "Teknisi Andi",
      tanggal: new Date().toISOString().split("T")[0],
      jamMulai: "08:00",
      jamSelesai: "",
      pekerjaan: "",
    });
    setShowPenugasanModal(true);
  };

  const savePenugasan = () => {
    if (!penugasanForm.pekerjaan || !penugasanForm.woId) return;

    const job = jobList.find((j) => j.id === penugasanForm.woId);
    if (!job) return;

    const newPenugasan: Penugasan = {
      id: "pg" + Date.now(),
      ...penugasanForm,
      status: penugasanForm.jamSelesai ? "Selesai" : "In Progress",
    };

    setPenugasanList((prev) => [newPenugasan, ...prev]);

    // Update job status if needed
    if (job.status === "Open") {
      updateJobStatus(job.id, "In Progress");
    }

    setShowPenugasanModal(false);
  };

  const updatePenugasanStatus = (id: string, newStatus: string) => {
    setPenugasanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const openAddSparepartModal = () => {
    const activeJob = jobList.find((j) => j.status === "In Progress");
    setSparepartForm({
      woId: activeJob?.id || "",
      noWo: activeJob?.no_wo || "",
      itemNama: "",
      qty: 1,
      harga: 0,
    });
    setShowSparepartModal(true);
  };

  const saveSparepart = () => {
    if (!sparepartForm.itemNama || sparepartForm.qty <= 0 || sparepartForm.harga <= 0) return;

    const newSpare: PenggunaanSparepart = {
      id: "sp" + Date.now(),
      ...sparepartForm,
      tanggal: new Date().toISOString().split("T")[0],
    };

    setSparepartList((prev) => [newSpare, ...prev]);

    // Update actual biaya di job
    setJobList((prev) =>
      prev.map((j) => {
        if (j.id === sparepartForm.woId) {
          const addedCost = sparepartForm.qty * sparepartForm.harga;
          return { ...j, actualBiaya: j.actualBiaya + addedCost };
        }
        return j;
      })
    );

    setShowSparepartModal(false);
  };

  // Helper for job select
  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>, formType: "penugasan" | "spare") => {
    const selected = jobList.find((j) => j.id === e.target.value);
    if (!selected) return;

    if (formType === "penugasan") {
      setPenugasanForm((prev) => ({
        ...prev,
        woId: selected.id,
        noWo: selected.no_wo,
      }));
    } else {
      setSparepartForm((prev) => ({
        ...prev,
        woId: selected.id,
        noWo: selected.no_wo,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Workshop...</div>
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
                <Wrench size={26} className="text-emerald-600" /> Modul Workshop
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola work order bengkel, penugasan teknisi, penggunaan sparepart, dan penyelesaian. Terintegrasi dengan Persediaan dan Kas & Bank.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "daftar") openAddJobModal();
                else if (activeTab === "penugasan") openAddPenugasanModal();
                else if (activeTab === "sparepart") openAddSparepartModal();
                else setActiveTab("daftar");
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Plus size={16} /> Tambah Data
            </button>
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

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Cari work order atau penugasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {(activeTab === "daftar" || activeTab === "penugasan") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              {activeTab === "daftar" && (
                <>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting Parts">Waiting Parts</option>
                  <option value="Completed">Completed</option>
                </>
              )}
              {activeTab === "penugasan" && (
                <>
                  <option value="In Progress">In Progress</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Menunggu Sparepart">Menunggu Sparepart</option>
                </>
              )}
            </select>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Work Order</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalJobs}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Sedang Dikerjakan</div>
                <div className="text-3xl font-semibold text-amber-700 mt-1">{activeJobs}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Selesai Bulan Ini</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{completedJobs}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Revenue</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalRevenue / 1000000).toFixed(0)}jt
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Clock size={20} /> Work Order Aktif
              </h3>
              <div className="space-y-3">
                {jobList.filter((j) => j.status !== "Completed").length > 0 ? (
                  jobList
                    .filter((j) => j.status !== "Completed")
                    .slice(0, 4)
                    .map((job) => (
                      <div key={job.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-2xl">
                        <div>
                          <div className="font-medium text-slate-900">{job.no_wo} - {job.kendaraan}</div>
                          <div className="text-sm text-slate-800">{job.customer} • {job.keluhan.substring(0, 50)}...</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${job.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                            {job.status}
                          </span>
                          <div className="text-xs text-slate-800 mt-1">Estimasi: Rp {job.estimasiBiaya.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-800">Tidak ada work order aktif.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR WORKSHOP */}
        {activeTab === "daftar" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddJobModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Work Order Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. WO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kendaraan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Keluhan</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Teknisi</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Estimasi</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-800">Belum ada work order.</td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{job.no_wo}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{job.customer}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{job.kendaraan} ({job.noPolisi})</td>
                          <td className="px-5 py-4 text-sm text-slate-800 max-w-xs truncate" title={job.keluhan}>{job.keluhan}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${job.status === "Completed" ? "bg-emerald-100 text-emerald-800" : job.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">{job.assignedTo}</td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {job.estimasiBiaya.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            {job.status !== "Completed" && (
                              <button onClick={() => updateJobStatus(job.id, job.status === "Open" ? "In Progress" : "Completed")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl" title="Update Status">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => deleteJob(job.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PENUGASAN TEKNISI */}
        {activeTab === "penugasan" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddPenugasanModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Tambah Penugasan
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. WO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Teknisi</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pekerjaan</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jam</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPenugasan.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-800">Belum ada penugasan.</td>
                      </tr>
                    ) : (
                      filteredPenugasan.map((pg) => (
                        <tr key={pg.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{pg.noWo}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{pg.teknisi}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{pg.pekerjaan}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">{pg.tanggal}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">{pg.jamMulai} {pg.jamSelesai ? `- ${pg.jamSelesai}` : ""}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${pg.status === "Selesai" ? "bg-emerald-100 text-emerald-800" : pg.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                              {pg.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => updatePenugasanStatus(pg.id, pg.status === "In Progress" ? "Selesai" : "In Progress")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl">
                              <CheckCircle size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PENGGUNAAN SPAREPART */}
        {activeTab === "sparepart" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddSparepartModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Catat Penggunaan Sparepart
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. WO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Sparepart</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Qty</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Harga</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Subtotal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSparepart.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-800">Belum ada penggunaan sparepart.</td>
                      </tr>
                    ) : (
                      filteredSparepart.map((sp) => (
                        <tr key={sp.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{sp.noWo}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{sp.itemNama}</td>
                          <td className="px-5 py-4 text-right text-sm text-slate-800">{sp.qty}</td>
                          <td className="px-5 py-4 text-right text-sm text-slate-800">Rp {sp.harga.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">Rp {(sp.qty * sp.harga).toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{sp.tanggal}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PENYELESAIAN */}
        {activeTab === "penyelesaian" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Work Order Siap Diselesaikan</h3>
            <div className="space-y-3">
              {jobList.filter((j) => j.status === "In Progress" && j.actualBiaya > 0).length > 0 ? (
                jobList
                  .filter((j) => j.status === "In Progress" && j.actualBiaya > 0)
                  .map((job) => (
                    <div key={job.id} className="flex justify-between items-center p-4 border border-emerald-200 bg-emerald-50 rounded-2xl">
                      <div>
                        <div className="font-medium text-slate-900">{job.no_wo} - {job.kendaraan}</div>
                        <div className="text-sm text-slate-800">{job.customer} • Actual: Rp {job.actualBiaya.toLocaleString("id-ID")}</div>
                      </div>
                      <button onClick={() => updateJobStatus(job.id, "Completed")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-2xl font-semibold flex items-center gap-2">
                        <CheckCircle size={16} /> Selesaikan
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-slate-800">Tidak ada work order yang siap diselesaikan saat ini.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingJobId ? "Edit Work Order" : "Buat Work Order Baru"}</h3>
              <button onClick={() => setShowJobModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Masuk</label>
                  <input type="date" value={jobForm.tanggalMasuk} onChange={(e) => setJobForm({ ...jobForm, tanggalMasuk: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">No. Polisi</label>
                  <input value={jobForm.noPolisi} onChange={(e) => setJobForm({ ...jobForm, noPolisi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Pelanggan</label>
                <input value={jobForm.customer} onChange={(e) => setJobForm({ ...jobForm, customer: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Kendaraan</label>
                <input value={jobForm.kendaraan} onChange={(e) => setJobForm({ ...jobForm, kendaraan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keluhan / Kerusakan</label>
                <textarea value={jobForm.keluhan} onChange={(e) => setJobForm({ ...jobForm, keluhan: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Teknisi</label>
                  <input value={jobForm.assignedTo} onChange={(e) => setJobForm({ ...jobForm, assignedTo: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Estimasi Jam</label>
                  <input type="number" value={jobForm.estimasiJam} onChange={(e) => setJobForm({ ...jobForm, estimasiJam: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Estimasi Biaya (Rp)</label>
                <input type="number" value={jobForm.estimasiBiaya} onChange={(e) => setJobForm({ ...jobForm, estimasiBiaya: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowJobModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveJob} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Work Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Penugasan Modal */}
      {showPenugasanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Tambah Penugasan Teknisi</h3>
              <button onClick={() => setShowPenugasanModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Work Order</label>
                <select value={penugasanForm.woId} onChange={(e) => handleJobChange(e, "penugasan")} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {jobList.filter((j) => j.status !== "Completed").map((j) => (
                    <option key={j.id} value={j.id}>{j.no_wo} - {j.kendaraan}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Teknisi</label>
                  <input value={penugasanForm.teknisi} onChange={(e) => setPenugasanForm({ ...penugasanForm, teknisi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                  <input type="date" value={penugasanForm.tanggal} onChange={(e) => setPenugasanForm({ ...penugasanForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jam Mulai</label>
                  <input type="time" value={penugasanForm.jamMulai} onChange={(e) => setPenugasanForm({ ...penugasanForm, jamMulai: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jam Selesai</label>
                  <input type="time" value={penugasanForm.jamSelesai} onChange={(e) => setPenugasanForm({ ...penugasanForm, jamSelesai: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Pekerjaan yang Dilakukan</label>
                <input value={penugasanForm.pekerjaan} onChange={(e) => setPenugasanForm({ ...penugasanForm, pekerjaan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPenugasanModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={savePenugasan} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Penugasan</button>
            </div>
          </div>
        </div>
      )}

      {/* Sparepart Modal */}
      {showSparepartModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Catat Penggunaan Sparepart</h3>
              <button onClick={() => setShowSparepartModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Work Order</label>
                <select value={sparepartForm.woId} onChange={(e) => handleJobChange(e, "spare")} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {jobList.filter((j) => j.status !== "Completed").map((j) => (
                    <option key={j.id} value={j.id}>{j.no_wo} - {j.kendaraan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Sparepart</label>
                <input value={sparepartForm.itemNama} onChange={(e) => setSparepartForm({ ...sparepartForm, itemNama: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jumlah</label>
                  <input type="number" value={sparepartForm.qty} onChange={(e) => setSparepartForm({ ...sparepartForm, qty: parseInt(e.target.value) || 1 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Harga Satuan (Rp)</label>
                  <input type="number" value={sparepartForm.harga} onChange={(e) => setSparepartForm({ ...sparepartForm, harga: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSparepartModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveSparepart} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Catat Penggunaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
