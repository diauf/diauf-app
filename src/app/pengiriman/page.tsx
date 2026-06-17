"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";
import { supabase } from "@/lib/supabase";

import {
  PackageCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  Truck,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

type Pengiriman = {
  id: string;
  no_pengiriman: string;
  tanggal: string;
  customer_id: string;
  customer_nama: string;
  so_ref?: string;
  items: any[];
  status: string; // Siap Kirim, Dalam Pengiriman, Diterima, Dikembalikan
  driver?: string;
  kendaraan?: string;
  catatan?: string;
  total_qty: number;
};

type SuratJalan = {
  id: string;
  no_sj: string;
  pengiriman_id: string;
  no_pengiriman: string;
  tanggal: string;
  customer_nama: string;
  items: any[];
  tanda_tangan?: string;
};

export default function PengirimanPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "pengiriman" | "surat-jalan" | "pengembalian"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "pengiriman", label: "Daftar Pengiriman" },
    { id: "surat-jalan", label: "Surat Jalan" },
    { id: "pengembalian", label: "Pengembalian" },
  ] as const;

  // Master data
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);

  // Data
  const [pengirimanList, setPengirimanList] = useState<Pengiriman[]>([
    {
      id: "pg1",
      no_pengiriman: "PG-2026-0089",
      tanggal: "2026-06-15",
      customer_id: "c1",
      customer_nama: "PT Maju Jaya",
      so_ref: "SO-2026-0142",
      items: [
        { nama: "Beras Premium 5kg", qty: 50, satuan: "pcs" },
        { nama: "Minyak Goreng 2 Liter", qty: 30, satuan: "pcs" },
      ],
      status: "Dalam Pengiriman",
      driver: "Pak Budi",
      kendaraan: "Truk Hino B-1234-XYZ",
      catatan: "Prioritas tinggi",
      total_qty: 80,
    },
    {
      id: "pg2",
      no_pengiriman: "PG-2026-0088",
      tanggal: "2026-06-14",
      customer_id: "c2",
      customer_nama: "CV Sukses Mandiri",
      so_ref: "SO-2026-0140",
      items: [{ nama: "Gula Pasir 1kg", qty: 100, satuan: "pcs" }],
      status: "Diterima",
      driver: "Pak Siti",
      kendaraan: "Colt Diesel B-5678-ABC",
      total_qty: 100,
    },
    {
      id: "pg3",
      no_pengiriman: "PG-2026-0087",
      tanggal: "2026-06-13",
      customer_id: "c3",
      customer_nama: "UD Berkah",
      so_ref: "SO-2026-0139",
      items: [{ nama: "Telur Ayam Kampung 1kg", qty: 40, satuan: "kg" }],
      status: "Siap Kirim",
      driver: "",
      kendaraan: "",
      total_qty: 40,
    },
  ]);

  const [suratJalanList, setSuratJalanList] = useState<SuratJalan[]>([
    {
      id: "sj1",
      no_sj: "SJ-2026-0123",
      pengiriman_id: "pg2",
      no_pengiriman: "PG-2026-0088",
      tanggal: "2026-06-14",
      customer_nama: "CV Sukses Mandiri",
      items: [{ nama: "Gula Pasir 1kg", qty: 100, satuan: "pcs" }],
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showPengirimanModal, setShowPengirimanModal] = useState(false);
  const [showSuratJalanModal, setShowSuratJalanModal] = useState(false);
  const [editingPengirimanId, setEditingPengirimanId] = useState<string | null>(null);

  const [pengirimanForm, setPengirimanForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    customer_id: "",
    customer_nama: "",
    so_ref: "",
    items: [] as any[],
    driver: "",
    kendaraan: "",
    catatan: "",
  });

  // Load master data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [{ data: custs }, { data: items }] = await Promise.all([
          supabase.from("master_customers").select("id, kode, nama").order("nama"),
          supabase.from("master_items").select("id, kode, nama, kategori").order("nama"),
        ]);

        setCustomerList(custs || getDemoCustomers());
        setItemList(items || getDemoItems());
      } catch (err) {
        console.error("Gagal load master, pakai demo", err);
        setCustomerList(getDemoCustomers());
        setItemList(getDemoItems());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  function getDemoCustomers() {
    return [
      { id: "c1", kode: "CUS-101", nama: "PT Maju Jaya" },
      { id: "c2", kode: "CUS-102", nama: "CV Sukses Mandiri" },
      { id: "c3", kode: "CUS-103", nama: "UD Berkah" },
    ];
  }

  function getDemoItems() {
    return [
      { id: "it1", kode: "ITM-001", nama: "Beras Premium 5kg", kategori: "Sembako" },
      { id: "it2", kode: "ITM-002", nama: "Minyak Goreng 2 Liter", kategori: "Sembako" },
      { id: "it3", kode: "ITM-003", nama: "Gula Pasir 1kg", kategori: "Sembako" },
      { id: "it4", kode: "ITM-004", nama: "Telur Ayam Kampung 1kg", kategori: "Protein" },
    ];
  }

  // Filtered
  const filteredPengiriman = pengirimanList.filter((p) => {
    const matchSearch = (p.no_pengiriman + p.customer_nama + (p.so_ref || "")).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredSuratJalan = suratJalanList.filter((sj) =>
    (sj.no_sj + sj.customer_nama).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalPengiriman = pengirimanList.length;
  const dalamPengiriman = pengirimanList.filter((p) => p.status === "Dalam Pengiriman").length;
  const sudahDiterima = pengirimanList.filter((p) => p.status === "Diterima").length;
  const totalQty = pengirimanList.reduce((sum, p) => sum + p.total_qty, 0);

  // Handlers
  const openAddPengirimanModal = () => {
    const firstCust = customerList[0];
    setPengirimanForm({
      tanggal: new Date().toISOString().split("T")[0],
      customer_id: firstCust?.id || "",
      customer_nama: firstCust?.nama || "",
      so_ref: "",
      items: [],
      driver: "",
      kendaraan: "",
      catatan: "",
    });
    setEditingPengirimanId(null);
    setShowPengirimanModal(true);
  };

  const openEditPengirimanModal = (pg: Pengiriman) => {
    setPengirimanForm({
      tanggal: pg.tanggal,
      customer_id: pg.customer_id,
      customer_nama: pg.customer_nama,
      so_ref: pg.so_ref || "",
      items: [...pg.items],
      driver: pg.driver || "",
      kendaraan: pg.kendaraan || "",
      catatan: pg.catatan || "",
    });
    setEditingPengirimanId(pg.id);
    setShowPengirimanModal(true);
  };

  const savePengiriman = () => {
    if (!pengirimanForm.customer_nama || pengirimanForm.items.length === 0) return;

    const total_qty = pengirimanForm.items.reduce((sum: number, i: any) => sum + (i.qty || 0), 0);

    if (editingPengirimanId) {
      setPengirimanList((prev) =>
        prev.map((p) =>
          p.id === editingPengirimanId
            ? {
                ...p,
                ...pengirimanForm,
                total_qty,
              }
            : p
        )
      );
    } else {
      const newPg: Pengiriman = {
        id: "pg" + Date.now(),
        no_pengiriman: `PG-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        ...pengirimanForm,
        status: "Siap Kirim",
        total_qty,
      };
      setPengirimanList((prev) => [newPg, ...prev]);
    }
    setShowPengirimanModal(false);
    setEditingPengirimanId(null);
  };

  const updateStatus = (id: string, newStatus: string) => {
    setPengirimanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const deletePengiriman = (id: string) => {
    if (!confirm("Hapus pengiriman ini?")) return;
    setPengirimanList((prev) => prev.filter((p) => p.id !== id));
  };

  const openAddSuratJalanModal = () => {
    const readyPg = pengirimanList.find((p) => p.status === "Siap Kirim" || p.status === "Dalam Pengiriman");
    if (!readyPg) {
      alert("Tidak ada pengiriman yang siap untuk surat jalan.");
      return;
    }
    setShowSuratJalanModal(true);
  };

  const createSuratJalan = (pg: Pengiriman) => {
    const newSJ: SuratJalan = {
      id: "sj" + Date.now(),
      no_sj: `SJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      pengiriman_id: pg.id,
      no_pengiriman: pg.no_pengiriman,
      tanggal: pg.tanggal,
      customer_nama: pg.customer_nama,
      items: [...pg.items],
    };
    setSuratJalanList((prev) => [newSJ, ...prev]);
    updateStatus(pg.id, "Dalam Pengiriman");
    setShowSuratJalanModal(false);
  };

  const deleteSuratJalan = (id: string) => {
    if (!confirm("Hapus surat jalan ini?")) return;
    setSuratJalanList((prev) => prev.filter((sj) => sj.id !== id));
  };

  // Helper for customer select
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = customerList.find((c) => c.id === e.target.value);
    if (selected) {
      setPengirimanForm((prev) => ({
        ...prev,
        customer_id: selected.id,
        customer_nama: selected.nama,
      }));
    }
  };

  // Add item to pengiriman form
  const addItemToForm = () => {
    if (itemList.length === 0) return;
    const firstItem = itemList[0];
    setPengirimanForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { nama: firstItem.nama, qty: 1, satuan: "pcs" },
      ],
    }));
  };

  const updateItemQty = (index: number, qty: number) => {
    setPengirimanForm((prev) => {
      const newItems = [...prev.items];
      newItems[index].qty = qty;
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setPengirimanForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Helper for item select in form
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = itemList.find((i) => i.id === e.target.value);
    if (!selected) return;
    setPengirimanForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        nama: selected.nama,
      };
      return { ...prev, items: newItems };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Pengiriman...</div>
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
                <PackageCheck size={26} className="text-emerald-600" /> Modul Pengiriman
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola pengiriman barang ke pelanggan, surat jalan, dan pengembalian. Terintegrasi dengan Penjualan dan Persediaan.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "pengiriman") openAddPengirimanModal();
                else if (activeTab === "surat-jalan") openAddSuratJalanModal();
                else setActiveTab("pengiriman");
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            <input
              type="text"
              placeholder="Cari pengiriman atau surat jalan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {(activeTab === "pengiriman" || activeTab === "pengembalian") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Siap Kirim">Siap Kirim</option>
              <option value="Dalam Pengiriman">Dalam Pengiriman</option>
              <option value="Diterima">Diterima</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Pengiriman</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalPengiriman}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Dalam Pengiriman</div>
                <div className="text-3xl font-semibold text-amber-700 mt-1">{dalamPengiriman}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Sudah Diterima</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{sudahDiterima}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Qty Dikirim</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalQty}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Truck size={20} /> Pengiriman Terbaru
              </h3>
              <div className="space-y-3">
                {pengirimanList.slice(0, 4).map((pg) => (
                  <div key={pg.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-2xl">
                    <div>
                      <div className="font-medium text-slate-900">{pg.no_pengiriman} - {pg.customer_nama}</div>
                      <div className="text-sm text-slate-800">{pg.tanggal} • {pg.so_ref || "Manual"} • Qty: {pg.total_qty}</div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        pg.status === "Diterima" ? "bg-emerald-100 text-emerald-800" :
                        pg.status === "Dalam Pengiriman" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {pg.status}
                      </span>
                    </div>
                  </div>
                ))}
                {pengirimanList.length === 0 && (
                  <div className="text-center py-8 text-slate-800">Belum ada pengiriman.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR PENGIRIMAN */}
        {activeTab === "pengiriman" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddPengirimanModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Pengiriman Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Pengiriman</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Ref SO</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Qty</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPengiriman.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-800">Belum ada pengiriman.</td>
                      </tr>
                    ) : (
                      filteredPengiriman.map((pg) => (
                        <tr key={pg.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{pg.no_pengiriman}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{pg.tanggal}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{pg.customer_nama}</td>
                          <td className="px-5 py-4 text-sm text-emerald-700 font-mono">{pg.so_ref || "-"}</td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">{pg.total_qty}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              pg.status === "Diterima" ? "bg-emerald-100 text-emerald-800" :
                              pg.status === "Dalam Pengiriman" ? "bg-amber-100 text-amber-800" :
                              pg.status === "Siap Kirim" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {pg.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => openEditPengirimanModal(pg)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            {pg.status === "Siap Kirim" && (
                              <button onClick={() => updateStatus(pg.id, "Dalam Pengiriman")} className="p-2 text-amber-700 hover:bg-amber-50 rounded-xl" title="Mulai Kirim">
                                <Truck size={16} />
                              </button>
                            )}
                            {pg.status === "Dalam Pengiriman" && (
                              <button onClick={() => updateStatus(pg.id, "Diterima")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl" title="Tandai Diterima">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => deletePengiriman(pg.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
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

        {/* SURAT JALAN */}
        {activeTab === "surat-jalan" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddSuratJalanModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Surat Jalan
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Surat Jalan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Ref Pengiriman</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jumlah Item</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSuratJalan.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-800">Belum ada surat jalan.</td>
                      </tr>
                    ) : (
                      filteredSuratJalan.map((sj) => (
                        <tr key={sj.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{sj.no_sj}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{sj.tanggal}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{sj.customer_nama}</td>
                          <td className="px-5 py-4 text-sm text-emerald-700 font-mono">{sj.no_pengiriman}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-900">{sj.items.length}</td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => deleteSuratJalan(sj.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
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
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Pengiriman</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pengirimanList.filter((p) => p.status === "Diterima" || p.status === "Dikembalikan").length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-800">Belum ada pengiriman yang diterima atau dikembalikan.</td>
                    </tr>
                  ) : (
                    pengirimanList.filter((p) => p.status === "Diterima" || p.status === "Dikembalikan").map((pg) => (
                      <tr key={pg.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-mono text-sm text-slate-900">{pg.no_pengiriman}</td>
                        <td className="px-5 py-4 text-sm text-slate-800">{pg.tanggal}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{pg.customer_nama}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${pg.status === "Diterima" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {pg.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {pg.status === "Diterima" && (
                            <button onClick={() => updateStatus(pg.id, "Dikembalikan")} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-xl transition">
                              Tandai Dikembalikan
                            </button>
                          )}
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

      {/* Pengiriman Modal */}
      {showPengirimanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingPengirimanId ? "Edit Pengiriman" : "Buat Pengiriman Baru"}</h3>
              <button onClick={() => setShowPengirimanModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                  <input type="date" value={pengirimanForm.tanggal} onChange={(e) => setPengirimanForm({ ...pengirimanForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Pelanggan</label>
                  <select value={pengirimanForm.customer_id} onChange={handleCustomerChange} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    {customerList.map((c) => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Referensi SO (opsional)</label>
                <input value={pengirimanForm.so_ref} onChange={(e) => setPengirimanForm({ ...pengirimanForm, so_ref: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="SO-2026-0142" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-slate-800">Item yang Dikirim</label>
                  <button onClick={addItemToForm} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <Plus size={14} /> Tambah Item
                  </button>
                </div>

                <div className="space-y-2">
                  {pengirimanForm.items.length === 0 && (
                    <div className="text-sm text-slate-800 py-2">Belum ada item. Klik "Tambah Item".</div>
                  )}
                  {pengirimanForm.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center border border-slate-200 rounded-xl p-3">
                      <div className="flex-1">
                        <select value={itemList.find(i => i.nama === item.nama)?.id || ""} onChange={(e) => handleItemChange(index, e)} className="w-full text-sm border border-slate-300 rounded-xl px-3 py-1 text-slate-900">
                          {itemList.map((it) => (
                            <option key={it.id} value={it.id}>{it.nama}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input type="number" value={item.qty} onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 1)} className="w-full border border-slate-300 rounded-xl px-3 py-1 text-sm text-slate-900" />
                      </div>
                      <button onClick={() => removeItem(index)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Driver</label>
                  <input value={pengirimanForm.driver} onChange={(e) => setPengirimanForm({ ...pengirimanForm, driver: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Kendaraan</label>
                  <input value={pengirimanForm.kendaraan} onChange={(e) => setPengirimanForm({ ...pengirimanForm, kendaraan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Catatan</label>
                <textarea value={pengirimanForm.catatan} onChange={(e) => setPengirimanForm({ ...pengirimanForm, catatan: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPengirimanModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={savePengiriman} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Pengiriman</button>
            </div>
          </div>
        </div>
      )}

      {/* Surat Jalan Modal - simple list of ready pengiriman */}
      {showSuratJalanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Pilih Pengiriman untuk Surat Jalan</h3>
              <button onClick={() => setShowSuratJalanModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-2 max-h-96 overflow-auto">
              {pengirimanList.filter((p) => p.status === "Siap Kirim" || p.status === "Dalam Pengiriman").map((pg) => (
                <button
                  key={pg.id}
                  onClick={() => createSuratJalan(pg)}
                  className="w-full text-left p-4 border border-slate-200 hover:bg-slate-50 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-slate-900">{pg.no_pengiriman} - {pg.customer_nama}</div>
                    <div className="text-sm text-slate-800">{pg.tanggal} • Qty: {pg.total_qty}</div>
                  </div>
                  <ArrowRight size={18} className="text-emerald-600" />
                </button>
              ))}
              {pengirimanList.filter((p) => p.status === "Siap Kirim" || p.status === "Dalam Pengiriman").length === 0 && (
                <div className="text-center py-8 text-slate-800">Tidak ada pengiriman yang siap.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
