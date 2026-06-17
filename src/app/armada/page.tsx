"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  MapPin,
  Calendar,
  User,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

type Armada = {
  id: string;
  no_polisi: string;
  jenis: string;
  merk: string;
  tahun: number;
  status: string; // Tersedia, Dalam Perjalanan, Servis, Rusak
  lokasi: string;
  km_terakhir: number;
  pengemudi?: string;
};

type Servis = {
  id: string;
  armada_id: string;
  no_polisi: string;
  tanggal: string;
  jenis_servis: string;
  km_saat_servis: number;
  biaya: number;
  keterangan?: string;
  status: string; // Terjadwal, Selesai
  next_servis_km?: number;
};

type Tracking = {
  id: string;
  armada_id: string;
  no_polisi: string;
  timestamp: string;
  lokasi: string;
  kecepatan: number;
  status: string;
};

export default function ArmadaPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "daftar" | "tracking" | "servis"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "daftar", label: "Daftar Armada" },
    { id: "tracking", label: "Tracking & GPS" },
    { id: "servis", label: "Jadwal Servis" },
  ] as const;

  // Demo data
  const [armadaList, setArmadaList] = useState<Armada[]>([
    {
      id: "a1",
      no_polisi: "B 1234 XYZ",
      jenis: "Truk Box",
      merk: "Hino",
      tahun: 2022,
      status: "Tersedia",
      lokasi: "Gudang Pusat",
      km_terakhir: 45230,
      pengemudi: "Pak Budi",
    },
    {
      id: "a2",
      no_polisi: "B 5678 ABC",
      jenis: "Truk Fuso",
      merk: "Mitsubishi",
      tahun: 2021,
      status: "Dalam Perjalanan",
      lokasi: "Jakarta - Bandung",
      km_terakhir: 67890,
      pengemudi: "Pak Andi",
    },
    {
      id: "a3",
      no_polisi: "B 9012 DEF",
      jenis: "Pickup",
      merk: "Isuzu",
      tahun: 2023,
      status: "Servis",
      lokasi: "Bengkel",
      km_terakhir: 23450,
    },
    {
      id: "a4",
      no_polisi: "B 3456 GHI",
      jenis: "Truk Box",
      merk: "Hino",
      tahun: 2020,
      status: "Tersedia",
      lokasi: "Gudang Pusat",
      km_terakhir: 112340,
      pengemudi: "Pak Siti",
    },
  ]);

  const [servisList, setServisList] = useState<Servis[]>([
    {
      id: "s1",
      armada_id: "a1",
      no_polisi: "B 1234 XYZ",
      tanggal: "2026-06-20",
      jenis_servis: "Servis Berkala",
      km_saat_servis: 45000,
      biaya: 2500000,
      keterangan: "Ganti oli, filter",
      status: "Terjadwal",
      next_servis_km: 55000,
    },
    {
      id: "s2",
      armada_id: "a2",
      no_polisi: "B 5678 ABC",
      tanggal: "2026-06-10",
      jenis_servis: "Perbaikan Mesin",
      km_saat_servis: 67000,
      biaya: 8500000,
      keterangan: "Overhaul mesin",
      status: "Selesai",
      next_servis_km: 80000,
    },
  ]);

  const [trackingList, setTrackingList] = useState<Tracking[]>([
    {
      id: "tr1",
      armada_id: "a2",
      no_polisi: "B 5678 ABC",
      timestamp: "2026-06-16 14:30",
      lokasi: "Tol Cipularang KM 87",
      kecepatan: 85,
      status: "Bergerak",
    },
    {
      id: "tr2",
      armada_id: "a1",
      no_polisi: "B 1234 XYZ",
      timestamp: "2026-06-16 09:15",
      lokasi: "Gudang Pusat",
      kecepatan: 0,
      status: "Diam",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showArmadaModal, setShowArmadaModal] = useState(false);
  const [showServisModal, setShowServisModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [editingArmadaId, setEditingArmadaId] = useState<string | null>(null);

  const [armadaForm, setArmadaForm] = useState({
    no_polisi: "",
    jenis: "",
    merk: "",
    tahun: 2020,
    status: "Tersedia",
    lokasi: "",
    km_terakhir: 0,
    pengemudi: "",
  });

  const [servisForm, setServisForm] = useState({
    armada_id: "",
    no_polisi: "",
    tanggal: new Date().toISOString().split("T")[0],
    jenis_servis: "",
    km_saat_servis: 0,
    biaya: 0,
    keterangan: "",
    status: "Terjadwal",
    next_servis_km: 0,
  });

  const [trackingForm, setTrackingForm] = useState({
    armada_id: "",
    no_polisi: "",
    lokasi: "",
    kecepatan: 0,
  });

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        setProfile({ name: "Admin Demo", role: "Armada Manager" });
      } catch (err) {
        setProfile({ name: "Admin Demo", role: "Armada Manager" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Filtered
  const filteredArmada = armadaList.filter((a) => {
    const matchSearch = (a.no_polisi + a.jenis + a.merk).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredServis = servisList.filter((s) =>
    (s.no_polisi + s.jenis_servis).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTracking = trackingList.filter((t) =>
    t.no_polisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalArmada = armadaList.length;
  const tersedia = armadaList.filter((a) => a.status === "Tersedia").length;
  const dalamPerjalanan = armadaList.filter((a) => a.status === "Dalam Perjalanan").length;
  const butuhServis = servisList.filter((s) => s.status === "Terjadwal").length;

  // Handlers
  const openAddArmadaModal = () => {
    setArmadaForm({
      no_polisi: "",
      jenis: "",
      merk: "",
      tahun: 2022,
      status: "Tersedia",
      lokasi: "Gudang Pusat",
      km_terakhir: 0,
      pengemudi: "",
    });
    setEditingArmadaId(null);
    setShowArmadaModal(true);
  };

  const openEditArmadaModal = (arm: Armada) => {
    setArmadaForm({
      no_polisi: arm.no_polisi,
      jenis: arm.jenis,
      merk: arm.merk,
      tahun: arm.tahun,
      status: arm.status,
      lokasi: arm.lokasi,
      km_terakhir: arm.km_terakhir,
      pengemudi: arm.pengemudi || "",
    });
    setEditingArmadaId(arm.id);
    setShowArmadaModal(true);
  };

  const saveArmada = () => {
    if (!armadaForm.no_polisi || !armadaForm.jenis) return;

    if (editingArmadaId) {
      setArmadaList((prev) =>
        prev.map((a) =>
          a.id === editingArmadaId ? { ...a, ...armadaForm } : a
        )
      );
    } else {
      const newArm: Armada = {
        id: "a" + Date.now(),
        ...armadaForm,
      };
      setArmadaList((prev) => [newArm, ...prev]);
    }
    setShowArmadaModal(false);
    setEditingArmadaId(null);
  };

  const deleteArmada = (id: string) => {
    if (!confirm("Hapus armada ini?")) return;
    setArmadaList((prev) => prev.filter((a) => a.id !== id));
    setServisList((prev) => prev.filter((s) => s.armada_id !== id));
    setTrackingList((prev) => prev.filter((t) => t.armada_id !== id));
  };

  const updateArmadaStatus = (id: string, newStatus: string, newLokasi?: string) => {
    setArmadaList((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: newStatus,
              lokasi: newLokasi || a.lokasi,
            }
          : a
      )
    );
  };

  const openAddServisModal = () => {
    const firstArm = armadaList[0];
    setServisForm({
      armada_id: firstArm?.id || "",
      no_polisi: firstArm?.no_polisi || "",
      tanggal: new Date().toISOString().split("T")[0],
      jenis_servis: "Servis Berkala",
      km_saat_servis: firstArm?.km_terakhir || 0,
      biaya: 1500000,
      keterangan: "",
      status: "Terjadwal",
      next_servis_km: (firstArm?.km_terakhir || 0) + 10000,
    });
    setShowServisModal(true);
  };

  const saveServis = () => {
    if (!servisForm.armada_id || !servisForm.jenis_servis) return;

    const arm = armadaList.find((a) => a.id === servisForm.armada_id);
    if (!arm) return;

    const newServ: Servis = {
      id: "s" + Date.now(),
      ...servisForm,
      no_polisi: arm.no_polisi,
    };

    setServisList((prev) => [newServ, ...prev]);

    // Update armada km if servis selesai
    if (servisForm.status === "Selesai") {
      setArmadaList((prev) =>
        prev.map((a) =>
          a.id === servisForm.armada_id
            ? { ...a, km_terakhir: servisForm.km_saat_servis }
            : a
        )
      );
    }

    setShowServisModal(false);
  };

  const updateServisStatus = (id: string, newStatus: string) => {
    setServisList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, status: newStatus };
          if (newStatus === "Selesai") {
            // update armada
            setArmadaList((prevArm) =>
              prevArm.map((a) =>
                a.id === s.armada_id
                  ? { ...a, km_terakhir: s.km_saat_servis }
                  : a
              )
            );
          }
          return updated;
        }
        return s;
      })
    );
  };

  const openUpdateTrackingModal = () => {
    const movingArm = armadaList.find((a) => a.status === "Dalam Perjalanan");
    if (!movingArm) {
      alert("Tidak ada armada dalam perjalanan untuk di-update.");
      return;
    }
    setTrackingForm({
      armada_id: movingArm.id,
      no_polisi: movingArm.no_polisi,
      lokasi: movingArm.lokasi,
      kecepatan: 60,
    });
    setShowTrackingModal(true);
  };

  const updateTracking = () => {
    if (!trackingForm.armada_id) return;

    const newTrack: Tracking = {
      id: "tr" + Date.now(),
      armada_id: trackingForm.armada_id,
      no_polisi: trackingForm.no_polisi,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      lokasi: trackingForm.lokasi,
      kecepatan: trackingForm.kecepatan,
      status: trackingForm.kecepatan > 0 ? "Bergerak" : "Diam",
    };

    setTrackingList((prev) => [newTrack, ...prev].slice(0, 10)); // keep last 10

    // update armada lokasi
    setArmadaList((prev) =>
      prev.map((a) =>
        a.id === trackingForm.armada_id
          ? { ...a, lokasi: trackingForm.lokasi }
          : a
      )
    );

    setShowTrackingModal(false);
  };

  // Helper for armada select
  const handleArmadaChange = (e: React.ChangeEvent<HTMLSelectElement>, formType: "servis" | "tracking") => {
    const selected = armadaList.find((a) => a.id === e.target.value);
    if (!selected) return;

    if (formType === "servis") {
      setServisForm((prev) => ({
        ...prev,
        armada_id: selected.id,
        no_polisi: selected.no_polisi,
        km_saat_servis: selected.km_terakhir,
        next_servis_km: selected.km_terakhir + 10000,
      }));
    } else {
      setTrackingForm((prev) => ({
        ...prev,
        armada_id: selected.id,
        no_polisi: selected.no_polisi,
        lokasi: selected.lokasi,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Armada...</div>
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
                <Truck size={26} className="text-emerald-600" /> Modul Armada
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola armada kendaraan, tracking GPS real-time, jadwal servis berkala, dan penugasan pengemudi.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "daftar") openAddArmadaModal();
                else if (activeTab === "servis") openAddServisModal();
                else if (activeTab === "tracking") openUpdateTrackingModal();
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
              placeholder="Cari armada atau servis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {(activeTab === "daftar" || activeTab === "servis") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              {activeTab === "daftar" && (
                <>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Servis">Servis</option>
                  <option value="Rusak">Rusak</option>
                </>
              )}
              {activeTab === "servis" && (
                <>
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Selesai">Selesai</option>
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
                <div className="text-xs text-slate-700">Total Armada</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalArmada}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Tersedia</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{tersedia}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Dalam Perjalanan</div>
                <div className="text-3xl font-semibold text-amber-700 mt-1">{dalamPerjalanan}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Jadwal Servis</div>
                <div className="text-3xl font-semibold text-red-700 mt-1">{butuhServis}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                  <MapPin size={20} /> Tracking Terbaru
                </h3>
                <div className="space-y-3">
                  {trackingList.slice(0, 4).map((tr) => (
                    <div key={tr.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-2xl">
                      <div>
                        <div className="font-medium text-slate-900">{tr.no_polisi}</div>
                        <div className="text-sm text-slate-800">{tr.lokasi}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-emerald-700 font-semibold">{tr.kecepatan} km/j</div>
                        <div className="text-xs text-slate-700">{tr.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                  <Wrench size={20} /> Jadwal Servis Mendatang
                </h3>
                <div className="space-y-3">
                  {servisList.filter((s) => s.status === "Terjadwal").length > 0 ? (
                    servisList
                      .filter((s) => s.status === "Terjadwal")
                      .slice(0, 4)
                      .map((s) => (
                        <div key={s.id} className="flex justify-between items-center p-4 border border-amber-200 bg-amber-50 rounded-2xl">
                          <div>
                            <div className="font-medium text-slate-900">{s.no_polisi}</div>
                            <div className="text-sm text-slate-800">{s.jenis_servis} • {s.km_saat_servis} km</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-amber-800">{s.tanggal}</div>
                            <div className="text-xs text-slate-700">Rp {s.biaya.toLocaleString("id-ID")}</div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-slate-800">Tidak ada servis terjadwal.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR ARMADA */}
        {activeTab === "daftar" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddArmadaModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Tambah Armada Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Polisi</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis / Merk</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Tahun</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Lokasi Saat Ini</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">KM</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pengemudi</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArmada.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-800">Belum ada armada.</td>
                      </tr>
                    ) : (
                      filteredArmada.map((arm) => (
                        <tr key={arm.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono font-medium text-slate-900">{arm.no_polisi}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{arm.jenis} • {arm.merk}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">{arm.tahun}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${arm.status === "Tersedia" ? "bg-emerald-100 text-emerald-800" : arm.status === "Dalam Perjalanan" ? "bg-amber-100 text-amber-800" : arm.status === "Servis" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                              {arm.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-800">{arm.lokasi}</td>
                          <td className="px-5 py-4 text-right font-mono text-sm text-slate-900">{arm.km_terakhir.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{arm.pengemudi || "-"}</td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => openEditArmadaModal(arm)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteArmada(arm.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
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

        {/* TRACKING & GPS */}
        {activeTab === "tracking" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openUpdateTrackingModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Update GPS (Simulasi)
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Polisi</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Waktu</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Lokasi</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Kecepatan</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTracking.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-800">Belum ada data tracking.</td>
                      </tr>
                    ) : (
                      filteredTracking.map((tr) => (
                        <tr key={tr.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono font-medium text-slate-900">{tr.no_polisi}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{tr.timestamp}</td>
                          <td className="px-5 py-4 text-sm text-slate-800 flex items-center gap-1">
                            <MapPin size={14} className="text-emerald-600" /> {tr.lokasi}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">{tr.kecepatan} km/j</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${tr.status === "Bergerak" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-900"}`}>
                              {tr.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <strong>Catatan Demo:</strong> Tracking adalah simulasi. Klik "Update GPS" untuk menambah data lokasi baru. Di production, ini akan terhubung ke perangkat GPS real-time.
            </div>
          </div>
        )}

        {/* JADWAL SERVIS */}
        {activeTab === "servis" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddServisModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Jadwalkan Servis Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Polisi</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis Servis</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">KM</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Biaya</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServis.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-800">Belum ada jadwal servis.</td>
                      </tr>
                    ) : (
                      filteredServis.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{s.no_polisi}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{s.jenis_servis}</td>
                          <td className="px-5 py-4 text-right text-sm text-slate-800">{s.km_saat_servis.toLocaleString("id-ID")} km</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{s.tanggal}</td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">Rp {s.biaya.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${s.status === "Selesai" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            {s.status === "Terjadwal" && (
                              <button onClick={() => updateServisStatus(s.id, "Selesai")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl" title="Tandai Selesai">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => deleteArmada(s.armada_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus (demo)">
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
      </div>

      {/* Armada Modal */}
      {showArmadaModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingArmadaId ? "Edit Armada" : "Tambah Armada Baru"}</h3>
              <button onClick={() => setShowArmadaModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">No. Polisi</label>
                  <input value={armadaForm.no_polisi} onChange={(e) => setArmadaForm({ ...armadaForm, no_polisi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jenis Kendaraan</label>
                  <input value={armadaForm.jenis} onChange={(e) => setArmadaForm({ ...armadaForm, jenis: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Truk Box / Fuso / Pickup" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Merk</label>
                  <input value={armadaForm.merk} onChange={(e) => setArmadaForm({ ...armadaForm, merk: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tahun</label>
                  <input type="number" value={armadaForm.tahun} onChange={(e) => setArmadaForm({ ...armadaForm, tahun: parseInt(e.target.value) || 2020 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                <select value={armadaForm.status} onChange={(e) => setArmadaForm({ ...armadaForm, status: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Servis">Servis</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Lokasi Saat Ini</label>
                <input value={armadaForm.lokasi} onChange={(e) => setArmadaForm({ ...armadaForm, lokasi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">KM Terakhir</label>
                  <input type="number" value={armadaForm.km_terakhir} onChange={(e) => setArmadaForm({ ...armadaForm, km_terakhir: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Pengemudi</label>
                  <input value={armadaForm.pengemudi} onChange={(e) => setArmadaForm({ ...armadaForm, pengemudi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowArmadaModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveArmada} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Armada</button>
            </div>
          </div>
        </div>
      )}

      {/* Servis Modal */}
      {showServisModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Jadwalkan Servis</h3>
              <button onClick={() => setShowServisModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Armada</label>
                <select value={servisForm.armada_id} onChange={(e) => handleArmadaChange(e, "servis")} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {armadaList.map((a) => (
                    <option key={a.id} value={a.id}>{a.no_polisi} - {a.jenis}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Servis</label>
                  <input type="date" value={servisForm.tanggal} onChange={(e) => setServisForm({ ...servisForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jenis Servis</label>
                  <input value={servisForm.jenis_servis} onChange={(e) => setServisForm({ ...servisForm, jenis_servis: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">KM Saat Servis</label>
                  <input type="number" value={servisForm.km_saat_servis} onChange={(e) => setServisForm({ ...servisForm, km_saat_servis: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Biaya (Rp)</label>
                  <input type="number" value={servisForm.biaya} onChange={(e) => setServisForm({ ...servisForm, biaya: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan</label>
                <input value={servisForm.keterangan} onChange={(e) => setServisForm({ ...servisForm, keterangan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Next Servis (KM)</label>
                  <input type="number" value={servisForm.next_servis_km} onChange={(e) => setServisForm({ ...servisForm, next_servis_km: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                  <select value={servisForm.status} onChange={(e) => setServisForm({ ...servisForm, status: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowServisModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveServis} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Servis</button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Update Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Update Posisi GPS (Simulasi)</h3>
              <button onClick={() => setShowTrackingModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Armada</label>
                <select value={trackingForm.armada_id} onChange={(e) => handleArmadaChange(e, "tracking")} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {armadaList.filter((a) => a.status === "Dalam Perjalanan").map((a) => (
                    <option key={a.id} value={a.id}>{a.no_polisi} - {a.jenis}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Lokasi Baru</label>
                <input value={trackingForm.lokasi} onChange={(e) => setTrackingForm({ ...trackingForm, lokasi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Contoh: Tol Jagorawi KM 45" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Kecepatan (km/j)</label>
                <input type="number" value={trackingForm.kecepatan} onChange={(e) => setTrackingForm({ ...trackingForm, kecepatan: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTrackingModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={updateTracking} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Update Posisi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
