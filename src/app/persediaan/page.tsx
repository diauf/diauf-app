"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";
import { supabase } from "@/lib/supabase";

import {
  Boxes,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  TrendingDown,
  Package,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type StokItem = {
  id: string;
  kode: string;
  nama: string;
  kategori?: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  harga_beli: number;
  nilai_persediaan: number;
};

type Mutasi = {
  id: string;
  tanggal: string;
  no_dokumen: string;
  item_id: string;
  item_nama: string;
  jenis: "Masuk" | "Keluar" | "Adjustment";
  qty: number;
  keterangan: string;
  ref_dokumen?: string;
};

export default function PersediaanPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "stok" | "mutasi" | "opname"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "stok", label: "Daftar Stok" },
    { id: "mutasi", label: "Mutasi Persediaan" },
    { id: "opname", label: "Stok Opname" },
  ] as const;

  // Data
  const [stokList, setStokList] = useState<StokItem[]>([]);
  const [mutasiList, setMutasiList] = useState<Mutasi[]>([
    {
      id: "m1",
      tanggal: "2026-06-15",
      no_dokumen: "MUT-20260615-001",
      item_id: "i1",
      item_nama: "Beras Premium 5kg",
      jenis: "Masuk",
      qty: 100,
      keterangan: "Penerimaan dari supplier PO-2026-089",
      ref_dokumen: "PO-2026-089",
    },
    {
      id: "m2",
      tanggal: "2026-06-15",
      no_dokumen: "MUT-20260615-002",
      item_id: "i2",
      item_nama: "Minyak Goreng 2 Liter",
      jenis: "Keluar",
      qty: 25,
      keterangan: "Pengeluaran untuk penjualan SO-2026-0142",
      ref_dokumen: "SO-2026-0142",
    },
    {
      id: "m3",
      tanggal: "2026-06-14",
      no_dokumen: "MUT-20260614-001",
      item_id: "i3",
      item_nama: "Gula Pasir 1kg",
      jenis: "Adjustment",
      qty: -5,
      keterangan: "Koreksi stok opname (rusak)",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // for stok: all, low, normal

  // Modals
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [editingMutasiId, setEditingMutasiId] = useState<string | null>(null);

  const [mutasiForm, setMutasiForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    item_id: "",
    item_nama: "",
    jenis: "Masuk" as "Masuk" | "Keluar" | "Adjustment",
    qty: 0,
    keterangan: "",
    ref_dokumen: "",
  });

  // For opname
  const [opnameItems, setOpnameItems] = useState<any[]>([]);

  // Load from master_items + demo stock
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: items } = await supabase
          .from("master_items")
          .select("id, kode, nama, kategori")
          .order("nama");

        if (items && items.length > 0) {
          const demoStok: StokItem[] = items.map((item: any, index: number) => {
            const current = Math.floor(Math.random() * 500) + 50;
            const min = Math.floor(Math.random() * 100) + 20;
            const harga = Math.floor(Math.random() * 100000) + 10000;
            return {
              id: item.id,
              kode: item.kode,
              nama: item.nama,
              kategori: item.kategori || "Umum",
              current_stock: current,
              min_stock: min,
              unit: "pcs",
              harga_beli: harga,
              nilai_persediaan: current * harga,
            };
          });
          setStokList(demoStok);
        } else {
          setStokList(getDemoStok());
        }
      } catch (err) {
        console.error("Gagal load dari master, pakai demo", err);
        setStokList(getDemoStok());
      }
      setLoading(false);
    };

    loadData();
  }, []);

  function getDemoStok(): StokItem[] {
    return [
      {
        id: "i1",
        kode: "ITM-001",
        nama: "Beras Premium 5kg",
        kategori: "Sembako",
        current_stock: 320,
        min_stock: 100,
        unit: "pcs",
        harga_beli: 58000,
        nilai_persediaan: 18560000,
      },
      {
        id: "i2",
        kode: "ITM-002",
        nama: "Minyak Goreng 2 Liter",
        kategori: "Sembako",
        current_stock: 85,
        min_stock: 50,
        unit: "pcs",
        harga_beli: 28000,
        nilai_persediaan: 2380000,
      },
      {
        id: "i3",
        kode: "ITM-003",
        nama: "Gula Pasir 1kg",
        kategori: "Sembako",
        current_stock: 150,
        min_stock: 80,
        unit: "pcs",
        harga_beli: 13500,
        nilai_persediaan: 2025000,
      },
      {
        id: "i4",
        kode: "ITM-004",
        nama: "Telur Ayam Kampung 1kg",
        kategori: "Protein",
        current_stock: 42,
        min_stock: 60,
        unit: "pcs",
        harga_beli: 32000,
        nilai_persediaan: 1344000,
      },
      {
        id: "i5",
        kode: "ITM-005",
        nama: "Susu UHT 1 Liter",
        kategori: "Minuman",
        current_stock: 210,
        min_stock: 100,
        unit: "pcs",
        harga_beli: 16500,
        nilai_persediaan: 3465000,
      },
    ];
  }

  // Filtered
  const filteredStok = stokList.filter((s) => {
    const matchSearch = (s.nama + s.kode).toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = kategoriFilter === "all" || s.kategori === kategoriFilter;
    let matchStatus = true;
    if (statusFilter === "low") matchStatus = s.current_stock < s.min_stock;
    if (statusFilter === "normal") matchStatus = s.current_stock >= s.min_stock;
    return matchSearch && matchKategori && matchStatus;
  });

  const filteredMutasi = mutasiList.filter((m) =>
    (m.item_nama + m.keterangan).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categories for filter
  const categories = ["all", ...new Set(stokList.map((s) => s.kategori).filter(Boolean))];

  // Stats
  const totalSKU = stokList.length;
  const totalQty = stokList.reduce((sum, s) => sum + s.current_stock, 0);
  const totalValue = stokList.reduce((sum, s) => sum + s.nilai_persediaan, 0);
  const lowStockCount = stokList.filter((s) => s.current_stock < s.min_stock).length;

  // Handlers
  const openAddMutasiModal = () => {
    const first = stokList[0];
    setMutasiForm({
      tanggal: new Date().toISOString().split("T")[0],
      item_id: first?.id || "",
      item_nama: first?.nama || "",
      jenis: "Masuk",
      qty: 10,
      keterangan: "",
      ref_dokumen: "",
    });
    setEditingMutasiId(null);
    setShowMutasiModal(true);
  };

  const saveMutasi = () => {
    if (!mutasiForm.keterangan || mutasiForm.qty <= 0) return;

    const item = stokList.find((i) => i.id === mutasiForm.item_id);
    if (!item) return;

    if (editingMutasiId) {
      setMutasiList((prev) =>
        prev.map((m) => (m.id === editingMutasiId ? { ...m, ...mutasiForm, item_nama: item.nama } : m))
      );
    } else {
      const newMut: Mutasi = {
        id: "m" + Date.now(),
        no_dokumen: `MUT-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        item_nama: item.nama,
        ...mutasiForm,
      };
      setMutasiList((prev) => [newMut, ...prev]);

      // Update stok (demo)
      setStokList((prev) =>
        prev.map((s) => {
          if (s.id === mutasiForm.item_id) {
            let newStock = s.current_stock;
            if (mutasiForm.jenis === "Masuk") newStock += mutasiForm.qty;
            else if (mutasiForm.jenis === "Keluar") newStock = Math.max(0, newStock - mutasiForm.qty);
            else newStock += mutasiForm.qty; // adjustment can be +/-
            return {
              ...s,
              current_stock: newStock,
              nilai_persediaan: newStock * s.harga_beli,
            };
          }
          return s;
        })
      );
    }
    setShowMutasiModal(false);
    setEditingMutasiId(null);
  };

  const deleteMutasi = (id: string) => {
    if (!confirm("Hapus mutasi ini?")) return;
    setMutasiList((prev) => prev.filter((m) => m.id !== id));
  };

  const startOpname = () => {
    const initial = stokList.map((item) => ({
      ...item,
      fisik: item.current_stock,
      variance: 0,
    }));
    setOpnameItems(initial);
    setShowOpnameModal(true);
  };

  const updateOpnameFisik = (id: string, fisik: number) => {
    setOpnameItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              fisik,
              variance: fisik - item.current_stock,
            }
          : item
      )
    );
  };

  const saveOpname = () => {
    // Apply variance to stok
    setStokList((prev) =>
      prev.map((s) => {
        const op = opnameItems.find((o) => o.id === s.id);
        if (op && op.variance !== 0) {
          const newStock = op.fisik;
          return {
            ...s,
            current_stock: newStock,
            nilai_persediaan: newStock * s.harga_beli,
          };
        }
        return s;
      })
    );

    // Log as adjustment mutasi
    opnameItems.forEach((op) => {
      if (op.variance !== 0) {
        const adj: Mutasi = {
          id: "m" + Date.now() + op.id,
          tanggal: new Date().toISOString().split("T")[0],
          no_dokumen: `OPN-${Date.now()}`,
          item_id: op.id,
          item_nama: op.nama,
          jenis: "Adjustment",
          qty: op.variance,
          keterangan: "Stok Opname",
        };
        setMutasiList((prev) => [adj, ...prev]);
      }
    });

    setShowOpnameModal(false);
    setOpnameItems([]);
  };

  // Helper for item select
  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = stokList.find((i) => i.id === e.target.value);
    if (selected) {
      setMutasiForm((prev) => ({
        ...prev,
        item_id: selected.id,
        item_nama: selected.nama,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Persediaan...</div>
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
                <Boxes size={26} className="text-emerald-600" /> Modul Persediaan
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola stok barang, mutasi persediaan, dan stok opname. Terintegrasi dengan Master Item dan transaksi pembelian/penjualan.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "stok" || activeTab === "mutasi") {
                  openAddMutasiModal();
                } else if (activeTab === "opname") {
                  startOpname();
                } else {
                  setActiveTab("mutasi");
                }
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
              placeholder="Cari item atau mutasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {activeTab === "stok" && (
            <>
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "Semua Kategori" : cat}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="low">Stok Menipis</option>
                <option value="normal">Stok Normal</option>
              </select>
            </>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total SKU</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalSKU}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Qty Persediaan</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalQty.toLocaleString("id-ID")}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Nilai Persediaan</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {totalValue.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Item Stok Menipis</div>
                <div className="text-3xl font-semibold text-amber-700 mt-1">{lowStockCount}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <AlertTriangle size={20} /> Item dengan Stok Menipis
              </h3>
              <div className="space-y-3">
                {stokList.filter((s) => s.current_stock < s.min_stock).length > 0 ? (
                  stokList
                    .filter((s) => s.current_stock < s.min_stock)
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 border border-amber-200 bg-amber-50 rounded-2xl">
                        <div>
                          <div className="font-medium text-slate-900">{item.nama}</div>
                          <div className="text-sm text-slate-800">{item.kode} • {item.kategori}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-amber-800">Stok: {item.current_stock} / Min: {item.min_stock}</div>
                          <div className="font-semibold text-amber-700">Rp {item.nilai_persediaan.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-800">Semua stok dalam kondisi aman.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STOK */}
        {activeTab === "stok" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kode</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Item</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kategori</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Stok Saat Ini</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Min. Stok</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Nilai</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStok.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-700">Tidak ada data stok.</td>
                    </tr>
                  ) : (
                    filteredStok.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-mono text-sm text-slate-900">{item.kode}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{item.nama}</td>
                        <td className="px-5 py-4 text-sm text-slate-800">{item.kategori}</td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">{item.current_stock} {item.unit}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-800">{item.min_stock} {item.unit}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                          Rp {item.nilai_persediaan.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {item.current_stock < item.min_stock ? (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Menipis</span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">Normal</span>
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

        {/* MUTASI */}
        {activeTab === "mutasi" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddMutasiModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Catat Mutasi Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Dokumen</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Item</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jenis</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Qty</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Keterangan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMutasi.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-700">Belum ada data mutasi.</td>
                      </tr>
                    ) : (
                      filteredMutasi.map((mut) => (
                        <tr key={mut.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{mut.no_dokumen}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{mut.tanggal}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{mut.item_nama}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${mut.jenis === "Masuk" ? "bg-emerald-100 text-emerald-800" : mut.jenis === "Keluar" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                              {mut.jenis}
                            </span>
                          </td>
                          <td className={`px-5 py-4 text-right font-semibold ${mut.jenis === "Masuk" ? "text-emerald-700" : "text-red-700"}`}>
                            {mut.jenis === "Masuk" ? "+" : ""}{mut.qty}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-800">{mut.keterangan} {mut.ref_dokumen && `(${mut.ref_dokumen})`}</td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => deleteMutasi(mut.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
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

        {/* STOK OPNAME */}
        {activeTab === "opname" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-xl text-slate-900">Stok Opname</h3>
                <p className="text-sm text-slate-800 mt-1">Hitung fisik stok dan cocokkan dengan catatan sistem.</p>
              </div>
              <button onClick={startOpname} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Mulai Stok Opname
              </button>
            </div>

            <div className="text-center py-12 text-slate-700">
              Klik "Mulai Stok Opname" untuk memulai proses penghitungan fisik.
            </div>
          </div>
        )}
      </div>

      {/* Mutasi Modal */}
      {showMutasiModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingMutasiId ? "Edit Mutasi" : "Catat Mutasi Persediaan"}</h3>
              <button onClick={() => setShowMutasiModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Item</label>
                <select value={mutasiForm.item_id} onChange={handleItemChange} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {stokList.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama} ({item.kode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jenis Mutasi</label>
                  <select value={mutasiForm.jenis} onChange={(e) => setMutasiForm({ ...mutasiForm, jenis: e.target.value as any })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option value="Masuk">Masuk</option>
                    <option value="Keluar">Keluar</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                  <input type="date" value={mutasiForm.tanggal} onChange={(e) => setMutasiForm({ ...mutasiForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Jumlah</label>
                <input type="number" value={mutasiForm.qty} onChange={(e) => setMutasiForm({ ...mutasiForm, qty: Number(e.target.value) })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan</label>
                <input value={mutasiForm.keterangan} onChange={(e) => setMutasiForm({ ...mutasiForm, keterangan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Contoh: Penerimaan PO-2026-089" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Referensi Dokumen</label>
                <input value={mutasiForm.ref_dokumen} onChange={(e) => setMutasiForm({ ...mutasiForm, ref_dokumen: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Opsional" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowMutasiModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveMutasi} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Mutasi</button>
            </div>
          </div>
        </div>
      )}

      {/* Opname Modal */}
      {showOpnameModal && opnameItems.length > 0 && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Stok Opname - Input Fisik</h3>
              <button onClick={() => setShowOpnameModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-3 mb-6">
              {opnameItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 border border-slate-200 rounded-2xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{item.nama}</div>
                    <div className="text-xs text-slate-800">{item.kode} • Sistem: {item.current_stock}</div>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={item.fisik}
                      onChange={(e) => updateOpnameFisik(item.id, parseInt(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div className={`w-20 text-right font-medium ${item.variance === 0 ? "text-emerald-700" : item.variance > 0 ? "text-blue-700" : "text-red-700"}`}>
                    {item.variance > 0 ? "+" : ""}{item.variance}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowOpnameModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveOpname} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan & Update Stok</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
