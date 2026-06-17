"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Calendar,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Clock,
  User,
  Package,
  ArrowRight,
} from "lucide-react";

type RentalItem = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  tarifHarian: number;
  stok: number;
  status: string;
};

type Penyewaan = {
  id: string;
  no_sewa: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  customer: string;
  itemId: string;
  itemNama: string;
  jumlah: number;
  total: number;
  status: string;
  catatan?: string;
};

export default function RentalPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "daftar" | "penyewaan" | "pengembalian"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "daftar", label: "Daftar Alat" },
    { id: "penyewaan", label: "Penyewaan" },
    { id: "pengembalian", label: "Pengembalian" },
  ] as const;

  // Demo data
  const [itemList, setItemList] = useState<RentalItem[]>([
    { id: "i1", kode: "RTL-001", nama: "Excavator 20 Ton", kategori: "Alat Berat", tarifHarian: 2500000, stok: 3, status: "Tersedia" },
    { id: "i2", kode: "RTL-002", nama: "Crane 50 Ton", kategori: "Alat Berat", tarifHarian: 4500000, stok: 2, status: "Tersedia" },
    { id: "i3", kode: "RTL-003", nama: "Genset 100 KVA", kategori: "Peralatan Listrik", tarifHarian: 850000, stok: 5, status: "Tersedia" },
    { id: "i4", kode: "RTL-004", nama: "Compactor", kategori: "Alat Berat", tarifHarian: 1200000, stok: 4, status: "Tersedia" },
    { id: "i5", kode: "RTL-005", nama: "Forklift 3 Ton", kategori: "Material Handling", tarifHarian: 950000, stok: 6, status: "Tersedia" },
  ]);

  const [sewaList, setSewaList] = useState<Penyewaan[]>([
    {
      id: "s1",
      no_sewa: "SEWA-2026-001",
      tanggalMulai: "2026-06-10",
      tanggalSelesai: "2026-06-17",
      customer: "PT Maju Konstruksi",
      itemId: "i1",
      itemNama: "Excavator 20 Ton",
      jumlah: 1,
      total: 17500000,
      status: "Disewa",
      catatan: "Proyek jalan tol",
    },
    {
      id: "s2",
      no_sewa: "SEWA-2026-002",
      tanggalMulai: "2026-06-12",
      tanggalSelesai: "2026-06-19",
      customer: "CV Bangun Bersama",
      itemId: "i3",
      itemNama: "Genset 100 KVA",
      jumlah: 2,
      total: 11900000,
      status: "Disewa",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showSewaModal, setShowSewaModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editingSewaId, setEditingSewaId] = useState<string | null>(null);
  const [selectedForReturn, setSelectedForReturn] = useState<Penyewaan | null>(null);

  const [sewaForm, setSewaForm] = useState({
    tanggalMulai: new Date().toISOString().split("T")[0],
    tanggalSelesai: "",
    customer: "",
    itemId: "",
    itemNama: "",
    jumlah: 1,
    catatan: "",
  });

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        setProfile({ name: "Admin Demo", role: "Operasional" });
      } catch (err) {
        setProfile({ name: "Admin Demo", role: "Operasional" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Filtered data
  const filteredItems = itemList.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSewa = sewaList.filter((s) => {
    const matchSearch = (s.no_sewa + s.customer + s.itemNama).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalItems = itemList.length;
  const totalStok = itemList.reduce((sum, i) => sum + i.stok, 0);
  const sedangDisewa = sewaList.filter((s) => s.status === "Disewa").length;
  const totalRevenue = sewaList.reduce((sum, s) => sum + s.total, 0);

  // Handlers
  const openAddSewaModal = () => {
    const firstItem = itemList[0];
    setSewaForm({
      tanggalMulai: new Date().toISOString().split("T")[0],
      tanggalSelesai: "",
      customer: "",
      itemId: firstItem?.id || "",
      itemNama: firstItem?.nama || "",
      jumlah: 1,
      catatan: "",
    });
    setEditingSewaId(null);
    setShowSewaModal(true);
  };

  const saveSewa = () => {
    if (!sewaForm.customer || !sewaForm.tanggalSelesai || !sewaForm.itemId) return;

    const item = itemList.find((i) => i.id === sewaForm.itemId);
    if (!item) return;

    const days = Math.max(1, Math.ceil((new Date(sewaForm.tanggalSelesai).getTime() - new Date(sewaForm.tanggalMulai).getTime()) / (1000 * 3600 * 24)));
    const total = sewaForm.jumlah * item.tarifHarian * days;

    if (editingSewaId) {
      setSewaList((prev) =>
        prev.map((s) =>
          s.id === editingSewaId
            ? {
                ...s,
                ...sewaForm,
                itemNama: item.nama,
                total,
              }
            : s
        )
      );
    } else {
      const newSewa: Penyewaan = {
        id: "s" + Date.now(),
        no_sewa: `SEWA-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        tanggalMulai: sewaForm.tanggalMulai,
        tanggalSelesai: sewaForm.tanggalSelesai,
        customer: sewaForm.customer,
        itemId: sewaForm.itemId,
        itemNama: item.nama,
        jumlah: sewaForm.jumlah,
        total,
        status: "Disewa",
        catatan: sewaForm.catatan,
      };
      setSewaList((prev) => [newSewa, ...prev]);
    }
    setShowSewaModal(false);
    setEditingSewaId(null);
  };

  const openReturnModal = (sewa: Penyewaan) => {
    setSelectedForReturn(sewa);
    setShowReturnModal(true);
  };

  const confirmReturn = () => {
    if (!selectedForReturn) return;

    setSewaList((prev) =>
      prev.map((s) =>
        s.id === selectedForReturn.id ? { ...s, status: "Dikembalikan" } : s
      )
    );

    // Update stok (demo)
    setItemList((prev) =>
      prev.map((i) =>
        i.id === selectedForReturn.itemId ? { ...i, stok: i.stok + selectedForReturn.jumlah } : i
      )
    );

    setShowReturnModal(false);
    setSelectedForReturn(null);
  };

  const deleteSewa = (id: string) => {
    if (!confirm("Hapus data penyewaan ini?")) return;
    setSewaList((prev) => prev.filter((s) => s.id !== id));
  };

  // Helper for item select in form
  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = itemList.find((i) => i.id === e.target.value);
    if (selected) {
      setSewaForm((prev) => ({
        ...prev,
        itemId: selected.id,
        itemNama: selected.nama,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Rental...</div>
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
                <Calendar size={26} className="text-emerald-600" /> Modul Rental
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola penyewaan alat berat, peralatan, dan aset. Pantau ketersediaan, jadwal, dan pengembalian.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "daftar" || activeTab === "penyewaan") {
                  openAddSewaModal();
                } else {
                  setActiveTab("penyewaan");
                }
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Plus size={16} /> Tambah Penyewaan
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
              placeholder="Cari alat atau penyewaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          {(activeTab === "penyewaan" || activeTab === "pengembalian") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Disewa">Disewa</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Jenis Alat</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalItems}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Unit Tersedia</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalStok}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Sedang Disewa</div>
                <div className="text-3xl font-semibold text-amber-700 mt-1">{sedangDisewa}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Pendapatan Sewa</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalRevenue / 1000000).toFixed(0)}jt
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Clock size={20} /> Penyewaan Aktif
              </h3>
              <div className="space-y-3">
                {sewaList.filter((s) => s.status === "Disewa").length > 0 ? (
                  sewaList.filter((s) => s.status === "Disewa").map((sewa) => (
                    <div key={sewa.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-2xl">
                      <div>
                        <div className="font-medium text-slate-900">{sewa.no_sewa} - {sewa.customer}</div>
                        <div className="text-sm text-slate-800">{sewa.itemNama} × {sewa.jumlah} • {sewa.tanggalMulai} s/d {sewa.tanggalSelesai}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-emerald-700">Rp {sewa.total.toLocaleString("id-ID")}</div>
                        <button onClick={() => openReturnModal(sewa)} className="text-xs text-blue-700 hover:underline mt-1">Proses Pengembalian</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-700">Tidak ada penyewaan aktif saat ini.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR ALAT */}
        {activeTab === "daftar" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kode</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Alat</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kategori</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Tarif/Hari</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Stok</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-700">Tidak ada data alat.</td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-mono text-sm text-slate-900">{item.kode}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{item.nama}</td>
                        <td className="px-5 py-4 text-sm text-slate-800">{item.kategori}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                          Rp {item.tarifHarian.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-center text-sm font-medium text-slate-900">{item.stok}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PENYEWAAN */}
        {activeTab === "penyewaan" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddSewaModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Penyewaan Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Sewa</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Alat</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Periode</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Total</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSewa.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-700">Belum ada data penyewaan.</td>
                      </tr>
                    ) : (
                      filteredSewa.map((sewa) => (
                        <tr key={sewa.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{sewa.no_sewa}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{sewa.customer}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{sewa.itemNama} × {sewa.jumlah}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">
                            {sewa.tanggalMulai} <ArrowRight size={12} className="inline" /> {sewa.tanggalSelesai}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {sewa.total.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${sewa.status === "Disewa" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                              {sewa.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            {sewa.status === "Disewa" && (
                              <button onClick={() => openReturnModal(sewa)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl" title="Proses Pengembalian">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => deleteSewa(sewa.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
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

        {/* PENGEMBALIAN */}
        {activeTab === "pengembalian" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Sewa</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Alat</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Periode</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Total</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sewaList.filter((s) => s.status === "Disewa").length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-700">Tidak ada penyewaan yang perlu dikembalikan.</td>
                    </tr>
                  ) : (
                    sewaList.filter((s) => s.status === "Disewa").map((sewa) => (
                      <tr key={sewa.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-mono text-sm text-slate-900">{sewa.no_sewa}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{sewa.customer}</td>
                        <td className="px-5 py-4 text-sm text-slate-800">{sewa.itemNama} × {sewa.jumlah}</td>
                        <td className="px-5 py-4 text-center text-sm text-slate-800">{sewa.tanggalMulai} - {sewa.tanggalSelesai}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">Rp {sewa.total.toLocaleString("id-ID")}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => openReturnModal(sewa)} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition">
                            Proses Pengembalian
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sewa Modal */}
      {showSewaModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingSewaId ? "Edit Penyewaan" : "Buat Penyewaan Baru"}</h3>
              <button onClick={() => setShowSewaModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Mulai</label>
                  <input type="date" value={sewaForm.tanggalMulai} onChange={(e) => setSewaForm({ ...sewaForm, tanggalMulai: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Selesai</label>
                  <input type="date" value={sewaForm.tanggalSelesai} onChange={(e) => setSewaForm({ ...sewaForm, tanggalSelesai: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Pelanggan</label>
                <input value={sewaForm.customer} onChange={(e) => setSewaForm({ ...sewaForm, customer: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="PT. Contoh Konstruksi" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Pilih Alat</label>
                <select value={sewaForm.itemId} onChange={handleItemChange} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {itemList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} - Rp {item.tarifHarian.toLocaleString("id-ID")}/hari
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jumlah Unit</label>
                  <input type="number" min="1" value={sewaForm.jumlah} onChange={(e) => setSewaForm({ ...sewaForm, jumlah: parseInt(e.target.value) || 1 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Catatan</label>
                  <input value={sewaForm.catatan} onChange={(e) => setSewaForm({ ...sewaForm, catatan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSewaModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveSewa} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Penyewaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedForReturn && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Konfirmasi Pengembalian</h3>
              <button onClick={() => setShowReturnModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-3 text-sm text-slate-800 mb-6">
              <div><strong>No. Sewa:</strong> {selectedForReturn.no_sewa}</div>
              <div><strong>Pelanggan:</strong> {selectedForReturn.customer}</div>
              <div><strong>Alat:</strong> {selectedForReturn.itemNama} × {selectedForReturn.jumlah}</div>
              <div><strong>Periode:</strong> {selectedForReturn.tanggalMulai} - {selectedForReturn.tanggalSelesai}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowReturnModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={confirmReturn} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Konfirmasi Dikembalikan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
