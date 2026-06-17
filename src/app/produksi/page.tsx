"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";
import { supabase } from "@/lib/supabase";

import {
  Factory,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Play,
  Package,
  AlertTriangle,
} from "lucide-react";

type BomItem = {
  item_id: string;
  item_kode: string;
  item_nama: string;
  qty: number;
};

type Bom = {
  id: string;
  produk_id: string;
  produk_kode: string;
  produk_nama: string;
  items: BomItem[];
  versi: string;
  catatan?: string;
};

type ProductionOrder = {
  id: string;
  no_po: string;
  tanggal: string;
  produk_id: string;
  produk_nama: string;
  qty_target: number;
  qty_produced: number;
  status: string; // Planned, In Progress, Completed, Cancelled
  bom_id?: string;
  catatan?: string;
};

export default function ProduksiPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "bom" | "perintah" | "output"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "bom", label: "Bill of Materials (BOM)" },
    { id: "perintah", label: "Perintah Produksi" },
    { id: "output", label: "Output Produksi" },
  ] as const;

  // Data
  const [itemList, setItemList] = useState<any[]>([]); // from master
  const [bomList, setBomList] = useState<Bom[]>([
    {
      id: "b1",
      produk_id: "p1",
      produk_kode: "PROD-001",
      produk_nama: "Meja Kayu Standar",
      versi: "v1.0",
      items: [
        { item_id: "i1", item_kode: "ITM-010", item_nama: "Papan Kayu 2x4", qty: 4 },
        { item_id: "i2", item_kode: "ITM-020", item_nama: "Paku 3 inch", qty: 20 },
        { item_id: "i3", item_kode: "ITM-030", item_nama: "Cat Kayu 1L", qty: 0.5 },
      ],
      catatan: "BOM standar untuk meja kantor",
    },
  ]);

  const [poList, setPoList] = useState<ProductionOrder[]>([
    {
      id: "po1",
      no_po: "PO-2026-001",
      tanggal: "2026-06-10",
      produk_id: "p1",
      produk_nama: "Meja Kayu Standar",
      qty_target: 50,
      qty_produced: 20,
      status: "In Progress",
      bom_id: "b1",
      catatan: "Prioritas tinggi",
    },
  ]);

  const [outputList, setOutputList] = useState<any[]>([
    {
      id: "out1",
      tanggal: "2026-06-15",
      po_id: "po1",
      no_po: "PO-2026-001",
      produk_nama: "Meja Kayu Standar",
      qty: 20,
      keterangan: "Batch pertama",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showBomModal, setShowBomModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [editingBomId, setEditingBomId] = useState<string | null>(null);
  const [editingPoId, setEditingPoId] = useState<string | null>(null);

  const [bomForm, setBomForm] = useState({
    produk_id: "",
    produk_nama: "",
    versi: "v1.0",
    items: [] as BomItem[],
    catatan: "",
  });

  const [poForm, setPoForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    produk_id: "",
    produk_nama: "",
    qty_target: 10,
    bom_id: "",
    catatan: "",
  });

  const [outputForm, setOutputForm] = useState({
    po_id: "",
    no_po: "",
    produk_nama: "",
    qty: 0,
    keterangan: "",
  });

  // Load items from master
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: items } = await supabase
          .from("master_items")
          .select("id, kode, nama, kategori")
          .order("nama");

        setItemList(items || getDemoItems());
      } catch (err) {
        console.error("Gagal load item master, pakai demo", err);
        setItemList(getDemoItems());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  function getDemoItems() {
    return [
      { id: "i1", kode: "ITM-010", nama: "Papan Kayu 2x4", kategori: "Bahan Baku" },
      { id: "i2", kode: "ITM-020", nama: "Paku 3 inch", kategori: "Bahan Baku" },
      { id: "i3", kode: "ITM-030", nama: "Cat Kayu 1L", kategori: "Bahan Baku" },
      { id: "p1", kode: "PROD-001", nama: "Meja Kayu Standar", kategori: "Produk Jadi" },
    ];
  }

  // Filtered lists
  const filteredBom = bomList.filter((b) =>
    (b.produk_nama + b.produk_kode).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPo = poList.filter((p) => {
    const matchSearch = (p.no_po + p.produk_nama).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredOutput = outputList.filter((o) =>
    (o.no_po + o.produk_nama).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalBom = bomList.length;
  const activePo = poList.filter((p) => p.status === "In Progress").length;
  const totalProduced = poList.reduce((sum, p) => sum + p.qty_produced, 0);
  const completionRate =
    poList.length > 0
      ? Math.round((totalProduced / poList.reduce((sum, p) => sum + p.qty_target, 0)) * 100)
      : 0;

  // Handlers
  const openAddBomModal = () => {
    setBomForm({
      produk_id: itemList.find((i) => i.kode.startsWith("PROD"))?.id || itemList[0]?.id || "",
      produk_nama: "",
      versi: "v1.0",
      items: [],
      catatan: "",
    });
    setEditingBomId(null);
    setShowBomModal(true);
  };

  const saveBom = () => {
    if (!bomForm.produk_id) return;

    const produk = itemList.find((i) => i.id === bomForm.produk_id);
    if (!produk) return;

    const newBom: Bom = {
      id: editingBomId || "b" + Date.now(),
      produk_id: bomForm.produk_id,
      produk_kode: produk.kode,
      produk_nama: produk.nama,
      versi: bomForm.versi,
      items: bomForm.items,
      catatan: bomForm.catatan,
    };

    if (editingBomId) {
      setBomList((prev) => prev.map((b) => (b.id === editingBomId ? newBom : b)));
    } else {
      setBomList((prev) => [newBom, ...prev]);
    }

    setShowBomModal(false);
    setEditingBomId(null);
  };

  const openEditBomModal = (bom: Bom) => {
    setBomForm({
      produk_id: bom.produk_id,
      produk_nama: bom.produk_nama,
      versi: bom.versi,
      items: [...bom.items],
      catatan: bom.catatan || "",
    });
    setEditingBomId(bom.id);
    setShowBomModal(true);
  };

  const deleteBom = (id: string) => {
    if (!confirm("Hapus BOM ini?")) return;
    setBomList((prev) => prev.filter((b) => b.id !== id));
  };

  const addBomItem = () => {
    const rawItem = itemList.find((i) => !i.kode.startsWith("PROD"));
    if (!rawItem) return;

    setBomForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: rawItem.id,
          item_kode: rawItem.kode,
          item_nama: rawItem.nama,
          qty: 1,
        },
      ],
    }));
  };

  const updateBomItemQty = (index: number, qty: number) => {
    setBomForm((prev) => {
      const newItems = [...prev.items];
      newItems[index].qty = qty;
      return { ...prev, items: newItems };
    });
  };

  const removeBomItem = (index: number) => {
    setBomForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const openAddPoModal = () => {
    const firstProd = itemList.find((i) => i.kode.startsWith("PROD")) || itemList[0];
    setPoForm({
      tanggal: new Date().toISOString().split("T")[0],
      produk_id: firstProd?.id || "",
      produk_nama: firstProd?.nama || "",
      qty_target: 10,
      bom_id: bomList[0]?.id || "",
      catatan: "",
    });
    setEditingPoId(null);
    setShowPoModal(true);
  };

  const savePo = () => {
    if (!poForm.produk_id || poForm.qty_target <= 0) return;

    const produk = itemList.find((i) => i.id === poForm.produk_id);
    if (!produk) return;

    const newPo: ProductionOrder = {
      id: editingPoId || "po" + Date.now(),
      no_po: editingPoId ? poList.find((p) => p.id === editingPoId)!.no_po : `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      tanggal: poForm.tanggal,
      produk_id: poForm.produk_id,
      produk_nama: produk.nama,
      qty_target: poForm.qty_target,
      qty_produced: editingPoId ? poList.find((p) => p.id === editingPoId)!.qty_produced : 0,
      status: editingPoId ? poList.find((p) => p.id === editingPoId)!.status : "Planned",
      bom_id: poForm.bom_id,
      catatan: poForm.catatan,
    };

    if (editingPoId) {
      setPoList((prev) => prev.map((p) => (p.id === editingPoId ? newPo : p)));
    } else {
      setPoList((prev) => [newPo, ...prev]);
    }

    setShowPoModal(false);
    setEditingPoId(null);
  };

  const updatePoStatus = (id: string, newStatus: string) => {
    setPoList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const deletePo = (id: string) => {
    if (!confirm("Hapus perintah produksi ini?")) return;
    setPoList((prev) => prev.filter((p) => p.id !== id));
  };

  const openOutputModal = () => {
    const openPo = poList.find((p) => p.status === "In Progress" || p.status === "Planned");
    if (!openPo) {
      alert("Tidak ada perintah produksi yang aktif.");
      return;
    }
    setOutputForm({
      po_id: openPo.id,
      no_po: openPo.no_po,
      produk_nama: openPo.produk_nama,
      qty: 0,
      keterangan: "",
    });
    setShowOutputModal(true);
  };

  const saveOutput = () => {
    if (outputForm.qty <= 0) return;

    const po = poList.find((p) => p.id === outputForm.po_id);
    if (!po) return;

    const newOutput = {
      id: "out" + Date.now(),
      tanggal: new Date().toISOString().split("T")[0],
      po_id: outputForm.po_id,
      no_po: po.no_po,
      produk_nama: po.produk_nama,
      qty: outputForm.qty,
      keterangan: outputForm.keterangan,
    };

    setOutputList((prev) => [newOutput, ...prev]);

    // Update produced qty
    setPoList((prev) =>
      prev.map((p) => {
        if (p.id === outputForm.po_id) {
          const newProduced = p.qty_produced + outputForm.qty;
          const newStatus = newProduced >= p.qty_target ? "Completed" : "In Progress";
          return { ...p, qty_produced: newProduced, status: newStatus };
        }
        return p;
      })
    );

    setShowOutputModal(false);
  };

  // Stats
  const totalActivePo = poList.filter((p) => p.status === "In Progress" || p.status === "Planned").length;
  const totalCompleted = poList.filter((p) => p.status === "Completed").length;
  const totalOutput = outputList.reduce((sum, o) => sum + o.qty, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Produksi...</div>
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
                <Factory size={26} className="text-emerald-600" /> Modul Produksi
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola Bill of Materials, perintah produksi, dan output. Terintegrasi dengan Persediaan dan Master Item.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "bom") openAddBomModal();
                else if (activeTab === "perintah") openAddPoModal();
                else if (activeTab === "output") openOutputModal();
                else setActiveTab("perintah");
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
              placeholder="Cari BOM, perintah, atau output..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {(activeTab === "perintah" || activeTab === "output") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-800">Total BOM Aktif</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalBom}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-800">Perintah Aktif</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{activePo}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-800">Total Output</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">{totalOutput}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-800">Rata-rata Penyelesaian</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{completionRate}%</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <AlertTriangle size={20} /> Perintah Produksi yang Perlu Perhatian
              </h3>
              <div className="space-y-3">
                {poList.filter((p) => p.status !== "Completed").length > 0 ? (
                  poList
                    .filter((p) => p.status !== "Completed")
                    .slice(0, 3)
                    .map((po) => (
                      <div key={po.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-2xl">
                        <div>
                          <div className="font-medium text-slate-900">{po.no_po} - {po.produk_nama}</div>
                          <div className="text-sm text-slate-800">Target: {po.qty_target} • Produced: {po.qty_produced}</div>
                        </div>
                        <div>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                            {po.status}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-800">Semua perintah produksi sudah selesai.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOM */}
        {activeTab === "bom" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddBomModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat BOM Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Produk</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Versi</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jumlah Komponen</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBom.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-slate-800">Belum ada BOM.</td>
                      </tr>
                    ) : (
                      filteredBom.map((bom) => (
                        <tr key={bom.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{bom.produk_nama}</div>
                            <div className="text-xs text-slate-800">{bom.produk_kode}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-800">{bom.versi}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-900">{bom.items.length}</td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => openEditBomModal(bom)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteBom(bom.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
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

            {/* Detail BOM yang dipilih (simple) */}
            {bomList.length > 0 && (
              <div className="mt-6 bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 text-slate-900">Komponen BOM: {bomList[0].produk_nama}</h3>
                <div className="space-y-2">
                  {bomList[0].items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 border border-slate-200 rounded-xl text-sm">
                      <span className="text-slate-900">{item.item_nama} ({item.item_kode})</span>
                      <span className="font-medium text-slate-900">{item.qty} pcs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERINTAH PRODUKSI */}
        {activeTab === "perintah" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddPoModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Perintah Produksi
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. PO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Produk</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Target</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Diproduksi</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPo.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-800">Belum ada perintah produksi.</td>
                      </tr>
                    ) : (
                      filteredPo.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{po.no_po}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{po.produk_nama}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-900">{po.qty_target}</td>
                          <td className="px-5 py-4 text-center text-sm text-emerald-700 font-semibold">{po.qty_produced}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              po.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                              po.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                              "bg-slate-200 text-slate-900"
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            {po.status !== "Completed" && (
                              <button onClick={() => updatePoStatus(po.id, po.status === "Planned" ? "In Progress" : "Completed")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl">
                                <Play size={16} />
                              </button>
                            )}
                            <button onClick={() => deletePo(po.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
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

        {/* OUTPUT */}
        {activeTab === "output" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openOutputModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Catat Output Produksi
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. PO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Produk</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Qty Output</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOutput.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-800">Belum ada output tercatat.</td>
                      </tr>
                    ) : (
                      filteredOutput.map((out) => (
                        <tr key={out.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 text-sm text-slate-800">{out.tanggal}</td>
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{out.no_po}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{out.produk_nama}</td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">{out.qty}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{out.keterangan}</td>
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

      {/* BOM Modal */}
      {showBomModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingBomId ? "Edit BOM" : "Buat Bill of Materials Baru"}</h3>
              <button onClick={() => setShowBomModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Produk Jadi</label>
                <select value={bomForm.produk_id} onChange={(e) => {
                  const prod = itemList.find((i) => i.id === e.target.value);
                  setBomForm({ ...bomForm, produk_id: e.target.value, produk_nama: prod?.nama || "" });
                }} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {itemList.filter((i) => i.kode.startsWith("PROD") || true).map((item) => (
                    <option key={item.id} value={item.id}>{item.nama} ({item.kode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Versi</label>
                  <input value={bomForm.versi} onChange={(e) => setBomForm({ ...bomForm, versi: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Catatan</label>
                  <input value={bomForm.catatan} onChange={(e) => setBomForm({ ...bomForm, catatan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-slate-800">Komponen / Bahan Baku</label>
                  <button onClick={addBomItem} className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1">
                    <Plus size={14} /> Tambah Komponen
                  </button>
                </div>

                <div className="space-y-2">
                  {bomForm.items.length === 0 && (
                    <div className="text-sm text-slate-800 py-2">Belum ada komponen. Klik "Tambah Komponen".</div>
                  )}
                  {bomForm.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center border border-slate-200 rounded-xl p-3">
                      <div className="flex-1 text-sm text-slate-900">{item.item_nama} ({item.item_kode})</div>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateBomItemQty(index, parseFloat(e.target.value) || 0)}
                        className="w-20 border border-slate-300 rounded-xl px-3 py-1 text-sm text-slate-900"
                      />
                      <button onClick={() => removeBomItem(index)} className="text-red-600"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBomModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveBom} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan BOM</button>
            </div>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {showPoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingPoId ? "Edit Perintah Produksi" : "Buat Perintah Produksi Baru"}</h3>
              <button onClick={() => setShowPoModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Produk Jadi</label>
                <select value={poForm.produk_id} onChange={(e) => {
                  const prod = itemList.find((i) => i.id === e.target.value);
                  setPoForm({ ...poForm, produk_id: e.target.value, produk_nama: prod?.nama || "" });
                }} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {itemList.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama} ({item.kode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Target Produksi</label>
                  <input type="number" value={poForm.qty_target} onChange={(e) => setPoForm({ ...poForm, qty_target: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Mulai</label>
                  <input type="date" value={poForm.tanggal} onChange={(e) => setPoForm({ ...poForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">BOM</label>
                <select value={poForm.bom_id} onChange={(e) => setPoForm({ ...poForm, bom_id: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {bomList.map((b) => (
                    <option key={b.id} value={b.id}>{b.produk_nama} - {b.versi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Catatan</label>
                <textarea value={poForm.catatan} onChange={(e) => setPoForm({ ...poForm, catatan: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPoModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={savePo} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Perintah</button>
            </div>
          </div>
        </div>
      )}

      {/* Output Modal */}
      {showOutputModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Catat Output Produksi</h3>
              <button onClick={() => setShowOutputModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-800 mb-1">Perintah: {outputForm.no_po}</div>
                <div className="text-sm text-slate-800">Produk: {outputForm.produk_nama}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Jumlah yang Diproduksi</label>
                <input type="number" value={outputForm.qty} onChange={(e) => setOutputForm({ ...outputForm, qty: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan</label>
                <input value={outputForm.keterangan} onChange={(e) => setOutputForm({ ...outputForm, keterangan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowOutputModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveOutput} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Catat Output</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
